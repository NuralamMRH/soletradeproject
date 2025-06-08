import * as Notifications from "expo-notifications";
import { useAppContent } from "@/context/AppContentContext";
import { baseUrl } from "@/api/MainApi";

// Show a local notification, with optional data for deep linking and image
export const showNotification = ({
  title,
  body,
  data,
  imageUrl,
}: {
  title: string;
  body: string;
  data?: any;
  imageUrl?: string;
}) => {
  Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: data || {},
      // Only add image if provided
      ...(imageUrl ? { image: imageUrl } : {}),
    },
    trigger: null, // Show immediately
  });
};

// Register a model-based click handler for notifications
export const registerNotificationClickHandler = (
  onClick: (notification: Notifications.NotificationResponse) => void
) => {
  // Returns the subscription so the caller can remove it if needed
  return Notifications.addNotificationResponseReceivedListener(onClick);
};

// Custom hook to show notification with image fallback logic
export function useShowNotificationWithImage() {
  const { appContent } = useAppContent();

  return ({
    title,
    body,
    data,
  }: {
    title: string;
    body: string;
    data?: any;
  }) => {
    let imageUrl = undefined;
    if (data?.productImage) {
      imageUrl = data.productImage.startsWith("http")
        ? data.productImage
        : `${baseUrl}${data.productImage}`;
    } else if (appContent?.appLogo) {
      imageUrl = `${baseUrl}/public/uploads/app-settings/${appContent.appLogo}`;
    }
    showNotification({ title, body, data, imageUrl });
  };
}
