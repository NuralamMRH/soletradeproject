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
import Price from "@/utils/Price";
import { ThemedText } from "@/components/ThemedText";
import { useSearchKeywords } from "@/hooks/useSearchKeywords";
// Helper functions and constants from index.tsx
const sortTypes = [
  { key: "numViews", label: "Most Popular" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Lowest Price" },
  { key: "price-desc", label: "Highest Price" },
  { key: "rating", label: "Top Rated" },
];

interface ProductCardProps {
  index?: number;
  brand: string;
  name: string;
  price: number;
  image: string;
  productId: string;
  sectionType?: string;
}

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

function renderDynamicSection(
  index: number,
  section: any,
  products: any,
  categories: any,
  brands: any,
  router: any
) {
  const {
    name,
    description,
    display_style,
    display_type,
    column_count,
    column_names,
    column_products,
    items_per_column,
    items_per_row,
    mode,
    isActive,
  } = section;

  const items = processItems(section, products, categories, brands);

  // console.log("items_per_row", items_per_row);
  const boxWidth = SIZES.width / items_per_row - 20;
  const boxHeight = SIZES.width / items_per_row - 20;

  function buildColumns(
    products: any,
    column_count: number,
    items_per_column: number,
    column_names: any
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
      key={index}
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
          paddingHorizontal: 5,
          marginBottom: 10,
        }}
      >
        <ThemedText
          type="title"
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#fff",
            marginLeft: 15,
            marginVertical: 10,
          }}
        >
          {name}
        </ThemedText>
        <TouchableOpacity>
          <ThemedText style={{ fontSize: 14, color: "#fff" }}>
            View More &gt;
          </ThemedText>
        </TouchableOpacity>
      </View>
      {/* Display Style 3: Column-based layout */}
      {isActive &&
        display_style === 3 &&
        (display_type === "product" || display_type === "new-items") &&
        section.variable_source === "products" && (
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
                        key={item?.column + index}
                        style={{
                          flex: 1,
                          marginRight: 20,
                          maxWidth: SIZES.width / 2 - 20,
                          overflow: "hidden",
                        }}
                      >
                        <View>
                          <ThemedText
                            style={{
                              fontSize: 16,
                              fontWeight: "bold",
                              color: "#fff",
                              marginBottom: 10,
                              textAlign: "center",
                            }}
                          >
                            {column_names?.[colKey]}
                          </ThemedText>
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
                                    <ThemedText
                                      style={{
                                        fontSize: 18,
                                        fontWeight: "bold",
                                        marginRight: 5,
                                        width: 20,
                                      }}
                                    >
                                      {pIndex + 1}
                                    </ThemedText>
                                    <Image
                                      source={
                                        product.images[0]?.file_full_url
                                          ? {
                                              uri: `${baseUrl}${product.images[0]?.file_full_url}`,
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
                      <ThemedText
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#333",
                          marginBottom: 10,
                          textAlign: "center",
                        }}
                      >
                        {col.name}
                      </ThemedText>
                      {col.products.length === 0 ? (
                        <ThemedText
                          style={{ textAlign: "center", color: "#aaa" }}
                        >
                          No products
                        </ThemedText>
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
                            <ThemedText
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                marginRight: 5,
                                width: 20,
                              }}
                            >
                              {pIndex + 1}
                            </ThemedText>
                            <Image
                              source={
                                product.images[0]?.file_full_url
                                  ? {
                                      uri: `${baseUrl}${product.images[0]?.file_full_url}`,
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
        (display_type === "product" || display_type === "new-items") &&
        section.variable_source === "products" && (
          <View>
            {items.slice(0, 3).map((item: any, index: number) => (
              <View key={item._id || index}>
                <TouchableOpacity
                  key={item._id || index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 5,
                    paddingHorizontal: 20,
                    gap: 20,
                  }}
                  onPress={() => router.push(`/product/${item._id}`)}
                >
                  <Image
                    source={
                      item.images[0]?.file_full_url
                        ? {
                            uri: `${baseUrl}${item.images[0]?.file_full_url}`,
                          }
                        : require("@/assets/images/bg_8.png")
                    }
                    style={{ width: 100, height: 70, resizeMode: "contain" }}
                  />
                  <View>
                    <ThemedText
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    >
                      {item.brand?.name || item.name}
                    </ThemedText>
                    <ThemedText
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
                    </ThemedText>
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
                    height: 10,
                    objectFit: "cover",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                />
              </View>
            ))}
          </View>
        )}

      {display_style === 1 && display_type === "brand" && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            paddingHorizontal: 25,
          }}
        >
          {section.brands?.map((brand: any) => {
            return (
              <TouchableOpacity
                onPress={() => router.push(`/brand/${brand._id}`)}
                key={brand._id}
                style={{
                  borderWidth: 1,
                  borderColor: "#fff",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                <ThemedText style={{ color: "#fff" }}>{brand?.name}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {display_style === 1 && display_type === "category" && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {section.categories?.length > 0 &&
            section.categories.map((item: any, index: number) => (
              <TouchableOpacity
                key={item._id}
                style={{
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => router.push(`/category/${item.id}`)}
              >
                <Image
                  source={
                    item.images[0]?.file_full_url
                      ? { uri: `${baseUrl}${item.images[0]?.file_full_url}` }
                      : require("@/assets/images/bg_8.png")
                  }
                  style={{
                    width: 100,
                    height: 100,
                    resizeMode: "contain",
                  }}
                />
                <ThemedText style={{ color: "#fff" }}>{item.name}</ThemedText>
              </TouchableOpacity>
            ))}
        </ScrollView>
      )}

      {display_style === 2 &&
        display_type === "hot-items" &&
        section.variable_source === "products" &&
        section.categories?.length > 0 && (
          <View>
            {products
              .filter((product: any) =>
                section.categories.some(
                  (c: any) =>
                    c._id === product.categoryId ||
                    c._id === product.category?._id
                )
              )
              .slice(0, items_per_column || 5)
              .map((item: any, index: number) => (
                <View key={item._id || index}>
                  <TouchableOpacity
                    key={item._id || index}
                    style={[
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 15,
                        justifyContent: "space-between",
                      },
                      { paddingHorizontal: 20, gap: 20 },
                    ]}
                    onPress={() => router.push(`/product/${item._id}`)}
                  >
                    <Image
                      source={
                        item.images[0]?.file_full_url
                          ? {
                              uri: `${baseUrl}${item.images[0]?.file_full_url}`,
                            }
                          : require("@/assets/images/bg_8.png")
                      }
                      style={{
                        width: 100,
                        height: 70,
                        objectFit: "contain",
                        marginBottom: 15,
                      }}
                    />
                    <View
                      style={{
                        flex: 1,
                        alignItems: "flex-start",
                        justifyContent: "center",
                        gap: 5,
                      }}
                    >
                      <ThemedText
                        type="title"
                        style={{
                          color: "#fff",
                          fontSize: 16,
                          fontWeight: "bold",
                        }}
                      >
                        {item.brand?.name}
                      </ThemedText>
                      <ThemedText
                        style={{
                          fontSize: 14,
                          color: "#888",
                        }}
                      >
                        {item.name} - Size:
                        {item.variations
                          .slice(0, 2)
                          .map((v: any) => v.optionName)
                          .join(` ${item.attribute.name}, `)}{" "}
                        {item.attribute.name} {item.richDescription}{" "}
                        {item.description}
                      </ThemedText>
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

      {display_style === 1 &&
        display_type === "most-popular" &&
        section.mode === "auto" &&
        section.variable_source === "products" && (
          <View>
            {products
              .sort((a: any, b: any) =>
                section.autoCriteria?.sortBy === "newest"
                  ? new Date(b.dateCreated).getTime() -
                    new Date(a.dateCreated).getTime()
                  : section.autoCriteria?.sortBy === "price-asc"
                  ? a.retailPrice - b.retailPrice
                  : section.autoCriteria?.sortBy === "price-desc"
                  ? b.retailPrice - a.retailPrice
                  : b.numViews - a.numViews
              )
              .slice(0, items_per_column || 5)
              .map((item: any, index: number) => (
                <View key={item._id || index}>
                  <TouchableOpacity
                    key={item._id || index}
                    style={[
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 15,
                        justifyContent: "space-between",
                      },
                      { paddingHorizontal: 20, gap: 20 },
                    ]}
                    onPress={() => router.push(`/product/${item._id}`)}
                  >
                    <Image
                      source={
                        item.images[0]?.file_full_url
                          ? {
                              uri: `${baseUrl}${item.images[0]?.file_full_url}`,
                            }
                          : require("@/assets/images/bg_8.png")
                      }
                      style={{
                        width: 100,
                        height: 70,
                        objectFit: "contain",
                        marginBottom: 15,
                      }}
                    />
                    <View>
                      <ThemedText style={{ fontSize: 16, fontWeight: "bold" }}>
                        {item.name}
                      </ThemedText>
                      <ThemedText
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
                      </ThemedText>

                      <ThemedText style={{ fontSize: 14, color: COLORS.gray }}>
                        Lowest Ask
                      </ThemedText>
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
      {display_style === 2 && display_type === "product" && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            paddingHorizontal: 10,
          }}
        >
          {items.map((item: any, index: number) => (
            <TouchableOpacity
              key={item._id || index}
              style={{
                borderRadius: 10,
              }}
              onPress={() => router.push(`/product/${item._id}`)}
            >
              <Image
                source={
                  item.images[0]?.file_full_url
                    ? { uri: `${baseUrl}${item.images[0]?.file_full_url}` }
                    : require("@/assets/images/bg_8.png")
                }
                style={{
                  width: boxWidth || SIZES.width / 3 - 20,
                  height: boxHeight || SIZES.width / 3 - 20,
                  resizeMode: "contain",
                }}
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
      params: { title: text, query: text },
    });
  };

  // Render product grid for search results
  const renderProductGrid = () => (
    <View style={styles.gridContainer}>
      {products.map((item: any) => (
        <TouchableOpacity
          key={item._id}
          onPress={() => {
            setModalVisible(false);
            router.push(`/product/${item._id}`);
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
      <ThemedText style={styles.suggestionText}>{item}</ThemedText>
    </TouchableOpacity>
  );

  // Modal content for search input, suggestions, history, and product results
  const renderSearchModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setModalVisible(false)}
    >
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
          <TouchableOpacity onPress={() => setModalVisible(false)}>
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
              <View key={index} style={styles.recentRow}>
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
    </Modal>
  );

  // Render dynamic sections (default content)
  const renderDynamicSections = () => (
    <View>
      {sections &&
        sections
          .sort((a: any, b: any) => a.order - b.order)
          .filter((section: any) => section.pageType === "search")
          .map((section: any, index: number) =>
            renderDynamicSection(
              index,
              section,
              products,
              fetchedCategories,
              brands,
              router
            )
          )}
    </View>
  );

  // Category section with horizontal scroll
  const renderCategorySection = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ padding: 10 }}
      >
        {fetchedCategories.length > 0 &&
          fetchedCategories.map((item: any, index: number) => (
            <TouchableOpacity
              key={item._id}
              style={{
                borderRadius: 10,
                marginLeft: 15,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => router.push(`/category/${item.id}`)}
            >
              <Image
                source={
                  item.image_full_url
                    ? { uri: `${baseUrl}${item.image_full_url}` }
                    : require("@/assets/images/bg_8.png")
                }
                style={{
                  width: SIZES.width / 3 - 20,
                  height: SIZES.width / 3 - 20,
                }}
              />
              <Text style={{ color: "#fff", fontSize: 16 }}>{item.name}</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Constants.statusBarHeight }]}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      {/* Search Bar */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <View style={styles.searchBarContainer}>
          <ThemedText style={{ color: "#fff", fontSize: 16 }}>
            {query || "Search"}
          </ThemedText>
          {query && (
            <Ionicons
              name="close"
              size={20}
              color="#fff"
              onPress={() => {
                setQuery("");
                setModalVisible(false);
                Keyboard.dismiss();
                inputRef.current?.blur();
                setSearching(false);
              }}
              style={{ marginLeft: "auto" }}
            />
          )}
        </View>
      </TouchableOpacity>

      {renderSearchModal()}
      {/* Default Content */}
      {!searching && (
        <ScrollView>
          {renderCategorySection()}
          {renderDynamicSections()}
        </ScrollView>
      )}

      {searching && (
        <ScrollView style={{ flex: 1 }}>{renderProductGrid()}</ScrollView>
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

export default SearchTab;
