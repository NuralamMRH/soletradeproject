const express = require("express");
const router = express.Router();
const {
  getAllAttributes,
  getAttributeById,
  createAttribute,
  updateAttribute,
  deleteAttribute,
} = require("../controllers/attributeController");
const upload = require("../config/multerConfig");

router.route("/").get(getAllAttributes);
router.route("/:id").get(getAttributeById);
router
  .route("/")
  .post(upload.fields([{ name: "image", maxCount: 1 }]), createAttribute);
router
  .route("/:id")
  .put(upload.fields([{ name: "image", maxCount: 1 }]), updateAttribute)
  .delete(deleteAttribute);

module.exports = router;
