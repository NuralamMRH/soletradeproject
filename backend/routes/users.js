const express = require("express");
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const {
  loginUser,
  forgotPassword,
  resetPassword,
  logout,
  getUserProfile,
  updatePassword,
  updateProfile,
  allUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  verifyOtp,
  deleteManyUsers,
  registerUser,
  loginAsGuest,
  registrationVerification,
} = require("../controllers/userController");
const upload = require("../config/multerConfig");

router.route("/guest").post(loginAsGuest);
router.route("/register").post(registerUser);
router.route("/registration-verification").post(registrationVerification);
router.route("/login").post(loginUser);
router.post("/logout", logout);

router.route("/my-account").get(isAuthenticatedUser, getUserProfile);

router.route("/password/reset/:token").post(resetPassword);

router.route("/password/forgot/:email").post(forgotPassword);
router.route("/password/verify-otp").put(verifyOtp);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router
  .route("/my-account/update")
  .put(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    updateProfile
  );

router.route("/admin/users").get(allUsers);

router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getUserDetails)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

router
  .route("/delete/users")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteManyUsers);

router
  .route("/admin/update/user")
  .put(
    upload.fields([{ name: "image" }]),
    isAuthenticatedUser,
    authorizeRoles("admin"),
    updateUser
  );

module.exports = router;
