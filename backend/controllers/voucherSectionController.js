const VoucherSection = require("../models/VoucherSection");

exports.createSection = async (req, res) => {
  try {
    const { name, voucherIds, term } = req.body;
    const section = await VoucherSection.create({ name, voucherIds, term });
    res.status(201).json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSections = async (req, res) => {
  try {
    const sections = await VoucherSection.find().populate({
      path: "voucherIds.voucher",
      select: "poster discountAmount maxDiscount minSpend endDate",
    });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSectionById = async (req, res) => {
  try {
    const section = await VoucherSection.findById(req.params.id).populate(
      "voucherIds.voucher"
    );
    if (!section) return res.status(404).json({ error: "Not found" });
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { name, voucherIds, term } = req.body;
    const section = await VoucherSection.findByIdAndUpdate(
      req.params.id,
      { name, voucherIds, term },
      { new: true }
    );
    if (!section) return res.status(404).json({ error: "Not found" });
    res.json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const section = await VoucherSection.findByIdAndDelete(req.params.id);
    if (!section) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get the Discount of the week section (only one)
exports.getDiscountOfTheWeekSection = async (req, res) => {
  try {
    const section = await VoucherSection.findOne({ term: "weekly" })
      .sort({ updatedAt: -1 })
      .populate({
        path: "voucherIds.voucher",
        select: "poster discountAmount maxDiscount minSpend endDate brand",
      });
    if (!section) return res.status(404).json({ error: "Not found" });
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create Discount of the week section (if not exists)
exports.createDiscountOfTheWeekSection = async (req, res) => {
  try {
    const { name, voucherIds } = req.body;
    // Only one allowed
    const exists = await VoucherSection.findOne({ term: "weekly" });
    if (exists)
      return res.status(400).json({ error: "Section already exists" });
    const section = await VoucherSection.create({
      name,
      voucherIds,
      term: "weekly",
    });
    res.status(201).json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update Discount of the week section
exports.updateDiscountOfTheWeekSection = async (req, res) => {
  try {
    const { name, voucherIds } = req.body;
    const section = await VoucherSection.findOneAndUpdate(
      { term: "weekly" },
      { name, voucherIds },
      { new: true }
    );
    if (!section) return res.status(404).json({ error: "Not found" });
    res.json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
