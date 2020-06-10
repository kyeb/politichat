import passport from "passport";
import LocalStrategy from "passport-local";

import User from "./models/UserModel.js";
import bcrypt from "bcrypt";

function getLocalUser(username) {
  return User.findOne({ username })
    .select("+password")
    .then((user) => {
      if (user) return user.toJSON();
      return undefined;
    });
}

passport.use(
  new LocalStrategy({ usernameField: "username", passwordField: "password" }, async function (
    username,
    password,
    done
  ) {
    const userJson = await getLocalUser(username);
    if (userJson) {
      const match = await bcrypt.compare(password, userJson.password);
      if (!match) {
        return done(null, false);
      }
      delete userJson.password;
      return done(null, userJson);
    }
    return done(null, false);
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id).then((user) => {
    done(null, user.toJSON());
  });
});

export default passport;
