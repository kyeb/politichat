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
const router = express.Router()

router.post("/newroom", (req, res) => {
  // generate random room ID number
  const roomID = Math.random().toString(36);

  // make a room object with keys id and roomName
  const room_temp = {id: roomID, roomName: req.body.roomName};

  // add room object to array of rooms
  rooms.push(room_temp);
  console.log(rooms)
  // then, send back the entire room object
  res.send(room_temp)
});

router.post("/deleteroom", (req, res) => {
  // delete room by its ID from the array rooms
  rooms = rooms.filter(function (e) {
    return e.id = req.query.id
  })
}); 

router.get("/rooms", (req, res) => {
  // returns all available rooms with names and IDs in an array
  res.send(rooms)
});

router.get("/room", (req,res) => {
  // returns just the room with a specific requested ID
  req.query.id
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
