import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
// import * as Device from "expo-device"; // Removed, not used
import * as SecureStore from "expo-secure-store";
import { registerNotificationClickHandler } from "./useLocalNotifications";
import { router } from "expo-router";

// --- Expo/FCM Push Notification Hook ---
export function useExpoNotifications() {
  const [notificationStack, setNotificationStack] = useState<any[]>([]);
  console.log("notificationStack", notificationStack);

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Listen for notifications when app is foregrounded
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotificationStack((prev) => [notification, ...prev]);
        console.log("Notification received!", notification);
      }
    );

    // Handle notification responses (when user taps)
    const responseSubscription = registerNotificationClickHandler(
      (response) => {
        console.log("Notification response received!", response);
        const data = response.notification.request.content.data;
        // Model-based routing
        if (data?.model === "Product" && data?.productId) {
          router.push(`/product/${data.productId}`);
        }
        // else if (data?.model === "Order" && data?.orderId) {
        //   router.push(`/order/${data.orderId}`);
        // } else if (data?.model === "Voucher" && data?.voucherId) {
        //   router.push(`/voucher/${data.voucherId}`);
        // } else if (data?.model === "User" && data?.userId) {
        //   router.push(`/user/${data.userId}`);
        // }
        // Add more model/type handling as needed
      }
    );

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);
}

export async function registerForPushNotificationsAsync() {
  console.log("registerForPushNotificationsAsync called");
  try {
    let token;
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    // Get Expo push token (Expo handles FCM bridge if configured in app.json)
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token (for expo-server-sdk):", token);
    await SecureStore.setItemAsync("expoPushToken", token);
    // Optionally, send token to your backend here
    // await api.savePushToken(token);
  } catch (err) {
    console.error("Error in registerForPushNotificationsAsync:", err);
  }
}
