const socket = require("../config/socket");
const { Expo } = require("expo-server-sdk");
const expo = new Expo();
const User = require("../models/user");
const { Product } = require("../models/product");

const sentNotificationsCache = new Map();

// Function to send push notification via Expo
const sendExpoPushNotification = async (pushToken, title, body, data = {}) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return;
  }

  const message = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data: {
      ...data,
      screen: data.productId
        ? "ProductDetails"
        : data.orderId
        ? "OrderDetails"
        : data.drawId
        ? "DrawDetails"
        : null,
    },
    priority: "high",
    channelId: "default",
    badge: 1,
    categoryIdentifier: "default",
    image: data.productImage,
    contentAvailable: true,
    sound: "default",
    color: "#FF231F7C",
    icon: "notification_icon",
    tag: data.type || "default",
    group: "sole_trade_notifications",
    androidPriority: "high",
    androidChannelId: "default",
    androidSound: true,
    androidVibrate: [0, 250, 250, 250],
    androidLight: true,
    androidColor: "#FF231F7C",
    androidIcon: "notification_icon",
    androidTag: data.type || "default",
    androidGroup: "sole_trade_notifications",
  };

  try {
    await expo.sendPushNotificationsAsync([message]);
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
  try {
    // Get user's push token
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User ${userId} not found`);
      return;
    }

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
    sendSocketNotification(userId, notification);

    // Send Expo push notification for background notifications
    if (user.pushToken) {
      await sendExpoPushNotification(user.pushToken, title, body, data);
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
  productImage
) => {
  const cacheKey = `${userId}_${productId}`;
  const now = Date.now();
  const lastNotification = sentNotificationsCache.get(cacheKey) || 0;

  // Only send notification if last notification was sent more than 1 hour ago
  if (now - lastNotification > 3600000) {
    await sendNotification(
      userId,
      "Product Available!",
      `${productName} is now available for purchase.`,
      {
        type: "product_available",
        productId,
        productName,
        productImage,
      }
    );
    sentNotificationsCache.set(cacheKey, now);
  }
};

// Function to handle trigger notifications
const handleTriggerNotifications = async () => {
  try {
    const today = new Date();
    const products = await Product.find({
      publishDate: {
        $lte: today,
      },
      isPublished: false,
    });

    for (const product of products) {
      const users = await User.find({
        wishlist: product._id,
      });

      for (const user of users) {
        await triggerNotification(
          user._id,
          product._id,
          product.name,
          product.images[0]
        );
      }

      // Mark product as published
      product.isPublished = true;
      await product.save();
    }
  } catch (error) {
    console.error("Error handling trigger notifications:", error);
  }
};

module.exports = {
  sendNotification,
  triggerNotification,
  handleTriggerNotifications,
};
