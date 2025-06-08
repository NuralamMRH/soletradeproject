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

import { Provider } from "react-redux";
import store from "@/Redux/store";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SearchHistoryProvider } from "@/context/SearchHistoryContext";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { SocketProvider } from "@/context/SocketContext";
import { useExpoNotifications } from "@/hooks/useExpoNotifications";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
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
                  </AuthProvider>
                </QueryClientProvider>
              </GestureHandlerRootView>
            </ListCreationProvider>
          </SearchHistoryProvider>
        </SocketProvider>
      </AppContentProvider>
    </Provider>
  );
}
