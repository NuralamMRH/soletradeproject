import { Ionicons } from "@expo/vector-icons";
import { Link, Redirect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../context/LanguageContext";
import type { Translations } from "../../context/LanguageContext";
import { COLORS, SIZES } from "@/constants";
import Constants from "expo-constants";
import Colors from "@/constants/Colors";
import AdminScreen from "@/components/admin";
import ProfileScreen from "@/components/profile";

const user = {
  name: "Sukhchot Pruthi",
  avatar: require("../../assets/images/avatar.png"),
};

type HistoryKey = keyof Translations;
type HistoryItem = {
  key: HistoryKey;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

const purchaseHistory: HistoryItem[] = [
  { key: "bids", icon: "hammer-outline" },
  { key: "order", icon: "document-text-outline" },
  { key: "verification", icon: "shield-checkmark-outline" },
  { key: "delivery", icon: "car-outline" },
  { key: "completed", icon: "checkmark-done-circle-outline" },
  { key: "cancelled", icon: "close-circle-outline" },
];
const salesHistory: HistoryItem[] = [
  { key: "asks", icon: "storefront-outline" },
  { key: "order", icon: "document-text-outline" },
  { key: "shipment", icon: "cube-outline" },
  { key: "verification", icon: "shield-checkmark-outline" },
  { key: "completed", icon: "checkmark-done-circle-outline" },
  { key: "cancelled", icon: "close-circle-outline" },
];

const NOTIFICATIONS = [
  {
    key: "promos",
    label: {
      en: "Exclusive Promos and Releases",
      th: "โปรโมชันและการเปิดตัวพิเศษ",
    },
  },
  {
    key: "orders",
    label: { en: "Purchase and Sales Order", th: "คำสั่งซื้อและขาย" },
  },
  {
    key: "pricing",
    label: {
      en: "Pricing and Availability Updates",
      th: "อัปเดตราคาและความพร้อมจำหน่าย",
    },
  },
  { key: "email", label: { en: "Email Subscription", th: "การสมัครรับอีเมล" } },
];
const SUPPORT_LINKS = [
  { label: { en: "Contact Us", th: "ติดต่อเรา" }, route: "/contact" },
  { label: { en: "Terms of Use", th: "ข้อกำหนดการใช้" }, route: "/terms" },
  { label: { en: "FAQs", th: "คำถามที่พบบ่อย" }, route: "/faqs" },
  {
    label: { en: "Privacy and Security", th: "ความเป็นส่วนตัวและความปลอดภัย" },
    route: "/privacy",
  },
  {
    label: { en: "Product Authentication", th: "การตรวจสอบสินค้า" },
    route: "/auth",
  },
  { label: { en: "Announcement", th: "ประกาศ" }, route: "/announcement" },
];
const initialNotificationSettings = {
  promos: false,
  orders: true,
  pricing: true,
  email: true,
};

export default function DashboardScreen() {
  const { logout, isAuthenticated, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [notificationSettings, setNotificationSettings] = React.useState(
    initialNotificationSettings
  );
  const router = useRouter();
  const handleToggle = (key: keyof typeof initialNotificationSettings) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  } else if (user?.role === "admin") {
    return <AdminScreen />;
  } else {
    return <ProfileScreen />;
  }
}
