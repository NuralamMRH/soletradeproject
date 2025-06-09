import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/AdminHeader";
import { router, useFocusEffect } from "expo-router";
import { useGetOrders } from "@/hooks/react-query/useOrderMutation";
import { useAuth } from "@/hooks/useAuth";

const ProcessPayouts = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("ongoing");
  const [myOrders, setMyOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("latest"); // 'latest' or 'oldest'

  const { data, isLoading, isError, refetch } = useGetOrders();

  // Refetch on focus
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Filter and sort orders
  const filteredOrders = React.useMemo(() => {
    if (!data || !user) return [];
    let orders;
    orders = data.filter(
      (order: any) =>
        order.orderStatus ===
        (activeTab === "ongoing" ? "Pending" : "Completed")
    );
    orders = [...orders].sort((a, b) => {
      const dateA = new Date(a.orderCreatedAt);
      const dateB = new Date(b.orderCreatedAt);
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });
    return orders;
  }, [data, user, activeTab, sortOrder]);

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSort = (order: string) => {
    setSortOrder(order);
    setSortModalVisible(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processing":
        return "#8B0000"; // Dark red
      case "Shipped to You":
        return "#8B0000"; // Dark red
      case "Delivered":
        return "#8B0000"; // Dark red
      default:
        return "#8B0000";
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/admin/orders/payout-details",
          params: { orderId: item.id },
        })
      }
      style={{
        flexDirection: "row",
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
        padding: 16,
      }}
    >
      <View style={styles.orderContent}>
        <Image
          source={{ uri: item.items[0]?.image }}
          style={styles.productImage}
          resizeMode="contain"
        />

        <View style={styles.orderDetails}>
          <Text style={{ fontSize: 12, color: "#333" }}>
            {`${item.items[0]?.name} from ${item.items[0]?.brand}`}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "column" }}>
        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.shippingStatus) },
            ]}
          >
            {item.shippingStatus === "Pending"
              ? "Pending"
              : item.shippingStatus === "Shipped to You"
              ? "Shipped to You"
              : item.shippingStatus === "Delivered"
              ? "Delivered"
              : "N/A"}
          </Text>
        </View>

        <View style={styles.transactionContainer}>
          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>Transaction ID:</Text>
            <Text style={styles.transactionValue}>{item.id}</Text>
          </View>

          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>Transaction Date:</Text>
            <Text style={styles.transactionValue}>
              {item.orderCreatedAt
                ? new Date(item.orderCreatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "N/A"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="star-outline" size={60} color="#CCCCCC" />
      <Text style={styles.emptyText}>No Sole Essential orders found</Text>
      <Text style={styles.emptySubText}>
        You don&apos;t have any {activeTab} Sole Essential orders
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader
        title="Payouts"
        onBack={() => router.back()}
        right={
          <View style={styles.headerRightContainer}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/(tab)/search" as any)}
            >
              <Ionicons name="search" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setSortModalVisible(true)}
            >
              <Ionicons name="filter" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/menu" as any)}
            >
              <Ionicons name="menu" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        }
      />
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "ongoing" && styles.activeTab]}
            onPress={() => handleTabPress("ongoing")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "ongoing" && styles.activeTabText,
              ]}
            >
              Ongoing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "completed" && styles.activeTab]}
            onPress={() => handleTabPress("completed")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "completed" && styles.activeTabText,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Orders List */}
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

      {/* Sort Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sortModalVisible}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setSortModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Sort by</Text>
              <TouchableOpacity
                style={styles.modalDone}
                onPress={() => setSortModalVisible(false)}
              >
                <Text style={styles.modalDoneText}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sortOptions}>
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => handleSort("oldest")}
              >
                <View style={styles.radioButton}>
                  {sortOrder === "oldest" && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
                <Text style={styles.sortOptionText}>Oldest to Latest</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => handleSort("latest")}
              >
                <View style={styles.radioButton}>
                  {sortOrder === "latest" && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
                <Text style={styles.sortOptionText}>Latest to Oldest</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#8B0000",
  },
  tabText: {
    fontSize: 16,
    color: "#999999",
  },
  activeTabText: {
    color: "#000000",
    fontWeight: "600",
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
    padding: 0,
    flexGrow: 1,
  },
  orderItem: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    padding: 16,
  },
  orderContent: {
    flexDirection: "column",
    marginBottom: 12,
    alignItems: "center",
    overflow: "hidden",
    marginRight: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginRight: 12,
  },
  orderDetails: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
  },
  orderInfo: {
    marginLeft: 72, // Align with product name
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  transactionContainer: {
    marginTop: 4,
  },
  transactionRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  transactionLabel: {
    fontSize: 12,
    color: "#666666",
    width: 110,
  },
  transactionValue: {
    fontSize: 12,
    color: "#333333",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#000000",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  modalCancel: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCancelText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalDone: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalDoneText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  sortOptions: {
    padding: 16,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  sortOptionText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

export default ProcessPayouts;
