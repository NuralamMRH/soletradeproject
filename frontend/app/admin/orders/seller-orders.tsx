import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SIZES } from "@/constants";
import { useGetOrders } from "@/hooks/react-query/useOrderMutation";
import { useFocusEffect } from "expo-router";
import { router } from "expo-router";
import AdminHeader from "@/components/AdminHeader";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const { width } = Dimensions.get("window");

type Order = {
  id: string;
  orderStatus: string;
  orderCreatedAt: string;
  items: any[];
  // ...add other fields as needed
};

const tabs = [
  { id: 0, name: "Order Matched" },
  { id: 1, name: "Order Confirmed" },
  { id: 2, name: "Shipped from Seller" },
  { id: 3, name: "Arrived at SoleTrade" },
  { id: 4, name: "Authentication" },
  { id: 5, name: "Preparing Shipment" },
  { id: 6, name: "Shipped to buyer" },
  { id: 7, name: "Delivered to Buyer" },
  { id: 8, name: "Completed" },
  { id: 9, name: "Cancelled" },
];

const statusMap = [
  "Order Matched",
  "Order Confirmed",
  "Shipped from Seller",
  "Arrived at SoleTrade",
  "Authentication",
  "Preparing Shipment",
  "Shipped to buyer",
  "Delivered to Buyer",
  "Completed",
  "Cancelled",
];

const UserSellerOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const sortSheetRef = useRef<any>(null);

  const { data, isLoading, refetch } = useGetOrders();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Filter and sort orders by status and sort order
  const filteredOrders = React.useMemo(() => {
    if (!data) return [];
    let orders = data.filter(
      (order: Order) => order.orderStatus === statusMap[activeTab]
    );
    orders = [...orders].sort((a, b) => {
      const dateA = new Date(a.orderCreatedAt).getTime();
      const dateB = new Date(b.orderCreatedAt).getTime();
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });
    return orders;
  }, [data, activeTab, sortOrder]);

  const handleTabPress = (tabId: number) => {
    setActiveTab(tabId);
  };

  const handleSort = (order: "latest" | "oldest") => {
    setSortOrder(order);
    sortSheetRef.current?.close();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Authentication":
        return "#8B0000";
      case "Completed":
        return "#006400";
      case "Cancelled":
        return "#8B0000";
      default:
        return "#000000";
    }
  };

  const renderTabItem = ({ item }: { item: (typeof tabs)[0] }) => (
    <TouchableOpacity
      onPress={() => handleTabPress(item.id)}
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: SIZES.width / 5,
        marginRight: 8,
      }}
    >
      <View
        style={[styles.tabItem, activeTab === item.id && styles.activeTabItem]}
      >
        <Ionicons name="cube-outline" size={24} color="#000" />
      </View>
      <Text
        style={[
          styles.tabItemText,
          activeTab === item.id && styles.activeTabItemText,
        ]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() =>
        router.push({
          pathname: "/admin/orders/order-details",
          params: { orderId: item.id },
        })
      }
    >
      <Image
        source={{ uri: item.items[0]?.image }}
        style={styles.productImage}
      />
      <View style={styles.orderDetails}>
        <View style={styles.orderHeader}>
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.orderStatus) },
            ]}
          >
            {item.orderStatus}
          </Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.infoLabel}>Transaction ID:</Text>
          <Text style={styles.infoValue}>{item.id}</Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.infoLabel}>Transaction Date:</Text>
          <Text style={styles.infoValue}>
            {item.orderCreatedAt
              ? new Date(item.orderCreatedAt).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A"}
          </Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.items[0]?.name}</Text>
          <Text style={styles.productVariant}>{item.items[0]?.brand}</Text>
          <Text style={styles.productSize}>Qty: {item.items[0]?.quantity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={60} color="#CCCCCC" />
      <Text style={styles.emptyText}>No orders found</Text>
      <Text style={styles.emptySubText}>
        You don't have any {tabs[activeTab].name.toLowerCase()} orders
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader
        title="Buyer Orders"
        onBack={() => router.back()}
        right={
          <View style={styles.headerRightContainer}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                /* navigation logic */
              }}
            >
              <Ionicons name="search" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => sortSheetRef.current?.open()}
            >
              <Ionicons name="filter" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                /* navigation logic */
              }}
            >
              <Ionicons name="menu" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        }
      />
      <View style={styles.container}>
        <View style={styles.tabSection}>
          <FlatList
            data={tabs}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            renderItem={renderTabItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
          />
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <BottomSheet
        ref={sortSheetRef}
        snapPoints={["25%"]}
        index={-1}
        enablePanDownToClose
        enableDynamicSizing
        enableContentPanningGesture
        enableHandlePanningGesture
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: "#000000",
        }}
      >
        <BottomSheetView>
          {/* Bottom sheet content for sorting */}
          <View style={{ padding: 16 }}>
            <TouchableOpacity onPress={() => handleSort("latest")}>
              <Text style={{ color: "#fff", fontSize: 16, marginBottom: 12 }}>
                Latest to Oldest
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort("oldest")}>
              <Text style={{ color: "#fff", fontSize: 16 }}>
                Oldest to Latest
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  headerRightContainer: {
    flexDirection: "row",
  },
  headerButton: {
    marginHorizontal: 8,
  },
  tabSection: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  tabContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tabItem: {
    width: SIZES.width / 5 - 20,
    height: SIZES.width / 5 - 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3f3f3f",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    marginRight: 8,
  },
  activeTabItem: {
    borderColor: "#000000",
    backgroundColor: "#e6e6e6",
  },
  tabIcon: {
    textAlign: "center",
    width: 30,
    height: 30,
  },
  tabItemText: {
    color: "#3f3f3f",
    textAlign: "center",
    fontSize: 8,
    paddingTop: 5,
  },
  activeTabItemText: {
    color: "#000000",
    fontWeight: "600",
  },
  iconRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    justifyContent: "space-around",
  },
  iconContainer: {
    alignItems: "center",
    width: 70,
  },
  iconText: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
    color: "#000000",
  },
  iconTextInactive: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
    color: "#999999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  orderItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginRight: 16,
  },
  orderDetails: {
    flex: 1,
  },
  orderHeader: {
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionInfo: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666666",
    width: 100,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "500",
  },
  productInfo: {
    marginTop: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  productVariant: {
    fontSize: 12,
    color: "#666666",
  },
  productSize: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666666",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999999",
    marginTop: 8,
    textAlign: "center",
  },
  sortSheetContainer: {
    padding: 16,
  },
  sortSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sortSheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  doneButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  doneButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  sortOptionText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
});

export default UserSellerOrders;
