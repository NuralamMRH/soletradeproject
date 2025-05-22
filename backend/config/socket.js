// socket.js
let io;

module.exports = {
  init: (server) => {
    if (!io) {
      io = require("socket.io")(server, {
        cors: {
          origin: "*", // Use your frontend URL in production
          methods: ["GET", "POST"],
        },
      });
    }
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};