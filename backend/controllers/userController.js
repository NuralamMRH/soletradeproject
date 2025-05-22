const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const bcrypt = require("bcryptjs");
const sendToken = require("../utils/jwtToken");
const { sendGmail } = require("../utils/sendEmail");
const { fileUploadPromises } = require("../utils/fileUploader");
const crypto = require("crypto");
const AppContent = require("../models/AppContent");
const { Vonage } = require("@vonage/server-sdk");
const twilio = require("twilio");

// Create a guest login endpoint
exports.loginAsGuest = catchAsyncErrors(async (req, res, next) => {
  // Generate a unique guest ID or guest user in the database
  const guest_id = `guest_${Date.now()}`;

  // Optionally create a new user in the database for tracking purposes
  const user = await User.create({
    role: "guest",
    guest_id: guest_id,
    email: `${guest_id}@guest.com`, // Placeholder email
    phone: "0000000000", // Placeholder phone
    password: `${guest_id}@SoleTrade`, // Placeholder phone
  });

  sendToken(user, 200, res);
});

// Register a user   => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  console.log(req.body);
  const {
    firstName,
    lastName,
    callingCode,
    phone,
    ref_code,
    ref_by,
    email,
    password,
    guest_id,
  } = req.body;

  let user;

  user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler("User already exists", 400));
  }

  // If guest_id is provided, find the guest user
  if (guest_id) {
    user = await User.findOne({ guest_id });
    if (user) {
      // Update guest user to a full account
      user.firstName = firstName;
      user.lastName = lastName;
      user.callingCode = callingCode;
      user.phone = phone;
      user.ref_code = ref_code;
      user.ref_by = ref_by;
      user.email = email;
      user.password = password;
      user.role = "user";
      await user.save();
    }
  }

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  // If no guest_id, create a new user
  if (!user) {
    user = await User.create({
      firstName,
      lastName,
      callingCode,
      phone,
      ref_code,
      ref_by,
      email,
      password,
      role: "user",
    });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

  user.phoneOTP = otp;
  user.phoneOTPExpires = otpExpires;
  await user.save();

  const appContent = await AppContent.findOne();

  if (appContent?.otp_verification_is_active) {
    if (appContent.otp_verification_type === "sms") {
      const provider = appContent.sms_otp_provider_name || "Vonage";
      const from = appContent.otp_api_sender_id || "SoleTrade";
      const to = user.phone; // Make sure phone is in international format
      const text = appContent.otp_verification_message_body.replace(
        "{{otp}}",
        otp
      );

      console.log(provider, from, to, text);

      try {
        if (provider === "Vonage") {
          const vonage = new Vonage({
            apiKey: appContent.sms_otp_api_key,
            apiSecret: appContent.otp_api_secret_key,
          });
          await vonage.sms.send({ to, from, text });
        } else if (provider === "Twilio") {
          const twilioClient = twilio(
            appContent.sms_otp_api_key,
            appContent.otp_api_secret_key
          );
          await twilioClient.messages.create({
            body: text,
            from: from, // This must be a Twilio-verified number
            to: to,
          });
        } else {
          // Add more providers here as needed
          throw new Error("Unsupported SMS provider");
        }
      } catch (err) {
        console.error("SMS sending error:", err);
        // Optionally: return next(new ErrorHandler("Failed to send OTP SMS", 500));
      }
    } else if (appContent.otp_verification_type === "email") {
      // Use custom email API if set, otherwise use default sendGmail
      const subject =
        appContent.otp_verification_message_subject || "OTP Verification";
      const html = appContent.otp_verification_message_body.replace(
        "{{otp}}",
        otp
      );

      if (appContent.email_otp_api_key) {
        // TODO: Integrate with your custom email API here if needed
        // Example: await sendWithCustomEmailAPI(...);
      } else {
        // Use default email sender
        await sendGmail({
          from:
            appContent.otp_api_sender_id || '"SoleTrade" <info@soletrade.com>',
          to: user.email,
          subject,
          html,
        });
      }
    }
  }

  // For manual/dev: log OTP to console or return in response
  console.log(`OTP for ${user.phone}: ${otp}`);
  // OR for dev only, send in response (never do this in production)
  res.status(201).json({
    success: true,
    message: "Account created successfully. Use this OTP to verify phone.",
    otp, // REMOVE THIS IN PRODUCTION!
    userId: user._id,
  });
  return;
});

// Login User  =>  /api/v1/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password, guest_id } = req.body;
  let user;

  // console.log(req.body);

  // Check if email and password are provided
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  // Find registered user by email
  user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  // Check password match
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  // Check for an existing guest account with guest_id
  if (guest_id) {
    const guestUser = await User.findOne({ guest_id });
    if (guestUser) {
      // Transfer any data you want from guestUser to user (e.g., cart items)
      await mergeGuestCart(guest_id, user);

      // Delete the guest account
      await User.deleteOne({ _id: guestUser._id });
    }
  }

  // Send response with token for the logged-in user
  sendToken(user, 200, res);
});

const mergeGuestCart = async (guest_id, user_id) => {
  const guestCartItems = await Cart.find({ guest_id, is_guest: true });

  for (const item of guestCartItems) {
    // Update the guest cart items to be associated with the user
    await Cart.findOneAndUpdate(
      { user_id, item_id: item.item_id },
      {
        $inc: { quantity: item.quantity },
        $set: { variation: item.variation }, // Update variations or any other details if needed
      },
      { upsert: true }
    );
  }

  // Remove the guest items now merged
  await Cart.deleteMany({ guest_id });
};

// Forgot Password   =>  /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.params.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the OTP and set expiration
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  await user.save({ validateBeforeSave: false });

  // Message to send via email
  const message = `Your password reset OTP is as follows:\n\n <h1>${otp}</h1>\n\nIf you did not request this email, please ignore it.\n\nHub`;

  try {
    await sendGmail({
      from: '"SoleTrade" <info@soletrade.com>',
      to: user.email,
      subject: "SoleTrade Password Recovery",
      html: `
        <div style="text-align: center; font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h4>Your Password Reset OTP</h4>
          <p style="font-size: 18px;">Your OTP is:</p>
          <div style="font-size: 30px; font-weight: bold; color: #007bff;">${otp}</div>
          <p>If you did not request this email, you can safely ignore it.</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: `OTP sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

exports.verifyOtp = catchAsyncErrors(async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Check if OTP matches and is not expired
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  if (
    hashedOtp !== user.resetPasswordToken ||
    user.resetPasswordExpire < Date.now()
  ) {
    return next(new ErrorHandler("Invalid or expired OTP", 400));
  }

  // OTP is valid, clear it from the database
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  user.password = password;

  await user.save();

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
  });
});

// Reset Password   =>  /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    user.password = password;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error resetting password: ${error.message}`, 500)
    );
  }
});

// Get currently logged in user details   =>   /api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("shippingAddress");

    res.status(200).json(user);
  } catch (error) {
    return next(
      new ErrorHandler(`Error getting user profile: ${error.message}`, 500)
    );
  }
});

// Update / Change password   =>  /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if (!isMatched) {
      return next(new ErrorHandler("Old password is incorrect"));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    return next(
      new ErrorHandler(`Error updating password: ${error.message}`, 500)
    );
  }
});

// Update user profile   =>   /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  try {
    // Update avatar

    // console.log(req.files.image);
    let uploadedFiles = req.body.image;
    if (req.files.image) {
      const fileNames = ["image"];
      uploadedFiles = await fileUploadPromises(
        req,
        res,
        next,
        fileNames,
        `user`
      );
    }

    const newUserData = {
      email: req.body.email,
      ...req.body,
      ...uploadedFiles,
    };

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error updating user profile: ${error.message}`, 500)
    );
  }
});

// Logout user   =>   /api/v1/logout

exports.logout = catchAsyncErrors(async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error logging out user: ${error.message}`, 500)
    );
  }
});

// Admin Routes

// Get all users   =>   /api/v1/admin/users
exports.allUsers = catchAsyncErrors(async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error getting all users: ${error.message}`, 500)
    );
  }
});

// Get user details   =>   /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHandler(`User does not found with id: ${req.params.id}`)
      );
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error getting user details: ${error.message}`, 500)
    );
  }
});

// Update user profile   =>   /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  try {
    let uploadedFiles = req.body.image;
    if (req.files.image) {
      const fileNames = ["image"];
      uploadedFiles = await fileUploadPromises(
        req,
        res,
        next,
        fileNames,
        `user`
      );
    }

    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      ...uploadedFiles,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error updating user profile: ${error.message}`, 500)
    );
  }
});

// Delete user   =>   /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHandler(`User does not found with id: ${req.params.id}`)
      );
    }

    // Remove avatar from cloudinary
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next(new ErrorHandler(`Error deleting user: ${error.message}`, 500));
  }
});

// Delete  => /api/v1/delete/s
exports.deleteManyUsers = catchAsyncErrors(async (req, res, next) => {
  try {
    // Validate input
    if (!req.body.ids || !Array.isArray(req.body.ids)) {
      return next(new ErrorHandler("Invalid request data", 400));
    }

    // Find the s to delete
    const users = await User.find({ _id: { $in: req.body.ids } });
    if (!users || users.length === 0) {
      return next(new ErrorHandler("Users not found", 404));
    }

    // Perform deletion
    await User.deleteMany({ _id: { $in: req.body.ids } });

    res.status(200).json({
      success: true,
      message: "Users have been deleted successfully.",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error deleting users: ${error.message}`, 500)
    );
  }
});

exports.registrationVerification = catchAsyncErrors(async (req, res, next) => {
  const { userId, otp } = req.body;
  const user = await User.findById(userId);

  if (!user) return next(new ErrorHandler("User not found", 404));
  if (!user.phoneOTP || !user.phoneOTPExpires)
    return next(new ErrorHandler("No OTP requested", 400));
  if (user.phoneOTP !== otp) return next(new ErrorHandler("Invalid OTP", 400));
  if (user.phoneOTPExpires < Date.now())
    return next(new ErrorHandler("OTP expired", 400));

  user.is_phone_verified = true;
  user.phoneOTP = undefined;
  user.phoneOTPExpires = undefined;
  await user.save();

  res.status(200).json({ success: true, message: "Phone verified" });
});
