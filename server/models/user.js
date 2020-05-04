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
    username: { type: String, required: true },
    password: {
      type: String,
      required: true,
      select: false,
    },
    displayName: { type: String, required: true },
    admin: { type: Boolean, required: true },
    canCreateRooms: { type: Boolean, required: true },
  },
  schemaOptions
);

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
