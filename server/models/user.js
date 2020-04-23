const mongoose = require("mongoose");
var schemaOptions = {
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
};

const UserSchema = new mongoose.Schema(
  {
    username: String,
    password: {
      type: String,
      required: true,
      select: false,
    },
    displayName: String,
    admin: Boolean,
    canCreateRooms: Boolean,
  },
  schemaOptions
);

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
