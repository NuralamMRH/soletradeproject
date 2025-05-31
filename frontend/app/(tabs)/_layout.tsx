import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useNetworkState } from "expo-network";
import React, { useEffect } from "react";
import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";

export default function TabLayout() {
  const { user, isAuthenticated } = useAuth();
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
        if (alreadyLaunched !== "true") {
          await SecureStore.setItemAsync("alreadyLaunched", "true");
        }
        // else: do nothing, stay on main app
      } catch (error) {
        console.log(error);
      }
    };

    checkIfFirstLaunch();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#666",
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#eee",
          paddingTop: 5,
          paddingBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      (
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
