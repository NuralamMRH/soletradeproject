const Voucher = require("../models/Voucher");

// Create a new voucher
exports.createVoucher = async (req, res) => {
  try {
    const voucher = new Voucher(req.body);
    await voucher.save();
    res.status(201).json(voucher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all vouchers
exports.getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find()
      .populate("categories")
      .populate("subCategories")
      .populate("brands")
      .populate("subBrands")
      .populate("attributes")
      .populate("tiers")
      .populate("poster");
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get voucher by ID
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id)
      .populate("categories")
      .populate("subCategories")
      .populate("brands")
      .populate("subBrands")
      .populate("attributes")
      .populate("tiers")
      .populate("poster");
    if (!voucher) return res.status(404).json({ error: "Voucher not found" });
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update voucher
exports.updateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!voucher) return res.status(404).json({ error: "Voucher not found" });
    res.json(voucher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete voucher
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) return res.status(404).json({ error: "Voucher not found" });
    res.json({ message: "Voucher deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
