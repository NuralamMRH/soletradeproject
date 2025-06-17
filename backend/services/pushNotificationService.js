const socket = require("../config/socket");
const { Expo } = require("expo-server-sdk");
const expo = new Expo();
const User = require("../models/user");
const { createLog } = require("../controllers/log/logController");
const { Wishlist } = require("../models/Wishlist");
const { Product } = require("../models/product");
const mongoose = require("mongoose");

const sentNotificationsCache = new Map();

// Function to send push notification via Expo
const sendExpoPushNotification = async (
  expoPushToken,
  title,
  body,
  data = {}
) => {
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
    return;
  }

  const message = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
    data: {
      ...data,
      model: data.model,
    },
    // priority: "high",
    // channelId: "default",
    // badge: 1,
    // categoryIdentifier: "default",
    // image: data.productImage,
    // contentAvailable: true,
    // sound: "default",
    // icon: "notification_icon",
    // tag: data.type || "default",
    // group: "sole_trade_notifications",
    // androidPriority: "high",
    // androidChannelId: "default",
    // androidSound: true,
    // androidVibrate: [0, 250, 250, 250],
    // androidLight: true,
    // androidColor: "#FF231F7C",
    // androidIcon: "notification_icon",
    // androidTag: data.type || "default",
    // androidGroup: "sole_trade_notifications",
  };

  try {
    await expo.sendPushNotificationsAsync([message]);
    console.log("Push notification sent successfully");
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};

// Function to send socket notification
const sendSocketNotification = (userId, notification) => {
  socket.to(`user_${userId}`).emit("notification", notification);
};

// Main function to send notification
const sendNotification = async (userId, title, body, data = {}) => {
  // console.log("userId", userId);
  // console.log("title", title);
  // console.log("body", body);
  // console.log("data", data);
  try {
    // Get user's push token
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User ${userId} not found`);
      return;
    }

    console.log("Expo Push Token", user.expoPushToken);

    // Create notification object
    const notification = {
      title,
      body,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    };

    // Send socket notification for in-app notifications
    // sendSocketNotification(userId, notification);

    await createLog({
      user_id: userId,
      name: "Notification",
      model_id: data.productId,
      model: data.model,
      action: "notification",
      data: { userId, notification },
      message: `Notification sent to ${user.name}`,
    });

    // Send Expo push notification for background notifications
    if (user.expoPushToken) {
      await sendExpoPushNotification(user.expoPushToken, title, body, data);
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// Function to trigger notification
const triggerNotification = async (
  userId,
  productId,
  productName,
  productImage,
  model,
  title,
  body,
  type
) => {
  const cacheKey = `${userId}_${productId}`;
  const now = Date.now();
  const lastNotification = sentNotificationsCache.get(cacheKey) || 0;

  // console.log("Now - Last Notification", now - lastNotification);
  // console.log("productId", productId);
  // console.log("triggerNotification userId", userId);

  // Only send notification if last notification was sent more than 1 hour ago
  if (now - lastNotification > 3600000) {
    await sendNotification(userId, title, body, {
      type: type,
      productId,
      productName,
      productImage,
      model: model,
    });
    sentNotificationsCache.set(cacheKey, now);
  }

  //Instant test notification
  // await sendNotification(userId, title, body, {
  //   type: type,
  //   productId,
  //   productName,
  //   productImage,
  //   model: model,
  // });
};

// Function to handle trigger notifications
const handleTriggerCalenderNotifications = async () => {
  try {
    const today = new Date();
    const products = await Product.find({
      addToCalendar: true,
      $or: [{ pushNotified: false }, { pushNotified: { $exists: false } }],
      calenderDateTime: {
        $lte: today,
      },
    });
    // console.log("Today", today);

    // console.log("Calender products", products.length);

    for (const product of products) {
      const calenders = await Wishlist.find({
        productId: product._id,
        wishlistType: "calender",
      });

      console.log("Calenders", calenders);

      const users = calenders.map((calender) => calender.user);
      console.log("Users", users);

      for (const user of users) {
        console.log("User", user);
        await triggerNotification(
          user,
          product._id,
          product.name,
          product.images[0].file_full_url,
          "Product",
          "Product Launched!",
          "You can trade this product now.",
          "product_launched"
        );
      }
      // product.pushNotified = true;
      // await product.save();

      await Product.findByIdAndUpdate(
        product._id,
        { $set: { pushNotified: true } },
        {
          new: true,
          runValidators: true,
        }
      );

      await Wishlist.updateMany(
        { productId: product._id, wishlistType: "calender" },
        { pushNotified: true }
      );
    }
  } catch (error) {
    console.error("Error handling trigger notifications:", error);
  }
};

module.exports = {
  sendNotification,
  triggerNotification,
  handleTriggerCalenderNotifications,
};
