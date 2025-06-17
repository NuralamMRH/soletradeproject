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
import Toast from "react-native-toast-message";
import { COLORS } from "@/constants";
import Price from "@/utils/Price";

const { width } = Dimensions.get("window");

const expirationOptions = ["3 Days", "7 Days", "14 Days", "30 Days"];

// Address type for selectedAddress
interface Address {
  id: string;
  name: string;
  street: string;
  street2?: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  isDefault?: boolean;
}

const OfferPlace = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mock data (replace with real params/data as needed)
  const productName = params.productName || "Air Jordan";
  const productSubtitle = `${params.productName} ${params.brand} ${params.colorway}`;

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

  const size = params.size || "";
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeId, setSizeId] = useState<string | null>(null);

  useEffect(() => {
    setSizeId(
      selectedSize
        ? variations.find(
            (variation: any) => variation.optionName === selectedSize || size
          )?.attributeId._id
        : params.sizeId
    );
  }, [selectedSize, variations, size, params.sizeId]);

  const { data: methods = [], isLoading: loadingMethods } =
    useGetMyPaymentMethods();

  // For attributeName, check if params.attribute is an object
  const attributeName =
    typeof params.attribute === "object" &&
    params.attribute !== null &&
    "name" in params.attribute
      ? (params.attribute as any).name
      : variations.find(
          (variation: any) => variation.optionName === selectedSize || size
        )?.attributeId.name;

  // For selectedSellerAsk, always parse if string
  const selectedSellerAskObj = (() => {
    if (!params.selectedSellerAsk) return undefined;
    if (typeof params.selectedSellerAsk === "string") {
      try {
        return JSON.parse(params.selectedSellerAsk);
      } catch {
        return undefined;
      }
    }
    if (Array.isArray(params.selectedSellerAsk)) {
      try {
        return JSON.parse(params.selectedSellerAsk[0]);
      } catch {
        return undefined;
      }
    }
    return params.selectedSellerAsk;
  })();

  const [buyNowItem, setBuyNowItem] = useState<any>(
    selectedSellerAskObj || null
  );

  console.log("buyNowItem", buyNowItem);

  const condition = selectedSellerAskObj?.itemCondition || "New";
  const box = selectedSellerAskObj?.packaging || "Original (Good)";

  const bidding = params?.bidding
    ? JSON.parse(params?.bidding as any)
    : undefined;

  const selling = params?.selling
    ? JSON.parse(params?.selling as any)
    : undefined;

  // Robust size-based price functions
  function getSizeHighestPrice(sizeId: string): number | null {
    if (!bidding || !Array.isArray(bidding)) return null;
    const filtered = bidding.filter((bid: any) => bid.sizeId.id === sizeId);
    if (filtered.length === 0) return null;
    return Math.max(...filtered.map((bid: any) => Number(bid.offeredPrice)));
  }

  function getSizeLowestPrice(sizeId: string): number | null {
    if (!selling || !Array.isArray(selling)) return null;
    const filtered = selling.filter((ask: any) => ask.sizeId.id === sizeId);
    if (filtered.length === 0) return null;
    return Math.min(...filtered.map((ask: any) => Number(ask.sellingPrice)));
  }

  function getLowestAskItem(sizeId: string): any | null {
    if (!selling || !Array.isArray(selling)) return null;
    const lowestPrice = getSizeLowestPrice(sizeId);
    if (lowestPrice === null) return null;
    return selling.find(
      (ask: any) =>
        ask.sizeId.id === sizeId && Number(ask.sellingPrice) === lowestPrice
    );
  }

  function getAverageBidPrice(sizeId: string): number | null {
    if (!bidding || !Array.isArray(bidding)) return null;
    const filtered = bidding.filter((bid: any) => bid.sizeId.id === sizeId);
    if (filtered.length === 0) return null;
    const sum = filtered.reduce(
      (acc: number, bid: any) => acc + Number(bid.offeredPrice),
      0
    );
    return Math.round(sum / filtered.length);
  }

  const [offer, setOffer] = useState(selectedSellerAskObj?.sellingPrice || "");
  const [expiration, setExpiration] = useState("30 Days");

  const [payment, setPayment] = useState(
    methods.find(
      (method: any) => method.section === "buying" && method.isDefault
    ) || null
  );

  const [showExpirationSheet, setShowExpirationSheet] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showSizeSheet, setShowSizeSheet] = useState(false);
  const expirationSheetRef = useRef<BottomSheet>(null);
  const paymentSheetRef = useRef<BottomSheet>(null);
  const addressSheetRef = useRef<BottomSheet>(null);
  const sizeSheetRef = useRef<BottomSheet>(null);
  // Payment methods

  // Addresses
  const { getMyShippingAddress } = useShippingAddress();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
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
    if (!payment) {
      Toast.show({
        text1: "Please select a payment method",
        type: "error",
      });
      return;
    }

    if (!selectedAddress) {
      Toast.show({
        text1: "Please select a shipping address",
        type: "error",
      });
      return;
    }

    if (!offer) {
      Toast.show({
        text1: "Please enter an offer price",
        type: "error",
      });
      return;
    }
    if (!expiration) {
      Toast.show({
        text1: "Please enter an expiration",
        type: "error",
      });
      return;
    }

    router.push({
      pathname: "/deal/checkout",
      params: {
        ...params,
        sizeName: selectedSize ? selectedSize : size,
        attributeName: attributeName,
        payment: JSON.stringify(payment),
        address: selectedAddress ? JSON.stringify(selectedAddress) : undefined,
        selectedSellerAsk: selectedSellerAskObj,
        buyNowItem: JSON.stringify(buyNowItem),
        newSizeId: sizeId,
        expiration: expiration,
        offeredPrice: offer,
        packaging: box,
        itemCondition: condition,
      },
    });
  };

  const insets = useSafeAreaInsets();

  // For image uri, ensure it's a string
  const imageUri = Array.isArray(params.image) ? params.image[0] : params.image;

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
            <TextInput
              style={[styles.offerInput, { textAlign: "right" }]}
              value={offer !== "" ? Number(offer).toLocaleString("th-TH") : ""}
              onChangeText={(text) => {
                setBuyNowItem("");
                const numeric = text.replace(/[^0-9]/g, "");
                setOffer(numeric ? Number(numeric) : "");
              }}
              placeholder="THB"
              placeholderTextColor="#888"
              keyboardType="numeric"
              // editable={buyNowItem?.id ? false : true}
            />
          </View>
          <Text
            style={[
              styles.placeOfferLabel,
              { color: buyNowItem?.id ? COLORS.brandGreen : "#fff" },
            ]}
          >
            {buyNowItem?.id ? "Buy at this price" : "Place your offer"}
          </Text>
        </View>
        {/* Pricing Options */}

        <>
          <Text style={styles.pricingOptionsLabel}>Pricing Options</Text>
          <View style={styles.pricingOptionsRow}>
            <TouchableOpacity
              onPress={() => {
                setBuyNowItem("");
                setOffer(getSizeHighestPrice(sizeId) || 0);
              }}
              style={styles.priceOptionBox}
            >
              <Text style={styles.priceOptionLabel}>Highest Offer</Text>
              <Text style={styles.priceOptionValue}>
                <Price
                  price={getSizeHighestPrice(sizeId) || 0}
                  currency="THB"
                />
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setBuyNowItem("");
                setOffer(getAverageBidPrice(sizeId) || 0);
              }}
              style={styles.priceOptionBox}
            >
              <Text style={styles.priceOptionLabel}>Suggested</Text>
              <Text style={styles.priceOptionValue}>
                <Price price={getAverageBidPrice(sizeId) || 0} currency="THB" />
              </Text>
            </TouchableOpacity>
            {sizeId && getLowestAskItem(sizeId) && (
              <TouchableOpacity
                onPress={() => {
                  setBuyNowItem(getLowestAskItem(sizeId));
                  setOffer(getLowestAskItem(sizeId)?.sellingPrice || 0);
                }}
                style={styles.priceOptionBox}
              >
                <Text style={styles.priceOptionLabel}>Buy Now</Text>
                <Text style={styles.priceOptionValue}>
                  <Price
                    price={getLowestAskItem(sizeId)?.sellingPrice || 0}
                    currency="THB"
                  />
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>

        {/* Product Info Row */}
        <View style={styles.productInfoRow}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={() => setShowSizeSheet(true)}>
              <Text style={styles.infoText}>
                Size: {selectedSize || size} {attributeName}
                <Ionicons name="pencil" size={14} color="#fff" />
              </Text>
            </TouchableOpacity>

            <Text style={styles.infoText}>Condition: {condition}</Text>
            <Text style={styles.infoText}>Box: {box}</Text>
          </View>
          <Image
            source={
              typeof imageUri === "string" ? { uri: imageUri } : undefined
            }
            style={styles.productImage}
          />
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
            {payment?.paymentType === "card"
              ? `${
                  payment?.name || "Card"
                } ending in **${payment?.cardNumber?.slice(-4)}`
              : `${
                  payment?.bank || "Bank"
                } ending in *${payment?.accountNumber?.slice(-3)}`}
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
            {selectedAddress
              ? `${selectedAddress.name} ${selectedAddress.street} ${
                  selectedAddress.street2 || ""
                } ${selectedAddress.subDistrict || ""} ${
                  selectedAddress.district || ""
                } ${selectedAddress.province || ""} ${
                  selectedAddress.postalCode || ""
                } ${selectedAddress.phone || ""}`
              : "No address selected"}
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
            style={[
              styles.placeOfferBtn,
              {
                backgroundColor: buyNowItem?.id
                  ? COLORS.brandGreen
                  : COLORS.brandRed,
              },
            ]}
            disabled={!offer || !buyNowItem?.id}
            onPress={handleGoCheckout}
          >
            <Text style={styles.placeOfferBtnText}>
              {buyNowItem?.id ? "Buy Now" : "Place Offer"}
            </Text>
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
                        selectedSize === variation.optionName ? "red" : "#888",
                      borderRadius: 8,
                      paddingVertical: 16,
                      alignItems: "center",
                      backgroundColor:
                        selectedSize === variation.optionName
                          ? "#222"
                          : "transparent",
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
                      {variation.optionName} {attributeName}
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
          {methods
            .filter((method: any) => method.section === "buying")
            .map((method) => (
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
                {method?.paymentType === "card" ? (
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
                  {method?.paymentType === "card"
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
                  setSelectedAddress(addr);
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
    borderRadius: 0,
    paddingVertical: 12,
    alignItems: "center",
    width: (width - 42) / 3,
  },
  priceOptionLabel: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 4,
  },
  priceOptionValue: {
    color: "#fff",
    fontSize: 14,
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
