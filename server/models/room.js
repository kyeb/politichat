const mongoose = require("mongoose");
var schemaOptions = {
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
};

const RoomSchema = new mongoose.Schema(
  {
    key: String,
  },
  schemaOptions
);

// compile model from schema
module.exports = mongoose.model("room", RoomSchema);
