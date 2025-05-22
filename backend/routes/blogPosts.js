const express = require("express");
const router = express.Router();

const {
  getAllBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogPostCount,
  getFeaturedBlogPosts,
  updateBlogPostGallery,
} = require("../controllers/blogPostController");

const upload = require("../config/multerConfig");

router.route("/").get(getAllBlogPosts);

router.route("/:id").get(getBlogPostById);

router.route("/").post(
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  createBlogPost
);

router
  .route("/:id")
  .put(
    upload.fields([
      { name: "image", maxCount: 1 },
      { name: "images", maxCount: 10 },
    ]),
    updateBlogPost
  )
  .delete(deleteBlogPost);

router.route("/get/count").get(getBlogPostCount);

router.route("/get/featured/:count").get(getFeaturedBlogPosts);

router
  .route("/gallery-images/:id")
  .put(upload.array("images", 10), updateBlogPostGallery);

module.exports = router;
