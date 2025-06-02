const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const upload = require("../config/multerConfig");

// Create a new voucher
router
  .route("/")
  .post(
    upload.fields([{ name: "image", maxCount: 1 }]),
    voucherController.createVoucher
  );

// Get all vouchers
router.get("/", voucherController.getVouchers);

// Get voucher by ID
router.get("/:id", voucherController.getVoucherById);

// Update voucher
router
  .route("/:id")
  .put(
    upload.fields([{ name: "image", maxCount: 1 }]),
    voucherController.updateVoucher
  )
  .delete(voucherController.deleteVoucher);

// Delete voucher
router.delete("/:id", voucherController.deleteVoucher);

module.exports = router;
