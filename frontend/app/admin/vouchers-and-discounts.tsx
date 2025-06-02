import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import Colors from "@/constants/Colors";
import AdminHeader from "@/components/AdminHeader";

const VouchersAndDiscounts: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (screen: string) => {
    switch (screen) {
      case "SpecialDiscount":
        router.push({ pathname: "/admin/vouchers/discounts" });
        break;
      case "PointsRedemption":
        router.push({ pathname: "/admin/vouchers/points-redemption" });
        break;
      case "Vouchers":
        router.push({ pathname: "/admin/vouchers" });
        break;
      default:
        break;
    }
  };

  const renderHeader = () => (
    <AdminHeader title="Vouchers and Discounts" onBack={() => router.back()} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      {renderHeader()}
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("SpecialDiscount")}
          >
            <Ionicons name="pricetag-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Special Discount</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("PointsRedemption")}
          >
            <Ionicons name="gift-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Points Redemption</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("Vouchers")}
          >
            <Ionicons name="ticket-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Vouchers</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Main content styles
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    marginLeft: 12,
  },
});

export default VouchersAndDiscounts;
