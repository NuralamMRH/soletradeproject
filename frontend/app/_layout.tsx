import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { AuthProvider } from "../hooks/useAuth";
import { LanguageProvider } from "../context/LanguageContext";
import { AppContentProvider } from "../context/AppContentContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ListCreationProvider } from "@/context/ListCreationContext";
import * as SecureStore from "expo-secure-store";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SearchHistoryProvider } from "@/context/SearchHistoryContext";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const queryClient = new QueryClient();

  useEffect(() => {
    // Request permissions and get expo push token
    async function registerForPushNotificationsAsync() {
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
      token = (await Notifications.getExpoPushTokenAsync()).data;
      const expoPushToken = await SecureStore.getItemAsync("expoPushToken");

      if (!expoPushToken) {
        await SecureStore.setItemAsync("expoPushToken", token);
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Notification Set Successfully",
            body: "You will receive a notification now",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 10,
            minute: 0,
          },
        });
      } else {
        console.log("Expo Push Token already exists");
      }

      // TODO: Send this token to your backend to save for the user
      // e.g., await api.savePushToken(token);
      console.log("Expo Push Token:", token);
    }

    registerForPushNotificationsAsync();

    // Listen for notifications when app is foregrounded
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        // You can show an in-app alert or update state here
        console.log("Notification received!", notification);
        // TODO: Handle notification
      }
    );

    // Optionally: handle notification responses (when user taps)
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response received!", response);
      });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SearchHistoryProvider>
      <ListCreationProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <AppContentProvider>
                <LanguageProvider>
                  <ThemeProvider
                    value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                  >
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen name="+not-found" />
                    </Stack>
                    <StatusBar style="auto" />
                  </ThemeProvider>
                </LanguageProvider>
              </AppContentProvider>
            </AuthProvider>
          </QueryClientProvider>
        </GestureHandlerRootView>
      </ListCreationProvider>
    </SearchHistoryProvider>
  );
}
