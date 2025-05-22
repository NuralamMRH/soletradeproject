const { AttributeOption } = require("../models/attributeOption");
const { Attribute } = require("../models/attribute");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.getAllAttributeOptions = catchAsyncErrors(async (req, res, next) => {
  const attributeOptionList = await AttributeOption.find().populate(
    "attributeId"
  );

  if (!attributeOptionList) {
    return next(new ErrorHandler("Attribute options not found", 500));
  }

  res.status(200).json({
    success: true,
    attributeOptions: attributeOptionList,
  });
});

exports.getAttributeOptionById = catchAsyncErrors(async (req, res, next) => {
  const attributeOption = await AttributeOption.findById(
    req.params.id
  ).populate("attributeId");

  if (!attributeOption) {
    return next(new ErrorHandler("Attribute option not found", 404));
  }

  res.status(200).json({
    success: true,
    attributeOption,
  });
});

exports.createAttributeOption = catchAsyncErrors(async (req, res, next) => {
  const attributeOption = new AttributeOption({
    optionName: req.body.optionName,
    attributeId: req.body.attributeId,
  });

  const savedAttributeOption = await attributeOption.save();

  if (!savedAttributeOption) {
    return next(new ErrorHandler("Error creating attribute option", 400));
  }

  res.status(201).json({
    success: true,
    attributeOption: savedAttributeOption,
  });
});

exports.updateAttributeOption = catchAsyncErrors(async (req, res, next) => {
  const updatedAttributeOption = await AttributeOption.findByIdAndUpdate(
    req.params.id,
    {
      optionName: req.body.optionName,
      attributeId: req.body.attributeId,
    },
    { new: true }
  );

  if (!updatedAttributeOption) {
    return next(new ErrorHandler("Error updating attribute option", 400));
  }

  res.status(200).json({
    success: true,
    attributeOption: updatedAttributeOption,
  });
});

exports.deleteAttributeOption = catchAsyncErrors(async (req, res, next) => {
  const attributeOption = await AttributeOption.findOneAndDelete({
    _id: req.params.id,
  });

  if (!attributeOption) {
    return next(new ErrorHandler("Attribute option not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Attribute option deleted successfully",
  });
});

exports.getAttributeOptionsByAttributeId = catchAsyncErrors(
  async (req, res, next) => {
    const attributeOptionList = await AttributeOption.find({
      attributeId: req.params.attributeId,
    }).populate("attributeId");

    if (!attributeOptionList) {
      return next(new ErrorHandler("Attribute options not found", 500));
    }

    res.status(200).json({
      success: true,
      attributeOptions: attributeOptionList,
    });
  }
);
