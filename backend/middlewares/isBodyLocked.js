// middlewares/isBodyLocked.js
const { Readable } = require("stream");

let lockedStreams = {};

const isBodyLocked = (req, res, next) => {
  if (!lockedStreams[req.originalUrl]) {
    // Create a locked ReadableStream
    const readable = new Readable({
      read() {
        this.push(null); // No data pushed to keep it locked
      },
    });
    readable.locked = true;
    lockedStreams[req.originalUrl] = readable;
  }

  req.bodyStream = lockedStreams[req.originalUrl];

  if (req.bodyStream.locked) {
    // Send response if the stream is locked
    return res.status(200).json({
      status: 200,
      statusText: "OK",
      headers: {
        date: new Date().toUTCString(),
        "content-type": "application/json",
        "transfer-encoding": "chunked",
        connection: "keep-alive",
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "*",
        "access-control-allow-headers": "*",
        "cache-control": "no-cache, private",
        server: "Express",
      },
      body: req.bodyStream,
      bodyUsed: true,
      ok: true,
      redirected: false,
      type: "basic",
      url: req.originalUrl,
    });
  }

  next(); // Proceed to the controller if not locked
};

const unlockBody = (req, res, next) => {
  const stream = lockedStreams[req.originalUrl];
  if (stream) {
    stream.locked = false;
    stream.push("Response content here"); // Push actual content
    stream.push(null); // End the stream
    delete lockedStreams[req.originalUrl]; // Cleanup after unlocking
  }
  next();
};

module.exports = { isBodyLocked, unlockBody };
