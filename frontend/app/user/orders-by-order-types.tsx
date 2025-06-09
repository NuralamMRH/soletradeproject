import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS as colors } from "@/constants";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
import AdminHeader from "@/components/AdminHeader";

type Params = {
  orderType: string;
  orderStatus: string;
};

const OrdersByOrderTypes = () => {
  const paramsRaw = useLocalSearchParams();
  const params: Params = {
    orderType: paramsRaw.orderType as string,
    orderStatus: paramsRaw.orderStatus as string,
  };

  const orderType = params.orderType || "Orders";
  const orderStatus = params.orderStatus || "Incoming Orders";

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Load mock data based on order status
    loadOrdersByStatus(orderStatus);
  }, [orderStatus]);

  const loadOrdersByStatus = (status) => {
    // Mock data for different order statuses
    const mockOrderData = {
      "Incoming Orders": [
        {
          id: "1",
          orderNumber: "ORD-12345",
          customerName: "Rocky Prithu",
          date: "24 Jul 2024",
          status: "New",
          items: [
            {
              id: "1",
              name: "Jordan 1 Low x Travis Scott",
              image:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp7o94CQVxy3SWj7Mygbij-o8JZCvZmgChyw&s",
              price: "12,500 Baht",
              size: "8.5 US",
            },
          ],
          total: "12,500 Baht",
        },
        {
          id: "2",
          orderNumber: "ORD-12346",
          customerName: "Rocky Prithu",
          date: "23 Jul 2024",
          status: "New",
          items: [
            {
              id: "1",
              name: "New Balance 530 White Silver",
              image:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp7o94CQVxy3SWj7Mygbij-o8JZCvZmgChyw&s",
              price: "5,200 Baht",
              size: "9 US",
            },
          ],
          total: "5,200 Baht",
        },
      ],
      "Pending Return Orders": [
        {
          id: "3",
          orderNumber: "ORD-12347",
          customerName: "Rocky Prithu",
          date: "22 Jul 2024",
          status: "Return Requested",
          items: [
            {
              id: "1",
              name: "Nike Air Force 1 Low",
              image:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp7o94CQVxy3SWj7Mygbij-o8JZCvZmgChyw&s",
              price: "3,800 Baht",
              size: "8 US",
            },
          ],
          total: "3,800 Baht",
        },
      ],
      "Awaiting Authentication": [
        {
          id: "4",
          orderNumber: "ORD-12348",
          customerName: "Rocky Prithu",
          date: "21 Jul 2024",
          status: "Authentication",
          items: [
            {
              id: "1",
              name: "Adidas Yeezy Boost 350",
              image:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp7o94CQVxy3SWj7Mygbij-o8JZCvZmgChyw&s",
              price: "9,800 Baht",
              size: "9.5 US",
            },
          ],
          total: "9,800 Baht",
        },
      ],
      "To Process Shipment": [
        {
          id: "5",
          orderNumber: "ORD-12349",
          customerName: "Rocky Prithu",
          date: "20 Jul 2024",
          status: "Ready to Ship",
          items: [
            {
              id: "1",
              name: "Nike Dunk Low",
              image:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp7o94CQVxy3SWj7Mygbij-o8JZCvZmgChyw&s",
              price: "4,500 Baht",
              size: "8 US",
            },
          ],
          total: "4,500 Baht",
        },
      ],
      "Pending Cancellation": [
        {
          id: "6",
          orderNumber: "ORD-12350",
          customerName: "Rocky Prithu",
          date: "19 Jul 2024",
          status: "Cancel Requested",
          items: [
            {
              id: "1",
              name: "Converse Chuck Taylor",
              image:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp7o94CQVxy3SWj7Mygbij-o8JZCvZmgChyw&s",
              price: "2,200 Baht",
              size: "8.5 US",
            },
          ],
          total: "2,200 Baht",
        },
      ],
    };

    // Set orders based on status
    setOrders(mockOrderData[status] || []);
  };

  // Filter orders based on search query
  const filteredOrders = orders.filter((order) => {
    return (
      searchQuery === "" ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() =>
        router.push({
          pathname: "/user/order-details",
          params: { orderId: item.id },
        } as any)
      }
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.customerInfo}>
        <Text style={styles.customerLabel}>Customer:</Text>
        <Text style={styles.customerName}>{item.customerName}</Text>
      </View>

      <View style={styles.divider} />

      {item.items.map((product) => (
        <View key={product.id} style={styles.productItem}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productSize}>Size: {product.size}</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
          </View>
        </View>
      ))}

      <View style={styles.divider} />

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>{item.total}</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "new":
        return "#2196F3"; // Blue
      case "return requested":
        return "#FF9800"; // Orange
      case "authentication":
        return "#9C27B0"; // Purple
      case "ready to ship":
        return "#4CAF50"; // Green
      case "cancel requested":
        return "#F44336"; // Red
      default:
        return "#757575"; // Grey
    }
  };

  const getPageTitle = () => {
    return `${orderType} - ${orderStatus}`;
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={60} color="#CCCCCC" />
      <Text style={styles.emptyText}>No orders found</Text>
      <Text style={styles.emptySubText}>
        There are no {orderStatus.toLowerCase()} at this time
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader
        title={getPageTitle()}
        onBack={() => router.back()}
        right={
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons name="search" size={24} color="#000" />
          </TouchableOpacity>
        }
      />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showSearch && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search orders..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== "" && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        )}

        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  headerButton: {
    marginHorizontal: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  orderDate: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  customerInfo: {
    flexDirection: "row",
    marginBottom: 12,
  },
  customerLabel: {
    fontSize: 14,
    color: "#666666",
    marginRight: 8,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginVertical: 12,
  },
  productItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  productSize: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
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
});

export default OrdersByOrderTypes;
