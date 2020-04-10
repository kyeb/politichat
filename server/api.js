/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

const logger = require("pino")(); // use pino logger

// import models so we can interact with the database
const User = require("./models/user");
const Room = require("./models/room");

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
  const room_temp = { id: roomID, roomName: req.body.roomName, user: req.user.username };

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

router.get("/example", (req, res, next) => {
  logger.info("Log Hello World");
  res.send({ hello: "world" });
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  logger.warn(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
