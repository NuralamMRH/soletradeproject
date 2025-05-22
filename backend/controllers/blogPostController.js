const { BlogPost } = require("../models/blogPost");
const mongoose = require("mongoose");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.getAllBlogPosts = catchAsyncErrors(async (req, res, next) => {
  const blogList = await BlogPost.find().populate("brand");

  if (!blogList) {
    return next(new ErrorHandler("Blog posts not found", 500));
  }

  res.status(200).json({
    success: true,
    blogPosts: blogList,
  });
});

exports.getBlogPostById = catchAsyncErrors(async (req, res, next) => {
  const blogPost = await BlogPost.findById(req.params.id).populate("brand");

  if (!blogPost) {
    return next(new ErrorHandler("Blog post not found", 404));
  }

  res.status(200).json({
    success: true,
    blogPost,
  });
});

exports.createBlogPost = catchAsyncErrors(async (req, res, next) => {
  const imageFile = req.files["image"];
  const fileName = imageFile ? imageFile[0].filename : null;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  const imagesFiles = req.files["images"];
  let imagesPaths = [];
  if (imagesFiles) {
    imagesPaths = imagesFiles.map((file) => {
      return `${basePath}${file.filename}`;
    });
  }

  const blogPost = new BlogPost({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    images: imagesPaths,
    brand: req.body.brand,
    isFeatured: req.body.isFeatured,
  });

  const savedBlogPost = await blogPost.save();

  if (!savedBlogPost) {
    return next(new ErrorHandler("Error creating blog post", 500));
  }

  res.status(201).json({
    success: true,
    blogPost: savedBlogPost,
  });
});

exports.updateBlogPost = catchAsyncErrors(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new ErrorHandler("Invalid blog ID", 400));
  }

  const blogPost = await BlogPost.findById(req.params.id);
  if (!blogPost) {
    return next(new ErrorHandler("Blog post not found", 404));
  }

  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  let imagepath = blogPost.image;

  // Handle single file upload
  const imageFile = req.files && req.files["image"];
  if (imageFile) {
    const fileName = imageFile[0].filename;
    imagepath = `${basePath}${fileName}`;
  }

  // Handle multiple file upload
  const imagesFiles = req.files && req.files["images"];
  let imagesPaths = blogPost.images;
  if (imagesFiles) {
    imagesPaths = imagesFiles.map((file) => `${basePath}${file.filename}`);
  }

  const updatedBlogPost = await BlogPost.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagepath,
      images: imagesPaths,
      brand: req.body.brand,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!updatedBlogPost) {
    return next(new ErrorHandler("Error updating blog post", 500));
  }

  res.status(200).json({
    success: true,
    blogPost: updatedBlogPost,
  });
});

exports.deleteBlogPost = catchAsyncErrors(async (req, res, next) => {
  const blogPost = await BlogPost.findByIdAndDelete(req.params.id);

  if (!blogPost) {
    return next(new ErrorHandler("Blog post not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Blog post deleted successfully",
  });
});

exports.getBlogPostCount = catchAsyncErrors(async (req, res, next) => {
  const blogCount = await BlogPost.countDocuments();

  if (!blogCount) {
    return next(new ErrorHandler("Error getting blog count", 500));
  }

  res.status(200).json({
    success: true,
    blogCount,
  });
});

exports.getFeaturedBlogPosts = catchAsyncErrors(async (req, res, next) => {
  const count = req.params.count ? req.params.count : 0;
  const blogPosts = await BlogPost.find({ isFeatured: true }).limit(+count);

  if (!blogPosts) {
    return next(new ErrorHandler("Featured blog posts not found", 500));
  }

  res.status(200).json({
    success: true,
    blogPosts,
  });
});

exports.updateBlogPostGallery = catchAsyncErrors(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new ErrorHandler("Invalid blog post ID", 400));
  }

  const blogPost = await BlogPost.findById(req.params.id);
  if (!blogPost) {
    return next(new ErrorHandler("Blog post not found", 404));
  }

  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  // Handle multiple file upload
  const imagesFiles = req.files && req.files["images"];
  let imagesPaths = blogPost.images;
  if (imagesFiles) {
    imagesPaths = imagesFiles.map((file) => `${basePath}${file.filename}`);
  }

  const updatedBlogPost = await BlogPost.findByIdAndUpdate(
    req.params.id,
    {
      images: imagesPaths,
    },
    { new: true }
  );

  if (!updatedBlogPost) {
    return next(new ErrorHandler("Error updating blog post gallery", 500));
  }

  res.status(200).json({
    success: true,
    blogPost: updatedBlogPost,
  });
});
