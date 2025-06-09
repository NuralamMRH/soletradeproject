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
import { SIZES } from "@/constants";
import Colors from "@/constants/Colors";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlists,
} from "@/hooks/react-query/useWishlistMutation";
import { LineChart } from "react-native-chart-kit";

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
}

const Deal = ({ product }: { product: any }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();
  const { data: wishlists, isLoading: wishlistsLoading } = useWishlists();

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

  const cartCount = useSelector(
    (state: any) => state.product.checkout.totalItems
  );

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

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        brand: product.brand?.name || "",
        price: product.retailPrice,
        quantity: 1,
        image: product.images[0]
          ? `${baseUrl}${product.images[0].file_full_url}`
          : "",
      })
    );
    // Animate button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
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
      <Image source={image} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>
        {price && (
          <View>
            <Text style={styles.productPrice}>{price}</Text>
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

  return (
    <>
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <>
              <TouchableOpacity
                onPress={() =>
                  wishlists?.some(
                    (wishlist: any) => wishlist?.productId === product._id
                  )
                    ? handleRemoveFromWishlist(product._id)
                    : handleAddToWishlist(product._id)
                }
                style={styles.favoriteButton}
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
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={24} color="#333" />
              </TouchableOpacity>
            </>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.buttonRow, { paddingTop: insets.top + 50 }]}>
          <TouchableOpacity style={styles.buyBigButton}>
            <Text style={styles.buyButtonLabel}>BUY</Text>
            <Text style={styles.buyButtonPrice}>8,400 Baht</Text>
            <Text style={styles.buyButtonSub}>Lowest Ask</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sellBigButton}>
            <Text style={styles.sellButtonLabel}>SELL</Text>
            <Text style={styles.sellButtonPrice}>12,400 Baht</Text>
            <Text style={styles.sellButtonSub}>Highest Offer</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>
          <SwiperFlatList
            showPagination
            paginationActiveColor="#007A3D"
            paginationDefaultColor="#ccc"
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
                  backgroundGradientFrom: "#fff",
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
    width: "80%",
    height: "80%",
  },
  imageDots: {
    flexDirection: "row",
    position: "absolute",
    bottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#007AFF",
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
  buyButton: {
    width: SIZES.width / 2 + 40,
    flexDirection: "row",
    backgroundColor: Colors.brandDarkGreen,
    borderRadius: 8,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    alignSelf: "center",
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  productBrand: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },

  lowestAsk: {
    fontSize: 10,
    color: "#999",
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    // backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 5,
  },
  mostPopularContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    marginBottom: 10,
  },
  chartCard: {
    padding: 20,
    backgroundColor: "#fff",
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    gap: 20,
  },
  buyBigButton: {
    flex: 1,
    padding: 20,
    borderRadius: 8,
    backgroundColor: Colors.brandDarkGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  sellBigButton: {
    flex: 1,
    padding: 20,
    borderRadius: 8,
    backgroundColor: Colors.brandDarkGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  buyButtonLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buyButtonPrice: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buyButtonSub: {
    color: "#fff",
    fontSize: 14,
  },
  sellButtonLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  sellButtonPrice: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sellButtonSub: {
    color: "#fff",
    fontSize: 14,
  },
  productDetailsSection: {
    padding: 20,
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
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
});

export default Deal;
