const mongoose = require("mongoose");
var schemaOptions = {
  toObject: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
};

const RoomSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    roomName: { type: String, required: true },
    owner: { type: String, required: true },
    ownerDisplayName: { type: String, required: true },
    current: { type: String, required: false },
    queue: [{ String }],
    link: { type: String, required: false },
    waitMessage: { type: String, required: false },
    exitMessage: { type: String, required: false },
    isScheduled: { type: Boolean, required: true },
    startTime: Date,
    userInfos: Map,
  },
  schemaOptions
);

// compile model from schema
module.exports = mongoose.model("room", RoomSchema);
