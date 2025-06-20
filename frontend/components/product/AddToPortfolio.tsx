import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DatePicker } from "react-native-wheel-pick";
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
import { useRouter } from "expo-router";
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

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import AdminHeader from "../AdminHeader";
import { TextInput } from "react-native";
import { ThemedText } from "../ThemedText";
import {
  useAddToPortfolio,
  useRemoveFromPortfolio,
  useUpdatePortfolio,
} from "@/hooks/react-query/usePortfolioMutation";
import { usePortfolio } from "@/hooks/usePortfolio";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

type TabType = "Brand New" | "Used";

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
  transactions: any;
}

const AddToPortfolio = ({
  portfolio = null,
  product,
}: {
  portfolio: any;
  product: any;
}) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [tempDate, setTempDate] = useState<Date>(
    new Date(portfolio?.purchaseAt) || new Date()
  );
  const [bottomSheetType, setBottomSheetType] = useState<"buy" | "sell">("buy");
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    portfolio?.sizeId || null
  );
  const [highestOffer, setHighestOffer] = useState<any>(null);
  const [purchasePrice, setPurchasePrice] = useState<number>(
    portfolio?.purchasePrice || 0
  );
  const dateSheetRef = useRef<any>(null);

  const { mutate: addToPortfolio } = useAddToPortfolio();
  const { mutate: updatePortfolio } = useUpdatePortfolio();
  const { mutate: removeFromPortfolio } = useRemoveFromPortfolio();
  const { portfolioItems, loading: portfolioLoading, refetch } = usePortfolio();

  const isPortfolio = portfolioItems?.some(
    (portfolioItem: any) => portfolioItem?.productId === product._id
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

  const insets = useSafeAreaInsets();

  const handleAddToPortfolio = () => {
    if (!selectedSize) {
      Toast.show({
        type: "error",
        text1: "Please select a size",
        text2: "You need to select a size to add to portfolio",
      });
      return;
    }
    if (purchasePrice === 0) {
      Toast.show({
        type: "error",
        text1: "Please enter a purchase price",
        text2: "You need to enter a purchase price to add to portfolio",
      });
      return;
    }
    if (tempDate === null) {
      Toast.show({
        type: "error",
        text1: "Please select a purchase date",
        text2: "You need to select a purchase date to add to portfolio",
      });
      return;
    }

    const portfolioItem = {
      productId: product._id,
      condition: selectedTab,
      sizeId: selectedSize,
      purchasePrice: purchasePrice,
      purchaseAt: tempDate,
    };

    if (portfolio) {
      updatePortfolio(
        { id: portfolio._id, data: portfolioItem },
        {
          onSuccess: () => {
            refetch();
            router.back();
          },
        }
      );
    } else {
      addToPortfolio(
        { data: portfolioItem },
        {
          onSuccess: () => {
            refetch();
            router.back();
          },
        }
      );
    }
  };

  const handleRemoveFromPortfolio = (productId: string) => {
    // Find the portfolio entry for this product
    const portfolioItem = portfolioItems?.find(
      (portfolioItem: any) => portfolioItem?.productId === productId
    );
    if (portfolioItem) {
      removeFromPortfolio((portfolioItem as any)._id);
    }
  };

  // Handle bottom sheet closing
  const handleCloseBottomSheet = () => {
    setTimeout(() => {
      bottomSheetRef.current?.close();
    }, 0);
  };

  const snapPoints = useMemo(() => ["60%"], []);

  const handleButtonClicked = () => {
    bottomSheetRef.current?.expand();
  };

  const [selectedTab, setSelectedTab] = useState<TabType>("Brand New");

  const tabOptions: TabType[] = ["Brand New", "Used"];

  return (
    <>
      <AdminHeader
        onBack={() => router.back()}
        backgroundColor={"transparent"}
        borderHide
      />

      <ScrollView showsVerticalScrollIndicator={false}>
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

        <View style={styles.productDetailsSection}>
          <Text style={styles.productNameBig}>{product.name}</Text>
        </View>
        <View style={{ padding: 10 }}>
          <View
            style={{
              borderBottomWidth: 1,
              marginBottom: 16,
              borderColor: Colors.brandGray,
            }}
          >
            <ThemedText
              type="subtitle"
              style={{
                fontSize: 16,
                color: "black",
                paddingBottom: 10,
              }}
            >
              Size
            </ThemedText>
            <TouchableOpacity
              onPress={() => handleButtonClicked()}
              style={{
                padding: 10,
              }}
            >
              <Text style={{ fontSize: 16, color: "black" }}>
                {selectedSize
                  ? product.variations.find(
                      (variation: any) => variation._id === selectedSize
                    )?.optionName +
                      " " +
                      product.attribute?.name || ""
                  : "Select Size"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.salesReportCard}>
            <ThemedText
              type="subtitle"
              style={{ marginBottom: 10, fontSize: 16 }}
            >
              Condition
            </ThemedText>
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
          </View>
          {/* Retail Price */}
          <View
            style={{
              borderBottomWidth: 1,
              marginBottom: 16,
              position: "relative",
              borderColor: Colors.brandGray,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                paddingBottom: 10,
              }}
            >
              Retail Price
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                position: "absolute",
                right: 0,
                bottom: 10,
              }}
            >
              THB
            </Text>
            <TextInput
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                paddingBottom: 10,
              }}
              placeholder="Retail Price"
              value={purchasePrice.toLocaleString("th-TH")}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, "");
                setPurchasePrice(numeric ? Number(numeric) : 0);
              }}
              keyboardType="numeric"
            />
          </View>

          <View
            style={{
              borderBottomWidth: 1,
              marginBottom: 16,
              borderColor: Colors.brandGray,
            }}
          >
            <ThemedText
              type="subtitle"
              style={{
                fontSize: 16,
                color: "black",
                paddingBottom: 10,
              }}
            >
              Purchase Date
            </ThemedText>
            <TouchableOpacity
              onPress={() => dateSheetRef.current?.expand()}
              style={{
                padding: 10,
              }}
            >
              <Text style={{ fontSize: 16, color: "black" }}>
                {tempDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 50,
          paddingBottom: 30,
        }}
      >
        <TouchableOpacity
          onPress={
            !portfolio && isPortfolio
              ? () => handleRemoveFromPortfolio(product._id)
              : handleAddToPortfolio
          }
          style={{
            backgroundColor: "black",

            padding: 10,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ThemedText
            type="default"
            style={{
              color:
                !portfolio && isPortfolio
                  ? "red"
                  : selectedSize && purchasePrice && tempDate
                  ? "white"
                  : "gray",
            }}
          >
            {!portfolio && isPortfolio
              ? "Remove from Portfolio"
              : portfolio
              ? "Update Portfolio"
              : "Add to Portfolio"}
          </ThemedText>
        </TouchableOpacity>
      </View>

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
                    handleCloseBottomSheet();
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
                    {bottomSheetType === "buy" ? (
                      <>
                        {getSizeLowestPrice(variation._id) === 0 ? (
                          "N/A"
                        ) : (
                          <Price
                            price={getSizeLowestPrice(variation._id) || 0}
                            currency="THB"
                          />
                        )}
                      </>
                    ) : (
                      <>
                        {getSizeHighestPrice(variation._id) === 0 ? (
                          "N/A"
                        ) : (
                          <Price
                            price={getSizeHighestPrice(variation._id) || 0}
                            currency="THB"
                          />
                        )}
                      </>
                    )}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet
        ref={dateSheetRef}
        index={-1}
        snapPoints={["35%"]}
        enablePanDownToClose={true}
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
        backgroundStyle={{ backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity
              onPress={() => {
                dateSheetRef.current?.close();
              }}
              style={{
                backgroundColor: "#000",
                padding: 10,
                width: SIZES.width,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            {Platform.OS === "ios" ? (
              <>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(_event: any, selectedDate: any) => {
                    if (selectedDate) setTempDate(selectedDate);
                  }}
                  style={{ width: 320, backgroundColor: "white" }}
                />
              </>
            ) : (
              <>
                <DatePicker
                  style={{ width: 320, backgroundColor: "white" }}
                  textSize={14}
                  selectTextColor="#000"
                  selectLineColor="white"
                  selectLineSize={6}
                  order="Y-M-D"
                  onDateChange={(_event: any, selectedDate: any) => {
                    if (selectedDate) setTempDate(selectedDate);
                  }}
                />
              </>
            )}
          </View>
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
    // width: SIZES.width - 32,
    // height: SIZES.width - 202,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
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
  salesReportCard: {},
  salesTabBar: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#ccc",
    borderRadius: 10,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 3,
    // marginHorizontal: 50,
    width: SIZES.width - 19,
  },
  salesTab: {
    padding: 10,
    borderRadius: 8,
    width: SIZES.width / 2 - 19,
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

export default AddToPortfolio;
