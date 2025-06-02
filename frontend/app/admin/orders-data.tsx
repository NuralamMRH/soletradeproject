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

const OrdersData: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (
    screen: string,
    params: { orderType?: string } = {}
  ) => {
    if (screen === "OrdersTypes" && params.orderType) {
      router.push({
        pathname: "/admin/orders/types" as any,
        params: { orderType: params.orderType },
      });
    } else if (screen === "ProcessPayout") {
      router.push({ pathname: "/admin/orders/process-payout" as any });
    } else if (screen === "ProcessRefund") {
      router.push({ pathname: "/admin/orders/process-refund" as any });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      <AdminHeader title="Orders" onBack={() => router.back()} />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              handleNavigation("OrdersTypes", { orderType: "Buyer Orders" })
            }
          >
            <Ionicons name="cart-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Buyer Orders</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              handleNavigation("OrdersTypes", { orderType: "Seller Orders" })
            }
          >
            <Ionicons name="cash-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Seller Orders</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              handleNavigation("OrdersTypes", { orderType: "SoleCheck Orders" })
            }
          >
            <Ionicons name="checkmark-circle-outline" size={24} color="#333" />
            <Text style={styles.menuText}>SoleCheck Orders</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              handleNavigation("OrdersTypes", { orderType: "Service Orders" })
            }
          >
            <Ionicons name="construct-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Service Orders</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              handleNavigation("OrdersTypes", {
                orderType: "Sole Essential Orders",
              })
            }
          >
            <Ionicons name="star-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Sole Essential Orders</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              handleNavigation("OrdersTypes", { orderType: "Pending Orders" })
            }
          >
            <Ionicons name="time-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Pending Orders</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("ProcessPayout")}
          >
            <Ionicons name="wallet-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Process Payout</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("ProcessRefund")}
          >
            <Ionicons name="return-down-back-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Process Refund</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
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

export default OrdersData;
