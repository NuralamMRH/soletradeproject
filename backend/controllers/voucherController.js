const Voucher = require("../models/Voucher");

// Create a new voucher
exports.createVoucher = async (req, res) => {
  try {
    let imageData = null;
    if (req.files.image) {
      imageData = await filesUpdatePromises(
        req,
        res,
        next,
        ["image"],
        "voucher"
      );
    }

    const arrayFields = [
      "categories",
      "brands",
      "subCategories",
      "subBrands",
      "attributes",
      "tiers",
      "shipmentMethods",
      "paymentMethods",
      "orderTypes",
      "terms",
    ];
    arrayFields.forEach((field) => {
      if (typeof req.body[field] === "string") {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (e) {
          req.body[field] = [];
        }
      }
    });

    const voucher = new Voucher({ ...req.body, ...imageData });
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
    let imageData = null;
    if (req.files.image) {
      imageData = await filesUpdatePromises(
        req,
        res,
        next,
        ["image"],
        "voucher"
      );
    }
    console.log("req.files.image", req.files);
    console.log("req.body.brand", req.body.brand);

    const arrayFields = [
      "categories",
      "brands",
      "subCategories",
      "subBrands",
      "attributes",
      "tiers",
      "shipmentMethods",
      "paymentMethods",
      "orderTypes",
      "terms",
    ];
    arrayFields.forEach((field) => {
      if (typeof req.body[field] === "string") {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (e) {
          req.body[field] = [];
        }
      }
    });

    const voucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...imageData },
      { new: true }
    );
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
