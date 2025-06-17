import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
  StatusBar,
} from "react-native";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Price from "@/utils/Price";
import { useSellingOfferById } from "@/hooks/react-query/useSellerOfferMutation";

type Params = {
  askId: string;
  transaction: string;
  data: string;
};

const AskConfirmation = () => {
  const paramsRaw = useLocalSearchParams();
  const params: Params = {
    askId: paramsRaw.askId as string,
    transaction: paramsRaw.transaction as string,
    data: paramsRaw.data as string,
  };
  const transaction = JSON.parse(params.transaction);
  const sellingOffer = JSON.parse(params.data);

  const animationRef = useRef<any>(null);

  // Get current date for order date
  const orderDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Estimated delivery date (5 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const estimatedDelivery = deliveryDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    // Play animation when component mounts
    if (animationRef.current) {
      setTimeout(() => {
        animationRef.current?.play();
      }, 100);
    }
  }, []);

  const handleDownloadReceipt = async () => {
    try {
      await Share.share({
        title: `${transaction ? "SellNow" : "Ask"} Receipt - ${
          sellingOffer?.id
        }`,
        message: `Your ${transaction ? "SellNow" : "Ask"} ${
          sellingOffer?.id
        } has been confirmed! Thank you for shopping with SoleTrade.`,
      });
    } catch (error) {
      console.error("Error sharing receipt:", error);
    }
  };

  const handleGoToMainApp = () => {
    router.push("/(tabs)");
  };

  const handleViewOrderDetails = () => {
    // Navigate to order details screen
    router.push("/deal/seller/offer-history");
  };

  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.animationContainer}>
          <LottieView
            ref={animationRef}
            source={require("@/assets/animation/success.json")}
            style={styles.animation}
            autoPlay={false}
            loop={false}
          />
        </View>

        <Text style={styles.title}>
          {transaction ? "Sell Now" : "Ask"} Confirmed!
        </Text>
        <Text style={styles.subtitle}>
          Your {transaction ? "SellNow" : "Ask"} has been placed successfully
        </Text>

        <View style={styles.orderInfoContainer}>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>
              {transaction ? "Sell Now" : "Ask"}
            </Text>
            <Text style={styles.orderInfoValue}>{sellingOffer?.id}</Text>
          </View>

          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>
              {transaction ? "SellNow" : "Ask"} Date
            </Text>
            <Text style={styles.orderInfoValue}>
              {transaction
                ? new Date(transaction?.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </Text>
          </View>

          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Payout Method</Text>
            <Text style={styles.orderInfoValue}>
              {sellingOffer?.paymentMethod?.name} ending in{" "}
              {sellingOffer?.paymentMethod?.cardNumber?.slice(-4)}
            </Text>
          </View>

          <View style={styles.divider} />

          <>
            <View
              style={[
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginHorizontal: 16,
                  paddingTop: 40,
                  marginTop: 10,
                },
              ]}
            >
              <Text style={{ color: "#333", fontSize: 15 }}>Selling Price</Text>

              <Text style={[{ fontSize: 15, color: "#333" }]}>
                {transaction?.price
                  ? Number(transaction?.price).toLocaleString("th-TH") + " Baht"
                  : ""}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginHorizontal: 16,
                paddingTop: 10,
              }}
            >
              <Text style={{ color: "#888", fontSize: 14 }}>
                Commision Fee (4.0 %)
              </Text>

              <Text style={[{ fontSize: 14, color: "#888" }]}>
                {transaction?.price
                  ? Number(transaction?.price * 0.04).toLocaleString("th-TH") +
                    " Baht"
                  : "0 Baht"}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginHorizontal: 16,
                paddingTop: 10,
              }}
            >
              <Text style={{ color: "#888", fontSize: 14 }}>
                Transaction Fee (3.0 %)
              </Text>

              <Text style={[{ fontSize: 14, color: "#888" }]}>
                {transaction?.price
                  ? Number(transaction?.price * 0.03).toLocaleString("th-TH") +
                    " Baht"
                  : "0 Baht"}
              </Text>
            </View>
            <View
              style={[
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginHorizontal: 15,
                  paddingTop: 10,
                },
              ]}
            >
              <Text style={{ color: "#fff", fontSize: 15 }}>Earnings</Text>

              <Text style={{ fontSize: 15, color: "#fff" }}>
                {transaction?.price
                  ? Number(transaction?.price * 0.91).toLocaleString("th-TH") +
                    " Baht"
                  : "0 Baht"}
              </Text>
            </View>
          </>
        </View>

        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownloadReceipt}
        >
          <Ionicons name="download-outline" size={20} color={Colors.white} />
          <Text style={styles.downloadButtonText}>Download E-Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewOrderButton}
          onPress={handleViewOrderDetails}
        >
          <Text style={styles.viewOrderButtonText}>
            View {transaction ? "SellNow" : "Ask"} Details
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={styles.mainAppButton}
        onPress={handleGoToMainApp}
      >
        <Text style={styles.mainAppButtonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.white,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginBottom: 30,
    textAlign: "center",
  },
  orderInfoContainer: {
    width: "100%",
    backgroundColor: "rgba(36, 36, 36, 0.66)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  orderInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  orderInfoLabel: {
    fontSize: 14,
    color: "#fff",
  },
  orderInfoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(214, 211, 211, 0.66)",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "rgba(214, 211, 211, 0.66)",
  },
  divider: {
    height: 1,
    backgroundColor: "#888",
    marginVertical: 16,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#094622",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: "100%",
    marginBottom: 16,
  },
  downloadButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  viewOrderButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 8,
  },
  viewOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  mainAppButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  mainAppButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AskConfirmation;
