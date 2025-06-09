import { useOrderById } from "@/hooks/react-query/useOrderMutation";
import { useLocalSearchParams, router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import AdminHeader from "@/components/AdminHeader";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";

const STATUS_STEPS = [
  "Processing",
  "Verified",
  "Shipped to You",
  "Delivered",
  "Completed",
];

function getStatusIndex(status: string) {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return 0;
    case "processing":
      return 0;
    case "verified":
      return 1;
    case "shipped":
    case "shipped to you":
      return 2;
    case "delivered":
      return 3;
    case "completed":
      return 4;
    default:
      return 0;
  }
}

const OrderDetails = () => {
  const paramsRow = useLocalSearchParams();
  const orderId = paramsRow.orderId as any;
  const { data: order, isLoading } = useOrderById(orderId);

  if (isLoading || !order) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading...</Text>
      </View>
    );
  }

  // Assume single product for essentials order
  const product = order.items && order.items[0] ? order.items[0] : {};
  const shippingStatus = order.shippingStatus || "Processing";
  const statusIndex = getStatusIndex(shippingStatus);
  const shippingAddress = order.shippingAddress || {};
  const subtotal = product.price || 0;
  const shippingFee = order.shippingFee || 100; // fallback
  const total = order.totalPrice || subtotal + shippingFee;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <AdminHeader title={"Order Details"} onBack={() => router.back()} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Product Info */}
        <View style={styles.productHeader}>
          {order.items && order.items.length > 0 ? (
            order.items.map((item: any, idx: number) => (
              <View
                key={item.id || idx}
                style={{ alignItems: "center", marginBottom: 16 }}
              >
                <Text style={styles.productTitle}>{item.name}</Text>
                <Text style={styles.productSubtitle}>{item.brand}</Text>
                <Image
                  source={{ uri: item.image || item.image_full_url }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </View>
            ))
          ) : (
            <Text style={styles.productTitle}>No products</Text>
          )}
        </View>
        {/* Status Line */}
        <View style={styles.statusLineContainer}>
          {STATUS_STEPS.map((step, idx) => (
            <React.Fragment key={step}>
              <View style={styles.statusStepContainer}>
                <View
                  style={[
                    styles.statusDot,
                    idx <= statusIndex ? styles.statusDotActive : {},
                  ]}
                />
                <Text
                  style={[
                    styles.statusLabel,
                    idx === statusIndex ? styles.statusLabelActive : {},
                  ]}
                >
                  {step}
                </Text>
              </View>
              {idx < STATUS_STEPS.length - 1 && (
                <View style={styles.statusLine} />
              )}
            </React.Fragment>
          ))}
        </View>
        {/* Order Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Number</Text>
            <Text style={styles.infoValue} selectable>
              {order.id || order._id}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Edit Status</Text>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Text style={styles.infoValue}>{shippingStatus}</Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={Colors.darkGrayText}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Price</Text>
            <Text style={styles.infoValue}>{product.price} Baht</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Date</Text>
            <Text style={styles.infoValue}>
              {order.orderCreatedAt
                ? new Date(order.orderCreatedAt).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "-"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantity</Text>
            <Text style={styles.infoValue}>{product.quantity || 1}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Condition</Text>
            <Text style={styles.infoValue}>
              {product.condition || "Brand New"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Shipment type</Text>
            <Text style={styles.infoValue}>
              {order.shipmentType || "Regular"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Shipping Address</Text>
            <Text style={styles.infoValue}>
              {shippingAddress.street} {shippingAddress.street2}
              {shippingAddress.district ? ", " + shippingAddress.district : ""}
              {shippingAddress.province ? ", " + shippingAddress.province : ""}
              {shippingAddress.postalCode
                ? ", " + shippingAddress.postalCode
                : ""}
            </Text>
          </View>
        </View>
        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{subtotal} Baht</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping Fee</Text>
            <Text style={styles.summaryValue}>{shippingFee} Baht</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Total</Text>
            <Text style={styles.summaryTotalValue}>{total} Baht</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  productHeader: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 2,
    textAlign: "center",
  },
  productSubtitle: {
    fontSize: 16,
    color: Colors.darkGrayText,
    marginBottom: 8,
    textAlign: "center",
  },
  productImage: {
    width: 90,
    height: 130,
    marginVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.backgroundGray,
  },
  statusLineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
    marginHorizontal: 8,
  },
  statusStepContainer: {
    alignItems: "center",
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.grayEEE,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: Colors.grayLinesColor,
  },
  statusDotActive: {
    backgroundColor: Colors.brandColor,
    borderColor: Colors.brandColor,
  },
  statusLabel: {
    fontSize: 12,
    color: Colors.darkGrayText,
    textAlign: "center",
    width: 70,
  },
  statusLabelActive: {
    color: Colors.black,
    fontWeight: "bold",
  },
  statusLine: {
    height: 2,
    backgroundColor: Colors.grayEEE,
    flex: 1,
    marginHorizontal: 2,
    marginTop: -12,
  },
  infoSection: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: Colors.darkGrayText,
    width: 120,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: Colors.black,
    flex: 1,
    textAlign: "right",
  },
  summarySection: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLinesColor,
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.darkGrayText,
  },
  summaryValue: {
    fontSize: 16,
    color: Colors.black,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
  },
});

export default OrderDetails;
