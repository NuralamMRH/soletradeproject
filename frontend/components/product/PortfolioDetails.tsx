import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Pressable,
  Platform,
  Animated,
  Modal,
  FlatList,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { baseUrl } from "@/api/MainApi";
import { useProducts } from "@/hooks/useProducts";
import Price from "@/utils/Price";
import { Share } from "react-native";
import SwiperFlatList from "react-native-swiper-flatlist";
import * as Linking from "expo-linking";
import { Image as ExpoImage } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZES } from "@/constants";
import Colors from "@/constants/Colors";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlists,
} from "@/hooks/react-query/useWishlistMutation";
import { LineChart } from "react-native-chart-kit";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import AdminHeader from "../AdminHeader";
import SellerAsk from "./SellerAsk";
import LottieView from "lottie-react-native";
import { useRemoveFromPortfolio } from "@/hooks/react-query/usePortfolioMutation";
import { ThemedText } from "../ThemedText";

const { width } = Dimensions.get("window");

type ChartRange = "1M" | "3M" | "6M" | "1YR" | "ALL";
type TabType = "Sales" | "Asks" | "Bids";
interface TableRow {
  size: string;
  price: number;
  date: string;
}

interface ProductCardProps {
  index?: number;
  brand: string;
  name: string;
  price: string;
  image: any;
  productId: string;
  selling: any;
  buying: any;
  images: any;
  attribute: any;
  variations: any;
  wishlist: any;
  transactions: any;
}

const PortfolioDetails = ({
  portfolio,
  product,
}: {
  portfolio: any;
  product: any;
}) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleSellerAsk, setModalVisibleSellerAsk] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scaleAnimSell = useRef(new Animated.Value(1)).current;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    portfolio.sizeId
  );
  const [selectedSellerAsk, setSelectedSellerAsk] = useState<any>(null);
  const [selectedBuyerOffer, setSelectedBuyerOffer] = useState<any>(null);
  const [highestOffer, setHighestOffer] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<
    "buyNow" | "placeOffer" | "sellNow" | "placeAsk"
  >("buyNow");

  const { mutate: removeFromPortfolio } = useRemoveFromPortfolio();
  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();
  const { data: wishlists, isLoading: wishlistsLoading } = useWishlists();

  const highestPrice = Math.max(
    ...product.bidding.map((bid: any) => bid.offeredPrice.toFixed(0))
  );

  const lowestPrice = Math.min(
    ...product.selling.map((ask: any) => ask.sellingPrice.toFixed(0))
  );

  function getSizeHighestPrice(size: any) {
    const filtered = product.bidding
      .filter((bid: any) => bid.sizeId.id === size)
      .map((bid: any) => bid.offeredPrice.toFixed(0));
    if (filtered.length === 0) return 0;
    return Math.max(...filtered);
  }

  function getSizeLowestPrice(size: string) {
    const filtered = product.selling
      .filter((ask: any) => ask.sizeId.id === size)
      .map((ask: any) => ask.sellingPrice.toFixed(0));
    if (filtered.length === 0) return 0;
    return Math.min(...filtered);
  }

  function getHighestOfferItem(size: string): any | null {
    if (!product.bidding || !Array.isArray(product.bidding)) return null;
    const highestPrice = getSizeHighestPrice(size);
    if (highestPrice === null) return null;
    return product.bidding.find(
      (bid: any) =>
        bid.sizeId.id === size && Number(bid.offeredPrice) === highestPrice
    );
  }

  useEffect(() => {
    setHighestOffer(getHighestOfferItem(selectedSize || ""));
    console.log("highestOffer", highestOffer);
  }, [selectedSize]);

  const { products: relatedProducts, loading: relatedProductsLoading } =
    useProducts({
      filter: {
        product_type: "deal",
        brandId: product.brandId,
      },
    });

  const insets = useSafeAreaInsets();

  // Handle bottom sheet closing
  const handleCloseBottomSheet = () => {
    setTimeout(() => {
      bottomSheetRef.current?.close();
    }, 0);
  };

  const snapPoints = useMemo(() => ["60%"], []);

  const handleButtonClicked = (type: "placeAsk" | "sellNow") => {
    setActiveTab(type);
    setSelectedSellerAsk(null);
    setSelectedBuyerOffer(null);
    bottomSheetRef.current?.expand();
    if (type === "placeAsk") {
      // Animate button
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }

    if (type === "sellNow") {
      Animated.sequence([
        Animated.timing(scaleAnimSell, {
          toValue: 1.1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnimSell, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleShare = async () => {
    const productUrl = `https://yourapp.com/product/${product._id}`;
    const deepLink = Linking.createURL(`/product/${product._id}`);
    const message = `Check out this product: ${product.name}\n${productUrl}`;
    try {
      await Share.share({
        title: product.name,
        message: message + (Platform.OS === "ios" ? "" : `\n${deepLink}`),
        url: Platform.OS === "ios" ? deepLink : productUrl,
      });
    } catch (error) {
      // handle error
    }
  };

  const handleGoToPlaceAsk = (ask: any) => {
    bottomSheetRef.current?.close();
    setTimeout(() => {
      bottomSheetRef.current?.close();
    }, 100);

    router.push({
      pathname: "/deal/seller/product-condition",
      params: {
        offerType: activeTab,
        productId: product._id,
        productName: product.name,
        brand: product.brand?.name,
        sizeId: selectedSize,
        size: product.variations.find(
          (variation: any) => variation._id === selectedSize
        )?.optionName,
        variations: JSON.stringify(product.variations) || [],
        retailPrice: product.retailPrice,
        image: `${baseUrl}${product.images[0].file_full_url}`,
        colorway: product.colorway,
        productType: product.product_type,
        brandId: product.brandId || "",
        categoryId: product.categoryId || "",
        subCategoryId: product.subCategoryId || "",
        attribute: JSON.stringify(product.attribute) || null,
        bidding: JSON.stringify(product.bidding) || null,
        selling: JSON.stringify(product.selling) || null,
        transactions: JSON.stringify(product.transactions) || null,
        highestPrice: getSizeHighestPrice(selectedSize || ""),
        lowestPrice: getSizeLowestPrice(selectedSize || ""),
        selectedBuyerOffer: JSON.stringify(selectedBuyerOffer || ask) || null,
        // Add more params as needed
      },
    });
  };

  const handleRemoveFromPortfolio = () => {
    removeFromPortfolio(portfolio.id);
    router.back();
  };

  const lostProfit =
    (getSizeHighestPrice(portfolio.sizeId) || product.retailPrice) -
    portfolio.purchasePrice;

  const lossProfitPercentage =
    ((getSizeHighestPrice(portfolio.sizeId) || product.retailPrice) /
      portfolio.purchasePrice) *
    100;
  return (
    <>
      <AdminHeader
        onBack={() => router.back()}
        backgroundColor={"transparent"}
        borderHide
        right={
          <View
            style={{
              flexDirection: "row",
              alignItems: "end",
              justifyContent: "end",
              gap: 10,
            }}
          >
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() =>
                router.push({
                  pathname: `/user/portfolio/item/edit`,
                  params: { id: portfolio.id },
                })
              }
            >
              <Ionicons name="pencil" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRemoveFromPortfolio}
              style={styles.headerButton}
            >
              <Ionicons name={"trash-outline"} size={20} color="#000" />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.buttonRow}>
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              flex: 1,
              paddingRight: 2,
              height: "100%",
              width: "100%",
            }}
          >
            <TouchableOpacity
              style={styles.buyButtonExact}
              onPress={() => handleButtonClicked("placeAsk")}
              activeOpacity={0.8}
            >
              <View style={styles.buttonLeftExact}>
                <Text style={styles.buyLabelExact}>PLACE ASK</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            style={{
              transform: [{ scale: scaleAnimSell }],
              flex: 1,
              paddingLeft: 2,
              height: "100%",
              width: "100%",
            }}
          >
            <TouchableOpacity
              style={styles.sellButtonExact}
              onPress={() => handleButtonClicked("sellNow")}
              activeOpacity={0.8}
            >
              <View style={styles.buttonLeftExact}>
                <Text style={styles.sellLabelExact}>SELL NOW</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
        <View style={styles.imageContainer}>
          <SwiperFlatList
            showPagination
            paginationActiveColor={COLORS.brandColor}
            paginationDefaultColor={COLORS.gray}
            paginationStyleItem={styles.paginationDot}
            data={product.images}
            index={currentImageIndex}
            onChangeIndex={({ index }) => setCurrentImageIndex(index)}
            renderItem={({ item, index }: { item: any; index: number }) => (
              <Pressable
                onPress={() => {
                  setZoomIndex(index);
                  setModalVisible(true);
                }}
                style={{
                  width: SIZES.width - 32,
                  height: SIZES.width - 202,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ExpoImage
                  source={{ uri: `${baseUrl}${item.file_full_url}` }}
                  style={styles.productImage}
                  contentFit="contain"
                />
              </Pressable>
            )}
          />
        </View>
        <Modal
          visible={modalVisible}
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.95)",
              paddingTop: insets.top + 100,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SwiperFlatList
              data={product.images}
              index={zoomIndex}
              showPagination
              renderItem={({ item }: { item: any }) => (
                <ExpoImage
                  source={{ uri: `${baseUrl}${item.file_full_url}` }}
                  style={{
                    width: width,
                    height: width,
                    flex: 1,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  contentFit="contain"
                />
              )}
            />
            <TouchableOpacity
              style={{ position: "absolute", top: 40, right: 20, zIndex: 10 }}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>

        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Link href={`/product/${product._id}`}>
            <ThemedText
              type="default"
              style={{ fontSize: 16, fontWeight: "bold" }}
            >
              View Product
            </ThemedText>
          </Link>
        </View>

        <View style={styles.productDetailsSection}>
          <Text style={styles.productNameBig}>{product.name}</Text>
          <Text style={styles.productBrandSmall}>
            {product.name} from {product.brand?.name}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.detailsRow}
          >
            <View
              style={[
                styles.detailItem,
                { flex: 1, borderRightWidth: 1, paddingHorizontal: 10 },
              ]}
            >
              <Text style={styles.detailLabel}>Condition</Text>
              <Text style={styles.detailValue}>{portfolio.itemCondition}</Text>
            </View>
            <View
              style={[
                styles.detailItem,
                { flex: 1, borderRightWidth: 1, paddingHorizontal: 10 },
              ]}
            >
              <Text style={styles.detailLabel}>Size</Text>
              <Text
                style={styles.detailValue}
              >{`${portfolio.size.optionName} ${portfolio.size.attributeId.name}`}</Text>
            </View>
            <View
              style={[styles.detailItem, { flex: 1, paddingHorizontal: 10 }]}
            >
              <Text style={styles.detailLabel}>Transaction Date</Text>
              <Text style={styles.detailValue}>
                {portfolio.purchaseAt
                  ? new Date(portfolio.purchaseAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </Text>
            </View>
          </ScrollView>
        </View>

        <View style={{ padding: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ThemedText type="default">Purchase Price</ThemedText>
            <Text>
              <Price price={portfolio.purchasePrice} currency="THB" />
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ThemedText type="default">Market Price</ThemedText>
            <Text>
              <Price
                price={
                  getSizeHighestPrice(portfolio.sizeId) || product.retailPrice
                }
                currency="THB"
              />
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ThemedText type="subtitle" style={{ fontSize: 16 }}>
              Profit/Loss
            </ThemedText>
            <ThemedText type="subtitle" style={{ fontSize: 16 }}>
              {lossProfitPercentage > 0 ? "+" : ""}{" "}
              <Price price={lostProfit} currency="THB" />{" "}
              {`${
                lossProfitPercentage > 0 ? "+" : ""
              } ${lossProfitPercentage.toFixed(2)}%`}
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onClose={handleCloseBottomSheet}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: "#000", borderRadius: 0 }}
        handleIndicatorStyle={{ backgroundColor: "white" }}
      >
        <BottomSheetView
          style={{
            flex: 1,
            padding: 20,
            maxHeight: 600,
            overflowY: "scroll",
          }}
        >
          {/* Size Selection Grid */}

          <>
            {/* Tab Bar */}
            <View
              style={{
                flexDirection: "row",
                borderBottomWidth: 2,
                borderBottomColor: "#888",
                marginBottom: 16,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: activeTab === "sellNow" ? 3 : 0,
                  borderBottomColor:
                    activeTab === "sellNow" ? "#a00" : "transparent",
                  marginBottom: -2,
                }}
                onPress={() => setActiveTab("sellNow")}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 18,
                  }}
                >
                  Sell Now
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: activeTab === "placeAsk" ? 3 : 0,
                  borderBottomColor:
                    activeTab === "placeAsk" ? "#a00" : "transparent",
                  marginBottom: -2,
                }}
                onPress={() => setActiveTab("placeAsk")}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 18,
                  }}
                >
                  Place Ask
                </Text>
              </TouchableOpacity>
            </View>
            {/* Tab Content */}
            {activeTab === "sellNow" ? (
              <View style={{ marginTop: 24 }}>
                {getHighestOfferItem(selectedSize || "")?.offeredPrice === 0 ||
                getHighestOfferItem(selectedSize || "")?.offeredPrice ===
                  undefined ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <LottieView
                      source={require("@/assets/animation/shoes-animation.json")}
                      autoPlay
                      loop
                      style={{
                        width: SIZES.width * 0.6,
                        height: SIZES.width * 0.6,
                        marginBottom: 24,
                      }}
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 22,
                          fontWeight: "bold",
                        }}
                      >
                        <Price
                          price={
                            getHighestOfferItem(selectedSize || "")
                              ?.offeredPrice || 0
                          }
                          currency="THB"
                        />
                      </Text>
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 15,
                          marginTop: 2,
                        }}
                      >
                        Sell Now / Highest Offer
                      </Text>
                      <Text
                        style={{
                          color: "#888",
                          fontSize: 13,
                          marginTop: 2,
                        }}
                      >
                        Sell to the highest offer price instantly.
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{
                        borderWidth: 2,
                        borderColor:
                          getHighestOfferItem(selectedSize || "")
                            ?.offeredPrice === 0 ||
                          getHighestOfferItem(selectedSize || "")
                            ?.offeredPrice === undefined
                            ? "#888"
                            : "#fff",
                        borderRadius: 4,
                        paddingVertical: 6,
                        paddingHorizontal: 18,
                      }}
                      onPress={() =>
                        handleGoToPlaceAsk(
                          getHighestOfferItem(selectedSize || "")
                        )
                      }
                      disabled={
                        getHighestOfferItem(selectedSize || "")
                          ?.offeredPrice === 0 ||
                        getHighestOfferItem(selectedSize || "")
                          ?.offeredPrice === undefined
                      }
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        Select
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <View style={{ marginTop: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 18 }}>
                    Highest Bid
                  </Text>
                  <Text style={{ color: "#fff", fontSize: 18 }}>
                    <Price
                      price={
                        getHighestOfferItem(selectedSize || "")?.offeredPrice ||
                        product.retailPrice
                      }
                      currency="THB"
                    />
                  </Text>
                  <TouchableOpacity
                    style={{
                      borderWidth: 2,
                      borderColor: "#fff",
                      borderRadius: 4,
                      paddingVertical: 6,
                      paddingHorizontal: 18,
                    }}
                    onPress={() => handleGoToPlaceAsk(null)}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                      Offer
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 18 }}>Last Sale</Text>
                  <Text style={{ color: "#fff", fontSize: 18 }}>
                    14,400 Baht
                  </Text>
                </View>
              </View>
            )}
            {/* Back to size selection */}

            <Text
              style={{
                color: "#fff",
                textDecorationLine: "underline",
                textAlign: "center",
                marginTop: 24,
              }}
            >
              Empty
            </Text>
          </>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  imageContainer: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    overflow: "hidden",
  },
  imageDots: {
    flexDirection: "row",
    position: "absolute",
    bottom: 20,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#007A3D",
  },
  detailsContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    color: "#000",
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 24,
  },
  sizeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  sizeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    marginBottom: 10,
  },
  selectedSizeButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  sizeText: {
    fontSize: 16,
    color: "#333",
  },
  selectedSizeText: {
    color: "#fff",
  },
  colorContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedColorButton: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  addToCartButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  addToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  productSectionContainer: {
    // backgroundColor: "#fff",
    paddingVertical: 15,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },

  viewMoreText: {
    fontSize: 14,
    color: "#666",
  },
  productScrollContainer: {
    paddingHorizontal: 15,
  },
  productCard: {
    width: 170,
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  productIndex: {
    position: "absolute",
    top: 10,
    left: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    zIndex: 1,
  },

  productInfo: {
    padding: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flex: 1,
    paddingHorizontal: 16,
    height: 60,
    gap: 30,
  },
  buyButtonExact: {
    flexDirection: "row",
    borderRadius: 8,
    alignItems: "center",
    height: "100%",
    width: "100%",
    paddingHorizontal: 10,
    borderWidth: 5,
    borderColor: "#000",
    backgroundImage: "#fff0",
  },
  sellButtonExact: {
    flexDirection: "row",
    backgroundColor: Colors.black,
    borderRadius: 8,
    alignItems: "center",
    height: "100%",
    width: "100%",
    paddingHorizontal: 10,
    borderWidth: 5,
    borderColor: "#000",
  },
  buyLabelExact: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  buyPriceExact: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  buySubExact: {
    color: "#fff",
    fontSize: 12,
  },
  sellLabelExact: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sellPriceExact: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  sellSubExact: {
    color: "#fff",
    fontSize: 12,
  },
  buttonLeftExact: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 20,
  },
  buttonRightExact: {
    flex: 3,
    paddingHorizontal: 5,
    paddingVertical: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  productDetailsSection: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingBottom: 10,
    borderColor: "#333",
  },
  productNameBig: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  productBrandSmall: {
    fontSize: 16,
    color: "#888",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  detailItem: {
    flexDirection: "column",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValueGreen: {
    fontSize: 16,
    color: "#007A3D",
    fontWeight: "bold",
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
  },
  detailSubValue: {
    fontSize: 12,
    color: "#999",
  },
  chartAndListRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  salesListContainer: {
    flex: 1,
    padding: 10,
  },
  salesListItem: {
    marginBottom: 12,
    alignItems: "flex-end",
  },
  salesListPriceOnly: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  salesListDateOnly: {
    fontSize: 12,
    color: "#999",
  },
  salesReportCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  salesTabBar: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#ccc",
    borderRadius: 10,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 3,
    marginHorizontal: 50,
  },
  salesTab: {
    padding: 10,
    borderRadius: 5,
    width: SIZES.width / 5 - 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeSalesTab: {
    backgroundColor: "#fff",
  },
  salesTabText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  activeSalesTabText: {
    color: "#000",
  },
  salesTableHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  salesTableHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  salesTableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  salesTableCell: {
    fontSize: 14,
    color: "#666",
  },
  chartCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  rangeTabs: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#ccc",
    borderRadius: 10,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 3,
  },
  rangeTab: {
    padding: 10,
    borderRadius: 5,
    width: SIZES.width / 5 - 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeRangeTab: {
    backgroundColor: "#fff",
  },
  rangeTabText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  activeRangeTabText: {
    color: "#000",
  },
  tabBar: {
    flexDirection: "row",
    marginBottom: 10,
  },
  tabButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  activeTabButton: {
    backgroundColor: "#007AFF",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  activeTabButtonText: {
    color: "#fff",
  },
  tableHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  tableHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  tableCell: {
    fontSize: 14,
    color: "#666",
  },
  productBrand: {
    fontSize: 14,
    color: "#888",
    fontWeight: "bold",
    marginBottom: 2,
  },
  lowestAsk: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
});

export default PortfolioDetails;
