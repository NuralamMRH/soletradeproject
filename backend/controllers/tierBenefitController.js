const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const TierBenefit = require("../models/TierBenefit");

// @desc    Create a new tier benefit
// @route   POST /api/tier-benefits
// @access  Private/Admin
const createTierBenefit = catchAsyncErrors(async (req, res) => {
  const { tier, category, products, sellerFee } = req.body;

  const tierBenefit = await TierBenefit.create({
    tier,
    category,
    products,
    sellerFee,
    ...req.body,
  });

  if (tierBenefit) {
    res.status(201).json(tierBenefit);
  } else {
    res.status(400);
    throw new Error("Invalid tier benefit data");
  }
});

// @desc    Get all tier benefits for a specific tier
// @route   GET /api/tier-benefits/:tierId
// @access  Private/Admin
const getTierBenefits = catchAsyncErrors(async (req, res) => {
  try {
    const { tierId } = req.params;

    if (!tierId) {
      return res.status(400).json({ message: "Tier ID is required" });
    }

    const tierBenefits = await TierBenefit.find({ tier: tierId })
      .populate("tier", "name")
      .populate("category", "name")
      .populate("product", "name")
      .populate("brand", "name");

    if (!tierBenefits) {
      return res
        .status(404)
        .json({ message: "No benefits found for this tier" });
    }

    res.status(200).json(tierBenefits);
  } catch (error) {
    console.error("Error in getTierBenefits:", error);
    res.status(500).json({
      message: "Error fetching tier benefits",
      error: error.message,
    });
  }
});

// @desc    Update a tier benefit
// @route   PUT /api/tier-benefits/:id
// @access  Private/Admin
const updateTierBenefit = catchAsyncErrors(async (req, res) => {
  const tierBenefit = await TierBenefit.findById(req.params.id);

  if (tierBenefit) {
    tierBenefit.category = req.body.category || tierBenefit.category;
    tierBenefit.products = req.body.products || tierBenefit.products;
    tierBenefit.sellerFee = req.body.sellerFee || tierBenefit.sellerFee;
    tierBenefit.isActive = req.body.isActive ?? tierBenefit.isActive;

    const updatedTierBenefit = await tierBenefit.save();
    res.json(updatedTierBenefit);
  } else {
    res.status(404);
    throw new Error("Tier benefit not found");
  }
});

// @desc    Delete a tier benefit
// @route   DELETE /api/v1/tier-benefits/:id
// @access  Private/Admin
const deleteTierBenefit = catchAsyncErrors(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Benefit ID is required" });
    }

    const tierBenefit = await TierBenefit.findById(id);

    if (!tierBenefit) {
      return res.status(404).json({ message: "Tier benefit not found" });
    }

    await tierBenefit.deleteOne();
    res.status(200).json({ message: "Tier benefit deleted successfully" });
  } catch (error) {
    console.error("Error in deleteTierBenefit:", error);
    res.status(500).json({
      message: "Error deleting tier benefit",
      error: error.message,
    });
  }
});

module.exports = {
  createTierBenefit,
  getTierBenefits,
  updateTierBenefit,
  deleteTierBenefit,
};
