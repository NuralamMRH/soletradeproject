const deleteFiles = async (req, res) => {
  const { fileUrl } = req.query;
  if (fileUrl) {
    await deleteFileByUrl(fileUrl);
    res.status(200).json({ message: "File deleted successfully" });
  } else {
    const { fileUrls } = req.body;
    if (fileUrls.length > 0) {
      await deleteFilesByUrls(fileUrls);
      res.status(200).json({ message: "Files deleted successfully" });
    } else {
      res.status(400).json({ message: "No files to delete" });
    }
  }
};

const express = require("express");
const { isAuthenticatedUser } = require("../middlewares/auth");
const { deleteFileByUrl, deleteFilesByUrls } = require("../utils/fileUploader");
const router = express.Router();

router.route("/").delete(isAuthenticatedUser, deleteFiles);

module.exports = router;
