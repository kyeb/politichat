const express = require("express");
const socket = require("./server-socket");

const logger = require("pino")(); // use pino logger

const User = require("./models/UserModel");
const Room = require("./models/RoomModel");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();
