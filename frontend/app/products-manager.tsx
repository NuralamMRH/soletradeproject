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
import Colors from "@/constants/Colors";
import Constants from "expo-constants";

const menuItems = [
  {
    label: "Category",
    icon: "list-outline",
    route: "/admin/categories/all-categories-manage",
  },
  {
    label: "Products",
    icon: "cube-outline",
    route: "/admin/products/all-product-manage",
  },
  {
    label: "Add New Product",
    icon: "add-circle-outline",
    route: "/admin/products/add-new-product?isEssential=false",
  },
  {
    label: "Sub Category",
    icon: "git-branch-outline",
    route: "/admin/categories/all-categories-manage?isSubcategory=true",
  },
  {
    label: "Brand",
    icon: "bookmark-outline",
    route: "/admin/brands/all-brands-manage",
  },
  {
    label: "Sub-Brand",
    icon: "bookmarks-outline",
    route: "/admin/brands/all-brands-manage?isSubBrand=true",
  },
  {
    label: "Sole Essentials",
    icon: "star-outline",
    route: "/admin/products/all-product-manage?isEssential=true",
  },
  {
    label: "Sizing Attributes",
    icon: "resize-outline",
    route: "/admin/attributes/all-attribute-manage",
  },
];

export default function ProductsManager() {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    router.navigate(route as any);
  };

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
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={{ padding: 5 }}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={25} color={"black"} />
              </TouchableOpacity>
            </View>

            <View style={[styles.headerCenter, { flex: 3 }]}>
              <Text style={styles.sectionTitle}>Products Manager</Text>
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
      <ScrollView>
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
    </View>
  );
}

const styles = StyleSheet.create({
  //Header section style
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  //Header section style close

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
    // paddingHorizontal: 4,
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
