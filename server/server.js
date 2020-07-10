/*
|--------------------------------------------------------------------------
| server.js -- The core of your server
|--------------------------------------------------------------------------
|
| This file defines how your server starts up. Think of it as the main() of your server.
| At a high level, this file does the following things:
| - Connect to the database
| - Sets up server middleware (i.e. addons that enable things like json parsing, user login)
| - Hooks up all the backend routes specified in api.js
| - Fowards frontend routes that should be handled by the React router
| - Sets up error handling in case something goes wrong when handling a request
| - Actually starts the webserver
*/

// get environment variables configured
import dotenv from "dotenv";
import pino from "pino";

dotenv.config();
const logger = pino();

import { Server } from "http";
import express from "express";
import expressSession from "express-session";
import path from "path";
const __dirname = path.resolve();

import { init } from "./db.js";

// library that stores info about each connected user
const session = expressSession({
  secret: "secret!!!",
  resave: false,
  saveUninitialized: true,
});

import { resolve, join } from "path"; // provide utilities for working with file and directory paths

import api from "./api.js";
import auth from "./routes/auth.js";
import passport from "./passport.js";

// import socket
import socket from "./server-socket.js";

// initialize database connection
init();

// create a new express server
const app = express();

// allow us to process POST requests
app.use(express.json());

//register express session middleware
app.use(session);

//register passport & passport session middleware
app.use(passport.initialize());
app.use(passport.session());

//connect authentication routes
app.use("/auth", auth);

// connect user-defined routes
app.use("/api", api);

// load the compiled react files, which will serve /index.html and /bundle.js
const reactPath = resolve(__dirname, "client", "dist");
app.use(express.static(reactPath));

// for all other routes, render index.html and let react router handle it
app.get("*", (req, res) => {
  res.sendFile(join(reactPath, "index.html"));
});

// any server errors cause this function to run
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) {
    // 500 means Internal Server Error
    logger.error("The server errored when processing a request!");
    logger.error(err);
  }

  res.status(status).send({
    status: status,
    message: err.message,
  });
});

// listen to env var for port, otherwise default to 3000.
const port = process.env.PORT || 3000;
const server = Server(app);
socket.init(server, session);

server.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
