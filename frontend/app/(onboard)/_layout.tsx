import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useNetworkState } from "expo-network";
import { Alert } from "react-native";

export default function Layout() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const networkState = useNetworkState();
  const router = useRouter();
  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert("🔌 You are offline", "You can't use the app!");
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  useEffect(() => {
    const checkIfFirstLaunch = async () => {
      try {
        const alreadyLaunched = await SecureStore.getItemAsync(
          "alreadyLaunched"
        );
        if (alreadyLaunched === "true") {
          router.push("/(tabs)");
        } else {
          await SecureStore.setItemAsync("alreadyLaunched", "false");
        }
        // else: do nothing, stay on main app
      } catch (error) {
        console.log(error);
      }
    };

    checkIfFirstLaunch();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerTitle: "On boarding 1" }} />
      <Stack.Screen
        name="onboarding2"
        options={{ headerTitle: "On boarding 2" }}
      />
      <Stack.Screen
        name="onboarding3"
        options={{ headerTitle: "On boarding 3" }}
      />
    </Stack>
  );
}
