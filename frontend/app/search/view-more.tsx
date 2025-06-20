import React, { useCallback, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useProducts } from "@/hooks/useProducts";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { baseUrl } from "@/api/MainApi";

import ContentLoader, { Rect } from "react-content-loader/native";
import LottieView from "lottie-react-native";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlists,
} from "@/hooks/react-query/useWishlistMutation";
import Price from "@/utils/Price";
import AdminHeader from "@/components/AdminHeader";
import { COLORS, SIZES } from "@/constants";
import { useListCreation } from "@/context/ListCreationContext";
import Toast from "react-native-toast-message";
interface ProductCardProps {
  index?: number;
  brand: string;
  name: string;
  price: number;
  image: any;
  productId: string;
  sectionType?: string;
  item?: any;
}

export default function SearchResultsPage() {
  const router = useRouter();
  const { filter } = useLocalSearchParams();
  const { query } = useLocalSearchParams();
  const { title } = useLocalSearchParams();
  const params = useLocalSearchParams();
  const searchFor =
    (params.searchFor as "<string>" | "products" | "essentials") || "products";

  const {
    isFilterActive,
    selectedCategory,
    selectedSubCategory,
    selectedBrand,
    selectedSubBrand,
    selectedIndicators,
    selectedAttributes,
    colors,
    price,
    listStyleView,
    setListStyleView,
  } = useListCreation();

  const newFilter = {
    categoryId: selectedCategory,
    subCategoryIds: selectedSubCategory,
    brandIds: selectedBrand,
    subBrandIds: selectedSubBrand,
    indicatorIds: selectedIndicators,
    attributes: selectedAttributes,
    // lowestPriceFilter: price,
    colors: colors,
  };

  const filterObj =
    filter && typeof filter === "string" ? JSON.parse(filter) : {};

  const paramProducts = JSON.parse(params.products as string);

  const [products, setProducts] = useState([]);

  const queryFilter = {
    keyword: query,
    ...newFilter,
    ...filterObj,
    productIds: paramProducts,
  };

  const {
    products: filteredProducts,
    loading,
    refetch,
  } = useProducts({
    filter: queryFilter,
  });

  const { products: allProducts } = useProducts({ filter: null });

  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();
  const { data: wishlists, isLoading: wishlistsLoading } = useWishlists();
  // Type assertion for products to avoid linter errors
  const typedProducts = products as any[];

  const loaderOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) {
      // Fade out loader, fade in content
      Animated.parallel([
        Animated.timing(loaderOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset for next load
      loaderOpacity.setValue(1);
      contentOpacity.setValue(0);
    }
  }, [loading]);

  useEffect(() => {
    const fetchAndUpdateProducts = async () => {
      if (isFilterActive) {
        await refetch();
        setProducts(filteredProducts || []);
      } else {
        await refetch();
        setProducts(filteredProducts || []);
      }
    };

    fetchAndUpdateProducts();
  }, [
    isFilterActive,
    selectedCategory,
    selectedSubCategory.length,
    selectedBrand.length,
    selectedSubBrand.length,
    selectedIndicators.length,
    selectedAttributes.length,
    colors.length,
    price[0] !== 0 || price[1] !== 1000000,
    query,
  ]);

  const lowestPrice = (productId: string) => {
    const product = allProducts.find((p: any) => p._id === productId);
    if (
      !product ||
      !Array.isArray(product.selling) ||
      product.selling.length === 0
    ) {
      return null; // or return a default value like 0 or "N/A"
    }
    const prices = product.selling.map((ask: any) => Number(ask.sellingPrice));
    return Math.min(...prices);
  };

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

  const ProductCard: React.FC<ProductCardProps> = ({
    index,
    brand,
    name,
    price,
    image,
    productId,
    sectionType,
    item,
  }) => (
    <TouchableOpacity
      onPress={() => router.push(`/product/${productId}`)}
      style={[
        styles.productCard,
        listStyleView && {
          width: SIZES.width - 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 10,
          // backgroundColor: "red",
          marginBottom: 10,
        },
        !listStyleView && {
          width: SIZES.width / 2,
          height: 250,
          justifyContent: "space-between",
          padding: 10,
        },
      ]}
    >
      {sectionType !== "row" && index && (
        <Text style={styles.productIndex}>{index}</Text>
      )}
      <Image source={image} style={styles.productImage} />
      <View style={[styles.productInfo, listStyleView && { flex: 1 }]}>
        <Text style={styles.productBrand}>{brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "end",
          }}
        >
          <View>
            {price && (
              <View>
                <Text style={styles.productPrice}>
                  <Price price={price || 0} currency="THB" />
                </Text>
                <Text style={styles.lowestAsk}>Lowest Ask</Text>
              </View>
            )}
            {item?.indicator && item.isIndicatorActive && (
              <View
                style={[
                  styles.expressTag,
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                <Image
                  source={
                    item.indicator?.image_full_url
                      ? { uri: `${baseUrl}${item.indicator?.image_full_url}` }
                      : require("@/assets/images/bg_8.png")
                  }
                  style={{
                    width: 15,
                    height: 15,
                    marginRight: 5,
                    tintColor: "#000",
                  }}
                />
                <Text style={styles.expressText}>{item.indicator?.name}</Text>
              </View>
            )}
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {searchFor === "products" && (
              <TouchableOpacity
                onPress={() =>
                  wishlists?.some(
                    (wishlist: any) => wishlist?.productId === productId
                  )
                    ? handleRemoveFromWishlist(productId)
                    : handleAddToWishlist(productId)
                }
                style={[
                  styles.favoriteButton,
                  listStyleView && {
                    marginLeft: 10,
                  },
                ]}
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
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {/* Header */}
      <AdminHeader
        left={
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <View style={{ marginLeft: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {title || ""}
              </Text>
              <Text style={{ fontSize: 12, color: "#666" }}>
                {products.length} Results
              </Text>
            </View>
          </View>
        }
        right={
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/search/filter",
                  params: { filterType: "products" },
                })
              }
            >
              <AntDesign name="filter" size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setListStyleView(!listStyleView)}>
              <Feather
                name={listStyleView ? "list" : "grid"}
                size={24}
                color={listStyleView ? "#000" : "#000"}
              />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Product Grid or Loader */}
      <View style={{ flex: 1 }}>
        <Animated.View
          style={{
            opacity: loaderOpacity,
            position: loading ? "relative" : "absolute",
            width: "100%",
          }}
        >
          <View style={{ padding: 8 }}>
            {[0, 1, 2, 3].map((row) => (
              <View
                key={row}
                style={{ flexDirection: "row", marginBottom: 16 }}
              >
                {[0, 1].map((col) => (
                  <ContentLoader
                    key={col}
                    speed={1}
                    width={160}
                    height={180}
                    viewBox="0 0 160 180"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    style={{ marginRight: col === 0 ? 16 : 0 }}
                  >
                    <Rect x="0" y="0" rx="8" ry="8" width="160" height="100" />
                    <Rect x="0" y="110" rx="4" ry="4" width="100" height="15" />
                    <Rect x="0" y="130" rx="4" ry="4" width="80" height="12" />
                    <Rect x="0" y="150" rx="4" ry="4" width="60" height="12" />
                  </ContentLoader>
                ))}
              </View>
            ))}
          </View>
        </Animated.View>
        <Animated.View style={{ opacity: contentOpacity, flex: 1 }}>
          {products.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LottieView
                source={require("@/assets/animation/NoContentAnimation7.json")}
                autoPlay
                loop
                style={{ width: 220, height: 220 }}
              />
              <Text
                style={{
                  marginTop: 16,
                  fontSize: 16,
                  color: "#888",
                  textAlign: "center",
                }}
              >
                No products found
              </Text>
            </View>
          ) : listStyleView ? (
            <ScrollView>
              {typedProducts.map((item, index) => (
                <ProductCard
                  key={item._id}
                  sectionType="row"
                  index={index + 1}
                  brand={item.brand?.name || ""}
                  name={item.name}
                  price={lowestPrice(item._id)}
                  productId={item._id}
                  image={
                    item.images[0]?.file_full_url
                      ? {
                          uri: `${baseUrl}${item.images[0]?.file_full_url}`,
                        }
                      : require("@/assets/images/bg_8.png")
                  }
                  item={item}
                />
              ))}
            </ScrollView>
          ) : (
            <FlatList
              data={typedProducts}
              numColumns={2}
              keyExtractor={(item) => item._id}
              renderItem={({ item, index }) => (
                <ProductCard
                  key={item._id}
                  sectionType="row"
                  index={index + 1}
                  brand={item.brand?.name || ""}
                  name={item.name}
                  price={lowestPrice(item._id)}
                  productId={item._id}
                  image={
                    item.images[0]?.file_full_url
                      ? {
                          uri: `${baseUrl}${item.images[0]?.file_full_url}`,
                        }
                      : require("@/assets/images/bg_8.png")
                  }
                  item={item}
                />
              )}
              contentContainerStyle={styles.gridContainer}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  resultCount: { color: "#888", marginLeft: 16, marginBottom: 8 },
  gridContainer: {
    gap: 10,
  },

  gridImage: {
    width: "100%",
    height: 100,
    resizeMode: "contain",
    marginBottom: 8,
  },
  brand: { fontWeight: "bold", fontSize: 15 },
  name: { fontSize: 13, color: "#444", marginBottom: 4 },
  price: { fontWeight: "bold", fontSize: 16, color: "#111" },

  // Product Card

  productScrollContainer: {
    paddingHorizontal: 15,
  },
  productCard: {
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
  productImage: {
    width: "100%",
    maxWidth: 170,
    height: 120,
    objectFit: "cover",
    overflow: "hidden",
    borderRadius: 10,
  },
  productInfo: {
    padding: 10,
  },
  productBrand: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  productName: {
    fontSize: 12,
    color: "#666",
    marginVertical: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  lowestAsk: {
    fontSize: 10,
    color: "#999",
  },
  favoriteButton: {
    // backgroundColor: "rgba(255, 255, 255, 0.8)",
    // padding: 5,
  },
  expressTag: {
    marginTop: 8,
    backgroundColor: COLORS.gray3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  expressText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
  },
});
