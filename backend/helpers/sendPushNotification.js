const { Expo } = require("expo-server-sdk");

// Create a new Expo SDK client
const expo = new Expo();

const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!pushToken) {
    // console.error("Invalid pushToken:", pushToken);
    return;
  }

  const message = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data,
  };

  try {
    await expo.sendPushNotificationsAsync([message]);
    // console.log("Push notification sent successfully");
  } catch (error) {
    // console.error("Error sending push notification:", error);
  }
};

module.exports = { sendPushNotification };
