// Grab a socket.io instance from our server-socket.js setup file, and bind to
//   the /video namespace
const io = require("./server-socket").getIo();

io.on("connection", (socket) => {
  socket.on("videoPCSignal", ({ desc, to, from, room }) => {
    console.log(`${from} sent an offer to ${to}`);
    socket.to(room).emit("videoPCSignal", { desc, to, from });
  });
});
