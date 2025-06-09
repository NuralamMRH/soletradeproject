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
import { router } from "expo-router";
import AdminHeader from "@/components/AdminHeader";

const Orders = () => {
  const handleNavigation = (screen: string, params: any = {}) => {
    if (screen === "OrdersTypes") {
      router.push({
        pathname: "/user/orders-types",
        params: { orderType: params.orderType },
      } as any);
    } else {
      router.push(screen as any);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title={"Orders"} onBack={() => router.back()} />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/admin/orders/buyer-orders")}
          >
            <Ionicons name="cart-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Buyer Orders</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/admin/orders/seller-orders")}
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
            onPress={() => router.push("/admin/orders/service-orders")}
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
            onPress={() => router.push("/admin/orders/process-payout")}
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

export default Orders;
