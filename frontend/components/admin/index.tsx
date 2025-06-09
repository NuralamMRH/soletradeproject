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

const user = {
  name: "Sukhchot Pruthi",
  avatar: require("../../assets/images/avatar.png"),
};

type HistoryKey = keyof Translations;
type HistoryItem = {
  key: HistoryKey;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

const initialNotificationSettings = {
  promos: false,
  orders: true,
  pricing: true,
  email: true,
};

export default function AdminScreen() {
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

  // Header component with logo and icons
  const renderHeader = () => {
    return (
      <View
        style={[
          styles.header,
          {
            paddingTop: Constants.statusBarHeight,
            backgroundColor: Colors.brandGray,
          },
        ]}
      >
        <View style={{ paddingBottom: 5 }}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}></View>

            <View style={[styles.headerCenter, { flex: 3 }]}>
              <Text style={styles.sectionTitle}>Admin Dashboard</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity style={{ padding: 5 }}>
                <Ionicons
                  name="notifications-outline"
                  size={25}
                  color={"black"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Content Management Section */}
        <View style={[styles.subContainer]}>
          <TouchableOpacity
            style={styles.buttonRow}
            onPress={() => router.push("/products-manager")}
          >
            <Ionicons
              name="cube-outline"
              size={24}
              color="#333"
              style={styles.menuIcon}
            />
            <Text style={styles.walletLabel}>Products</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#999"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonRow}
            onPress={() => router.push("/admin/orders/orders")}
          >
            <Ionicons
              name="cart-outline"
              size={24}
              color="#333"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Orders</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#999"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonRow}
            onPress={() => router.push("/admin/manage-pages")}
          >
            <Ionicons
              name="document-text-outline"
              size={24}
              color="#333"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Manage Pages</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#999"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonRow}
            onPress={() =>
              router.push({ pathname: "/admin/vouchers-and-discounts" })
            }
          >
            <Ionicons
              name="pricetag-outline"
              size={24}
              color="#333"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Vouchers and Discounts</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#999"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonRow}
            onPress={() => router.push("/admin/user-data")}
          >
            <Ionicons
              name="people-outline"
              size={24}
              color="#333"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Users data</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#999"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonRow}
            onPress={() => router.push("/admin/statistics")}
          >
            <Ionicons
              name="stats-chart-outline"
              size={24}
              color="#333"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Statistics</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#999"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        </View>

        {/* Language Switcher */}
        <View style={[styles.buttonRow, styles.subContainer]}>
          <Ionicons
            name="globe-outline"
            size={24}
            color="#111"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.languageLabel}>{t.language}</Text>
          <View style={styles.languageSwitchBtns}>
            <TouchableOpacity
              style={[
                styles.langBtn,
                language === "en" && styles.langBtnActive,
              ]}
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
              style={[
                styles.langBtn,
                language === "th" && styles.langBtnActive,
              ]}
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

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  subContainer: {
    paddingHorizontal: 18,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
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
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
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
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#f7f7f7",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
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
    // fontWeight: "bold",
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
    paddingBottom: 12,
    borderRadius: 8,
  },
  supportLinkText: {
    fontSize: 16,
    color: "#111",
  },

  // header

  flatList: {
    flex: 1,
  },
  header: {
    padding: 10,
    backgroundColor: Colors.brandGray,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    flex: 1,
    flexDirection: "row",
    paddingRight: 10,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  logo: {
    maxWidth: 150,
    height: 40,
    resizeMode: "cover",
  },
  cartButton: {
    position: "relative",
    padding: 5,
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: COLORS.brandColor,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  sliderContainer: {
    height: 350,
    backgroundColor: "#fff",
  },
  sliderSlide: {
    width: SIZES.width,
    height: 350,
  },
  sliderImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  noContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonSectionContainer: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    marginBottom: 10,
  },
  buttonScrollContainer: {
    paddingHorizontal: 15,
  },
  buttonContainer: {
    alignItems: "center",
    marginRight: 20,
    width: 70,
  },
  circleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.brandColor,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  squareButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3f3f3f",
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  buttonImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  buttonText: {
    fontSize: 12,
    textAlign: "center",
    color: "#333",
  },
  categorySectionContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    marginBottom: 10,
  },
  categoryScrollContainer: {
    paddingRight: 15,
  },
  categoryCard: {
    width: SIZES.width / 2 - 25,
    height: 120,
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  categoryImage: {
    width: "100%",
    height: 80,
    resizeMode: "contain",
  },
  categoryName: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
    color: "#333",
  },
  productSectionContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  viewMoreText: {
    fontSize: 14,
    color: "#666",
  },
  productScrollContainer: {
    paddingHorizontal: 15,
  },
  productCard: {
    width: 170,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  productIndex: {
    position: "absolute",
    top: 10,
    left: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    zIndex: 1,
  },
  productImage: {
    width: "100%",
    height: 120,
    resizeMode: "contain",
  },
  productInfo: {
    padding: 10,
  },
  productBrand: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  productName: {
    fontSize: 12,
    color: "#666",
    marginVertical: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  lowestAsk: {
    fontSize: 10,
    color: "#999",
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 5,
  },
  mostPopularContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 15,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: COLORS.brandColor,
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: COLORS.brandColor,
    fontWeight: "bold",
  },
  popularItemsContainer: {
    paddingHorizontal: 15,
  },
  popularColumnContainer: {
    flexDirection: "row",
  },
  popularColumn: {
    flex: 1,
  },
  popularItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  popularItemNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 15,
    width: 20,
  },
  popularItemImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  topBrandsContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingBottom: 25,
  },
  brandRowContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  brandButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#8b0612",
  },
  brandButtonText: {
    fontSize: 16,
    color: "#8b0612",
    fontWeight: "bold",
  },
  // New styles for dynamic sections
  columnContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  columnProductInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
});
