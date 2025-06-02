import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AdminHeader from "@/components/AdminHeader";

const Discounts: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (screen: string) => {
    switch (screen) {
      case "Vouchers":
        router.push({ pathname: "/admin/vouchers" });
        break;
      case "Content":
        router.push({ pathname: "/admin/vouchers/contents" });
        break;
      default:
        break;
    }
  };

  const renderHeader = () => (
    <AdminHeader title="Discounts" onBack={() => router.back()} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      {renderHeader()}
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("Discount")}
          >
            <Ionicons name="pricetag-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Discounts</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("Content")}
          >
            <Ionicons name="gift-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Content</Text>
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

export default Discounts;
