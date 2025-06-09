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
import { useShippingAddress } from "@/hooks/useShippingAddress";
import AdminHeader from "@/components/AdminHeader";
import { router, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { useCreateOrder } from "@/hooks/react-query/useOrderMutation";
import { addToCart } from "@/Redux/slices/product";

const SHIPPING_OPTIONS = [
  { key: "standard", label: "Standard", price: 100, icon: "local-shipping" },
  { key: "express", label: "Express", price: 300, icon: "motorcycle" },
];

export default function Checkout() {
  const dispatch = useDispatch();
  const params = useLocalSearchParams();
  const { selectedItems } = params;
  const items = JSON.parse(selectedItems as string);

  // Calculate subtotal from items
  const subtotal = items.reduce(
    (sum: number, item: any) => sum + item.price * (item.quantity || 1),
    0
  );

  // Payment methods
  const { data: methods = [], isLoading: loadingMethods } =
    useGetMyPaymentMethods();
  // Addresses
  const { getMyShippingAddress } = useShippingAddress();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Selected
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [discount, setDiscount] = useState(0);

  console.log("selectedItems", selectedItems);
  // Bottom sheets
  const paymentSheetRef = useRef<any>(null);
  const addressSheetRef = useRef<any>(null);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);

  // Swipe to pay
  const swipeX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);
  const SWIPE_WIDTH = Dimensions.get("window").width - 48;

  // Group items by brand for display
  const groupedItems: { [brand: string]: any[] } = items.reduce(
    (groups: { [brand: string]: any[] }, item: any) => {
      const brand = item.brand || "Unknown Brand";
      if (!groups[brand]) groups[brand] = [];
      groups[brand].push(item);
      return groups;
    },
    {}
  );

  // Fetch addresses on mount
  useEffect(() => {
    (async () => {
      setLoadingAddresses(true);
      try {
        const res = await getMyShippingAddress();
        const addresses = res.shipping || res;
        setAddresses(addresses);
        setSelectedAddress(
          addresses.find((address: any) => address.isDefault) ||
            addresses[0] ||
            null
        );
      } catch {
        setAddresses([]);
      }
      setLoadingAddresses(false);
    })();
  }, []);

  // Set default payment method
  useEffect(() => {
    if (methods.length > 0 && !selectedPayment) {
      setSelectedPayment(methods.find((m: any) => m.isDefault) || methods[0]);
    }
  }, [methods]);

  const { mutate: createOrder, isLoading: isCreatingOrder } = useCreateOrder();

  // Swipe logic
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      !isCreatingOrder && gesture.dx > 10,
    onPanResponderMove: Animated.event([null, { dx: swipeX }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, gesture) => {
      if (isCreatingOrder) return;
      if (gesture.dx > SWIPE_WIDTH * 0.6) {
        Animated.timing(swipeX, {
          toValue: SWIPE_WIDTH - 48,
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          // Submit order on successful swipe
          if (!selectedAddress || !selectedPayment || items.length === 0) {
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
            items,
            totalPrice: total,
            shippingAddressId: selectedAddress.id || selectedAddress._id,
            paymentMethodId: selectedPayment.id || selectedPayment._id,
            discount,
            orderType: "E-Commerce",
            orderStatus: "Pending",
          };
          createOrder(payload, {
            onSuccess: (data: any) => {
              setSwiped(false);
              swipeX.setValue(0);
              //   dispatch(addToCart({} as any));
              router.replace({
                pathname: "/essentials/order-confirmation",
                params: {
                  orderId: data.id,
                } as any,
              });
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
          {methods.map((method: any) => (
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

  // Main render
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <AdminHeader title="Checkout" onBack={() => router.back()} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Product summary */}
        {items.length === 0 ? (
          <View style={{ padding: 32, alignItems: "center" }}>
            <Text style={{ color: COLORS.grayTie, fontSize: 18 }}>
              No items in checkout.
            </Text>
          </View>
        ) : (
          <View>
            {Object.entries(groupedItems).map(([brand, brandItems]) => (
              <View key={brand}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 18,
                    marginLeft: 16,
                    marginTop: 12,
                    marginBottom: 4,
                    textAlign: "center",
                  }}
                >
                  {brand}
                </Text>
                {brandItems.map((item: any, idx: number) => (
                  <View style={styles.productSummary} key={item.id || idx}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productTitle}>{item.name}</Text>
                      {item.subtitle && (
                        <Text style={styles.productSubtitle}>
                          {item.subtitle}
                        </Text>
                      )}
                      <Text style={styles.productMeta}>
                        {item.size ? `Size: ${item.size}\n` : ""}
                        {item.condition ? `Condition: ${item.condition}\n` : ""}
                        {item.equipment ? `Equipment: ${item.equipment}` : ""}
                      </Text>
                      <Text style={styles.productMeta}>
                        Qty: {item.quantity || 1}
                      </Text>
                    </View>
                    <Image
                      source={{ uri: item.image || item.image_full_url }}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
        <View style={styles.divider} />
        {/* Delivery options */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { padding: 10, borderWidth: 2, width: 100, textAlign: "center" },
            ]}
          >
            Delivery
          </Text>
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
                  color={
                    selectedShipping.key === opt.key
                      ? COLORS.white
                      : COLORS.dark1
                  }
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
          <Ionicons name="card-outline" size={24} color={COLORS.dark1} />
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
          <Ionicons name="home-outline" size={24} color={COLORS.dark1} />
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
            color={COLORS.dark1}
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
              opacity: swiped || isCreatingOrder ? 0.5 : 1,
            },
          ]}
          {...panResponder.panHandlers}
        >
          {isCreatingOrder ? (
            <Text style={{ color: COLORS.white, fontWeight: "bold" }}>...</Text>
          ) : (
            <Ionicons name="arrow-forward" size={32} color={COLORS.white} />
          )}
        </Animated.View>
        <Text style={styles.swipeText}>
          {isCreatingOrder ? "Processing..." : "Swipe to Pay"}
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
    backgroundColor: COLORS.white,
    padding: 0,
  },
  productSummary: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: COLORS.white,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.dark1,
    marginBottom: 2,
  },
  productSubtitle: {
    fontSize: 16,
    color: COLORS.dark1,
    marginBottom: 8,
  },
  productMeta: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 8,
  },
  productImage: {
    width: 80,
    height: 120,
    marginLeft: 16,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundGray,
  },
  divider: {
    height: 2,
    backgroundColor: COLORS.grayTie,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  section: {
    padding: 16,
    backgroundColor: COLORS.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark1,
    marginBottom: 8,
  },
  deliveryOption: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.dark1,
    marginRight: 12,
    backgroundColor: COLORS.white,
  },
  deliveryOptionSelected: {
    backgroundColor: COLORS.dark1,
    borderColor: COLORS.dark1,
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    color: COLORS.dark1,
  },
  deliveryPrice: {
    fontSize: 14,
    color: COLORS.grayTie,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.dark1,
    marginLeft: 12,
  },
  editLink: {
    color: COLORS.grayTie,
    fontSize: 14,
    fontWeight: "bold",
  },
  discountApplied: {
    color: COLORS.dark1,
    fontWeight: "bold",
    fontSize: 14,
  },
  summarySection: {
    padding: 16,
    backgroundColor: COLORS.white,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.dark1,
  },
  summaryValue: {
    fontSize: 16,
    color: COLORS.dark1,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.dark1,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.dark1,
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
    backgroundColor: COLORS.dark1,
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
