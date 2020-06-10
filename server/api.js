/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes at /api/* for our server.
|
*/

import express from "express";
import socket from "./server-socket.js";

import pino from "pino";
const logger = pino();

import Room from "./models/RoomModel.js";
import User from "./models/UserModel.js";

import { needsAdmin, needsCanCreateRooms } from "./middleware.js";

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

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

router.post("/enduser", [needsCanCreateRooms], (req, res) => {
  Room.findOne({ _id: req.body.id }).then((room) => {
    // ensure logged in as owner
    if (req.user && room.owner !== req.user.username) {
      res.status(401).send({});
      return;
    }

    // fail if nobody in the chat
    // the "end current conversation" button should be disabled in frontend until someone is there,
    // so this shouldn't be happen
    if (!room.current || !socket.getSocketFromSocketID(room.current)) {
      res.send({ success: false });
      return;
    }

    if (room.current && socket.getSocketFromSocketID(room.current)) {
      // tell the old user that they should exit the page
      socket.getSocketFromSocketID(room.current).emit("leave please");
      room.current = null;
      res.send({ success: true });
      return;
    } else {
      res.send({ success: false });
    }
  });
});

router.post("/jump", [needsCanCreateRooms], (req, res) => {
  Room.findOne({ _id: req.body.id }).then((room) => {
    // ensure logged in as owner
    if (req.user && room.owner !== req.user.username) {
      res.status(401).send({});
      return;
    }

    if (room.current && socket.getSocketFromSocketID(room.current)) {
      // tell the old user that they should exit the page
      socket.getSocketFromSocketID(room.current).emit("leave please");
    }

    let current;
    let track_for_error = 0;
    while (!current || !socket.getSocketFromSocketID(current)) {
      // shouldn't happen because no users displayed if no one in queue
      if (room.queue.length === 0) {
        updateQueueLength(room);
        updateQueueArray(room);
        updateUsers(room);
        updateIsUser(room);
        res.send({ success: true });
        return;
      }
      current = room.queue.filter((item) => item === req.body.user)[0]; // grab user from array

      let new_queue = room.queue.filter((item) => item !== current); // remove user from array

      room.queue = new_queue; // update room.queue

      if (track_for_error >= 1000) {
        logger.info();
        break;
      }
      track_for_error++;
    }
    room.current = current;

    // tell the first user in the queue they can connect
    socket.getSocketFromSocketID(room.current).emit("host ready");

    // let the host know the queue length again, so they can update it
    updateQueueLength(room);
    updateQueueArray(room);
    updateUsers(room);
    updateIsUser(room);

    room.save().then(() => {
      res.send({ success: true });
    });
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
        updateIsUser(room);
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
    updateIsUser(room);

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

import room from "./routes/room.js";
router.use("/room", room);

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  logger.warn(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

export default router;
