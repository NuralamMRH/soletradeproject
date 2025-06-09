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
import { router, useLocalSearchParams } from "expo-router";
import AdminHeader from "@/components/AdminHeader";

type Params = {
  orderType: string;
};

const OrdersTypes = () => {
  const paramsRaw = useLocalSearchParams();
  const params: Params = {
    orderType: paramsRaw.orderType as string,
  };

  const orderType = params.orderType || "Orders";

  const handleNavigation = (orderStatus: string) => {
    router.push({
      pathname: "/user/orders-by-order-types",
      params: { orderType, orderStatus },
    } as any);
  };

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title={orderType} onBack={() => router.back()} />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("Incoming Orders")}
          >
            <Text style={styles.menuText}>Incoming Orders</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("Pending Return Orders")}
          >
            <Text style={styles.menuText}>Pending Return Orders</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("Awaiting Authentication")}
          >
            <Text style={styles.menuText}>Awaiting Authentication</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("To Process Shipment")}
          >
            <Text style={styles.menuText}>To Process Shipment</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("Pending Cancellation")}
          >
            <Text style={styles.menuText}>Pending Cancellation</Text>
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
    marginTop: 0,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
  },
});

export default OrdersTypes;
