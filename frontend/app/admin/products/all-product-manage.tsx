import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { baseUrl } from "@/api/MainApi";
import Colors from "@/constants/Colors";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";
import { useAttributes } from "@/hooks/useAttributes";
import { useAttributeOptions } from "@/hooks/useAttributeOptions";
import { useProducts } from "@/hooks/useProducts";

type Params = {
  productId?: string;
};

// Add this type at the top (or import if you have it elsewhere)
type Product = {
  _id: string;
  name: string;
  product_type: string;
  image_full_url?: string;
  price: number;
  discountPrice: number;
  description: string;
  richDescription: string;
  image: string;
  images: any[];
  indicator: string;
  isIndicatorActive: boolean;
  brand: string;
  category: string;
  subCategory: string;
  isUnpublished: boolean;
  publishDate: Date;
  releaseDate: Date;
  duration: number;
  duration_icon: string;
  dateCreated: Date;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isTopRated: boolean;
  isTrending: boolean;
  isSpecial: boolean;
  isHot: boolean;
  isDeleted: boolean;
  isActive: boolean;
  // add other properties if needed
};

export default function AllProductManagePage() {
  const router = useRouter();
  const paramsRaw = useLocalSearchParams();
  const productId =
    typeof paramsRaw.productId === "string" ? paramsRaw.productId : null;
  const isEssential = paramsRaw.isEssential === "true" ? true : false;
  const isAuction = paramsRaw.isAuction === "true" ? true : false;
  const isDeal = paramsRaw.isDeal === "true" ? true : false;

  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [filter, setFilter] = useState({
    product_type: isEssential ? "essential" : isAuction ? "auction" : "deal",
    keyword: searchText,
  });
  const { products, loading, error, refetch } = useProducts({ filter });

  console.log("Products", products);

  useFocusEffect(
    useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      keyword: searchText,
    }));
  }, [searchText]);

  // console.log("Products", products);
  const handleAddNewProduct = () => {
    router.push({
      pathname: "/admin/products/add-new-product",
      params: {
        productType: isEssential ? "essential" : isAuction ? "auction" : "deal",
      },
    });
  };

  const handleEditProduct = (product: any) => {
    router.push({
      pathname: "/admin/products/add-new-product",
      params: {
        product: JSON.stringify(product),
        productType: product.product_type,
      },
    });
  };

  const renderHeader = () => {
    return (
      <View
        style={[
          styles.header,
          {
            paddingTop: Constants.statusBarHeight,
            backgroundColor: Colors.brandGray,
          },
        ]}
      >
        <View style={{ paddingBottom: 5 }}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={{ padding: 5 }}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={25} color={"black"} />
              </TouchableOpacity>
            </View>

            <View style={[styles.headerCenter, { flex: 3 }]}>
              <Text style={styles.sectionTitle}>Products</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity style={{ padding: 5 }}>
                <Ionicons
                  name="notifications-outline"
                  size={25}
                  color={"black"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {searchActive && (
        <View style={styles.subContainer}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 8,
              marginVertical: 10,
            }}
            placeholder="Search products..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
        </View>
      )}
      <FlatList
        contentContainerStyle={[styles.subContainer, { paddingTop: 20 }]}
        data={products as Product[]}
        keyExtractor={(product) => product._id}
        renderItem={({ item: product }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => handleEditProduct(product)}
          >
            <Image
              source={
                product.images[0]?.file_full_url
                  ? {
                      uri: product.images[0]?.file_full_url.startsWith("http")
                        ? product.images[0]?.file_full_url
                        : `${baseUrl}${product.images[0]?.file_full_url}`,
                    }
                  : product?.image_full_url
                  ? {
                      uri: product.image_full_url.startsWith("http")
                        ? product.image_full_url
                        : `${baseUrl}${product.image_full_url}`,
                    }
                  : require("@/assets/images/bg_8.png")
              }
              style={styles.productImage}
              resizeMode="contain"
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={{ fontSize: 12, color: "#333" }}>
                {product.brand?.name || product.category?.name}
              </Text>
              <Text style={{ fontSize: 12, color: "#333" }}>
                {product?.richDescription?.slice(0, 50)}
              </Text>

              <Text style={{ fontSize: 12, color: "#333" }}>
                {product?.description?.slice(0, 50)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.title}>
              {isEssential
                ? "Manage Essential Products"
                : isAuction
                ? "Manage Auction Products"
                : "Manage Products"}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  setSearchActive(!searchActive);
                  setSearchText("");
                }}
              >
                <Ionicons
                  name={!searchActive ? "search" : "close"}
                  size={20}
                  color="#333"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={handleAddNewProduct}
              >
                <Ionicons name="add" size={20} color="#333" />
                <Text style={{ color: "#333", fontSize: 16 }}>Add New</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  //Header section style
  header: {
    padding: 10,
    backgroundColor: Colors.brandGray,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    flex: 1,
    flexDirection: "row",
    paddingRight: 10,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  logo: {
    maxWidth: 150,
    height: 40,
    resizeMode: "cover",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  //Header section style close
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  subContainer: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  attributesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 40,
  },
  productName: {
    fontSize: 14,
    textAlign: "left",
    color: "#333",
    width: "100%",
    fontWeight: "bold",
  },

  addNewCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    height: 150,
  },
  addNewText: {
    fontSize: 16,
    marginTop: 8,
    color: "#333",
  },
});
