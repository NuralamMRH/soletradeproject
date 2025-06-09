import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
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

  const {
    data: biddingOffer,
    isLoading: isBiddingOfferLoading,
    isError: isBiddingOfferError,
  } = useBiddingOfferById(orderId as string);

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

        <Text style={styles.title}>Offer Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your offer has been placed successfully
        </Text>

        <View style={styles.orderInfoContainer}>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Offer Number</Text>
            <Text style={styles.orderInfoValue}>{biddingOffer?.id}</Text>
          </View>

          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Order Date</Text>
            <Text style={styles.orderInfoValue}>
              {biddingOffer?.createdAt
                ? new Date(biddingOffer?.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                : "N/A"}
            </Text>
          </View>

          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Estimated Delivery</Text>
            <Text style={styles.orderInfoValue}>
              {biddingOffer?.createdAt
                ? new Date(
                    new Date(biddingOffer?.createdAt).getTime() +
                      3 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("en-US", {
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
              {biddingOffer?.paymentMethod?.name} ending in{" "}
              {biddingOffer?.paymentMethod?.cardNumber?.slice(-4)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>
              <Price price={biddingOffer?.totalPrice} currency="THB" />
            </Text>
          </View>
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
          <Text style={styles.viewOrderButtonText}>View Offer Details</Text>
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
    backgroundColor: Colors.white,
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
    color: Colors.black,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.darkGray,
    marginBottom: 30,
    textAlign: "center",
  },
  orderInfoContainer: {
    width: "100%",
    backgroundColor: Colors.backgroundGray,
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
    color: Colors.darkGray,
  },
  orderInfoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.black,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
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
    borderColor: Colors.lightGray,
    borderRadius: 8,
  },
  viewOrderButtonText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: "600",
  },
  mainAppButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.black,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  mainAppButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EssentialOrderConfirmation;
