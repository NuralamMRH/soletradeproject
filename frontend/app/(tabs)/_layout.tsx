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
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#eeeeee",
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          borderTopColor: "#000000",
          paddingTop: 5,
          paddingBottom: 5,
          backgroundColor: "#000000",
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
        name="trends"
        options={{
          title: "Trends",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shirt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sole-check"
        options={{
          title: "Sole Check",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="checkmark-circle-outline"
              size={size}
              color={color}
            />
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
