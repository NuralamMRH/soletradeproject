import React, { useEffect, useState, useRef } from "react";
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
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { baseUrl } from "@/api/MainApi";
import { useProducts } from "@/hooks/useProducts";
import { StatusBar } from "expo-status-bar";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/Redux/slices/product";
import { Share } from "react-native";
import SwiperFlatList from "react-native-swiper-flatlist";
import * as Linking from "expo-linking";
import { Image as ExpoImage } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Price from "@/utils/Price";
import { COLORS, SIZES } from "@/constants";
import Colors from "@/constants/Colors";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlists,
} from "@/hooks/react-query/useWishlistMutation";
import { LineChart } from "react-native-chart-kit";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import AdminHeader from "../AdminHeader";
import SellerAsk from "./SellerAsk";

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

const Deal = ({ product }: { product: any }) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleSellerAsk, setModalVisibleSellerAsk] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scaleAnimSell = useRef(new Animated.Value(1)).current;
  const [bottomSheetType, setBottomSheetType] = useState<"buy" | "sell">("buy");
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSellerAsk, setSelectedSellerAsk] = useState<any>(null);
  const [selectedBuyerOffer, setSelectedBuyerOffer] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<
    "buyNow" | "placeOffer" | "sellNow" | "placeAsk"
  >("buyNow");

  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();
  const { data: wishlists, isLoading: wishlistsLoading } = useWishlists();

  const highestPrice = Math.max(
    ...product.bidding.map((bid: any) => bid.offeredPrice.toFixed(0))
  );

  const lowestPrice = Math.min(
    ...product.selling.map((ask: any) => ask.sellingPrice.toFixed(0))
  );

  function getSizeHighestPrice(size: string) {
    return Math.max(
      ...product.bidding
        .filter((bid: any) => bid.sizeId === size)
        .map((bid: any) => bid.offeredPrice.toFixed(0))
    );
  }

  function getSizeLowestPrice(size: string) {
    return Math.min(
      ...product.selling
        .filter((ask: any) => ask.sizeId === size)
        .map((ask: any) => ask.sellingPrice.toFixed(0))
    );
  }



  const { products: relatedProducts, loading: relatedProductsLoading } =
    useProducts({
      filter: {
        product_type: "deal",
        brandId: product.brandId,
      },
    });

  const { products: similarProducts, loading: similarProductsLoading } =
    useProducts({
      filter: {
        product_type: "essential",
        keyword: product.name.split(" ").slice(0, 1).join(" "), // get first 1 words
      },
    });

  const insets = useSafeAreaInsets();

  const handleAddToWishlist = (productId: string) => {
    console.log("productId", productId);
    addToWishlist({ productId, wishlistType: "wishlist" });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    // Find the wishlist entry for this product
    const wishlistEntry = wishlists?.find(
      (wishlist: any) => wishlist?.productId === productId
    );
    if (wishlistEntry) {
      removeFromWishlist(wishlistEntry._id);
    }
  };

  // Handle bottom sheet closing
  const handleCloseBottomSheet = () => {
    setTimeout(() => {
      bottomSheetRef.current?.close();
    }, 0);
  };

  const handleButtonClicked = (type: "buy" | "sell") => {
    setBottomSheetType(type);
    setSelectedSize(null);
    setActiveTab("buyNow");
    setSelectedSellerAsk(null);
    setSelectedBuyerOffer(null);
    bottomSheetRef.current?.expand();
    if (type === "buy") {
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

    if (type === "sell") {
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

  const handleGoToOfferPlace = () => {
    router.push({
      pathname: "/deal/offer-place",
      params: {
        offerType: activeTab,
        productId: product._id,
        productName: product.name,
        subtitle: product.description,
        brand: product.brand?.name,
        sizeId: selectedSize,
        selectedSellerAsk: JSON.stringify(selectedSellerAsk) || null,
        selectedBuyerOffer: JSON.stringify(selectedBuyerOffer) || null,
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
        attribute: product.attribute || null,
        bidding: JSON.stringify(product.bidding) || null,
        selling: JSON.stringify(product.selling) || null,
        transactions: JSON.stringify(product.transactions) || null,
        highestPrice: getSizeHighestPrice(selectedSize || ""),
        lowestPrice: getSizeLowestPrice(selectedSize || ""),
        // Add more params as needed
      },
    });
  };

  const handleGoToPlaceAsk = () => {
    console.log("selectedSize", selectedSize);
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
        attribute: product.attribute || null,
        bidding: product.bidding || null,
        selling: product.selling || null,
        transactions: product.transactions || null,
        // Add more params as needed
      },
    });
  };

  const ProductCard: React.FC<ProductCardProps> = ({
    index,
    brand,
    name,
    price,
    image,
    productId,
  }) => (
    <TouchableOpacity
      onPress={() => router.push(`/product/${productId}`)}
      style={styles.productCard}
    >
      {index && <Text style={styles.productIndex}>{index}</Text>}
      <Image
        source={image}
        style={{
          width: "100%",
          maxWidth: 170,
          height: 120,
          objectFit: "cover",
          overflow: "hidden",
          borderRadius: 10,
        }}
      />
      <View style={styles.productInfo}>
        <Text style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>
          {brand}
        </Text>
        <Text
          style={{ fontSize: 12, color: "#666", marginVertical: 4 }}
          numberOfLines={2}
        >
          {name}
        </Text>
        {price && (
          <View>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>
              {price}
            </Text>
            <Text style={styles.lowestAsk}>Lowest Ask</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() =>
          wishlists?.some((wishlist: any) => wishlist?.productId === productId)
            ? handleRemoveFromWishlist(productId)
            : handleAddToWishlist(productId)
        }
        style={styles.favoriteButton}
      >
        <Ionicons
          name={
            wishlists?.some(
              (wishlist: any) => wishlist?.productId === productId
            )
              ? "bookmark"
              : "bookmark-outline"
          }
          size={20}
          color="#000"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Hot items section with horizontal scroll
  const RelatedItemsSection = ({
    products,
    title,
  }: {
    products: any[];
    title: string;
  }) => {
    return (
      <View style={styles.productSectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productScrollContainer}
        >
          {products.slice(0, 5).map((product: any, index: number) => (
            <View key={product._id}>
              <ProductCard
                index={index + 1}
                brand={product.brand?.name || ""}
                name={product.name}
                price={product.retailPrice ? `${product.retailPrice} Baht` : ""}
                productId={product._id}
                image={
                  product.image_full_url
                    ? { uri: `${baseUrl}${product.image_full_url}` }
                    : require("@/assets/images/bg_8.png")
                }
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const mockChartData: { [key in ChartRange]: number[] } = {
    "1M": [20000, 18000, 19000, 21000, 20000, 19500, 19800],
    "3M": [
      22000, 21000, 20000, 19000, 20000, 19500, 19800, 21000, 20500, 20000,
      19800, 20200,
    ],
    "6M": [
      25000, 24000, 23000, 22000, 21000, 20000, 19500, 19800, 21000, 20500,
      20000, 19800, 20200, 21000, 21500, 22000,
    ],
    "1YR": [
      30000, 28000, 26000, 25000, 24000, 23000, 22000, 21000, 20000, 19500,
      19800, 21000,
    ],
    ALL: [
      35000, 30000, 28000, 26000, 25000, 24000, 23000, 22000, 21000, 20000,
      19500, 19800, 21000,
    ],
  };
  const mockTableData: { [key in TabType]: TableRow[] } = {
    Sales: [
      { size: "8.5 USw", price: 19000, date: "22 Apr 2024" },
      { size: "7.5 USw", price: 17500, date: "28 Apr 2024" },
      { size: "9.5 USw", price: 21000, date: "30 Apr 2024" },
      { size: "10.5 USw", price: 24400, date: "02 May 2024" },
      { size: "12 USw", price: 29000, date: "09 May 2024" },
    ],
    Asks: [
      { size: "8.5 USw", price: 20000, date: "20 Apr 2024" },
      { size: "7.5 USw", price: 18000, date: "25 Apr 2024" },
      { size: "9.5 USw", price: 22000, date: "29 Apr 2024" },
      { size: "10.5 USw", price: 25000, date: "01 May 2024" },
      { size: "12 USw", price: 30000, date: "08 May 2024" },
    ],
    Bids: [
      { size: "8.5 USw", price: 18500, date: "19 Apr 2024" },
      { size: "7.5 USw", price: 17000, date: "24 Apr 2024" },
      { size: "9.5 USw", price: 20000, date: "28 Apr 2024" },
      { size: "10.5 USw", price: 24000, date: "30 Apr 2024" },
      { size: "12 USw", price: 28000, date: "07 May 2024" },
    ],
  };

  const [selectedRange, setSelectedRange] = useState<ChartRange>("ALL");
  const [selectedTab, setSelectedTab] = useState<TabType>("Sales");

  const timeRanges = [
    { label: "1M", value: "1M" as ChartRange },
    { label: "3M", value: "3M" as ChartRange },
    { label: "6M", value: "6M" as ChartRange },
    { label: "1YR", value: "1YR" as ChartRange },
    { label: "ALL", value: "ALL" as ChartRange },
  ];
  const tabOptions: TabType[] = ["Sales", "Asks", "Bids"];

  // console.log("product", product);
  console.log("product.selling", product.selling);
  console.log("product.bidding", product.bidding);

  const [zoomImages, setZoomImages] = useState<any[]>([]);

  return (
    <>
      <AdminHeader
        onBack={() => router.back()}
        backgroundColor={"transparent"}
        borderHide
        right={
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                wishlists?.some(
                  (wishlist: any) => wishlist?.productId === product._id
                )
                  ? handleRemoveFromWishlist(product._id)
                  : handleAddToWishlist(product._id)
              }
              style={styles.headerButton}
            >
              <Ionicons
                name={
                  wishlists?.some(
                    (wishlist: any) => wishlist?.productId === product._id
                  )
                    ? "bookmark"
                    : "bookmark-outline"
                }
                size={20}
                color="#000"
              />
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
              onPress={() => handleButtonClicked("buy")}
              activeOpacity={0.8}
            >
              <View style={styles.buttonLeftExact}>
                <Text style={styles.buyLabelExact}>BUY</Text>
              </View>
              <View style={styles.buttonRightExact}>
                <Text style={styles.buyPriceExact}>8,400 Baht</Text>
                <Text style={styles.buySubExact}>Lowest Ask</Text>
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
              onPress={() => handleButtonClicked("sell")}
              activeOpacity={0.8}
            >
              <View style={styles.buttonLeftExact}>
                <Text style={styles.sellLabelExact}>SELL</Text>
              </View>
              <View style={styles.buttonRightExact}>
                <Text style={styles.sellPriceExact}>12,400 Baht</Text>
                <Text style={styles.sellSubExact}>Highest Offer</Text>
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
                  width: width,
                  height: width,
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
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Sale</Text>
              <Text style={styles.detailValueGreen}>18,900 Baht</Text>
              <Text style={styles.detailSubValue}>▲ 500 (+0.5%)</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total Sales</Text>
              <Text style={styles.detailValue}>1,593</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Retail Price</Text>
              <Text style={styles.detailValue}>5,400 Baht</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>SKU</Text>
              <Text style={styles.detailValue}>FZ8117-100</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Release Date</Text>
              <Text style={styles.detailValue}>23 Jan 2024</Text>
            </View>
          </ScrollView>
        </View>
        <View style={styles.chartCard}>
          <View style={styles.rangeTabs}>
            {timeRanges.map((range: { label: string; value: ChartRange }) => (
              <TouchableOpacity
                key={range.value}
                style={[
                  styles.rangeTab,
                  selectedRange === range.value && styles.activeRangeTab,
                ]}
                onPress={() => setSelectedRange(range.value)}
              >
                <Text
                  style={[
                    styles.rangeTabText,
                    selectedRange === range.value && styles.activeRangeTabText,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.chartAndListRow}>
            <View style={{ flex: 3 }}>
              <LineChart
                data={{
                  labels: ["", "", "", "", "", ""],
                  datasets: [{ data: mockChartData[selectedRange] }],
                }}
                width={width * 0.8}
                height={180}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: COLORS.brandGray,
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(123, 36, 28, ${opacity})`,
                  labelColor: () => "rgba(0,0,0,0)",
                  propsForBackgroundLines: {
                    stroke: "transparent",
                  },
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "0",
                  },
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                  marginLeft: -60,
                }}
              />
            </View>
            <View
              style={{
                flex: 2,
                height: 180,
                justifyContent: "space-between",
                alignItems: "flex-end",
                paddingLeft: 0,
              }}
            >
              {mockTableData.Sales.slice(
                0,
                mockChartData[selectedRange].length
              ).map((row, idx) => (
                <View key={idx} style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#222",
                      textAlign: "right",
                    }}
                  >
                    {row.price.toLocaleString()} Baht
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#888", textAlign: "right" }}
                  >
                    {row.date}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.salesReportCard}>
          <View style={styles.salesTabBar}>
            {tabOptions.map((tab: TabType) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.salesTab,
                  selectedTab === tab && styles.activeSalesTab,
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    styles.salesTabText,
                    selectedTab === tab && styles.activeSalesTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.salesTableHeaderRow}>
            <Text style={styles.salesTableHeader}>Size</Text>
            <Text style={styles.salesTableHeader}>Price</Text>
            <Text style={styles.salesTableHeader}>Date</Text>
          </View>
          {mockTableData[selectedTab].map((row, idx) => (
            <View style={styles.salesTableRow} key={idx}>
              <Text style={styles.salesTableCell}>{row.size}</Text>
              <Text style={styles.salesTableCell}>
                {row.price.toLocaleString()} Baht
              </Text>
              <Text style={styles.salesTableCell}>{row.date}</Text>
            </View>
          ))}
        </View>
        <RelatedItemsSection
          products={similarProducts}
          title={"Recommended Items"}
        />
        <RelatedItemsSection
          products={relatedProducts}
          title={"Recently Viewed"}
        />
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["60%"]}
        onClose={handleCloseBottomSheet}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: "#000", borderRadius: 0 }}
        handleIndicatorStyle={{ backgroundColor: "white" }}
      >
        <BottomSheetView style={{ flex: 1, padding: 20 }}>
          {/* Size Selection Grid */}
          {!selectedSize ? (
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
                {product.variations?.map((variation: any, idx: number) => (
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
                      setSelectedSize(variation._id);
                      {
                        bottomSheetType === "buy"
                          ? setActiveTab("buyNow")
                          : setActiveTab("sellNow");
                      }
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
                      {product.attribute?.name || variation.attributeId.name}
                    </Text>
                    <Text style={{ color: "#fff", fontSize: 14, marginTop: 4 }}>
                      14,800 Baht
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <>
              {bottomSheetType === "buy" ? (
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
                        borderBottomWidth: activeTab === "buyNow" ? 3 : 0,
                        borderBottomColor:
                          activeTab === "buyNow" ? "#a00" : "transparent",
                        marginBottom: -2,
                      }}
                      onPress={() => setActiveTab("buyNow")}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: 18,
                        }}
                      >
                        Buy Now
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        alignItems: "center",
                        paddingVertical: 12,
                        borderBottomWidth: activeTab === "placeOffer" ? 3 : 0,
                        borderBottomColor:
                          activeTab === "placeOffer" ? "#a00" : "transparent",
                        marginBottom: -2,
                      }}
                      onPress={() => {
                        setActiveTab("placeOffer");
                        setSelectedSellerAsk(null);
                        setSelectedBuyerOffer(null);
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: 18,
                        }}
                      >
                        Place Offer
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {/* Tab Content */}
                  {activeTab === "buyNow" ? (
                    <>
                      {product?.selling.length > 0 &&
                        product.selling.map((sel: any) => (
                          <SellerAsk
                            key={sel._id}
                            sel={sel}
                            modalVisible={modalVisibleSellerAsk}
                            setModalVisible={setModalVisibleSellerAsk}
                            zoomIndex={zoomIndex}
                            setZoomIndex={setZoomIndex}
                            onPress={() => {
                              setSelectedSellerAsk(sel);
                              handleGoToOfferPlace();
                            }}
                          />
                        ))}
                    </>
                  ) : (
                    <>
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
                          14,595 Baht
                        </Text>
                        <TouchableOpacity
                          style={{
                            borderWidth: 2,
                            borderColor: "#fff",
                            borderRadius: 4,
                            paddingVertical: 6,
                            paddingHorizontal: 18,
                          }}
                          onPress={handleGoToOfferPlace}
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
                        <Text style={{ color: "#fff", fontSize: 18 }}>
                          Last Sale
                        </Text>
                        <Text style={{ color: "#fff", fontSize: 18 }}>
                          18,900 Baht
                        </Text>
                      </View>
                    </>
                  )}
                  {/* Back to size selection */}
                  <TouchableOpacity
                    style={{ marginTop: 32, alignSelf: "center" }}
                    onPress={() => setSelectedSize(null)}
                  >
                    <Text
                      style={{ color: "#fff", textDecorationLine: "underline" }}
                    >
                      Change Size
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
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
                            12,400 Baht
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
                            borderColor: "#fff",
                            borderRadius: 4,
                            paddingVertical: 6,
                            paddingHorizontal: 18,
                          }}
                        >
                          <Text style={{ color: "#fff", fontWeight: "bold" }}>
                            Select
                          </Text>
                        </TouchableOpacity>
                      </View>
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
                          12,400 Baht
                        </Text>
                        <TouchableOpacity
                          style={{
                            borderWidth: 2,
                            borderColor: "#fff",
                            borderRadius: 4,
                            paddingVertical: 6,
                            paddingHorizontal: 18,
                          }}
                          onPress={handleGoToPlaceAsk}
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
                        <Text style={{ color: "#fff", fontSize: 18 }}>
                          Last Sale
                        </Text>
                        <Text style={{ color: "#fff", fontSize: 18 }}>
                          14,400 Baht
                        </Text>
                      </View>
                    </View>
                  )}
                  {/* Back to size selection */}
                  <TouchableOpacity
                    style={{ marginTop: 32, alignSelf: "center" }}
                    onPress={() => setSelectedSize(null)}
                  >
                    <Text
                      style={{ color: "#fff", textDecorationLine: "underline" }}
                    >
                      Change Size
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
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
    width: width,
    height: width,
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
    height: 70,
  },
  buyButtonExact: {
    flexDirection: "row",
    backgroundColor: Colors.brandDarkGreen,
    borderRadius: 8,
    alignItems: "center",
    height: "100%",
    width: "100%",
    paddingHorizontal: 10,
  },
  sellButtonExact: {
    flexDirection: "row",
    backgroundColor: Colors.brandDarkColor,
    borderRadius: 8,
    alignItems: "center",
    height: "100%",
    width: "100%",
    paddingHorizontal: 10,
  },
  buyLabelExact: {
    color: "#fff",
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
    borderRightWidth: 1,
    borderRightColor: "#fff",
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
    alignItems: "center",
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

export default Deal;
