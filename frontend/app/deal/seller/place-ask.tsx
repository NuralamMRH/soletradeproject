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
import { COLORS } from "@/constants";
import AdminHeader from "@/components/AdminHeader";
import { useCreateSellingOffer } from "@/hooks/react-query/useSellerOfferMutation";
import { useListCreation } from "@/context/ListCreationContext";

const { width } = Dimensions.get("window");

const expirationOptions = ["3 Days", "7 Days", "14 Days", "30 Days"];

const PlaceAsk = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
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
  const attributeName = variations.find(
    (variation: any) => variation.optionName === selectedSize || size
  )?.attributeId.name;

  const attribute = params.attribute || null;
  const { images } = useListCreation();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const condition = "New";
  const box = "Original (Good)";
  const [offer, setOffer] = useState("");
  const [expiration, setExpiration] = useState("30 Days");
  const [payment, setPayment] = useState("Visa ending in **34");
  const [payoutInfo, setPayoutInfo] = useState<boolean>(false);
  const [showExpirationSheet, setShowExpirationSheet] = useState(false);
  const [showSizeSheet, setShowSizeSheet] = useState(false);
  const expirationSheetRef = useRef<BottomSheet>(null);
  const sizeSheetRef = useRef<BottomSheet>(null);
  // Payment methods
  const { data: methods = [], isLoading: loadingMethods } =
    useGetMyPaymentMethods();
  // Addresses
  const createSellingOffer = useCreateSellingOffer();
  const formattedImages = formatImagesForFormData(images);
  function formatImagesForFormData(
    images: string[]
  ): { uri: string; name: string; type: string }[] {
    return images.filter(Boolean).map((uri) => {
      // Extract file extension
      const uriParts = uri.split(".");
      const ext = uriParts[uriParts.length - 1];
      // Extract file name
      const nameParts = uri.split("/");
      const name = nameParts[nameParts.length - 1] || `image.${ext}`;
      // Guess type
      const type = `image/${ext === "jpg" ? "jpeg" : ext}`;
      return { uri, name, type };
    });
  }
  const handleSubmitAsk = async () => {
    try {
      console.log("sizeId", params.sizeId);

      setLoading(true);
      const payload = {
        type: "Ask",
        productId: params.productId as string,
        itemCondition: condition,
        packaging: box,
        sizeName: `${selectedSize || size} ${attributeName}`,
        sizeId:
          variations.find(
            (variation: any) => variation.optionName === selectedSize
          )?._id || (params.sizeId as string),
        sellingPrice: Number(offer),
        earnings: Number(offer * 0.91),
        sellingCommission: Number(offer * 0.04),
        sellingFee: Number(offer * 0.03),
        validUntil: new Date(Date.now() + Number(expiration) * 1000),
        paymentMethodId: payment._id,
        images: formattedImages,
      };
      const data = await createSellingOffer.mutateAsync(payload);

      router.replace({
        pathname: "/deal/seller/ask-confirmation",
        params: {
          askId: data._id,
          data: JSON.stringify(data),
        } as any,
      });
    } catch (err: any) {
      console.log("err", err);
      alert(err?.message || "Ask failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <AdminHeader
        onBack={() => router.back()}
        backgroundColor="black"
        borderHide
        center={
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.title}>{productName}</Text>
            <Text style={styles.subtitle}>{productSubtitle}</Text>
          </View>
        }
      />

      {/* <View style={{ paddingTop: insets.top - 40 }} /> */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Offer Input */}
        <View style={styles.offerInputSection}>
          <View style={styles.offerInputRow}>
            <TextInput
              style={[styles.offerInput]}
              value={
                offer !== undefined && offer !== null && offer !== ""
                  ? Number(offer).toLocaleString("th-TH")
                  : ""
              }
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, "");
                setOffer(numeric ? Number(numeric) : "");
              }}
              placeholder="THB"
              placeholderTextColor="#888"
              keyboardType="numeric"
            />
          </View>
          <Text
            style={[
              styles.placeOfferLabel,
              { color: offer ? COLORS.brandGreen : "#888", fontWeight: "bold" },
            ]}
          >
            {offer ? `Sell now at ${offer} Baht` : "Place your ask"}
          </Text>
        </View>
        {/* Pricing Options */}
        <View style={styles.pricingOptionsRow}>
          <TouchableOpacity
            onPress={() => setOffer(14595)}
            style={styles.priceOptionBox}
          >
            <Text style={styles.priceOptionLabel}>Last Sale</Text>
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
            <Text style={styles.priceOptionLabel}>Sell Now</Text>
            <Text style={styles.priceOptionValue}>21,800 Baht</Text>
          </TouchableOpacity>
        </View>
        {/* Product Info Row */}
        <View style={styles.productInfoRow}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={() => setShowSizeSheet(true)}>
              <Text style={styles.infoText}>
                Size: {`${selectedSize || size} ${attributeName}`}
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
        <View style={{ marginHorizontal: 16 }}>
          <View>
            <Text style={styles.infoRowText}>Payout Method</Text>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ScrollView horizontal>
              {methods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    borderBottomColor: "#333",
                    position: "relative",
                    marginRight: 16,
                  }}
                  onPress={() => {
                    setPayment(method);
                  }}
                >
                  <FontAwesome
                    name="credit-card-alt"
                    size={100}
                    color={"#333"}
                    style={{ marginRight: 8 }}
                  />

                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 10,
                      position: "absolute",
                      bottom: 50,
                      left: 10,
                    }}
                  >
                    {method.paymentType === "card"
                      ? `${
                          method.name || "Card"
                        } ending in **${method.cardNumber?.slice(-4)}`
                      : `${
                          method.bank || "Bank"
                        }  *${method.accountNumber?.slice(-3)}`}
                  </Text>
                  <Ionicons
                    name={
                      method.id === payment.id
                        ? "checkmark-circle-outline"
                        : "radio-button-off-outline"
                    }
                    size={20}
                    color={
                      method.id === payment.id ? COLORS.brandColor : "#fff"
                    }
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 50,
                    }}
                  />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={{
                  paddingVertical: 16,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  router.push("/user/add-payment-method");
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                  }}
                >
                  <Ionicons name="add-outline" size={70} color="#fff" />
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />
        <View style={{ position: "relative" }}>
          {payoutInfo && (
            <TouchableOpacity
              style={{ position: "absolute", right: 10, top: 20, zIndex: 1000 }}
              onPress={() => setPayoutInfo(!payoutInfo)}
            >
              <Ionicons
                name={!payoutInfo ? "add-outline" : "remove-circle-outline"}
                size={24}
                color="#999"
              />
            </TouchableOpacity>
          )}

          {!payoutInfo && (
            <View
              style={[
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginHorizontal: 15,
                  borderTopWidth: 1,
                  borderColor: "#666",
                  paddingTop: 40,
                },
              ]}
            >
              <Text style={styles.infoRowText}>Earnings</Text>

              <Text
                style={[
                  styles.placeOfferBtnText,
                  { fontSize: 15, marginEnd: 20 },
                ]}
              >
                {offer
                  ? Number(offer * 0.91).toLocaleString("th-TH") + " Baht"
                  : "Place your ask"}
              </Text>
              <TouchableOpacity
                style={{
                  marginLeft: "auto",
                  marginTop: -4,
                }}
                onPress={() => setPayoutInfo(!payoutInfo)}
              >
                <Ionicons
                  name={!payoutInfo ? "add-outline" : "remove-outline"}
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          )}
          {payoutInfo && (
            <>
              <View
                style={[
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginHorizontal: 16,
                    borderTopWidth: 1,
                    borderColor: "#666",
                    paddingTop: 40,
                    marginTop: 10,
                  },
                ]}
              >
                <Text style={{ color: "#e9e9e9", fontSize: 15 }}>
                  Selling Price
                </Text>

                <Text
                  style={[
                    styles.placeOfferBtnText,
                    { fontSize: 15, color: "#e9e9e9" },
                  ]}
                >
                  {offer
                    ? Number(offer).toLocaleString("th-TH") + " Baht"
                    : "Place your ask"}
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

                <Text
                  style={[
                    styles.placeOfferBtnText,
                    { fontSize: 14, color: "#888" },
                  ]}
                >
                  {offer
                    ? Number(offer * 0.04).toLocaleString("th-TH") + " Baht"
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

                <Text
                  style={[
                    styles.placeOfferBtnText,
                    { fontSize: 14, color: "#888" },
                  ]}
                >
                  {offer
                    ? Number(offer * 0.03).toLocaleString("th-TH") + " Baht"
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
                <Text style={styles.infoRowText}>Earnings</Text>

                <Text style={[styles.placeOfferBtnText, { fontSize: 15 }]}>
                  {offer
                    ? Number(offer * 0.91).toLocaleString("th-TH") + " Baht"
                    : "Place your ask"}
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
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
            { backgroundColor: offer ? COLORS.brandDarkColor : "#222" },
          ]}
          disabled={!offer}
          onPress={handleSubmitAsk}
        >
          <Text style={styles.placeOfferBtnText}>Place Ask</Text>
        </TouchableOpacity>
      </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
    marginHorizontal: 10,
    marginBottom: 18,
  },
  priceOptionBox: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    width: (width - 34) / 3,
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
    textAlign: "center",
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

export default PlaceAsk;
