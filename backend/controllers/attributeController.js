const { Attribute } = require("../models/attribute");
const { AttributeOption } = require("../models/attributeOption");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.getAllAttributes = catchAsyncErrors(async (req, res, next) => {
  const attributeList = await Attribute.find();

  if (!attributeList) {
    return next(new ErrorHandler("Attributes not found", 500));
  }

  res.status(200).json({
    success: true,
    attributes: attributeList,
  });
});

exports.getAttributeById = catchAsyncErrors(async (req, res, next) => {
  const attribute = await Attribute.findById(req.params.id);

  if (!attribute) {
    return next(new ErrorHandler("Attribute not found", 404));
  }

  res.status(200).json({
    success: true,
    attribute,
  });
});

exports.createAttribute = catchAsyncErrors(async (req, res, next) => {
  const attribute = new Attribute({
    name: req.body.name,
  });

  const savedAttribute = await attribute.save();

  if (!savedAttribute) {
    return next(new ErrorHandler("Error creating attribute", 400));
  }

  if (req.body.attributeOptions) {
    try {
      // Parse attributeOptions if it's a string
      let attributeOptions;
      if (typeof req.body.attributeOptions === "string") {
        attributeOptions = JSON.parse(req.body.attributeOptions);
      } else {
        attributeOptions = req.body.attributeOptions;
      }

      if (Array.isArray(attributeOptions) && attributeOptions.length > 0) {
        const optionsToCreate = attributeOptions.map((option) => ({
          ...option,
          attributeId: savedAttribute._id,
        }));
        await AttributeOption.insertMany(optionsToCreate);
      }
    } catch (error) {
      console.error("Error processing attribute options:", error);
      // We don't want to fail the whole request if options processing fails
      // Just log the error and continue
    }
  }

  res.status(201).json({
    success: true,
    attribute: savedAttribute,
  });
});

exports.updateAttribute = catchAsyncErrors(async (req, res, next) => {
  const updatedAttribute = await Attribute.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
    },
    { new: true }
  );

  if (!updatedAttribute) {
    return next(new ErrorHandler("Error updating attribute", 400));
  }

  res.status(200).json({
    success: true,
    attribute: updatedAttribute,
  });
});

exports.deleteAttribute = catchAsyncErrors(async (req, res, next) => {
  // Find the attribute to be deleted
  const attribute = await Attribute.findById(req.params.id);

  if (!attribute) {
    return next(new ErrorHandler("Attribute not found", 404));
  }

  // Delete all attribute options associated with this attribute
  await AttributeOption.deleteMany({ attributeId: req.params.id });

  // Delete the attribute
  await Attribute.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Attribute and associated options deleted successfully",
  });
});
