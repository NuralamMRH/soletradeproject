import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  Keyboard,
  Modal,
  Pressable,
  StatusBar,
} from "react-native";
import { useProducts } from "@/hooks/useProducts";
import { useSearchHistory } from "@/context/SearchHistoryContext";
import { COLORS, SIZES } from "@/constants";
import { useRouter } from "expo-router";
import { baseUrl } from "@/api/MainApi";

import { ThemedText } from "@/components/ThemedText";
import { useSearchKeywords } from "@/hooks/useSearchKeywords";
import { useLocalSearchParams } from "expo-router";
// Helper functions and constants from index.tsx

const Search = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const searchFor =
    (params.searchFor as
      | "<string>"
      | "portfolio"
      | "products"
      | "columnSelection"
      | "productSelection") || "products";
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const { addSearch, suggest, history, removeSearch } = useSearchHistory();
  const { products, loading, refetch } = useProducts({
    filter: { product_type: "deal", keyword: query },
  });

  const {
    topSearches,
    recentSearches,
    loading: loadingSearchKeywords,
    error: errorSearchKeywords,
    refetch: refetchSearchKeywords,
  } = useSearchKeywords();

  const handleSearch = (text: string) => {
    setQuery(text);
    setSearching(!!text);
  };

  const handleSubmit = () => {
    if (query.trim()) {
      addSearch(query.trim());
      setSearching(true);
      Keyboard.dismiss();
    }
  };

  const handleSuggestion = (text: string) => {
    setQuery(text);
    setSearching(true);
    addSearch(text);
    Keyboard.dismiss();
  };

  const handleRecommendedClick = (text: string) => {
    setModalVisible(false);
    router.push({
      pathname: "/search/search-results",
      params: { title: text, query: text, searchFor: searchFor },
    });
  };

  // Render product grid for search results
  const renderProductGrid = () => (
    <View style={styles.gridContainer}>
      {products.map((item: any) => (
        <TouchableOpacity
          key={item._id}
          onPress={() => {
            if (searchFor === "portfolio") {
              router.push({
                pathname: "/user/portfolio/details",
                params: {
                  id: item._id,
                },
              });
            } else {
              router.push(`/product/${item._id}`);
            }
          }}
        >
          <Image
            source={
              item.images[0]?.file_full_url
                ? { uri: `${baseUrl}${item.images[0]?.file_full_url}` }
                : require("@/assets/images/bg_8.png")
            }
            style={styles.gridImage}
          />
          <ThemedText style={styles.gridTitle} numberOfLines={2}>
            {item.name}
          </ThemedText>
          {item.subtitle && (
            <ThemedText style={styles.gridSubtitle} numberOfLines={1}>
              {item.subtitle}
            </ThemedText>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TextInput
            ref={inputRef}
            style={styles.modalSearchInput}
            placeholder="Search"
            placeholderTextColor="#888"
            value={query}
            onChangeText={handleSearch}
            onSubmitEditing={handleSubmit}
            autoFocus
            returnKeyType="search"
          />
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Product Grid Results */}
          {searching && query.length > 0 && renderProductGrid()}
          {/* Recommended Search Items */}
          <ThemedText style={styles.recommendedTitle}>
            Recommended Search Items
          </ThemedText>
          <View style={styles.recommendedRow}>
            {/* Example recommended items, replace with real data if available */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {topSearches.map((item: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recommendedItem}
                  onPress={() => handleRecommendedClick(item.keyword)}
                >
                  <ThemedText>{item.keyword}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* Recent Searches */}
          <ThemedText style={styles.recentTitle}>Recent Searches</ThemedText>
          <View style={styles.recentList}>
            {history.map((item: any, index: number) => (
              <View key={item + index} style={styles.recentRow}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => handleSuggestion(item)}
                >
                  <ThemedText style={styles.recentText}>{item}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeSearch(item)}>
                  <ThemedText style={styles.removeText}>×</ThemedText>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
    backgroundColor: "#fff",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    marginHorizontal: 16,
    marginBottom: 12,
    height: 44,
    gap: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#fff",
  },
  searchInputText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 12,
    height: 44,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalSearchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    fontSize: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    color: "#000",
  },
  cancelText: {
    color: "#000",
    fontSize: 16,
    marginLeft: 12,
  },
  recommendedTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    color: "#111",
  },
  recommendedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  recommendedItem: {
    borderWidth: 2,
    borderColor: "#111",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  recentTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    color: "#111",
  },
  recentList: {
    marginBottom: 16,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  recentText: {
    color: "#111",
    fontSize: 15,
  },
  removeText: {
    color: "#b71c1c",
    fontSize: 18,
    marginLeft: 8,
    fontWeight: "bold",
  },
  productList: {
    flex: 1,
    marginHorizontal: 0,
    marginTop: 0,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    backgroundColor: "#181818",
  },
  productImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
    marginRight: 14,
    backgroundColor: "#222",
  },
  productBrand: {
    color: COLORS.brandColor,
    fontWeight: "bold",
    fontSize: 15,
  },
  productName: {
    color: "#fff",
    fontSize: 14,
    marginTop: 2,
  },
  loadingText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 24,
    fontSize: 16,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 18,
    marginTop: 8,
  },
  categoryItem: {
    alignItems: "center",
    width: 80,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    marginBottom: 4,
    resizeMode: "contain",
  },
  categoryLabel: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
  },
  suggestionList: {
    backgroundColor: "#181818",
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    maxHeight: 180,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  suggestionText: {
    color: "#fff",
    fontSize: 15,
  },
  gridContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 10,
  },
  gridItem: {
    flex: 1,
    alignItems: "center",
    margin: 8,
  },
  gridImage: {
    width: SIZES.width / 3 - 20,
    height: SIZES.width / 3 - 20,
    resizeMode: "contain",
    marginBottom: 6,
  },
  gridTitle: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 2,
  },
  gridSubtitle: {
    color: "#999",
    fontSize: 13,
    textAlign: "center",
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

  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default Search;
