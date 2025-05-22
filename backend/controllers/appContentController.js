const fileUpload = require("express-fileupload");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const AppContent = require("../models/AppContent");
const ErrorHandler = require("../utils/errorHandler");
const {
  fileUploadPromises,
  filesUpdatePromises,
  fileUpdatePromises,
  deleteFileByUrl,
  filesUpdateWithExisting,
} = require("../utils/fileUploader");

exports.getAppContent = catchAsyncErrors(async (req, res, next) => {
  try {
    const appContent = await AppContent.findOne();

    if (!appContent) {
      return next(new ErrorHandler("App content not found", 404));
    }

    res.status(200).json({
      success: true,
      data: appContent,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error fetching app content: ${error.message}`, 500)
    );
  }
});

exports.createUpdateAppContent = catchAsyncErrors(async (req, res, next) => {
  try {
    let app_content = await AppContent.findOne();
    let updatedFiles;
    if (app_content) {
      let updatedFiles = {};

      // console.log("req.body", req.body);
      // console.log("req.files", req.files);

      if (req.files && req.files.appLogo) {
        updatedFiles = await fileUpdatePromises(
          req,
          res,
          next,
          ["appLogo"],
          "app-settings",
          app_content
        );
      }

      if (
        (req.files && req.files.homeSlider) ||
        (req.files && req.files.soleCheckSlider)
      ) {
        updatedFiles = await filesUpdateWithExisting(
          req,
          ["homeSlider", "soleCheckSlider"],
          "app-settings",
          app_content
        );
        console.log("updatedFiles", updatedFiles);
      }

      app_content = await AppContent.findByIdAndUpdate(
        app_content._id,
        { ...req.body, ...updatedFiles },
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      if (req.files && req.files.appLogo) {
        updatedFiles = await fileUploadPromises(
          req,
          res,
          next,
          ["appLogo"],
          "app-settings"
        );
      }

      if (
        (req.files && req.files.homeSlider) ||
        (req.files && req.files.soleCheckSlider)
      ) {
        updatedFiles = await filesUpdatePromises(
          req,
          res,
          next,
          ["homeSlider", "soleCheckSlider"],
          "app-settings"
        );
      }

      app_content = await AppContent.create({
        ...req.body,
        ...updatedFiles,
      });
    }

    res.status(201).json({
      success: true,
      data: app_content,
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        `Error creating/updating app content: ${error.message}`,
        500
      )
    );
  }
});

exports.deleteAppContent = catchAsyncErrors(async (req, res, next) => {
  try {
    const appContent = await AppContent.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "App content deleted successfully",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error deleting app content: ${error.message}`, 500)
    );
  }
});

exports.deleteAppContentFile = catchAsyncErrors(async (req, res, next) => {
  try {
    const { field, fileUrl } = req.body;

    const appContent = await AppContent.findOne();

    if (!appContent) {
      return next(new ErrorHandler("App content not found", 404));
    }

    let updateData = {};

    if (field === "appLogo") {
      updateData = {
        appLogo: "",
        appLogo_full_url: "",
      };
    }

    if (field === "homeSlider") {
      const filteredSlider = appContent.homeSlider.filter(
        (slider) => slider.file_full_url !== fileUrl && slider.file !== fileUrl
      );
      updateData = {
        homeSlider: filteredSlider,
      };
    }

    if (field === "soleCheckSlider") {
      const filteredSlider = appContent.soleCheckSlider.filter(
        (slider) => slider.file_full_url !== fileUrl && slider.file !== fileUrl
      );
      updateData = {
        soleCheckSlider: filteredSlider,
      };
    }

    await deleteFileByUrl(fileUrl);

    const updatedAppContent = await AppContent.findByIdAndUpdate(
      appContent._id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "App content files deleted successfully",
      data: updatedAppContent,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error deleting app content file: ${error.message}`, 500)
    );
  }
});
