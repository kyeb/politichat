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

// array to store rooms
let rooms = [];
let endedRooms = [];

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
  if (rooms.find((room) => room.roomName === req.body.roomName)) {
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

  // error if link is not valid
  if (req.body.roomLink && validURL(req.body.roomLink) === false) {
    res.status(400).send({ statusMessage: "URL not valid" });
    return;
  }

  // generate random room ID number
  const roomID = Math.random().toString(36).substr(2, 9);

  // parse date string in format "MM-DD-YYYY hh:mm A" TODO add validity checking
  let parts = req.body.datetime.split(/[- :]/);
  if (parts.length !== 6) {
    res.status(400).send({ statusMessage: "Datetime invalid" });
  }
  if (parts[5] === "AM") {
    parts[3] = (parts[3] === "12") ? 0 : parts[3];
  } else {
    parts[3] = (parts[3] === "12") ? 12 : 12 + parseInt(parts[3]);
  }
  parts = parts.slice(0, -1).map((x) => parseInt(x));
  let datetime = new Date(parts[2], parts[0] - 1, parts[1], parts[3], parts[4]);

  // make a room object with keys id, roomName, owner, current user, and queue
  const room_temp = {
    id: roomID,
    roomName: req.body.roomName,
    owner: req.user.username,
    current: null,
    queue: [],
    link: req.body.roomLink,
    waitMessage: req.body.waitingMessage,
    exitMessage: req.body.exitMessage,
    isPrivate: req.body.isPrivate,
    isScheduled: req.body.isScheduled,
    datetime: datetime.getTime()
  };

  // add room object to array of rooms
  rooms.push(room_temp);

  // update roomlist on user frontends
  const allConnected = socket.getAllConnectedSockets();
  allConnected.forEach((connectedSocket) => {
    connectedSocket.emit("new room", room_temp);
  });

  // then, send back the entire room object
  res.send(room_temp);
});

router.post("/end", [needsCanCreateRooms], (req, res) => {
  const room = rooms.find((e) => e.id === req.body.id);

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

  // add the room to ended rooms for exit pages
  endedRooms.push(room);

  // delete a room by its ID from the array of active rooms
  const length = rooms.length;
  rooms = rooms.filter(function (e) {
    return e.id !== req.body.id;
  });

  // sends true if was successful, false if not
  if (rooms.length == length) {
    res.send({ success: false });
  }

  // update roomlist on user frontends
  const allConnected = socket.getAllConnectedSockets();
  allConnected.forEach((connectedSocket) => {
    connectedSocket.emit("room ended", room);
  });

  res.send({ success: true });
});

router.get("/rooms", (req, res) => {
  // returns all available rooms with id and roomName in an array
  res.send(rooms);
});

router.get("/room", (req, res) => {
  // returns just the room with a specific requested ID
  // each room should have the id and roomName so far
  res.send(rooms.find((e) => e.id === req.query.id));
});

router.get("/endedroom", (req, res) => {
  // returns possibly ended room with a specific requested ID
  const room = rooms.find((e) => e.id === req.query.id);
  if (!room) {
    res.send(endedRooms.find((e) => e.id === req.query.id));
  }
  res.send(room);
});

router.post("/leavequeue", (req, res) => {
  removeFromQueue(req.body.roomID, req.body.socketID);
  res.send({ success: true });
});

function removeFromQueue(roomID, userSocketID) {
  const room = rooms.find((e) => e.id === roomID);
  // if the room doesn't exist for some reason, exit
  if (!room) return;
  room.queue = room.queue.filter((e) => e !== userSocketID);
  logger.info(`User ${userSocketID} has left the queue`);
  updateHost(room);
  updateUsers(room);
}

function updateHost(room) {
  const ownerSocket = socket.getSocketFromUsername(room.owner);
  if (ownerSocket) {
    ownerSocket.emit("queue status", room.queue.length);
  }
}

function updateUsers(room) {
  for (let i = 0; i < room.queue.length; i++) {
    const userSocket = socket.getSocketFromSocketID(room.queue[i]);
    if (userSocket) {
      userSocket.emit("position update", i + 1);
    }
  }
}

router.post("/join", (req, res) => {
  // adds a user's socketID to the queue for the given room
  const userSocket = socket.getSocketFromSocketID(req.body.socketID);
  const room = rooms.find((e) => e.id === req.body.roomID);
  if (!room) {
    res.status(404).send({});
    return;
  }

  // if the host is trying to join, don't let them
  if (userSocket === socket.getSocketFromUsername(room.owner)) {
    updateHost(room);
    res.send({});
    return;
  }

  room.queue.push(userSocket.id);
  logger.info(`User ${userSocket.id} has joined the queue`);

  // set up a callback so that if the user disconnects, they get removed from
  //   the queue
  userSocket.on("disconnect", () => {
    removeFromQueue(room.id, userSocket.id);
  });

  // tell the room owner how many people are in the queue
  updateHost(room);
  updateUsers(room);

  res.send({ success: true });
});

router.post("/submitEmail", (req, res) => {
  // add an email address to the room's email list
  const room = rooms.find((e) => e.id === req.body.roomID);
  if (!room) {
    res.status(404).send({});
    return;
  }

  if (!room.emailList) {
    room.emailList = [];
  }

  // ensure is valid email
  let pattern = /\S+@\S+\.\S+/;
  if (pattern.test(req.body.email)) {
    room.emailList.push(req.body.email);
    res.send({ success: true });
  } else {
    res.status(400).send({});
  }
});

router.post("/next", [needsCanCreateRooms], (req, res) => {
  const room = rooms.find((e) => e.id === req.body.id);
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

  room.current = room.queue[0]; // first element is the who to currently connect

  room.queue.shift(); // remove the old user from the array

  // tell the first user in the queue they can connect
  socket.getSocketFromSocketID(room.current).emit("host ready");

  // let the host know the queue length again, so they can update it
  updateHost(room);
  updateUsers(room);

  res.send({ success: true });
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
