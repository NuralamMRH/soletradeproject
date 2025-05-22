const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");

// Create a new voucher
router.post("/", voucherController.createVoucher);

// Get all vouchers
router.get("/", voucherController.getVouchers);

// Get voucher by ID
router.get("/:id", voucherController.getVoucherById);

// Update voucher
router.put("/:id", voucherController.updateVoucher);

// Delete voucher
router.delete("/:id", voucherController.deleteVoucher);

module.exports = router;
