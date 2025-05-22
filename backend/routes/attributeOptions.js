const express = require("express");
const router = express.Router();
const {
  getAllAttributeOptions,
  getAttributeOptionById,
  createAttributeOption,
  updateAttributeOption,
  deleteAttributeOption,
  getAttributeOptionsByAttributeId,
} = require("../controllers/attributeOptionController");

router.get(`/`, getAllAttributeOptions);
router.get("/:id", getAttributeOptionById);
router.post("/", createAttributeOption);
router.put("/:id", updateAttributeOption);
router.delete("/:id", deleteAttributeOption);
router.get(`/attribute/:attributeId`, getAttributeOptionsByAttributeId);

module.exports = router;
