import { Redirect, useRouter } from "expo-router";
import React, { useEffect } from "react";

import { useAuth } from "../../hooks/useAuth";

import AdminScreen from "@/components/admin";
import ProfileScreen from "@/components/profile";
import { View } from "react-native";

export default function DashboardScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  return <>{user?.role === "admin" ? <AdminScreen /> : <ProfileScreen />}</>;
}
