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
import Toast from "react-native-toast-message";

import { Provider } from "react-redux";
import store from "@/Redux/store";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SearchHistoryProvider } from "@/context/SearchHistoryContext";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { SocketProvider } from "@/context/SocketContext";
import { useExpoNotifications } from "@/hooks/useExpoNotifications";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    BalooPaaji2: require("../assets/fonts/BalooPaaji2-Regular.ttf"),
    BalooPaaji2Bold: require("../assets/fonts/BalooPaaji2-Bold.ttf"),
    BalooPaaji2ExtraBold: require("../assets/fonts/BalooPaaji2-ExtraBold.ttf"),
    BalooPaaji2Medium: require("../assets/fonts/BalooPaaji2-Medium.ttf"),
    BalooPaaji2SemiBold: require("../assets/fonts/BalooPaaji2-SemiBold.ttf"),
  });

  const queryClient = new QueryClient();

  useExpoNotifications();

  useEffect(() => {
    const getExpoPushToken = async () => {
      const expoPushToken = await SecureStore.getItemAsync("expoPushToken");
      console.log("expoPushToken (from SecureStore)", expoPushToken);
    };
    getExpoPushToken();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Provider store={store}>
      <AppContentProvider>
        <SocketProvider>
          <SearchHistoryProvider>
            <ListCreationProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <QueryClientProvider client={queryClient}>
                  <AuthProvider>
                    <LanguageProvider>
                      <ThemeProvider
                        value={
                          colorScheme === "dark" ? DarkTheme : DefaultTheme
                        }
                      >
                        <StatusBar style="auto" />
                        <Stack screenOptions={{ headerShown: false }}>
                          <Stack.Screen
                            name="(tabs)"
                            options={{ headerShown: false }}
                          />
                          <Stack.Screen name="+not-found" />
                        </Stack>
                      </ThemeProvider>
                    </LanguageProvider>
                  </AuthProvider>
                </QueryClientProvider>
              </GestureHandlerRootView>
            </ListCreationProvider>
          </SearchHistoryProvider>
        </SocketProvider>
      </AppContentProvider>
      <Toast />
    </Provider>
  );
}
