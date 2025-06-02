import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/AdminHeader";
import { COLORS } from "@/constants";
import { useRouter } from "expo-router";

const menuItems = [
  {
    id: 1,
    title: "Manage Poster",
    icon: "image-outline",
    route: "/admin/vouchers/manage-posters",
  },
  {
    id: 2,
    title: "Manage Sections",
    icon: "grid-outline",
    route: "/admin/vouchers/manage-sections",
  },
  {
    id: 3,
    title: "Discount of the Week",
    icon: "pricetag-outline",
    route: "/admin/vouchers/discount-of-the-week",
  },
];

const ContentPage: React.FC = () => {
  const router = useRouter();

  const handleMenuPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <AdminHeader title="Content" onBack={() => router.back()} />
      <View style={styles.container}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.route)}
          >
            <View style={styles.menuContent}>
              <View style={styles.leftContent}>
                <Ionicons name={item.icon as any} size={24} color="#333" />
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  menuItem: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    fontWeight: "400",
  },
});

export default ContentPage;
