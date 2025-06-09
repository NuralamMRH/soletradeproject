import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useGetMyPaymentMethods } from "@/hooks/react-query/usePaymentMethodMutation";
import { useShippingAddress } from "@/hooks/useShippingAddress";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const expirationOptions = ["3 Days", "7 Days", "14 Days", "30 Days"];

const OfferPlace = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mock data (replace with real params/data as needed)
  const productName = params.productName || "Air Jordan";
  const productSubtitle = "Air Jordan 1 Low OG Travis Scott Medium Olive";
  const size = params.size || "6.5";
  let variations: any[] = [];
  if (typeof params.variations === "string") {
    try {
      variations = JSON.parse(params.variations);
    } catch {
      variations = [];
    }
  } else if (Array.isArray(params.variations)) {
    variations = params.variations;
  }

  const attribute = params.attribute || null;

  const [selectedSize, setSelectedSize] = useState(size);
  const condition = "New";
  const box = "Original (Good)";
  const [offer, setOffer] = useState("");
  const [expiration, setExpiration] = useState("30 Days");
  const [payment, setPayment] = useState("Visa ending in **34");
  const [address, setAddress] = useState("2342 Ratchaphruek 34 Rd");
  const [showExpirationSheet, setShowExpirationSheet] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showSizeSheet, setShowSizeSheet] = useState(false);
  const expirationSheetRef = useRef<BottomSheet>(null);
  const paymentSheetRef = useRef<BottomSheet>(null);
  const addressSheetRef = useRef<BottomSheet>(null);
  const sizeSheetRef = useRef<BottomSheet>(null);
  // Payment methods
  const { data: methods = [], isLoading: loadingMethods } =
    useGetMyPaymentMethods();
  // Addresses
  const { getMyShippingAddress } = useShippingAddress();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
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

  const handleGoCheckout = () => {
    router.push({
      pathname: "/deal/checkout",
      params: {
        size: selectedSize,
        attribute:
          attribute?.name ||
          variations.find(
            (variation: any) => variation.optionName === selectedSize
          )?.attributeId.name,
        payment: payment,
        address: selectedAddress,
        expiration: expiration,
        offeredPrice: offer,
        packaging: box,
        itemCondition: condition,
        ...params,
      },
    });
  };

  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top - 40 }} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center", marginRight: 28 }}>
            <Text style={styles.title}>{productName}</Text>
            <Text style={styles.subtitle}>{productSubtitle}</Text>
          </View>
        </View>
        {/* Offer Input */}
        <View style={styles.offerInputSection}>
          <View style={styles.offerInputRow}>
            <Text style={styles.currency}>THB</Text>
            <TextInput
              style={styles.offerInput}
              value={
                offer !== undefined && offer !== null && offer !== ""
                  ? Number(offer).toLocaleString("th-TH")
                  : ""
              }
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, "");
                setOffer(numeric ? Number(numeric) : "");
              }}
              placeholder=""
              placeholderTextColor="#888"
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.placeOfferLabel}>Place your offer</Text>
        </View>
        {/* Pricing Options */}
        <Text style={styles.pricingOptionsLabel}>Pricing Options</Text>
        <View style={styles.pricingOptionsRow}>
          <TouchableOpacity
            onPress={() => setOffer(14595)}
            style={styles.priceOptionBox}
          >
            <Text style={styles.priceOptionLabel}>Highest Offer</Text>
            <Text style={styles.priceOptionValue}>14,595 Baht</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setOffer(20000)}
            style={styles.priceOptionBox}
          >
            <Text style={styles.priceOptionLabel}>Suggested</Text>
            <Text style={styles.priceOptionValue}>20,000 Baht</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setOffer(21800)}
            style={styles.priceOptionBox}
          >
            <Text style={styles.priceOptionLabel}>Buy Now</Text>
            <Text style={styles.priceOptionValue}>21,800 Baht</Text>
          </TouchableOpacity>
        </View>
        {/* Product Info Row */}
        <View style={styles.productInfoRow}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={() => setShowSizeSheet(true)}>
              <Text style={styles.infoText}>
                Size: {selectedSize}{" "}
                {attribute?.name ||
                  variations.find(
                    (variation: any) => variation.optionName === selectedSize
                  )?.attributeId.name}
                <Ionicons name="pencil" size={14} color="#fff" />
              </Text>
            </TouchableOpacity>

            <Text style={styles.infoText}>Condition: {condition}</Text>
            <Text style={styles.infoText}>Box: {box}</Text>
          </View>
          <Image source={{ uri: params.image }} style={styles.productImage} />
        </View>
        {/* Expiration, Payment, Address */}
        <View style={styles.infoRow}>
          <Ionicons
            name="time-outline"
            size={22}
            color="#fff"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.infoRowText}>{expiration}</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setShowExpirationSheet(true)}
          >
            <Text style={styles.editBtnText}>Edit&gt;</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoRow}>
          <Ionicons
            name="card-outline"
            size={22}
            color="#fff"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.infoRowText}>
            {payment.paymentType === "card"
              ? `${
                  payment.name || "Card"
                } ending in **${payment.cardNumber?.slice(-4)}`
              : `${
                  payment.bank || "Bank"
                } ending in *${payment.accountNumber?.slice(-3)}`}
          </Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setShowPaymentSheet(true)}
          >
            <Text style={styles.editBtnText}>Edit&gt;</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoRow}>
          <Ionicons
            name="home-outline"
            size={22}
            color="#fff"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.infoRowText}>
            {`${selectedAddress?.name} ${selectedAddress?.street} ${selectedAddress?.street2} ${selectedAddress?.subDistrict} ${selectedAddress?.district} ${selectedAddress?.province} ${selectedAddress?.postalCode} ${selectedAddress?.phone}`}
          </Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setShowAddressSheet(true)}
          >
            <Text style={styles.editBtnText}>Edit&gt;</Text>
          </TouchableOpacity>
        </View>
        {/* Spacer */}
        <View style={{ flex: 1 }} />
        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.placeOfferBtn}
            disabled={!offer}
            onPress={handleGoCheckout}
          >
            <Text style={styles.placeOfferBtnText}>Place Offer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Offer Expiration BottomSheet */}
      <BottomSheet
        ref={expirationSheetRef}
        index={showExpirationSheet ? 0 : -1}
        snapPoints={["40%"]}
        enablePanDownToClose={true}
        onClose={() => setShowExpirationSheet(false)}
        backgroundStyle={{ backgroundColor: "#222" }}
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ padding: 20 }}>
          <Text
            style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: 18,
              marginBottom: 16,
            }}
          >
            Offer Expiration
          </Text>
          {expirationOptions.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={{
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: "#333",
              }}
              onPress={() => {
                setExpiration(opt);
                expirationSheetRef.current?.close();
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </BottomSheetView>
      </BottomSheet>
      {/* Size BottomSheet */}
      <BottomSheet
        ref={sizeSheetRef}
        index={showSizeSheet ? 0 : -1}
        snapPoints={["50%"]}
        enablePanDownToClose={true}
        onClose={() => setShowSizeSheet(false)}
        backgroundStyle={{ backgroundColor: "#222" }}
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ flex: 1, padding: 20 }}>
          {/* Size Selection Grid */}

          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 20 }}
              >
                Select Size
              </Text>
              <TouchableOpacity>
                <Text style={{ color: "white", fontSize: 14 }}>
                  Size Chart &gt;
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {variations &&
                variations?.map((variation: any, idx: number) => (
                  <TouchableOpacity
                    key={variation._id}
                    style={{
                      width: "30%",
                      marginBottom: 16,
                      borderWidth: 2,
                      borderColor:
                        selectedSize === variation._id ? "#fff" : "#888",
                      borderRadius: 8,
                      paddingVertical: 16,
                      alignItems: "center",
                      backgroundColor:
                        selectedSize === variation._id ? "#222" : "transparent",
                    }}
                    onPress={() => {
                      setSelectedSize(variation.optionName);
                      sizeSheetRef.current?.close();
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      {variation.optionName}{" "}
                      {attribute?.name ||
                        variations.find(
                          (variation: any) =>
                            variation.optionName === selectedSize
                        )?.attributeId.name}
                    </Text>
                    <Text style={{ color: "#fff", fontSize: 14, marginTop: 4 }}>
                      {variation.retailPrice} Baht
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </>
        </BottomSheetView>
      </BottomSheet>
      {/* Payment Method BottomSheet */}
      <BottomSheet
        ref={paymentSheetRef}
        index={showPaymentSheet ? 0 : -1}
        snapPoints={["50%"]}
        enablePanDownToClose={true}
        onClose={() => setShowPaymentSheet(false)}
        backgroundStyle={{ backgroundColor: "#222" }}
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ padding: 20 }}>
          <Text
            style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: 18,
              marginBottom: 16,
            }}
          >
            Payment Method
          </Text>
          {methods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: "#333",
              }}
              onPress={() => {
                setPayment(method);
                paymentSheetRef.current?.close();
              }}
            >
              {method.paymentType === "card" ? (
                <FontAwesome
                  name="credit-card"
                  size={24}
                  color={"#fff"}
                  style={{ marginRight: 8 }}
                />
              ) : (
                <MaterialIcons
                  name="account-balance"
                  size={24}
                  color={"#fff"}
                  style={{ marginRight: 8 }}
                />
              )}
              <Text style={{ color: "#fff", fontSize: 16 }}>
                {method.paymentType === "card"
                  ? `${
                      method.name || "Card"
                    } ending in **${method.cardNumber?.slice(-4)}`
                  : `${
                      method.bank || "Bank"
                    } ending in *${method.accountNumber?.slice(-3)}`}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={{ paddingVertical: 16 }}
            onPress={() => {
              router.push("/user/add-payment-method");
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                textDecorationLine: "underline",
              }}
            >
              Add New Payment Method
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
      {/* Address BottomSheet */}
      <BottomSheet
        ref={addressSheetRef}
        index={showAddressSheet ? 0 : -1}
        snapPoints={["50%"]}
        enablePanDownToClose={true}
        onClose={() => setShowAddressSheet(false)}
        backgroundStyle={{ backgroundColor: "#222" }}
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ padding: 20 }}>
          <Text
            style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: 18,
              marginBottom: 16,
            }}
          >
            Shipping Address
          </Text>
          {loadingAddresses ? (
            <Text style={{ color: "#fff", fontSize: 16 }}>
              <ActivityIndicator />
            </Text>
          ) : (
            addresses?.map((addr: any) => (
              <TouchableOpacity
                key={addr.id}
                style={{
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: "#333",
                }}
                onPress={() => {
                  setAddress(addr);
                  addressSheetRef.current?.close();
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16 }}>
                  {`${addr.name} ${addr.street} ${addr.street2} ${addr.subDistrict} ${addr.district} ${addr.province} ${addr.postalCode} ${addr.phone}`}
                </Text>
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity
            style={{ paddingVertical: 16 }}
            onPress={() => {
              router.push("/user/shipping-address");
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                textDecorationLine: "underline",
              }}
            >
              Add New Address
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingTop: 40,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginTop: 2,
  },
  offerInputSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 18,
  },
  offerInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  currency: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
    marginRight: 8,
  },
  offerInput: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
    minWidth: 120,
    textAlign: "left",
    padding: 0,
  },
  placeOfferLabel: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 2,
  },
  pricingOptionsLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 8,
  },
  pricingOptionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 18,
  },
  priceOptionBox: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    width: (width - 64) / 3,
  },
  priceOptionLabel: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 4,
  },
  priceOptionValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  productInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 18,
  },
  infoText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 2,
  },
  productImage: {
    width: 80,
    height: 50,
    resizeMode: "contain",
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  infoRowText: {
    color: "#fff",
    fontSize: 15,
    flex: 1,
  },
  editBtn: {
    marginLeft: 8,
  },
  editBtnText: {
    color: "#aaa",
    fontSize: 15,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: 24,
  },
  cancelBtn: {
    backgroundColor: "#444",
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  cancelBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  placeOfferBtn: {
    backgroundColor: "#222",
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 32,
    opacity: 1,
  },
  placeOfferBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OfferPlace;
