import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { COLORS } from "@/constants";
// @ts-ignore
import { debounce } from "lodash";
import Constants from "expo-constants";
import Colors from "@/constants/Colors";
import { useProducts } from "@/hooks/useProducts";
import { useRouter, useLocalSearchParams } from "expo-router";
import { baseUrl } from "@/api/MainApi";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useListCreation } from "@/context/ListCreationContext";

interface Product {
  _id: string;
  name: string;
  images?: { file_full_url: string }[];
  brand?: { name: string };
  category?: { name: string };
  model?: string;
}

const SelectProducts: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  let initialSelectedProducts: Product[] = [];
  if (params.selectedProducts && typeof params.selectedProducts === "string") {
    try {
      initialSelectedProducts = JSON.parse(params.selectedProducts);
    } catch {}
  }
  const colIdx = params.colIdx ? Number(params.colIdx) : undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    Array.isArray(initialSelectedProducts)
      ? initialSelectedProducts.map((product) => product._id)
      : []
  );
  const [showGroupedResults, setShowGroupedResults] = useState(false);
  const [filter, setFilter] = useState({ keyword: searchQuery });
  const {
    products: searchResults,
    loading: isLoading,
    error,
    refetch,
  } = useProducts({ filter });
  const { setColumnProducts } = useListCreation();

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((text: string) => {
      setSearchQuery(text);
      setFilter({ keyword: text });
      setShowGroupedResults(!!text.length);
    }, 500),
    []
  );

  const toggleProductSelection = (productId: string) => {
    let newSelectedIds;
    if (selectedIds.includes(productId)) {
      newSelectedIds = selectedIds.filter((id) => id !== productId);
    } else {
      newSelectedIds = [...selectedIds, productId];
    }
    setSelectedIds(newSelectedIds);
  };

  const handleSave = () => {
    let productsArray: Product[] = [];
    if (Array.isArray(searchResults)) {
      productsArray = searchResults;
    } else if (
      searchResults &&
      Array.isArray((searchResults as any).products)
    ) {
      productsArray = (searchResults as any).products;
    }
    const selectedProductsList = productsArray.filter((product: Product) =>
      selectedIds.includes(product._id)
    );
    if (colIdx === undefined) {
      Toast.show({ type: "error", text1: "Column index missing" });
      return;
    }
    setColumnProducts(colIdx, selectedProductsList);
    router.back();
    Toast.show({ type: "success", text1: "Products selected" });
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        selectedIds.includes(item._id) && styles.selectedItemContainer,
      ]}
      onPress={() => toggleProductSelection(item._id)}
    >
      <Image
        source={{
          uri: item.images?.[0]?.file_full_url
            ? baseUrl + item.images[0].file_full_url
            : undefined,
        }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.modelText} numberOfLines={2}>
          {item.name}
        </Text>
        {selectedIds.includes(item._id) && (
          <View style={styles.selectedIndicator}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={COLORS.brandRed}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
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
            <Text style={styles.sectionTitle}>Select Products</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={{ padding: 5 }} onPress={handleSave}>
              <Ionicons name="save-outline" size={25} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {renderHeader()}
      <View style={{ padding: 16 }}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <FlatList<Product>
            data={(() => {
              if (Array.isArray(searchResults)) return searchResults;
              if (
                searchResults &&
                Array.isArray((searchResults as any).products)
              ) {
                return (searchResults as any).products;
              }
              return [];
            })()}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  selectedItemContainer: {
    backgroundColor: "#e0f7fa",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f2f2f2",
  },
  itemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modelText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  selectedIndicator: {
    marginLeft: 8,
  },
});

export default SelectProducts;
