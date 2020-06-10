import sharedsession from "express-socket.io-session";
import User from "./models/UserModel.js";
import socketio from "socket.io";

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object
const allConnectedSocketIDs = new Set();

const getAllConnectedUsers = () => Object.values(socketToUserMap);
const getSocketFromUsername = (username) => userToSocketMap[username];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];

const getAllConnectedSockets = () => {
  const sockets = new Set();
  allConnectedSocketIDs.forEach((s) => sockets.add(getSocketFromSocketID(s)));
  return sockets;
};

const addUser = (user, socket) => {
  const oldSocket = userToSocketMap[user.username];
  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    oldSocket.disconnect();
    delete socketToUserMap[oldSocket.id];
  }

  userToSocketMap[user.username] = socket;
  socketToUserMap[socket.id] = user;
  io.emit("activeUsers", { activeUsers: getAllConnectedUsers() });
};

const removeUser = (user, socket) => {
  if (user) delete userToSocketMap[user.username];
  delete socketToUserMap[socket.id];
  io.emit("activeUsers", { activeUsers: getAllConnectedUsers() });
};

const socket = {
  init: (http, session) => {
    io = socketio(http);
    //set up socket middleware
    io.use(
      sharedsession(session, {
        autoSave: true,
      })
    );
    io.use((socket, next) => {
      if (socket.handshake.session.passport) {
        socket.userId = socket.handshake.session.passport.user;
      } else {
        socket.userId = undefined;
      }
      next();
    });
    io.on("connection", async (socket) => {
      allConnectedSocketIDs.add(socket.id);
      if (socket.userId) {
        const userObj = await User.findById(socket.userId).select("-password");
        socket.emit("user", userObj.toJSON());
      }
      socket.on("disconnect", (reason) => {
        const user = getUserFromSocketID(socket.id);
        removeUser(user, socket);
        allConnectedSocketIDs.delete(socket.id);
      });
    });
  },

  addUser: addUser,
  removeUser: removeUser,

  getSocketFromUsername: getSocketFromUsername,
  getUserFromSocketID: getUserFromSocketID,
  getSocketFromSocketID: getSocketFromSocketID,
  getAllConnectedUsers: getAllConnectedUsers,
  getAllConnectedSockets: getAllConnectedSockets,

  getIo: () => io,
};
export default socket;
