import express from "express";

import pino from "pino";
const logger = pino();

import User from "../models/UserModel.js";
import socket from "../server-socket.js";
import { needsAdmin } from "../middleware.js";

// api endpoints: all these paths will be prefixed with "/api/user/"
const router = express.Router();

router.get("/list", [needsAdmin], (req, res) => {
  User.find({}).then((users) => {
    res.send(users);
  });
});

router.post("/admin", [needsAdmin], (req, res) => {
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

router.post("/permissions", [needsAdmin], (req, res) => {
  User.findByIdAndUpdate(req.body.id, { canCreateRooms: req.body.canCreateRooms })
    .then((user) => res.send(user))
    .catch((err) => {
      logger.error(err);
      res.status(500).send({});
    });
});

router.post("/displayname", (req, res) => {
  if (!req.user) res.status(501).send({ error: "Must be logged in" });

  User.findByIdAndUpdate(req.user.id, { displayName: req.body.displayName }, () => {
    res.send({ success: true });
  });
});

router.post("/delete", [needsAdmin], (req, res) => {
  User.findByIdAndDelete(req.body.id)
    .then(() => {
      res.send({ success: true });
    })
    .catch((err) => {
      logger.error(err);
      res.send({ success: false });
    });
});

// keep the user-to-socket mapping current, so we know who is who
router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user) socket.addUser(req.user, socket.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

export default router;
