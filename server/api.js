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

import { needsCanCreateRooms } from "./middleware.js";

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

// UNUSED: all information is sent to /join now
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

import room from "./routes/room.js";
router.use("/room", room);

import user from "./routes/user.js";
router.use("/user", user);

import queue from "./routes/queue.js";
router.use("/queue", queue);

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  logger.warn(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

export default router;
