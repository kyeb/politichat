import express from "express";
import socket from "../server-socket.js";

import pino from "pino";
const logger = pino();

import Room from "../models/RoomModel.js";
import { needsAdmin, needsCanCreateRooms } from "../middleware.js";
import { isValid, validURL } from "../utilities.js";

// api endpoints: all these paths will be prefixed with "/api/room/"
const router = express.Router();

router.post("/new", [needsCanCreateRooms], (req, res) => {
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

router.get("/list", (req, res) => {
  // returns all available rooms with id and roomName in an array
  Room.find({ ended: false }).then((rooms) => {
    res.send(rooms);
  });
});

router.get("/", (req, res) => {
  // returns just the room with a specific requested ID
  // each room should have the id and roomName so far
  Room.findOne({ _id: req.query.id }).then((room) => {
    res.send(room);
  });
});

function updateQueueLength(room) {
  const ownerSocket = socket.getSocketFromUsername(room.owner);
  if (ownerSocket) {
    ownerSocket.emit("queue status", room.queue.length);
  }
}

function updateQueueArray(room) {
  const ownerSocket = socket.getSocketFromUsername(room.owner);
  let queue_info = [];
  for (let i = 0; i < room.queue.length; i++) {
    let current_id = room.queue[i];
    queue_info[i] = {
      id: room.queue[i],
      name: room.userInfos.get(current_id).name,
      town: room.userInfos.get(current_id).town,
    };
  }
  if (ownerSocket) {
    ownerSocket.emit("queue array", queue_info);
  }
}

router.get("/count", [needsAdmin], (req, res) => {
  Room.count({}).then((count) => {
    res.send({ roomCount: count });
  });
});

router.post("/clean", [needsAdmin], (req, res) => {
  Room.deleteMany({ ended: true }).then(() => {
    logger.info("Cleared all ended rooms.");
    res.send({ success: true });
  });
});

export default router;
