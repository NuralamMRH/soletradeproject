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
import EssentialProductCard from "./EssentialProductCard";
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
import AdminHeader from "../AdminHeader";

const { width } = Dimensions.get("window");

const Essential = ({ product }: { product: any }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const { products: relatedProducts, loading: relatedProductsLoading } =
    useProducts({
      filter: {
        product_type: "essential",
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
              <EssentialProductCard item={product} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <>
      <AdminHeader
        onBack={() => router.back()}
        backgroundColor={"transparent"}
        right={
          <>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/essentials/cart")}
            >
              <Ionicons name="cart-outline" size={24} color="#333" />
              <Text
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "red",
                  color: "#fff",
                  borderRadius: 10,
                  fontSize: 12,
                  height: 15,
                  width: 15,
                  textAlign: "center",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {cartCount}
              </Text>
            </TouchableOpacity>
          </>
        }
      />

      {/* Product name, brand, and price section */}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <View>
            <Text style={styles.productName}>{product.name}</Text>
            <Text
              style={{ color: "#888", fontSize: 16, marginBottom: 4 }}
            >{`${product.name} from ${product.brand?.name}`}</Text>
          </View>

          <Text style={styles.productPrice}>
            <Price price={product.retailPrice} currency="THB" />
          </Text>
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
        <View style={{ padding: 20, backgroundColor: "#f5f5f5" }}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={styles.buyButton}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <View
                style={{
                  flex: 1,
                  marginRight: 8,
                  borderRightWidth: 1,
                  borderColor: "#fff",
                  paddingVertical: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="cart-outline"
                  size={24}
                  color="#fff"
                  style={{
                    borderColor: "#fff",
                  }}
                />
              </View>

              <View
                style={{
                  flex: 3,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 10,
                }}
              >
                <Text style={styles.buyButtonText}>BUY</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.description}>{product.description}</Text>
        </View>
        <RelatedItemsSection
          products={similarProducts}
          title={`Other ${product.name} products`}
        />
        <RelatedItemsSection
          products={relatedProducts}
          title={`You also may like`}
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
});

export default Essential;
