const mongoose = require("mongoose");

const appContentSchema = mongoose.Schema(
  {
    appLogo: {
      type: String,
      default: "",
    },
    appLogo_full_url: {
      type: String,
      default: "",
    },
    homeSlider: [],
    soleCheckSlider: [],
    app_launch_screen_type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    app_launch_screen_images: [],

    app_launch_screen_video: {
      type: String,
      default: "",
    },
    app_launch_screen_video_full_url: {
      type: String,
      default: "",
    },
    app_launch_screen_title: {
      type: String,
      default: "",
    },
    app_launch_screen_description: {
      type: String,
      default: "",
    },
    app_launch_screen_button_text: {
      type: String,
      default: "",
    },
    app_launch_screen_button_link: {
      type: String,
      default: "",
    },
    animation_duration: {
      type: Number,
      default: 0,
    },
    animation_type: {
      type: String,
      default: "",
    },
    otp_verification_is_active: {
      type: Boolean,
      default: false,
    },
    otp_verification_type: {
      type: String,
      enum: ["sms", "email"],
      default: "sms",
    },
    sms_otp_api_key: {
      type: String,
      default: "",
    },
    email_otp_api_key: {
      type: String,
      default: "",
    },
    otp_api_secret_key: {
      type: String,
      default: "",
    },
    otp_api_sender_id: {
      type: String,
      default: "",
    },
    sms_otp_provider_name: {
      type: String,
      enum: ["Vonage", "Twilio"],
      default: "Vonage",
    },
    otp_verification_message: {
      type: String,
      default: "A text message sent using the SMS API",
    },
    otp_verification_message_subject: {
      type: String,
      default: "OTP Verification",
    },
    otp_verification_message_body: {
      type: String,
      default: "Your OTP is: {{otp}}",
    },
    is_app_launch_screen_active: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

appContentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

appContentSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("AppContent", appContentSchema);
