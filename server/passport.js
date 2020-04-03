const passport = require("passport");
var LocalStrategy = require("passport-local");

const User = require("./models/user");
const bcrypt = require("bcrypt");

function getLocalUser(username) {
  return User.findOne({ username }).then((user) => {
    if (user) return user.toJSON();
    return undefined;
  });
}

passport.use(
  new LocalStrategy({ usernameField: "username", passwordField: "password" }, async function(
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

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id)
    .select("-password")
    .then((user) => {
      done(null, user.toJSON());
    });
});

module.exports = passport;
