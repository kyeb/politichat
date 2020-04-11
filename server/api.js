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

router.post("/newroom", (req, res) => {
  // error if room with same name already exists
  if (rooms.find((room) => room.roomName === req.body.roomName)) {
    res.status(400).send({ msg: "Room with that name already exists" });
    return;
  }

  // generate random room ID number
  const roomID = Math.random().toString(36);

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

router.get("/deleteroom", (req, res) => {
  // delete a room by its ID from the array rooms
  rooms = rooms.filter(function (e) {
    return e.id !== req.query.id;
  });
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

router.post("/join", (req, res) => {
  // adds a user's socket to the queue for the given room
  const roomIndex = rooms.findIndex((e) => e.id === req.body.id);
  rooms[roomIndex].queue.push(req.user.username);

  // tell the owner to enable the "next" button, since someone is in the queue
  socket.getSocketFromUsername(room.owner).emit("queue ready");
  res.send({ success: true });
});

router.post("/next", (req, res) => {
  const room = rooms.find((e) => e.id === req.body.id);
  // ensure logged in as owner
  if (req.user && room.owner !== req.user.username) {
    res.status(401).send({});
    return;
  }

  // tell the first user in the queue they can connect
  socket.getSocketFromUsername(room.queue.shift()).emit("host ready");

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
