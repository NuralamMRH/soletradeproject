import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
  Image,
} from "react-native";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
  useRootNavigationState,
} from "expo-router";
import Colors from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOrderById } from "@/hooks/react-query/useOrderMutation";
import Price from "@/utils/Price";
import { useBiddingOfferById } from "@/hooks/react-query/useBuyerOfferMutation";
import { StatusBar } from "react-native";
import { useTransactionById } from "@/hooks/react-query/useTransactionMutation";
import { SIZES } from "@/constants";

type Params = {
  orderId: string;
};

const EssentialOrderConfirmation = () => {
  const paramsRaw = useLocalSearchParams();
  const params: Params = {
    orderId: paramsRaw.orderId as string,
  };
  const orderId = params.orderId;
  const animationRef = useRef<any>(null);
  const offerData = JSON.parse(paramsRaw.offer as string);
  const transactionData = JSON.parse(paramsRaw.transaction as string);

  const {
    data: biddingOffer,
    isLoading: isBiddingOfferLoading,
    isError: isBiddingOfferError,
  } = useBiddingOfferById(orderId as string);

  const {
    data: transaction,
    isLoading: isTransactionLoading,
    isError: isTransactionError,
  } = useTransactionById(transactionData?.id as any);

  console.log("transaction", transaction);

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
        title: `Offer Receipt - ${biddingOffer?.id}`,
        message: `Your offer ${biddingOffer?.id} has been confirmed! Thank you for shopping with SoleTrade.`,
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
    router.push("/user/offer-history");
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
          {transactionData ? "Order Confirmed!" : "Offer Confirmed!"}
        </Text>
        <Text style={styles.subtitle}>
          {transactionData
            ? "Your order has been placed successfully"
            : "Your offer has been placed successfully"}
        </Text>

        <View style={styles.orderInfoContainer}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={{
                uri: transactionData?.productImage || offerData?.productImage,
              }}
              style={styles.productImage}
            />
          </View>

          <View>
            <Text
              style={{ color: Colors.white, fontSize: 16, fontWeight: "bold" }}
            >
              {transactionData?.product?.name || ""}
            </Text>
          </View>
          <View>
            <Text
              style={{ color: Colors.white, fontSize: 16, fontWeight: "bold" }}
            >
              {transactionData?.sizeName || offerData?.sizeName}
            </Text>
          </View>
          <View>
            <Text style={styles.orderInfoLabel}>
              {transactionData?.sizeName || offerData?.sizeName}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>
              {transactionData ? "Order Id" : "Offer Id"}
            </Text>
            <Text style={styles.orderInfoValue}>
              {transactionData ? transactionData?.id : offerData?.id}
            </Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>
              {transactionData ? "Price" : "Offered Price"}
            </Text>
            <Text style={styles.orderInfoValue}>
              <Price
                price={
                  transactionData
                    ? transactionData?.price
                    : offerData?.offeredPrice
                }
                currency="THB"
              />
            </Text>
          </View>

          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>
              {transactionData ? "Order Date" : "Offer Date"}
            </Text>
            <Text style={styles.orderInfoValue}>
              {transactionData
                ? transactionData?.createdAt
                : offerData?.createdAt
                ? new Date(offerData?.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </Text>
          </View>

          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Payment Method</Text>
            <Text style={styles.orderInfoValue}>
              {transactionData
                ? transactionData?.paymentMethodId?.name
                : offerData?.paymentMethodId?.name}
              ending in{" "}
              {transactionData
                ? transactionData?.paymentMethodId?.cardNumber?.slice(-4)
                : offerData?.paymentMethodId?.cardNumber?.slice(-4)}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 10,
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <TouchableOpacity
            onPress={handleDownloadReceipt}
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                padding: 10,
                borderRadius: 50,
                width: SIZES.width / 4 - 50,
                height: SIZES.width / 4 - 50,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons
                name="download-outline"
                size={20}
                color={Colors.black}
              />
            </View>
            <Text style={{ color: Colors.white, fontSize: 12 }}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDownloadReceipt}
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                padding: 10,
                borderRadius: 50,
                width: SIZES.width / 4 - 50,
                height: SIZES.width / 4 - 50,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons name="share-outline" size={20} color={Colors.black} />
            </View>
            <Text style={{ color: Colors.white, fontSize: 12 }}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDownloadReceipt}
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                padding: 10,
                borderRadius: 50,
                width: SIZES.width / 4 - 50,
                height: SIZES.width / 4 - 50,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons name="grid-outline" size={20} color={Colors.black} />
            </View>
            <Text style={{ color: Colors.white, fontSize: 12 }}>Grid</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDownloadReceipt}
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                padding: 10,
                borderRadius: 50,
                width: SIZES.width / 4 - 50,
                height: SIZES.width / 4 - 50,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons name="list-outline" size={20} color={Colors.black} />
            </View>
            <Text style={{ color: Colors.white, fontSize: 12 }}>List</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.mainAppButton}
        onPress={handleGoToMainApp}
      >
        <Text style={styles.mainAppButtonText}>Dismiss</Text>
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
    borderRadius: 0,
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
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  mainAppButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  productImage: {
    width: SIZES.width * 0.5,
    height: SIZES.width * 0.5,
    objectFit: "cover",
    overflow: "hidden",
  },
});

export default EssentialOrderConfirmation;
