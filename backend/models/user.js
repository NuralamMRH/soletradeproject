const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  username: {
    type: String,
  },
  image: {
    type: String,
    default: "",
  },
  image_full_url: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter valid email address"],
  },
  password: {
    type: String,
    minlength: [6, "Your password must be longer than 6 characters"],
    select: false,
  },
  callingCode: {
    type: String,
    maxLength: [5, "Your callingCode cannot exceed 5 characters"],
  },
  phone: {
    type: String,
    maxLength: [30, "Your name cannot exceed 30 characters"],
  },

  role: {
    type: String,
    enum: ["admin", "user", "seller", "buyer", "guest"],
    default: "guest", // Default role
  },
  sneaker_size: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    default: "",
  },
  expoPushToken: {
    type: String,
  },
  guest_id: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  login_medium: {
    type: String,
    required: false,
  },
  ref_code: {
    type: String,
    required: false,
  },
  ref_by: {
    type: String,
    required: false,
  },
  social_id: {
    type: String,
    required: false,
  },
  is_email_verified: { type: Boolean, default: false },
  is_phone_verified: { type: Boolean, default: false },
  wallet_balance: {
    type: Number,
    default: 0,
  },
  loyalty_point: {
    type: Number,
    default: 0,
  },
  buyer: {
    currentSpent: {
      type: Number,
      default: 0,
    },
    targetSpent: {
      type: Number,
      default: 0,
    },
    currentOrders: {
      type: Number,
      default: 0,
    },
    daysLeft: {
      type: Number,
      default: 0,
    },
    period: {
      type: String,
      default: "",
    },
    nextTier: {
      type: Number,
      default: 0,
    },
  },
  seller: {
    currentSpent: {
      targetSpent: {
        type: Number,
        default: 0,
      },
      currentOrders: {
        type: Number,
        default: 0,
      },
      type: Number,
      default: 0,
    },
    daysLeft: {
      type: Number,
      default: 0,
    },
    period: {
      type: String,
      default: "",
    },
    nextTier: {
      type: Number,
      default: 0,
    },
  },
  isNotificationEnabled: {
    type: Boolean,
    default: true,
  },
  is_email_notification_enabled: {
    type: Boolean,
    default: true,
  },
  is_push_notification_enabled: {
    type: Boolean,
    default: true,
  },
  promos_and_releases_notification_enabled: {
    type: Boolean,
    default: true,
  },
  purchase_and_sales_notification_enabled: {
    type: Boolean,
    default: true,
  },
  email_subscription_enabled: {
    type: Boolean,
    default: true,
  },
  phoneOTP: {
    type: String,
  },
  phoneOTPExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// To include the virtuals when converting to JSON or Object
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

userSchema.virtual("shippingAddress", {
  ref: "Shipping",
  localField: "_id",
  foreignField: "user",
});

userSchema.virtual("searchKeywords", {
  ref: "SearchKeyword",
  localField: "_id",
  foreignField: "userId",
});

userSchema.virtual("recentlyViewedProducts", {
  ref: "RecentViewed",
  localField: "_id",
  foreignField: "userId",
});

// Encrypting password before saving user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  if (!this.name) {
    this.name = this.firstName + " " + this.lastName;
  }

  if (!this.username) {
    this.username = await this.generateSlug(this.name);
  }

  if (!this.password) {
    this.password = await this.generatePassword();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
userSchema.methods.getJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role, // Include the role in the payload
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_TIME,
    }
  );
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

userSchema.methods.generateSlug = async function (name) {
  let username = name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

  const existingUsername = await this.constructor
    .findOne({ username: new RegExp(`^${username}`, "i") })
    .sort({ _id: -1 });

  if (existingUsername) {
    const lastUsername = existingUsername.username;
    const usernameParts = lastUsername.split("-");
    const lastCount = parseInt(usernameParts[usernameParts.length - 1], 10);

    if (isNaN(lastCount)) {
      username = `${username}-2`; // Append '-2' if no numeric suffix
    } else {
      username = `${username}-${lastCount + 1}`; // Increment numeric suffix
    }
  }

  return username;
};

// Generate a random password if none is provided
userSchema.methods.generatePassword = async function () {
  const chars = process.env.PASSWORD_GENERATION;
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

module.exports = mongoose.model("User", userSchema);
