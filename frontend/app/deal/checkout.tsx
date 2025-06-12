import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { COLORS, SIZES } from "@/constants";
import { useGetMyPaymentMethods } from "@/hooks/react-query/usePaymentMethodMutation";
import { router, useLocalSearchParams } from "expo-router";
import { useCreateOrder } from "@/hooks/react-query/useOrderMutation";
import { useShippingAddress } from "@/hooks/useShippingAddress";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAddToBiddingOffer } from "@/hooks/react-query/useBuyerOfferMutation";
import { useAuth } from "@/hooks/useAuth";
import { useCreateTransaction } from "@/hooks/react-query/useTransactionMutation";

const SHIPPING_OPTIONS = [
  { key: "standard", label: "Standard", price: 100, icon: "local-shipping" },
  { key: "express", label: "Express", price: 300, icon: "motorcycle" },
];

export default function Checkout() {
  const params = useLocalSearchParams();
  const {
    expiration,
    offeredPrice,
    productName,
    sizeId,
    packaging,
    itemCondition,
    brand,
    productId,
  } = params;

  const { user, isAuthenticated } = useAuth();
  // Calculate subtotal from items
  const subtotal = Number(offeredPrice);

  const payment = JSON.parse(params.payment as string);
  const address = JSON.parse(params.address as string);
  const buyNowItem = JSON.parse(params.buyNowItem as string);

  // Payment methods
  const { data: methods = [], isLoading: loadingMethods } =
    useGetMyPaymentMethods();
  // Addresses
  const { getMyShippingAddress } = useShippingAddress();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Selected
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0]);
  const [deliverySystem, setDeliverySystem] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<any>(payment || null);
  const [selectedAddress, setSelectedAddress] = useState<any>(address || null);
  const [discount, setDiscount] = useState(0);

  // Bottom sheets
  const paymentSheetRef = useRef<any>(null);
  const addressSheetRef = useRef<any>(null);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);

  // Swipe to pay
  const swipeX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);
  const SWIPE_WIDTH = Dimensions.get("window").width - 48;

  // Fetch addresses on mount
  useEffect(() => {
    (async () => {
      setLoadingAddresses(true);
      try {
        const res = await getMyShippingAddress();
        const addresses = res.shipping || res;
        setAddresses(addresses);
        if (!address) {
          setSelectedAddress(
            addresses.find((address: any) => address.isDefault) ||
              addresses[0] ||
              null
          );
        }
      } catch {
        setAddresses([]);
      }
      setLoadingAddresses(false);
    })();
  }, [address]);

  // Set default payment method
  useEffect(() => {
    if (methods.length > 0 && !selectedPayment) {
      setSelectedPayment(methods.find((m: any) => m.isDefault) || methods[0]);
    }
  }, [methods]);

  const { mutate: addToBiddingOffer, isPending: isAddingToBiddingOffer } =
    useAddToBiddingOffer();

  const { mutate: createTransaction, isPending: isCreatingTransaction } =
    useCreateTransaction();

  // Swipe logic
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      !isAddingToBiddingOffer && gesture.dx > 10,
    onPanResponderMove: Animated.event([null, { dx: swipeX }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, gesture) => {
      if (isAddingToBiddingOffer) return;
      if (gesture.dx > SWIPE_WIDTH * 0.6) {
        Animated.timing(swipeX, {
          toValue: SWIPE_WIDTH - 48,
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          // Submit order on successful swipe
          if (!selectedAddress || !selectedPayment) {
            alert(
              "Please select address, payment method, and have at least one item."
            );
            Animated.spring(swipeX, {
              toValue: 0,
              useNativeDriver: false,
            }).start();
            return;
          }
          const payload = {
            type: params.offerType,
            productId: productId as string,
            itemCondition: itemCondition,
            packaging: packaging,
            sizeId: params.newSizeId || (sizeId as string),
            offeredPrice: Number(offeredPrice),
            totalPrice: Number(total),
            price: Number(total),
            deliverySystem: deliverySystem,
            validUntil: new Date(Date.now() + Number(expiration) * 1000),
            shippingAddressId: selectedAddress.id || selectedAddress._id,
            paymentMethodId: selectedPayment.id || selectedPayment._id,
            discount,
            paymentStatus: "Paid",
            shippingStatus: "Ongoing",
            buyerId: user?.id,
            sellerId: buyNowItem.userId,
            sellingItemId: buyNowItem.id,
            status: "Pending",
            createdAt: new Date(),
          };

          let biddingOfferId: string | null = null;

          addToBiddingOffer(payload, {
            onSuccess: (data: any) => {
              setSwiped(false);
              swipeX.setValue(0);

              if (params.offerType === "buyNow") {
                biddingOfferId = data.id;
                const transactionPayload = {
                  ...payload,
                  biddingOfferId,
                  type: "buyNow",
                };
                createTransaction(transactionPayload, {
                  onSuccess: (data: any) => {
                    router.replace({
                      pathname: "/deal/offer-confirmation",
                      params: {
                        offerId: biddingOfferId,
                      } as any,
                    });
                  },
                });
              } else {
                router.replace({
                  pathname: "/deal/offer-confirmation",
                  params: {
                    offerId: biddingOfferId,
                  } as any,
                });
              }
            },
            onError: (err: any) => {
              setSwiped(false);
              swipeX.setValue(0);
              alert(err?.message || "Order failed. Please try again.");
            },
          });
        });
      } else {
        Animated.spring(swipeX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  // Order summary
  const shippingFee = selectedShipping.price;
  const total = subtotal + shippingFee - discount;

  // Renderers
  const renderPaymentSheet = () => (
    <BottomSheet
      ref={paymentSheetRef}
      index={0}
      snapPoints={["50%"]}
      enablePanDownToClose={true}
      onClose={() => setShowPaymentSheet(false)}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.bottomSheetIndicator}
    >
      <BottomSheetView style={styles.bottomSheetContent}>
        <View style={styles.bottomSheetHeader}>
          <TouchableOpacity onPress={() => paymentSheetRef.current?.close()}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.bottomSheetTitle}>Payment Method</Text>
          <TouchableOpacity onPress={() => paymentSheetRef.current?.close()}>
            <Text style={styles.doneButton}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.paymentMethodsList}>
          {methods
            .filter((method: any) => method.section === "buying")
            .map((method: any) => (
              <TouchableOpacity
                key={method._id || method.id}
                style={styles.paymentMethodItem}
                onPress={() => {
                  setSelectedPayment(method);
                  paymentSheetRef.current?.close();
                }}
              >
                <View style={styles.paymentMethodLeft}>
                  {method.paymentType === "card" ? (
                    <FontAwesome
                      name="credit-card"
                      size={24}
                      color={COLORS.white}
                      style={{ marginRight: 8 }}
                    />
                  ) : (
                    <MaterialIcons
                      name="account-balance"
                      size={24}
                      color={COLORS.white}
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text style={styles.paymentMethodText}>
                    {method.paymentType === "card"
                      ? `${
                          method.name || "Card"
                        } ending in **${method.cardNumber?.slice(-4)}`
                      : `${
                          method.bank || "Bank"
                        } ending in *${method.accountNumber?.slice(-3)}`}
                    {method.isDefault ? " (Default)" : ""}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          <TouchableOpacity
            style={styles.addPaymentButton}
            onPress={() => {
              paymentSheetRef.current?.close();
              setTimeout(() => router.push("/user/add-payment-method"), 300);
            }}
          >
            <Text style={styles.addPaymentText}>Add New Payment Method</Text>
          </TouchableOpacity>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );

  const renderAddressSheet = () => (
    <BottomSheet
      ref={addressSheetRef}
      index={0}
      snapPoints={["50%"]}
      enablePanDownToClose={true}
      onClose={() => setShowAddressSheet(false)}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.bottomSheetIndicator}
    >
      <BottomSheetView style={styles.bottomSheetContent}>
        <View style={styles.bottomSheetHeader}>
          <TouchableOpacity onPress={() => addressSheetRef.current?.close()}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.bottomSheetTitle}>Shipping Address</Text>
          <TouchableOpacity onPress={() => addressSheetRef.current?.close()}>
            <Text style={styles.doneButton}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.paymentMethodsList}>
          {addresses.map((method: any) => (
            <TouchableOpacity
              key={method._id || method.id}
              style={styles.paymentMethodItem}
              onPress={() => {
                setSelectedAddress(method);
                addressSheetRef.current?.close();
              }}
            >
              <View style={styles.paymentMethodLeft}>
                <Text style={{ color: "#fff", fontSize: 16 }}>
                  {`${method.name} ${method.street} ${method.street2} ${method.subDistrict} ${method.district} ${method.province} ${method.postalCode} ${method.phone}`}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addPaymentButton}
            onPress={() => {
              addressSheetRef.current?.close();
              setTimeout(() => router.push("/user/shipping-address"), 300);
            }}
          >
            <Text style={styles.addPaymentText}>Add New Address</Text>
          </TouchableOpacity>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
  const insets = useSafeAreaInsets();
  // Main render
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{ paddingTop: insets.top }} />
      <View
        style={{
          position: "relative",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{ position: "absolute", left: 16, top: 16 }}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
              marginLeft: 16,
              marginTop: 12,
              marginBottom: 4,
              textAlign: "center",
              color: "#fff",
            }}
          >
            {`${productName} `}
          </Text>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 14,
              marginLeft: 16,
              marginTop: 12,
              marginBottom: 4,
              textAlign: "center",
              color: "#eee",
            }}
          >
            {`${brand} `}
          </Text>
        </View>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Product summary */}

        <View>
          <View style={styles.productSummary}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productMeta}>
                {params.size
                  ? `Size: ${params.sizeName || params.size} ${
                      params.attributeName
                    }\n`
                  : ""}
                {itemCondition ? `Condition: ${itemCondition}\n` : ""}
                {packaging ? `Equipment: ${packaging}` : ""}
              </Text>
            </View>
            <Image
              source={{ uri: params.image }}
              style={styles.productImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.divider} />
        {/* Delivery options */}
        <View style={styles.section}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity onPress={() => setDeliverySystem("Delivery")}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    padding: 10,
                    borderWidth: 2,
                    borderColor:
                      deliverySystem === "Delivery" ? COLORS.dark2 : "#fff",
                    backgroundColor:
                      deliverySystem === "Delivery"
                        ? COLORS.dark2
                        : "transparent",
                    width: 130,
                    textAlign: "center",
                  },
                ]}
              >
                Delivery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeliverySystem("Storage")}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    padding: 10,
                    borderWidth: 2,
                    borderColor:
                      deliverySystem === "Storage" ? COLORS.dark2 : "#fff",
                    backgroundColor:
                      deliverySystem === "Storage"
                        ? COLORS.dark2
                        : "transparent",
                    width: 130,
                    textAlign: "center",
                    fontWeight: "bold",
                  },
                ]}
              >
                Storage -TBA
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", marginTop: 16 }}>
            {SHIPPING_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.deliveryOption,
                  selectedShipping.key === opt.key &&
                    styles.deliveryOptionSelected,
                ]}
                onPress={() => setSelectedShipping(opt)}
              >
                <Text
                  style={[
                    styles.deliveryLabel,
                    selectedShipping.key === opt.key && { color: COLORS.white },
                  ]}
                >
                  {opt.label}
                </Text>
                <MaterialIcons
                  name={opt.icon as any}
                  size={32}
                  color={COLORS.white}
                />

                <Text
                  style={[
                    styles.deliveryPrice,
                    selectedShipping.key === opt.key && { color: COLORS.white },
                  ]}
                >
                  {opt.price} Baht
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Payment method */}
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={24} color={COLORS.white} />
          <Text style={styles.infoText}>
            {selectedPayment
              ? selectedPayment.paymentType === "card"
                ? `${
                    selectedPayment.name || "Card"
                  } ending in **${selectedPayment.cardNumber?.slice(-4)}`
                : `${
                    selectedPayment.bank || "Bank"
                  } ending in *${selectedPayment.accountNumber?.slice(-3)}`
              : "Select Payment Method"}
          </Text>
          <TouchableOpacity onPress={() => setShowPaymentSheet(true)}>
            <Text style={styles.editLink}>Edit&gt;</Text>
          </TouchableOpacity>
        </View>
        {/* Shipping address */}
        <View style={styles.infoRow}>
          <Ionicons name="home-outline" size={24} color={COLORS.white} />
          <Text style={styles.infoText} numberOfLines={1}>
            {selectedAddress
              ? `${selectedAddress.name} ${selectedAddress.street} ${selectedAddress.street2} ${selectedAddress.subDistrict} ${selectedAddress.district} ${selectedAddress.province} ${selectedAddress.postalCode} ${selectedAddress.phone}`
              : "Select Shipping Address"}
          </Text>
          <TouchableOpacity onPress={() => setShowAddressSheet(true)}>
            <Text style={styles.editLink}>Edit&gt;</Text>
          </TouchableOpacity>
        </View>
        {/* Discount code */}
        <View style={styles.infoRow}>
          <MaterialIcons
            name="confirmation-number"
            size={24}
            color={COLORS.white}
          />
          <Text style={styles.infoText}>Discount Code</Text>
          <Text style={styles.discountApplied}>
            {discount > 0 ? "1 offer applied" : "No offer applied"}
          </Text>
        </View>
        <View style={styles.divider} />
        {/* Order summary */}
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
            <Text style={styles.summaryLabel}>Discount Applied</Text>
            <Text style={styles.summaryValue}>-{discount} Baht</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Total</Text>
            <Text style={styles.summaryTotalValue}>{total} Baht</Text>
          </View>
        </View>
      </ScrollView>
      {/* Swipe to Pay */}
      <View style={styles.swipeContainer}>
        <Animated.View
          style={[
            styles.swipeButton,
            {
              transform: [{ translateX: swipeX }],
              opacity: swiped || isAddingToBiddingOffer ? 0.5 : 1,
            },
          ]}
          {...panResponder.panHandlers}
        >
          {isAddingToBiddingOffer ? (
            <Text style={{ color: COLORS.white, fontWeight: "bold" }}>...</Text>
          ) : (
            <Ionicons name="arrow-forward" size={32} color={COLORS.white} />
          )}
        </Animated.View>
        <Text style={styles.swipeText}>
          {isAddingToBiddingOffer ? "Processing..." : "Swipe to Pay"}
        </Text>
      </View>
      {/* Bottom Sheets */}
      {showPaymentSheet && renderPaymentSheet()}
      {showAddressSheet && renderAddressSheet()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: "#000",
  },
  productSummary: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  productSubtitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 8,
  },
  productMeta: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
  },
  productImage: {
    width: 80,
    height: 120,
    marginLeft: 16,
    borderRadius: 8,
  },
  divider: {
    height: 2,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  deliveryOption: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 12,
    backgroundColor: "#000",
  },
  deliveryOptionSelected: {
    backgroundColor: COLORS.dark2,
    borderColor: "#fff",
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    color: "#fff",
  },
  deliveryPrice: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    marginLeft: 12,
  },
  editLink: {
    color: COLORS.grayTie,
    fontSize: 14,
    fontWeight: "bold",
  },
  discountApplied: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  summarySection: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#fff",
  },
  summaryValue: {
    fontSize: 16,
    color: "#fff",
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  swipeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray2,
    margin: 16,
    borderRadius: 0,
    overflow: "hidden",
    height: 56,
    marginBottom: 25,
  },
  swipeButton: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.gray3,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    zIndex: 2,
  },
  swipeText: {
    flex: 1,
    textAlign: "center",
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "500",
  },
  // BottomSheet styles
  bottomSheetBackground: {
    backgroundColor: COLORS.dark1,
  },
  bottomSheetIndicator: {
    backgroundColor: COLORS.grayTie,
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: COLORS.dark1,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayTie,
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  cancelButton: {
    fontSize: 14,
    color: COLORS.white,
  },
  doneButton: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
  },
  paymentMethodsList: {
    flex: 1,
  },
  paymentMethodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodText: {
    fontSize: 14,
    color: COLORS.white,
  },
  addPaymentButton: {
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  addPaymentText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "500",
  },
});
