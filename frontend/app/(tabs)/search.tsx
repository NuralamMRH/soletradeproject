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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProducts } from "@/hooks/useProducts";
import { useSections } from "@/hooks/useSections";
import { useSearchHistory } from "@/context/SearchHistoryContext";
import { COLORS, SIZES } from "@/constants";
import { useRouter } from "expo-router";
import { baseUrl } from "@/api/MainApi";
import { useBrands } from "@/hooks/useBrands";
import { useCategories } from "@/hooks/useCategories";
import Constants from "expo-constants";
// Helper functions and constants from index.tsx
const sortTypes = [
  { key: "numViews", label: "Most Popular" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Lowest Price" },
  { key: "price-desc", label: "Highest Price" },
  { key: "rating", label: "Top Rated" },
];

function getSortedProducts(products, sortKey) {
  const sorted = [...products];
  switch (sortKey) {
    case "newest":
      sorted.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      break;
    case "popular":
    case "numViews":
      sorted.sort((a, b) => (b.numViews || 0) - (a.numViews || 0));
      break;
    case "price-asc":
      sorted.sort((a, b) => (a.retailPrice || 0) - (b.retailPrice || 0));
      break;
    case "price-desc":
      sorted.sort((a, b) => (b.retailPrice || 0) - (a.retailPrice || 0));
      break;
    case "rating":
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    default:
      break;
  }
  return sorted;
}

function processItems(section, products, categories, brands) {
  if (section.mode === "auto") {
    let items = [];
    switch (section.variable_source) {
      case "products":
        items = products || [];
        if (section.autoCriteria) {
          items = items.filter((item) => {
            if (
              section.autoCriteria.productType !== "all" &&
              item.product_type !== section.autoCriteria.productType
            )
              return false;
            if (
              section.autoCriteria.minRating > 0 &&
              item.rating < section.autoCriteria.minRating
            )
              return false;
            if (
              section.autoCriteria.priceRange.min > 0 &&
              item.retailPrice < section.autoCriteria.priceRange.min
            )
              return false;
            if (
              section.autoCriteria.priceRange.max > 0 &&
              item.retailPrice > section.autoCriteria.priceRange.max
            )
              return false;
            return true;
          });
          items.sort((a, b) => {
            switch (section.autoCriteria.sortBy) {
              case "price-asc":
                return a.retailPrice - b.retailPrice;
              case "price-desc":
                return b.retailPrice - a.retailPrice;
              case "rating":
                return b.rating - a.rating;
              case "popular":
                return b.numViews - a.numViews;
              case "newest":
              default:
                return new Date(b.dateCreated) - new Date(a.dateCreated);
            }
          });
        }
        break;
      case "categories":
        items = categories || [];
        break;
      case "brands":
        items = brands || [];
        break;
    }
    return section.number_of_items > 0
      ? items.slice(0, section.number_of_items)
      : items;
  }
  return section.products || [];
}

function renderDynamicSection(section, products, categories, brands, router) {
  const {
    name,
    description,
    display_style,
    display_type,
    column_count,
    column_names,
    column_products,
    items_per_column,
    mode,
    autoCriteria,
    isActive,
    column_categories,
    column_brands,
  } = section;

  const items = processItems(section, products, categories, brands);

  function buildColumns(
    products,
    column_count,
    items_per_column,
    column_names
  ) {
    let remaining = [...products];
    const columns = [];
    for (let i = 0; i < column_count; i++) {
      const sortType = sortTypes[i % sortTypes.length].key;
      const sorted = getSortedProducts(remaining, sortType);
      const colProducts = sorted.slice(0, items_per_column);
      remaining = remaining.filter((p) => !colProducts.includes(p));
      columns.push({
        name: column_names?.[`C${i + 1}`] || `Column ${i + 1}`,
        products: colProducts,
        sortType,
      });
      if (remaining.length === 0) break;
    }
    let colIndex = 0;
    while (remaining.length > 0 && columns.length < column_count) {
      const sortType = sortTypes[colIndex % sortTypes.length].key;
      const sorted = getSortedProducts(remaining, sortType);
      const colProducts = sorted.slice(0, items_per_column);
      remaining = remaining.filter((p) => !colProducts.includes(p));
      columns.push({
        name:
          column_names?.[`C${columns.length + 1}`] ||
          `Column ${columns.length + 1}`,
        products: colProducts,
        sortType,
      });
      colIndex++;
    }
    return columns;
  }

  const columns = buildColumns(
    products,
    column_count,
    items_per_column,
    column_names
  );

  return (
    <View
      style={{
        backgroundColor: "#000000",
        paddingVertical: 15,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 15,
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#fff",
            marginLeft: 15,
            marginVertical: 10,
          }}
        >
          {name}
        </Text>
        <TouchableOpacity>
          <Text style={{ fontSize: 14, color: "#fff" }}>View More &gt;</Text>
        </TouchableOpacity>
      </View>
      {/* Display Style 3: Column-based layout */}
      {isActive &&
        display_style === 3 &&
        (display_type === "product" || display_type === "new-items") && (
          <View style={{ position: "relative" }}>
            <View
              style={{
                width: SIZES.width - 32,
                height: 3,
                backgroundColor: COLORS.grayTie,
                position: "absolute",
                top: 25,
                left: 10,
                right: 10,
              }}
            />
            <View
              style={{
                width: SIZES.width / 3 - 32,
                height: 3,
                backgroundColor: COLORS.brandRed,
                position: "absolute",
                top: 25,
                left: 20,
              }}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: "row",
                paddingHorizontal: 15,
              }}
            >
              {mode === "manual"
                ? column_products.map((item: any, index: number) => {
                    const colKey = `C${index + 1}`;
                    return (
                      <View
                        key={item?.column}
                        style={{
                          flex: 1,
                          marginRight: 20,
                          maxWidth: SIZES.width / 2 - 20,
                          overflow: "hidden",
                        }}
                      >
                        <View>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "bold",
                              color: "#fff",
                              marginBottom: 10,
                              textAlign: "center",
                            }}
                          >
                            {column_names?.[colKey]}
                          </Text>
                        </View>
                        {item?.column === colKey
                          ? item?.products
                              .slice(0, items_per_column)
                              .map((product: any, pIndex: number) => {
                                return (
                                  <TouchableOpacity
                                    key={`${product._id || pIndex}`}
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                      marginBottom: 15,
                                    }}
                                    onPress={() =>
                                      router.push(`/product/${product._id}`)
                                    }
                                  >
                                    <Text
                                      style={{
                                        fontSize: 18,
                                        fontWeight: "bold",
                                        marginRight: 5,
                                        width: 20,
                                      }}
                                    >
                                      {pIndex + 1}
                                    </Text>
                                    <Image
                                      source={
                                        product.image_full_url
                                          ? {
                                              uri: `${baseUrl}${product.image_full_url}`,
                                            }
                                          : require("@/assets/images/bg_8.png")
                                      }
                                      style={{
                                        width: 100,
                                        height: 100,
                                        resizeMode: "contain",
                                      }}
                                    />
                                  </TouchableOpacity>
                                );
                              })
                          : null}
                      </View>
                    );
                  })
                : columns.map((col, colIndex) => (
                    <View
                      key={col.name + colIndex}
                      style={{
                        flex: 1,
                        marginRight: 20,
                        maxWidth: SIZES.width / 2 - 20,
                        overflow: "hidden",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#333",
                          marginBottom: 10,
                          textAlign: "center",
                        }}
                      >
                        {col.name}
                      </Text>
                      {col.products.length === 0 ? (
                        <Text style={{ textAlign: "center", color: "#aaa" }}>
                          No products
                        </Text>
                      ) : (
                        col.products.map((product, pIndex) => (
                          <TouchableOpacity
                            key={product._id || pIndex}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 15,
                            }}
                            onPress={() =>
                              router.push(`/product/${product._id}`)
                            }
                          >
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                marginRight: 5,
                                width: 20,
                              }}
                            >
                              {pIndex + 1}
                            </Text>
                            <Image
                              source={
                                product.image_full_url
                                  ? {
                                      uri: `${baseUrl}${product.image_full_url}`,
                                    }
                                  : require("@/assets/images/bg_8.png")
                              }
                              style={{
                                width: 100,
                                height: 100,
                                resizeMode: "contain",
                              }}
                            />
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  ))}
            </ScrollView>
          </View>
        )}
      {/* Display Style 1: Products with details */}
      {display_style === 1 &&
        (display_type === "product" || display_type === "new-items") && (
          <View>
            {items
              .slice(0, items_per_column || 5)
              .map((item: any, index: number) => (
                <View key={item._id || index}>
                  <TouchableOpacity
                    key={item._id || index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 15,
                      paddingHorizontal: 20,
                      gap: 20,
                    }}
                    onPress={() => router.push(`/product/${item._id}`)}
                  >
                    <Image
                      source={
                        item.image_full_url
                          ? {
                              uri: `${baseUrl}${item.image_full_url}`,
                            }
                          : require("@/assets/images/bg_8.png")
                      }
                      style={{ width: 100, height: 100, resizeMode: "contain" }}
                    />
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: COLORS.gray,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "80%",
                          height: 20,
                        }}
                      >
                        {item.description || "No description"}
                      </Text>
                      <Text style={{ fontSize: 14, color: COLORS.gray }}>
                        {item.retailPrice ? `${item.retailPrice} Baht` : ""}
                      </Text>
                      <Text style={{ fontSize: 14, color: COLORS.gray }}>
                        Lowest Ask
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color="#999"
                      style={{ marginLeft: "auto" }}
                    />
                  </TouchableOpacity>
                  <Image
                    source={require("@/assets/images/icons/divider.png")}
                    style={{
                      flex: 1,
                      width: SIZES.width,
                      height: 40,
                      objectFit: "contain",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  />
                </View>
              ))}
          </View>
        )}
      {/* Display Style 2: Image-only grid */}
      {display_style === 2 &&
        (display_type === "product" || display_type === "new-items") && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              paddingHorizontal: 10,
            }}
          >
            {items.slice(0, items_per_column || 5).map((item, index) => (
              <TouchableOpacity
                key={item._id || index}
                style={{
                  width: SIZES.width / 3 - 20,
                  height: SIZES.width / 3 - 20,
                  borderRadius: 10,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: COLORS.grayTie,
                }}
                onPress={() => router.push(`/product/${item._id}`)}
              >
                <Image
                  source={{
                    uri: item.image_full_url
                      ? `${baseUrl}${item.image_full_url}`
                      : `https://via.placeholder.com/170x120`,
                  }}
                  style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
    </View>
  );
}

const SearchTab = () => {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  const { addSearch, suggest, history, removeSearch } = useSearchHistory();
  const { products, loading } = useProducts({
    filter: query ? { keyword: query } : {},
  });
  const { sections } = useSections();
  const { categories: fetchedCategories, loading: loadingCategories } =
    useCategories();
  const { brands } = useBrands();

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
      params: { query: text },
    });
  };

  // Render product grid for search results
  const renderProductGrid = () => (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <TouchableOpacity
          key={item._id}
          style={styles.gridItem}
          onPress={() => router.push(`/product/${item._id}`)}
        >
          <Image
            source={
              item.image_full_url
                ? { uri: `${baseUrl}${item.image_full_url}` }
                : require("@/assets/images/bg_8.png")
            }
            style={styles.gridImage}
          />
          <Text style={styles.gridTitle} numberOfLines={2}>
            {item.name}
          </Text>
          {item.subtitle && (
            <Text style={styles.gridSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          )}
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item._id}
      numColumns={3}
      contentContainerStyle={styles.gridContainer}
      ListEmptyComponent={
        loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <Text style={styles.loadingText}>No products found.</Text>
        )
      }
    />
  );

  // Render search suggestion/history
  const renderSuggestion = ({ item }: any) => (
    <TouchableOpacity
      key={item?._id}
      style={styles.suggestionRow}
      onPress={() => handleSuggestion(item)}
    >
      <Ionicons
        name="time-outline"
        size={18}
        color="#aaa"
        style={{ marginRight: 8 }}
      />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  // Render category icons from API
  const renderCategories = () => (
    <View style={styles.categoryRow}>
      {loadingCategories ? (
        <Text style={{ color: "#fff", textAlign: "center", flex: 1 }}>
          Loading...
        </Text>
      ) : fetchedCategories.length === 0 ? (
        <Text style={{ color: "#fff", textAlign: "center", flex: 1 }}>
          No categories
        </Text>
      ) : (
        fetchedCategories.slice(0, 6).map((cat: any) => (
          <TouchableOpacity
            key={cat._id}
            style={styles.categoryItem}
            onPress={() => handleSuggestion(cat.name)}
          >
            <Image
              source={
                cat.image_full_url
                  ? { uri: cat.image_full_url }
                  : require("@/assets/images/bg_8.png")
              }
              style={styles.categoryIcon}
            />
            <Text style={styles.categoryLabel}>{cat.name}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  // Modal content for search input, suggestions, history, and product results
  const renderSearchModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setModalVisible(false)}
    >
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
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        {/* Product Grid Results */}
        {searching && query.length > 0 && renderProductGrid()}
        {/* Recommended Search Items */}
        <Text style={styles.recommendedTitle}>Recommended Search Items</Text>
        <View style={styles.recommendedRow}>
          {/* Example recommended items, replace with real data if available */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.recommendedItem}
              onPress={() => handleRecommendedClick("Denim Tears Jeans")}
            >
              <Text>Denim Tears Jeans</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.recommendedItem}
              onPress={() => handleRecommendedClick("Labubu Macaron")}
            >
              <Text>Labubu Macaron</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.recommendedItem}
              onPress={() => handleRecommendedClick("Jordan Low")}
            >
              <Text>Jordan Low</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.recommendedItem}
              onPress={() => handleRecommendedClick("Asics Gel")}
            >
              <Text>Asics Gel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.recommendedItem}
              onPress={() => handleRecommendedClick("Stussy Knit")}
            >
              <Text>Stussy Knit</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        {/* Recent Searches */}
        <Text style={styles.recentTitle}>Recent Searches</Text>
        <FlatList
          data={history}
          renderItem={({ item }) => (
            <View key={item?._id} style={styles.recentRow}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => handleSuggestion(item)}
              >
                <Text style={styles.recentText}>{item}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeSearch(item)}>
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item}
          style={styles.recentList}
        />
      </View>
    </Modal>
  );

  // Render dynamic sections (default content)
  const renderDynamicSections = () => (
    <View>
      {sections &&
        sections.map((section: any) =>
          renderDynamicSection(
            section,
            products,
            fetchedCategories,
            brands,
            router
          )
        )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: Constants.statusBarHeight }]}>
      {/* Search Bar */}
      <Pressable onPress={() => setModalVisible(true)}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 16 }}>
            {query || "Search"}
          </Text>
        </View>
      </Pressable>
      {renderSearchModal()}
      {/* Default Content */}
      {!searching && (
        <ScrollView>
          {renderCategories()}
          {renderDynamicSections()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 32,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    height: 44,
    gap: 10,
    paddingHorizontal: 12,
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
    borderColor: "#b71c1c",
    borderRadius: 6,
    fontSize: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    color: "#000",
  },
  cancelText: {
    color: "#b71c1c",
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
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  gridItem: {
    flex: 1,
    alignItems: "center",
    margin: 8,
    maxWidth: "30%",
  },
  gridImage: {
    width: 90,
    height: 60,
    resizeMode: "contain",
    marginBottom: 6,
  },
  gridTitle: {
    color: "#222",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 2,
  },
  gridSubtitle: {
    color: "#666",
    fontSize: 13,
    textAlign: "center",
  },
});

export default SearchTab;
