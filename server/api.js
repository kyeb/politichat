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

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

router.get("/example", (req, res, next) => {
  logger.info("Log Hello World");
  res.send({ hello: "world" });
});

router.get("/rooms", (req, res) => {
  Room.find({}).then((rooms) => {
    res.send(rooms);
  });
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  logger.warn(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
