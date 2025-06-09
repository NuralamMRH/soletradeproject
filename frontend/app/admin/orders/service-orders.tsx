import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import AdminHeader from "@/components/AdminHeader";
import { router } from "expo-router";

const UserServiceOrders = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("ongoing");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filterOption, setFilterOption] = useState("all");
  const filterSheetRef = useRef();

  // Mock data for service orders
  const mockOrders = {
    ongoing: [
      {
        id: "1",
        orderNumber: "#50464920",
        productName: "Asics Kayano 14",
        productImage:
          "https://media.licdn.com/dms/image/v2/C4E0BAQGceoBBXelJDA/company-logo_200_200/company-logo_200_200/0/1630592993028?e=2147483647&v=beta&t=lFngeUxS33tuusXrFclWYAZtTSKOOAINh0_oeZtYZvo",
        createdOn: "2 Sep 24, 10:49 PM",
        submittedOn: "2 Sep 24, 10:52 PM",
        status: "PICK UP",
        serviceType: "Sneaker Protect",
      },
      {
        id: "2",
        orderNumber: "#5096030",
        productName: "Asics Kayano 14",
        productImage:
          "https://media.licdn.com/dms/image/v2/C4E0BAQGceoBBXelJDA/company-logo_200_200/company-logo_200_200/0/1630592993028?e=2147483647&v=beta&t=lFngeUxS33tuusXrFclWYAZtTSKOOAINh0_oeZtYZvo",
        createdOn: "2 Sep 24, 10:49 PM",
        submittedOn: "2 Sep 24, 10:52 PM",
        status: "SHIPPED TO YOU",
        serviceType: "Sneaker Clean",
      },
      {
        id: "3",
        orderNumber: "#53959302",
        productName: "Air Jordan 1",
        productImage:
          "https://media.licdn.com/dms/image/v2/C4E0BAQGceoBBXelJDA/company-logo_200_200/company-logo_200_200/0/1630592993028?e=2147483647&v=beta&t=lFngeUxS33tuusXrFclWYAZtTSKOOAINh0_oeZtYZvo",
        createdOn: "2 Sep 24, 10:49 PM",
        submittedOn: "2 Sep 24, 10:52 PM",
        status: "VERIFICATION",
        serviceType: "Sneaker Clean",
      },
      {
        id: "4",
        orderNumber: "#5096034",
        productName: "Air Jordan 1",
        productImage:
          "https://media.licdn.com/dms/image/v2/C4E0BAQGceoBBXelJDA/company-logo_200_200/company-logo_200_200/0/1630592993028?e=2147483647&v=beta&t=lFngeUxS33tuusXrFclWYAZtTSKOOAINh0_oeZtYZvo",
        createdOn: "2 Sep 24, 10:49 PM",
        submittedOn: "2 Sep 24, 10:52 PM",
        status: "PICK UP",
        serviceType: "Customize your Pair",
      },
    ],
    completed: [
      {
        id: "5",
        orderNumber: "#50464920",
        productName: "Asics Kayano 14",
        productImage:
          "https://media.licdn.com/dms/image/v2/C4E0BAQGceoBBXelJDA/company-logo_200_200/company-logo_200_200/0/1630592993028?e=2147483647&v=beta&t=lFngeUxS33tuusXrFclWYAZtTSKOOAINh0_oeZtYZvo",
        createdOn: "2 Sep 24, 10:49 PM",
        submittedOn: "2 Sep 24, 10:52 PM",
        status: "DELIVERED",
        serviceType: "Sneaker Protect",
      },
      {
        id: "6",
        orderNumber: "#5096030",
        productName: "Asics Kayano 14",
        productImage:
          "https://media.licdn.com/dms/image/v2/C4E0BAQGceoBBXelJDA/company-logo_200_200/company-logo_200_200/0/1630592993028?e=2147483647&v=beta&t=lFngeUxS33tuusXrFclWYAZtTSKOOAINh0_oeZtYZvo",
        createdOn: "2 Sep 24, 10:49 PM",
        submittedOn: "2 Sep 24, 10:52 PM",
        status: "DELIVERED",
        serviceType: "Sneaker Clean",
      },
      {
        id: "7",
        orderNumber: "#53959302",
        productName: "Jordan 1 High",
        productImage:
          "https://media.licdn.com/dms/image/v2/C4E0BAQGceoBBXelJDA/company-logo_200_200/company-logo_200_200/0/1630592993028?e=2147483647&v=beta&t=lFngeUxS33tuusXrFclWYAZtTSKOOAINh0_oeZtYZvo",
        createdOn: "2 Sep 24, 10:49 PM",
        submittedOn: "2 Sep 24, 10:52 PM",
        status: "DELIVERED",
        serviceType: "Sneaker Clean",
      },
      {
        id: "8",
        orderNumber: "#5096034",
        productName: "Jordan 1 High",
        productImage:
          "https://media.licdn.com/dms/image/v2/C4E0BAQGceoBBXelJDA/company-logo_200_200/company-logo_200_200/0/1630592993028?e=2147483647&v=beta&t=lFngeUxS33tuusXrFclWYAZtTSKOOAINh0_oeZtYZvo",
        createdOn: "2 Sep 24, 10:49 PM",
        submittedOn: "2 Sep 24, 10:52 PM",
        status: "DELIVERED",
        serviceType: "Customize your Pair",
      },
    ],
  };

  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    setTimeout(() => {
      let filteredOrders = [...mockOrders[activeTab]];

      // Apply filter if not 'all'
      if (filterOption !== "all") {
        filteredOrders = filteredOrders.filter(
          (order) => order.serviceType === filterOption
        );
      }

      setOrders(filteredOrders);
      setLoading(false);
    }, 500);
  }, [activeTab, filterOption]);

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  const handleFilter = (option) => {
    setFilterOption(option);
    filterSheetRef.current.close();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "#006400"; // Dark green
      case "PICK UP":
      case "SHIPPED TO YOU":
      case "VERIFICATION":
        return "#FFFFFF"; // White text for dark backgrounds
      default:
        return "#000000";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "#006400"; // Dark green
      case "PICK UP":
      case "SHIPPED TO YOU":
      case "VERIFICATION":
        return "#333333"; // Dark background
      default:
        return "transparent";
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={{ marginBottom: 10 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          borderWidth: 2,
          borderColor: "#000",
        }}
      >
        <View
          style={{ position: "relative", padding: 10, borderRightWidth: 2 }}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: getStatusBgColor(item.status),
              zIndex: 5,
            }}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status}
            </Text>
          </View>
          <Image
            source={{ uri: item.productImage }}
            style={styles.productImage}
          />
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.productName}>{item.productName}</Text>

          <View style={styles.orderInfo}>
            <Text style={styles.infoLabel}>Created on</Text>
            <Text style={styles.infoValue}>{item.createdOn}</Text>
          </View>

          <View style={styles.orderInfo}>
            <Text style={styles.infoLabel}>Submitted on</Text>
            <Text style={styles.infoValue}>{item.submittedOn}</Text>
          </View>

          <Text style={styles.serviceType}>{item.serviceType}</Text>
        </View>

        <View style={styles.orderNumber}>
          <Text style={styles.orderNumberText}>{item.orderNumber}</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="construct-outline" size={60} color="#CCCCCC" />
      <Text style={styles.emptyText}>No service orders found</Text>
      <Text style={styles.emptySubText}>
        You don't have any {activeTab} service orders
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader
        title="Service Orders"
        onBack={() => router.back()}
        right={
          <View style={styles.headerRightContainer}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => filterSheetRef.current.open()}
            >
              <Ionicons name="filter" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate("Menu")}
            >
              <Ionicons name="menu" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        }
      />
      <View style={styles.container}>
        {/* Tab Navigation */}
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        ref={filterSheetRef}
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
          <View style={{ padding: 16 }}>
            <Text style={styles.filterTitle}>Filter by Service Type</Text>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterOption === "all" && styles.activeFilterOption,
              ]}
              onPress={() => handleFilter("all")}
            >
              <Text style={styles.filterOptionText}>All Services</Text>
              {filterOption === "all" && (
                <Ionicons name="checkmark" size={20} color="#000" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterOption === "Sneaker Clean" && styles.activeFilterOption,
              ]}
              onPress={() => handleFilter("Sneaker Clean")}
            >
              <Text style={styles.filterOptionText}>Sneaker Clean</Text>
              {filterOption === "Sneaker Clean" && (
                <Ionicons name="checkmark" size={20} color="#000" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterOption === "Sneaker Protect" && styles.activeFilterOption,
              ]}
              onPress={() => handleFilter("Sneaker Protect")}
            >
              <Text style={styles.filterOptionText}>Sneaker Protect</Text>
              {filterOption === "Sneaker Protect" && (
                <Ionicons name="checkmark" size={20} color="#000" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterOption === "Customize your Pair" &&
                  styles.activeFilterOption,
              ]}
              onPress={() => handleFilter("Customize your Pair")}
            >
              <Text style={styles.filterOptionText}>Customize your Pair</Text>
              {filterOption === "Customize your Pair" && (
                <Ionicons name="checkmark" size={20} color="#000" />
              )}
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
    padding: 16,
    flexGrow: 1,
  },
  orderItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  orderContent: {
    flexDirection: "row",
    padding: 16,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginRight: 12,
  },
  orderDetails: {
    flex: 1,
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  orderInfo: {
    flexDirection: "row",
    marginVertical: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666666",
    width: 80,
  },
  infoValue: {
    fontSize: 12,
    color: "#333333",
  },
  serviceType: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
    color: "#333333",
  },
  orderNumber: {
    position: "absolute",
    top: 10,
    right: 10,
    justifyContent: "center",
    backgroundColor: "#000",
    padding: 5,
    borderRadius: 5,
  },
  orderNumberText: {
    fontSize: 12,
    color: "#fff",
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
  filterSheet: {
    padding: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  activeFilterOption: {
    backgroundColor: "#F8F8F8",
  },
  filterOptionText: {
    fontSize: 16,
  },
});

export default UserServiceOrders;
