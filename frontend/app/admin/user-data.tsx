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
import AdminHeader from "@/components/AdminHeader";

interface DataCategory {
  id: string;
  title: string;
  screen: string;
  icon: any;
}

const dataCategories: DataCategory[] = [
  {
    id: "1",
    title: "Portfolio",
    screen: "/admin/users/portfolio",
    icon: "briefcase-outline",
  },
  {
    id: "2",
    title: "Wishlist",
    screen: "/admin/users/wishlist",
    icon: "heart-outline",
  },
  {
    id: "3",
    title: "List of Users",
    screen: "/admin/users/list",
    icon: "people-outline",
  },
  {
    id: "4",
    title: "Tier",
    screen: "/admin/tiers-and-benefits",
    icon: "trophy-outline",
  },
  {
    id: "5",
    title: "Points",
    screen: "/admin/users/points",
    icon: "star-outline",
  },
  {
    id: "6",
    title: "Credit Balance (Sole Check)",
    screen: "/admin/users/credit-balance",
    icon: "wallet-outline",
  },
];

const UsersData: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      <AdminHeader title="User Data" onBack={() => router.back()} />
      <ScrollView style={styles.container}>
        <View style={styles.listContainer}>
          {dataCategories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.listItem}
              onPress={() => handleNavigation(item.screen)}
            >
              <View style={styles.itemContent}>
                <Ionicons
                  name={item.icon}
                  size={24}
                  color="#333"
                  style={styles.itemIcon}
                />
                <Text style={styles.itemTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  listContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 1,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemIcon: {
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    color: "#000000",
  },
});

export default UsersData;
