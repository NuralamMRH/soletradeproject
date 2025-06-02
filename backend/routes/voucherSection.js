const express = require("express");
const router = express.Router();
const voucherSectionController = require("../controllers/voucherSectionController");

router.post("/", voucherSectionController.createSection);
router.get("/", voucherSectionController.getSections);
router.get(
  "/discount-of-the-week",
  voucherSectionController.getDiscountOfTheWeekSection
);
router.get("/:id", voucherSectionController.getSectionById);
router.put("/:id", voucherSectionController.updateSection);
router.delete("/:id", voucherSectionController.deleteSection);

router.post(
  "/discount-of-the-week",
  voucherSectionController.createDiscountOfTheWeekSection
);
router.put(
  "/discount-of-the-week",
  voucherSectionController.updateDiscountOfTheWeekSection
);

module.exports = router;
