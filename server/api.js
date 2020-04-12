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
const io = socket.getIo();

const logger = require("pino")(); // use pino logger

// import models so we can interact with the database
const User = require("./models/user");

// array to store rooms
let rooms = [];

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

function isValid(str) {
  var check = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
  if (check.test(str)) {
    return false;
  }
  return true;
}

router.post("/newroom", (req, res) => {
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

  // generate random room ID number
  const roomID = Math.random().toString(36).substr(2, 9);

  // make a room object with keys id, roomName, user
  const room_temp = {
    id: roomID,
    roomName: req.body.roomName,
    owner: req.user.username,
    queue: [],
  };

  // add room object to array of rooms
  rooms.push(room_temp);

  // then, send back the entire room object
  res.send(room_temp);
});

router.post("/end", (req, res) => {
  // delete a room by its ID from the array of active rooms
  const length = rooms.length;
  rooms = rooms.filter(function (e) {
    return e.id !== req.body.id;
  });

  // sends true if was successful, false if not
  if (rooms.length == length) {
    res.send({ success: false });
  }
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

function removeFromQueue(roomID, userSocketID) {
  const room = rooms.find((e) => e.id === roomID);
  // if the room doesn't exist for some reason, exit
  if (!room) return;
  room.queue = room.queue.filter((e) => e !== userSocketID);
  logger.info(`User ${userSocketID} has left the queue`);
  updateHost(room);
}

function updateHost(room) {
  const ownerSocket = socket.getSocketFromUsername(room.owner);
  if (ownerSocket) {
    ownerSocket.emit("queue status", room.queue.length);
  }
}

router.post("/join", (req, res) => {
  console.log(rooms);
  console.log(req.body.socketID);
  // adds a user's socketID to the queue for the given room
  const userSocket = socket.getSocketFromSocketID(req.body.socketID);
  const room = rooms.find((e) => e.id === req.body.roomID);
  room.queue.push(userSocket.id);
  logger.info(`User ${userSocket.id} has joined the queue`);

  // set up a callback so that if the user disconnects, they get removed from
  //   the queue
  userSocket.on("disconnect", () => {
    removeFromQueue(room.id, userSocket.id);
  });

  // tell the room owner how many people are in the queue
  updateHost(room);

  res.send({ success: true });
});

router.post("/next", (req, res) => {
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

  // tell the first user in the queue they can connect
  const userSocketID = room.queue.shift();
  socket.getSocketFromSocketID(userSocketID).emit("host ready");

  // let the host know the queue length again, so they can update it
  updateHost(room);

  res.send({ success: true });
});

// TODO: this doesn't work right now since socket.userId is always undefined
//   For now, assume an owner doesn't disconnect and reconnect
// io.on("connection", (socket) => {
//   // when a logged-in user's socket reconnects, remember their socket so we
//   //   can communicate with them later
//   console.log("new socket connection");
//   console.log(socket.userId);
//   if (socket.userId) {
//     User.findById(socket.userId).then((user) => {
//       console.log("found owner");
//       for (let i = 0; i < rooms.length; i++) {
//         if (rooms[i].owner === user.username) {
//           rooms[roomIndex].ownerSocket = socket;
//           console.log("updating owner socket");
//         }
//       }
//     });
//   }
// });

router.get("/example", (req, res) => {
  logger.info("Log Hello World");
  res.send({ hello: "world" });
});

// keep the user-to-socket mapping current, so we know who is who
router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user) socket.addUser(req.user, socket.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  logger.warn(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
