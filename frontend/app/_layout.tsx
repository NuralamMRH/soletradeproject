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

import { useColorScheme } from "@/hooks/useColorScheme";
import { SearchHistoryProvider } from "@/context/SearchHistoryContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const queryClient = new QueryClient();

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
