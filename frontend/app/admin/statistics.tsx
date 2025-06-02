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

interface StatCategory {
  id: string;
  title: string;
  screen: string;
  icon: any;
}

const statCategories: StatCategory[] = [
  {
    id: "1",
    title: "Sales Overview",
    screen: "/admin/statistics/sales-overview",
    icon: "bar-chart-outline",
  },
  {
    id: "2",
    title: "Sales Breakdown",
    screen: "/admin/statistics/sales-breakdown",
    icon: "pie-chart-outline",
  },
  {
    id: "3",
    title: "Pending Actions",
    screen: "/admin/statistics/pending-actions",
    icon: "time-outline",
  },
  {
    id: "4",
    title: "Pending Orders",
    screen: "/admin/statistics/pending-orders",
    icon: "hourglass-outline",
  },
];

const Statistics: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      <AdminHeader title="Statistics" onBack={() => router.back()} />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          {statCategories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleNavigation(item.screen)}
            >
              <Ionicons name={item.icon} size={24} color="#333" />
              <Text style={styles.menuText}>{item.title}</Text>
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

export default Statistics;
