import React from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const menuItems = [
  { label: "Category", icon: "list-outline", route: "/all-categories-manage" },
  { label: "Products", icon: "cube-outline", route: "/products-list" },
  {
    label: "Add New Product",
    icon: "add-circle-outline",
    route: "/admin-add-new-product",
  },
  { label: "Sub-Category", icon: "git-branch-outline", route: "/sub-category" },
  { label: "Brand", icon: "bookmark-outline", route: "/all-brands-manage" },
  { label: "Sub-Brand", icon: "bookmarks-outline", route: "/sub-brand" },
  { label: "Sole Essentials", icon: "star-outline", route: "/sole-essentials" },
  {
    label: "Sizing Attributes",
    icon: "resize-outline",
    route: "/sizing-attributes",
  },
];

export default function ProductsManager() {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    router.navigate(route as any);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => handleNavigation(item.route)}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color="#333"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
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
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
});
