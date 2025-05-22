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

export default function ProfileScreen() {
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
  }

  const avatar =
    process.env.EXPO_NATIVE_API + user.image_full_url ||
    require("../../assets/images/avatar.png");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={
            user?.image
              ? { uri: avatar }
              : require("../../assets/images/avatar.png")
          }
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={26} color="#222" />
        </TouchableOpacity>
      </View>
      <View style={styles.editRow}>
        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => router.push("/edit-profile")}
        >
          <Text style={styles.editProfileText}>{t.editProfile}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="ticket-outline" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="layers-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Purchase History */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{t.purchaseHistory}</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>{t.viewAll} &gt;</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.historyScroll}
      >
        {purchaseHistory.map((item) => (
          <TouchableOpacity key={item.key} style={styles.historyBtn}>
            <Ionicons name={item.icon} size={32} color="#111" />
            <Text style={styles.historyLabel}>
              {t[item.key as keyof Translations]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Sales History */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{t.salesHistory}</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>{t.viewAll} &gt;</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.historyScroll}
      >
        {salesHistory.map((item) => (
          <TouchableOpacity key={item.key} style={styles.historyBtn}>
            <Ionicons name={item.icon} size={32} color="#111" />
            <Text style={styles.historyLabel}>
              {t[item.key as keyof Translations]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Language Switcher */}
      <View style={styles.languageRow}>
        <Ionicons
          name="globe-outline"
          size={24}
          color="#111"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.languageLabel}>{t.language}</Text>
        <View style={styles.languageSwitchBtns}>
          <TouchableOpacity
            style={[styles.langBtn, language === "en" && styles.langBtnActive]}
            onPress={() => setLanguage("en")}
          >
            <Text
              style={[
                styles.langBtnText,
                language === "en" && styles.langBtnTextActive,
              ]}
            >
              {t.eng}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, language === "th" && styles.langBtnActive]}
            onPress={() => setLanguage("th")}
          >
            <Text
              style={[
                styles.langBtnText,
                language === "th" && styles.langBtnTextActive,
              ]}
            >
              {t.th}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Wallet Tab */}
      <TouchableOpacity style={styles.walletRow}>
        <Ionicons
          name="card-outline"
          size={28}
          color="#111"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.walletLabel}>{t.wallet}</Text>
        <Ionicons
          name="chevron-forward"
          size={24}
          color="#111"
          style={{ marginLeft: "auto" }}
        />
      </TouchableOpacity>
      {/* Notifications Section */}
      <Text style={styles.sectionTitle}>
        {language === "en" ? "Notifications" : "การแจ้งเตือน"}
      </Text>
      {NOTIFICATIONS.map((item) => (
        <View key={item.key} style={styles.notificationRow}>
          <Text style={styles.notificationLabel}>{item.label[language]}</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {notificationSettings[
                item.key as keyof typeof initialNotificationSettings
              ]
                ? "ON"
                : "OFF"}
            </Text>
            <Switch
              value={
                notificationSettings[
                  item.key as keyof typeof initialNotificationSettings
                ]
              }
              onValueChange={() =>
                handleToggle(
                  item.key as keyof typeof initialNotificationSettings
                )
              }
              trackColor={{ false: "#ccc", true: "#222" }}
              thumbColor={
                notificationSettings[
                  item.key as keyof typeof initialNotificationSettings
                ]
                  ? "#fff"
                  : "#fff"
              }
            />
          </View>
        </View>
      ))}
      <View style={styles.divider} />
      {/* Support Section */}
      <Text style={styles.sectionTitle}>
        {language === "en" ? "Support" : "ซัพพอร์ต"}
      </Text>
      <View style={styles.supportGrid}>
        <View style={{ flex: 1 }}>
          {SUPPORT_LINKS.slice(0, 3).map((item) => (
            <Link key={item.route} href={item.route as any} asChild>
              <TouchableOpacity style={styles.supportLink}>
                <Text style={styles.supportLinkText}>
                  {item.label[language]}
                </Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          {SUPPORT_LINKS.slice(3).map((item) => (
            <Link key={item.route} href={item.route as any} asChild>
              <TouchableOpacity style={styles.supportLink}>
                <Text style={styles.supportLinkText}>
                  {item.label[language]}
                </Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </View>
      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingTop: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 10,
  },
  editProfileBtn: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  editProfileText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  iconBtn: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 10,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  viewAll: {
    color: "#a00",
    fontWeight: "bold",
    fontSize: 14,
  },
  historyScroll: {
    marginBottom: 8,
  },
  historyBtn: {
    alignItems: "center",
    marginRight: 18,
    width: 80,
    paddingVertical: 8,
  },
  historyLabel: {
    fontSize: 13,
    color: "#111",
    marginTop: 4,
    textAlign: "center",
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 10,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
    marginRight: 10,
  },
  languageSwitchBtns: {
    flexDirection: "row",
    marginLeft: "auto",
    gap: 0,
  },
  langBtn: {
    borderWidth: 1,
    borderColor: "#a00",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 18,
    marginLeft: 2,
    backgroundColor: "#fff",
  },
  langBtnActive: {
    backgroundColor: "#a00",
  },
  langBtnText: {
    color: "#a00",
    fontWeight: "bold",
    fontSize: 15,
  },
  langBtnTextActive: {
    color: "#fff",
  },
  walletRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 18,
    marginBottom: 10,
  },
  walletLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },
  logoutButton: {
    backgroundColor: "#000",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 60,
    marginTop: 20,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111",
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  supportGrid: {
    flexDirection: "row",
    gap: 10,
  },
  supportLink: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  supportLinkText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },
});
