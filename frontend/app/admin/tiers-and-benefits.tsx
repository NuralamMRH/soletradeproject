import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import Colors from "@/constants/Colors";

const TiersAndBenefits: React.FC = () => {
  const router = useRouter();
  const menuItems = [
    {
      title: "Buyer Tier",
      onPress: () =>
        router.push({
          pathname: "/admin/tiers/buyer",
        }),
    },
    {
      title: "Seller Tier",
      onPress: () =>
        router.push({
          pathname: "/admin/tiers/seller",
        }),
    },
  ];

  const renderHeader = () => (
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
            <Text style={styles.sectionTitle}>Tiers and Benefits</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {renderHeader()}
      <View style={styles.container}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Text style={styles.menuItemText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  menuItemText: {
    fontSize: 16,
    color: "#000",
  },
  // Header styles
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
});

export default TiersAndBenefits;
