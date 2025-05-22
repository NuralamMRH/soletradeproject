const app = require("./app");
const http = require("http");
const connectDatabase = require("./config/database");
const socket = require("./config/socket");

// const dotenv = require('dotenv');
const cloudinary = require("cloudinary").v2;

// Handle Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.stack}`);
  console.log("Shutting down due to uncaught exception");
  process.exit(1);
});

// Connecting to database
connectDatabase();

if (process.env.CLOUDINARY_CLOUD_NAME !== "")
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

const server = http.createServer(app);

// const server = app.listen(process.env.PORT, () => {
//   console.log(
//     `Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
//   );
// });

// Initialize socket.js
const io = socket.init(server);
// Socket.IO connection event
io.on("connection", function (socket) {
  require("./utils/socketEvents")(socket);
});

server.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(
    `Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
});

// Handle Unhandled Promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err.stack}`);
  console.log("Shutting down the server due to Unhandled Promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
