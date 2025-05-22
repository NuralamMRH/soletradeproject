const multer = require("multer");

// Set up multer storage and file filter
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // Temporary folder for uploads
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB limit
//   },
//   fileFilter: function (req, file, cb) {
//     // Accept images only
//     if (!file.originalname.match(/\.(jpg|jpeg|png|gif|avif)$/)) {
//       return cb(new Error("Only image files are allowed!"), false);
//     }
//     cb(null, true);
//   },
// });


const upload = multer({ storage: storage });

module.exports = upload;
