/*
|--------------------------------------------------------------------------
| auth.js -- Auth API routes
|--------------------------------------------------------------------------
|
| This file defines the API authentication routes for your server.
|
*/
const express = require("express");
const logger = require("pino")(); // import pino logger
const passport = require("./passport");
//add error handling to async endpoints
const { decorateRouter } = require("@awaitjs/express");

// api endpoints: all these paths will be prefixed with "/api/"
const router = decorateRouter(express.Router());

const SALT_ROUNDS = 10;
const bcrypt = require("bcrypt");
const User = require("./models/user");
const ALREADY_REGISTERED_ERROR = "username_conflict";

router.get("/logout", (req, res) => {
  if (req.user) {
    logger.info(`Logged out user ID ${req.user.id}`);
  } else {
    logger.info(`Already logged out!`);
  }
  req.logout();
  res.send({});
});

async function createUser(username, password, displayName) {
  // Throws if user exists
  if (await User.findOne({ username })) {
    throw Error(ALREADY_REGISTERED_ERROR);
  }
  const hashedSaltedPwd = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = new User({
    username: username,
    password: hashedSaltedPwd,
    displayName: displayName,
  });
  return newUser.save();
}

router.postAsync("/register", async (req, res) => {
  try {
    const user = await createUser(req.body.username, req.body.password, req.body.displayName);
    req.login(user, function (err) {
      logger.info(`Local Auth: Registed user ID ${req.user.id}`);
      req.user.password = undefined;
      res.send(req.user);
    });
  } catch (error) {
    if (error.message != ALREADY_REGISTERED_ERROR) {
      logger.error("Error registering user", error);
      throw error;
    }
    res.status(403).send({ error: ALREADY_REGISTERED_ERROR });
  }
});

router.post("/login", passport.authenticate("local"), function (req, res) {
  logger.info(`Local Auth: Logged in user ID ${req.user.id}`);
  res.send(req.user);
});

module.exports = router;
