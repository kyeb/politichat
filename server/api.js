/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");
const socket = require("./server-socket");

const logger = require("pino")(); // use pino logger

const User = require("./models/user");
const Room = require("./models/room");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

// Admin authorization middleware
const needsAdmin = (req, res, next) => {
  if (!req.user || !req.user.admin) {
    res.status(403).send({ msg: "Admin permissions required" });
  } else {
    next();
  }
};
const needsCanCreateRooms = (req, res, next) => {
  if (!req.user || !req.user.canCreateRooms) {
    res.status(403).send({ msg: "canCreateRooms permissions required" });
  } else {
    next();
  }
};

function isValid(str) {
  var check = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
  if (check.test(str)) {
    return false;
  }
  return true;
}

function validURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

router.post("/newroom", [needsCanCreateRooms], (req, res) => {
  // error if room with same name already exists
  Room.findOne({ _id: req.body.id }).then((duplicate) => {
    if (duplicate) {
      res.status(400).send({ msg: "Room with that name already exists" });
      return;
    }

    // error if room name includes quotation marks
    if (isValid(req.body.roomName) === false) {
      res.status(400).send({ statusMessage: "Room name cannot include special characters" });
      return;
    }

    // error if room name is empty
    if (req.body.roomName === "") {
      res.status(400).send({ statusMessage: "Room name cannot be empty" });
      return;
    }

    let prefix = "";
    if (req.body.roomLink) {
      // error if link is not valid
      if (validURL(req.body.roomLink) === false) {
        res.status(400).send({ statusMessage: "URL not valid" });
        return;
      }

      // add https:// if not there already
      if (!req.body.roomLink.startsWith("http://") && !req.body.roomLink.startsWith("https://")) {
        prefix = "https://";
      }
    }

    // generate random room ID number
    const roomID = Math.random().toString(36).substr(2, 9);

    const newRoom = new Room({
      id: roomID,
      roomName: req.body.roomName,
      owner: req.user.username,
      ownerDisplayName: req.user.displayName,
      link: prefix + req.body.roomLink,
      waitMessage: req.body.waitingMessage,
      exitMessage: req.body.exitMessage,
      isPrivate: req.body.isPrivate,
      isScheduled: req.body.isScheduled,
      datetime: req.body.datetime,
      userInfos: {}, // user infos keyed by socketID
    });

    // add room object to array of rooms
    newRoom.save().then((savedRoom) => {
      // update roomlist on user frontends
      const allConnected = socket.getAllConnectedSockets();
      allConnected.forEach((connectedSocket) => {
        connectedSocket.emit("new room", savedRoom);
      });

      // then, send back the entire room object
      res.send(savedRoom);
    });
  });
});

router.post("/end", [needsCanCreateRooms], (req, res) => {
  Room.findOne({ _id: req.body.id }).then((room) => {
    // tell the old user that they should exit the page
    const userSocket = socket.getSocketFromSocketID(room.current);
    if (userSocket) {
      userSocket.emit("room gone");
    }

    // tell all users in queue to exit the page
    for (let i = 0; i < room.queue.length; i++) {
      const queuedSocket = socket.getSocketFromSocketID(room.queue[i]);
      if (queuedSocket) {
        // TODO: make this a different message so queued users see a message instead of just
        //   being kicked from the queue
        queuedSocket.emit("room gone");
      }
    }

    // specify that the room is ended
    room.ended = true;

    // update roomlist on user frontends
    const allConnected = socket.getAllConnectedSockets();
    allConnected.forEach((connectedSocket) => {
      connectedSocket.emit("room ended", room);
    });

    room.save().then(() => {
      // send true if we successfully saved
      res.send({ success: true });
    });
  });
});

router.get("/rooms", (req, res) => {
  // returns all available rooms with id and roomName in an array
  Room.find({ ended: false }).then((rooms) => {
    res.send(rooms);
  });
});

router.get("/room", (req, res) => {
  // returns just the room with a specific requested ID
  // each room should have the id and roomName so far
  Room.findOne({ _id: req.query.id }).then((room) => {
    res.send(room);
  });
});

router.post("/leavequeue", (req, res) => {
  removeFromQueue(req.body.roomID, req.body.socketID);
  res.send({ success: true });
});

function removeFromQueue(roomID, userSocketID) {
  // const room = rooms.find((e) => e.id === roomID);
  Room.findOne({ _id: roomID }).then((room) => {
    // if the room doesn't exist for some reason, exit
    if (!room) return;
    room.queue = room.queue.filter((e) => e !== userSocketID);
    room.save().then((savedRoom) => {
      logger.info(`User ${userSocketID} has left the queue`);
      updateQueueLength(savedRoom);
      updateQueueArray(savedRoom);
      updateUsers(savedRoom);
    });
  });
}

function updateQueueLength(room) {
  const ownerSocket = socket.getSocketFromUsername(room.owner);
  if (ownerSocket) {
    ownerSocket.emit("queue status", room.queue.length);
  }
}

function updateQueueArray(room){
  const ownerSocket = socket.getSocketFromUsername(room.owner);
  let queue_info =  [];
    for (let i = 0; i < room.queue.length; i++) {
      current_id = room.queue[i]; 
      queue_info[i] = {
        name: room.userInfos.get(current_id).name, 
        town: room.userInfos.get(current_id).town
      }
    }
  ownerSocket.emit("queue array", queue_info)
}

function updateUsers(room) {
  for (let i = 0; i < room.queue.length; i++) {
    const userSocket = socket.getSocketFromSocketID(room.queue[i]);
    if (userSocket) {
      userSocket.emit("position update", i + 1);
    }
  }
}

// router.post("/usersinqueue", (req, res) => {
//   Room.findOne({ _id: req.body.id }).then((room) => {
//     let queue_info =  [];
//     for (let i = 0; i < room.queue.length; i++) {
//       current_id = room.queue[i]; 
//       queue_info[i] = {
//         name: room.userInfos.get(current_id).name, 
//         town: room.userInfos.get(current_id).town
//       }
//     }
//     res.send(queue_info); 
//   });
// });

router.post("/join", (req, res) => {
  // adds a user's socketID to the queue for the given room
  const userSocket = socket.getSocketFromSocketID(req.body.socketID);
  Room.findOne({ _id: req.body.roomID }).then((room) => {
    if (!room) {
      res.status(500).send({ msg: "Room not found" });
      return;
    }

    // if the host is trying to join, don't let them
    if (userSocket === socket.getSocketFromUsername(room.owner)) {
      updateQueueLength(room);
      updateQueueArray(room); 
      res.send({});
      return;
    }

    Room.findByIdAndUpdate(
      req.body.roomID,
      { $push: { queue: userSocket.id } },
      { new: true }
    ).then((updatedRoom) => {
      logger.info(`User ${userSocket.id} has joined the queue`);
      logger.info(`Updated queue: ${updatedRoom.queue}`);

      // set up a callback so that if the user disconnects, they get removed from
      //   the queue
      userSocket.on("disconnect", () => {
        removeFromQueue(updatedRoom._id, userSocket.id);
      });

      
      // add the name, email, phone, town to the userInfos
      updatedRoom.userInfos.set(req.body.socketID, {
        name: req.body.name,
        email: req.body.email, 
        phone: req.body.phone, 
        town: req.body.town
      });

      // tell the room owner how many people are in the queue
      updateQueueLength(updatedRoom);
      updateQueueArray(updatedRoom); 
      updateUsers(updatedRoom);

      updatedRoom.save().then(() => {
        res.send({ success: true });
      });
    });
  });
});

router.post("/submitInfo", (req, res) => {
  // add/update a user's info
  Room.findOne({ _id: req.body.roomID }).then((room) => {
    if (!room) {
      res.status(404).send({});
      return;
    }

    // ensure is valid email
    let emailOkay = !req.body.userInfo.email || /\S+@\S+\.\S+/.test(req.body.userInfo.email);
    let phoneOkay = !req.body.userInfo.phone || /[\d()\- ]+/.test(req.body.userInfo.phone);
    if (emailOkay && phoneOkay) {
      room.userInfos.set(req.body.socketID, req.body.userInfo);
      room.save().then(() => {
        res.send({ success: true });
      });
    } else {
      res.status(400).send({});
    }
  });
});

router.post("/next", [needsCanCreateRooms], (req, res) => {
  Room.findOne({ _id: req.body.id }).then((room) => {
    // ensure logged in as owner
    if (req.user && room.owner !== req.user.username) {
      res.status(401).send({});
      return;
    }

    // fail if nobody in queue; the "next" button should be disabled in frontend until someone is
    //   there, so this shouldn't be happen
    if (room.queue.length === 0) {
      res.send({ success: false });
      return;
    }

    if (room.current && socket.getSocketFromSocketID(room.current)) {
      // tell the old user that they should exit the page
      socket.getSocketFromSocketID(room.current).emit("leave please");
    }

    let current;
    while (!current || !socket.getSocketFromSocketID(current)) {
      if (room.queue.length === 0) {
        updateQueueLength(room);
        updateQueueArray(room); 
        updateUsers(room);
        res.send({ success: true });
        return;
      }
      current = room.queue.shift(); // grab and remove first user from array
    }
    room.current = current;

    // tell the first user in the queue they can connect
    socket.getSocketFromSocketID(room.current).emit("host ready");

    // let the host know the queue length again, so they can update it
    updateQueueLength(room);
    updateQueueArray(room); 
    updateUsers(room);

    room.save().then(() => {
      res.send({ success: true });
    });
  });
});

router.get("/totalrooms", [needsAdmin], (req, res) => {
  Room.count({}).then((count) => {
    res.send({ roomCount: count });
  });
});

router.post("/cleanended", [needsAdmin], (req, res) => {
  Room.deleteMany({ ended: true }).then(() => {
    logger.info("Cleared all ended rooms.");
    res.send({ success: true });
  });
});

router.post("/displayname", (req, res) => {
  if (!req.user) res.status(501).send({ error: "Must be logged in" });

  User.findByIdAndUpdate(req.user.id, { displayName: req.body.displayName }, () => {
    res.send({ success: true });
  });
});

// keep the user-to-socket mapping current, so we know who is who
router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user) socket.addUser(req.user, socket.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

router.get("/users", [needsAdmin], (req, res) => {
  User.find({}).then((users) => {
    res.send(users);
  });
});

router.post("/user/admin", [needsAdmin], (req, res) => {
  if (!req.user || !req.user.admin) {
    res.status(403).send({ msg: "Admin permissions required" });
    return;
  }
  User.findByIdAndUpdate(req.body.id, { admin: req.body.admin })
    .then((user) => res.send(user))
    .catch((err) => {
      logger.error(err);
      res.status(500).send({});
    });
});

router.post("/user/updatepermissions", [needsAdmin], (req, res) => {
  User.findByIdAndUpdate(req.body.id, { canCreateRooms: req.body.canCreateRooms })
    .then((user) => res.send(user))
    .catch((err) => {
      logger.error(err);
      res.status(500).send({});
    });
});

router.post("/user/delete", [needsAdmin], (req, res) => {
  User.findByIdAndDelete(req.body.id)
    .then(() => {
      res.send({ success: true });
    })
    .catch((err) => {
      logger.error(err);
      res.send({ success: false });
    });
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  logger.warn(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
