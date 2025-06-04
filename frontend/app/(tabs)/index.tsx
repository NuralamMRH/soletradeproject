import React, { useState, useEffect } from "react";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import Colors from "@/constants/Colors";
import { useSections } from "@/hooks/useSections";
import { useLanguage } from "@/context/LanguageContext";
import { useAppContent } from "@/context/AppContentContext";
import { useGetHomeFeedButtons } from "@/hooks/react-query/homeFeedButtonApi";
import { COLORS, SIZES } from "@/constants";
import { baseUrl } from "@/api/MainApi";
import { useAuth } from "../../hooks/useAuth";
import SwiperFlatList from "react-native-swiper-flatlist";
import { useProducts } from "@/hooks/useProducts";
import { useBrands } from "@/hooks/useBrands";
import { useCategories } from "@/hooks/useCategories";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  ImageSourcePropType,
} from "react-native";

interface HomeFeedButton {
  _id: string;
  name: string;
  link: string;
  image_full_url: string;
}

interface Product {
  _id: string;
  name: string;
  brand?: { name: string };
  retailPrice?: number;
  rating?: number;
  numViews?: number;
  dateCreated: string;
  image_full_url?: string;
  product_type?: string;
}

interface Section {
  isActive: boolean;
  variable_source: "products" | "categories" | "brands";
  products?: Product[];
  categories?: any[];
  brands?: any[];
  name: string;
  description?: string;
  display_style: number;
  column_count?: number;
  column_names?: Record<string, string>;
  column_products?: any;
  items_per_column?: number;
  mode: "auto" | "manual";
  autoCriteria?: {
    productType: "essential" | "auction" | "deal" | "all";
    sortBy: "newest" | "popular" | "price-asc" | "price-desc" | "rating";
    minRating: number;
    priceRange: {
      min: number;
      max: number;
    };
  };
  number_of_items?: number;
  order?: number;
  _id: string;
}

interface ProductCardProps {
  index?: number;
  brand: string;
  name: string;
  price: string;
  image: ImageSourcePropType;
}

type SectionType = {
  type: string;
  id: string;
  data?: Section;
};

type AppContent = {
  homeSlider?: Array<{ file_fill_url: string }>;
};

const { width } = Dimensions.get("window");

// 1. Define your sort types
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

export default function HomeScreen() {
  const { isAuthenticated, user } = useAuth();
  const { language, t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [theme, setTheme] = useState("light");
  const [selectedTab, setSelectedTab] = useState("Sneakers");
  const router = useRouter();

  const [filter, setFilter] = useState({
    product_type: "deal",
  });

  const { products, loading, error, refetch } = useProducts({
    filter: JSON.stringify(filter),
  });

  const { brands, loading: brandsLoading, error: brandsError } = useBrands();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  // console.log("products", products);
  // console.log("brands", brands);
  // console.log("categories", categories);

  // Fetch home feed buttons
  const { data: circleButtons = [], isLoading: circleButtonsLoading } =
    useGetHomeFeedButtons("circle");
  const { data: squareButtons = [], isLoading: squareButtonsLoading } =
    useGetHomeFeedButtons("square");

  // Fetch app content (for slider)
  const {
    appContent,
    loading: contentLoading,
    fetchAppContent,
  } = useAppContent();

  // console.log("appContent", appContent);

  // Fetch dynamic sections
  const {
    sections: homeFeedSections,
    loading: sectionsLoading,
    refetch: refetchSections,
  } = useSections();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchAppContent(), refetchSections()]).finally(() =>
      setRefreshing(false)
    );
  }, [fetchAppContent, refetchSections]);

  const [sortOffset, setSortOffset] = useState(0);

  // On reload, increment sortOffset
  const handleReload = () => setSortOffset((prev) => prev + 1);

  // Header component with logo and icons
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
              <TouchableOpacity style={{ paddingLeft: 10 }}>
                <Ionicons name="bookmark-outline" size={25} color={"black"} />
              </TouchableOpacity>
            </View>

            <View style={styles.headerCenter}>
              <Image
                source={require("@/assets/images/top-logo.png")}
                style={styles.logo}
              />
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity style={{ padding: 5 }}>
                <Ionicons name="search-outline" size={25} color={"black"} />
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 5 }}>
                <Ionicons
                  name="notifications-outline"
                  size={25}
                  color={"black"}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.cartButton}>
                <Ionicons name="cart-outline" size={24} color="#333" />
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>2</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render circle and square buttons section
  const renderButtonSection = () => {
    if (circleButtonsLoading || squareButtonsLoading) {
      return <ActivityIndicator size="small" color={COLORS.brandColor} />;
    }

    return (
      <>
        <View style={styles.buttonSectionContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buttonScrollContainer}
          >
            {circleButtons.map((item, index) => (
              <TouchableOpacity
                key={item._id || index}
                style={styles.buttonContainer}
                onPress={() => router.push(item.link || "/")}
              >
                <View style={styles.circleButton}>
                  <Image
                    source={{
                      uri: baseUrl + item?.image_full_url,
                    }}
                    style={styles.buttonImage}
                  />
                </View>
                <Text style={styles.buttonText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.buttonSectionContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buttonScrollContainer}
          >
            {squareButtons.map((item, index) => (
              <TouchableOpacity
                key={item._id || index}
                style={styles.buttonContainer}
                onPress={() => router.push(item.link || "/")}
              >
                <View style={styles.squareButton}>
                  <Image
                    source={{
                      uri: baseUrl + item?.image_full_url,
                    }}
                    style={styles.buttonImage}
                  />
                </View>
                <Text style={styles.buttonText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </>
    );
  };

  // Category section with horizontal scroll
  const renderCategorySection = () => {
    return (
      <View style={styles.categorySectionContainer}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContainer}
        >
          {categories.length > 0 &&
            categories.map((item: any, index: number) => (
              <TouchableOpacity
                key={item._id}
                style={[styles.categoryCard, { marginLeft: 15 }]}
                onPress={() => router.push("/category/sneakers")}
              >
                <Image
                  source={
                    item.image_full_url
                      ? { uri: `${baseUrl}${item.image_full_url}` }
                      : require("@/assets/images/bg_8.png")
                  }
                  style={styles.categoryImage}
                />
                <Text style={styles.categoryName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    );
  };

  // Hot items section with horizontal scroll
  const renderHotItemsSection = () => {
    return (
      <View style={styles.productSectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hot Items</Text>
          <TouchableOpacity onPress={() => router.push("/hot-items")}>
            <Text style={styles.viewMoreText}>View More &gt;</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productScrollContainer}
        >
          {/* Example product cards */}
          {products.slice(0, 5).map((product: any, index: number) => (
            <View key={product._id}>
              <ProductCard
                index={index + 1}
                brand={product.brand?.name || ""}
                name={product.name}
                price={product.retailPrice ? `${product.retailPrice} Baht` : ""}
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

  // Recommended section with horizontal scroll
  const renderRecommendedSection = () => {
    return (
      <View style={styles.productSectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <TouchableOpacity onPress={() => router.push("/recommended")}>
            <Text style={styles.viewMoreText}>View More &gt;</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productScrollContainer}
        >
          {/* Example product cards */}
          {products.slice(0, 5).map((product: any, index: number) => (
            <View key={product._id}>
              <ProductCard
                index={index + 1}
                brand={product.brand?.name || ""}
                name={product.name}
                price={product.retailPrice ? `${product.retailPrice} Baht` : ""}
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

  // Most Popular section with tabs
  const renderMostPopularSection = () => {
    return (
      <View style={styles.mostPopularContainer}>
        <Text style={styles.sectionTitle}>Most Popular</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "Sneakers" && styles.activeTab]}
            onPress={() => setSelectedTab("Sneakers")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "Sneakers" && styles.activeTabText,
              ]}
            >
              Sneakers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "Apparels" && styles.activeTab]}
            onPress={() => setSelectedTab("Apparels")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "Apparels" && styles.activeTabText,
              ]}
            >
              Apparels
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.popularItemsContainer}>
          {selectedTab === "Sneakers" ? (
            <View style={styles.popularColumnContainer}>
              <View style={styles.popularColumn}>
                {[1, 2, 3, 4].map((num) => (
                  <View key={`sneaker-${num}`} style={styles.popularItem}>
                    <Text style={styles.popularItemNumber}>{num}</Text>
                    <Image
                      source={
                        num === 1
                          ? require("@/assets/images/asics.png")
                          : num === 2
                          ? require("@/assets/images/nb.png")
                          : num === 3
                          ? require("@/assets/images/adidas.png")
                          : require("@/assets/images/nike.png")
                      }
                      style={styles.popularItemImage}
                    />
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.popularColumnContainer}>
              <View style={styles.popularColumn}>
                {[1, 2, 3, 4].map((num) => (
                  <View key={`apparel-${num}`} style={styles.popularItem}>
                    <Text style={styles.popularItemNumber}>{num}</Text>
                    <Image
                      source={
                        num === 1
                          ? require("@/assets/images/stussy.png")
                          : num === 2
                          ? require("@/assets/images/essentials.png")
                          : num === 3
                          ? require("@/assets/images/stussy-ball.png")
                          : require("@/assets/images/flowers.png")
                      }
                      style={styles.popularItemImage}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Top Brands section
  const renderTopBrandsSection = () => {
    return (
      <View style={styles.topBrandsContainer}>
        <Text style={styles.sectionTitle}>Top Brands</Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            paddingHorizontal: 10,
          }}
        >
          {brands.map((brand: any) => {
            return (
              <TouchableOpacity key={brand._id} style={styles.brandButton}>
                <Text style={styles.brandButtonText}>{brand?.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Product Card Component
  const ProductCard: React.FC<ProductCardProps> = ({
    index,
    brand,
    name,
    price,
    image,
  }) => (
    <TouchableOpacity style={styles.productCard}>
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
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="bookmark-outline" size={20} color="#000" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Filter and sort sections based on priority and conditions
  const sections = [
    { type: "SLIDER", id: "slider" },
    { type: "BUTTONS", id: "buttons" },
    { type: "CATEGORY", id: "category" },
    // Dynamic sections from API will be added here
    ...(homeFeedSections || [])
      .filter((section) => {
        // Skip if section is not active
        if (!section.isActive) return false;

        // Skip if section has no content based on variable_source
        if (
          section.variable_source === "products" &&
          (!section.products || section.products.length === 0)
        )
          return false;
        if (
          section.variable_source === "categories" &&
          (!section.categories || section.categories.length === 0)
        )
          return false;
        if (
          section.variable_source === "brands" &&
          (!section.brands || section.brands.length === 0)
        )
          return false;

        return true;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((section) => ({
        type: "DYNAMIC_SECTION",
        id: section._id,
        data: section,
      })),
    // Static sections
    { type: "HOT_ITEMS", id: "hot-items" },
    { type: "RECOMMENDED", id: "recommended" },
    { type: "MOST_POPULAR", id: "most-popular" },
    { type: "TOP_BRANDS", id: "top-brands" },
  ];

  // Process items based on mode and autoCriteria
  const processItems = (section: Section) => {
    if (section.mode === "auto") {
      let items = [];
      switch (section.variable_source) {
        case "products":
          items = products || [];
          // Apply autoCriteria filters
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
            // Sort items based on sortBy criteria
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
      // Limit items based on number_of_items
      return section.number_of_items > 0
        ? items.slice(0, section.number_of_items)
        : items;
    }
    return section.products || [];
  };

  // Render dynamic section based on API data
  const renderDynamicSection = (section) => {
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

    const items = processItems(section);

    console.log("name: ", name);
    // console.log("display_type: ", display_type);

    function buildColumns(
      products,
      column_count,
      items_per_column,
      column_names
    ) {
      let remaining = [...products];
      const columns = [];
      for (let i = 0; i < column_count; i++) {
        const sortType = sortTypes[(i + sortOffset) % sortTypes.length].key;
        const sorted = getSortedProducts(remaining, sortType);
        const colProducts = sorted.slice(0, items_per_column);
        // Remove these products from the pool
        remaining = remaining.filter((p) => !colProducts.includes(p));
        columns.push({
          name: column_names?.[`C${i + 1}`] || `Column ${i + 1}`,
          products: colProducts,
          sortType,
        });
        if (remaining.length === 0) break;
      }
      // If there are still products left, start over with the next sort type
      let colIndex = 0;
      while (remaining.length > 0 && columns.length < column_count) {
        const sortType =
          sortTypes[(colIndex + sortOffset) % sortTypes.length].key;
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
      <View style={styles.productSectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{name}</Text>
          <TouchableOpacity>
            <Text style={styles.viewMoreText}>View More &gt;</Text>
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
                contentContainerStyle={styles.columnContainer}
              >
                {mode === "manual"
                  ? column_products.map((item: any, index: number) => {
                      const colKey = `C${index + 1}`;
                      return (
                        <View key={item?.column} style={styles.column}>
                          <View>
                            <Text style={styles.columnTitle}>
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
                                      style={styles.popularItem}
                                      onPress={() =>
                                        router.push(`/product/${product._id}`)
                                      }
                                    >
                                      <Text style={styles.popularItemNumber}>
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
                                        style={styles.popularItemImage}
                                      />
                                    </TouchableOpacity>
                                  );
                                })
                            : null}
                        </View>
                      );
                    })
                  : columns.map((col, colIndex) => (
                      <View key={col.name + colIndex} style={styles.column}>
                        <Text style={styles.columnTitle}>{col.name}</Text>
                        {col.products.length === 0 ? (
                          <Text style={{ textAlign: "center", color: "#aaa" }}>
                            No products
                          </Text>
                        ) : (
                          col.products.map((product, pIndex) => (
                            <TouchableOpacity
                              key={product._id || pIndex}
                              style={styles.popularItem}
                              onPress={() =>
                                router.push(`/product/${product._id}`)
                              }
                            >
                              <Text style={styles.popularItemNumber}>
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
                                style={styles.popularItemImage}
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
                      style={[
                        styles.popularItem,
                        { paddingHorizontal: 20, gap: 20 },
                      ]}
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
                        style={styles.popularItemImage}
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
                    style={styles.imageOnlyStyle}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
      </View>
    );
  };

  // Render each section based on its type
  const renderSection = ({ item }: { item: SectionType }) => {
    switch (item.type) {
      case "SLIDER":
        return (
          <View style={styles.sliderContainer}>
            {contentLoading ? (
              <ActivityIndicator size="large" color={COLORS.brandColor} />
            ) : appContent?.homeSlider && appContent.homeSlider.length > 0 ? (
              <SwiperFlatList
                autoplay
                autoplayDelay={3000}
                autoplayLoop
                index={0}
                showPagination
                paginationActiveColor={COLORS.brandColor}
                paginationDefaultColor={COLORS.gray}
                paginationStyleItem={styles.paginationDot}
                data={[...appContent.homeSlider].reverse()}
                renderItem={({ item }) => (
                  <View style={styles.sliderSlide}>
                    <Image
                      source={{ uri: `${baseUrl}${item.file_full_url}` }}
                      style={styles.sliderImage}
                    />
                  </View>
                )}
              />
            ) : (
              <View style={styles.noContentContainer}>
                <Text>No slider content available</Text>
              </View>
            )}
          </View>
        );
      case "BUTTONS":
        return renderButtonSection();
      case "CATEGORY":
        return renderCategorySection();
      case "HOT_ITEMS":
        return renderHotItemsSection();
      case "RECOMMENDED":
        return renderRecommendedSection();
      // case "MOST_POPULAR":
      //   return renderMostPopularSection();
      case "DYNAMIC_SECTION":
        return renderDynamicSection(item.data);
      case "TOP_BRANDS":
        return renderTopBrandsSection();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.flatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imageOnlyCard: {
    width: width * 0.4,
    height: width * 0.4,
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: "hidden",
  },
  imageOnlyStyle: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  flatList: {
    flex: 1,
  },
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
  cartButton: {
    position: "relative",
    padding: 5,
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: COLORS.brandColor,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  sliderContainer: {
    height: 350,
    backgroundColor: "#fff",
  },
  sliderSlide: {
    width: SIZES.width,
    height: 350,
  },
  sliderImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  noContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonSectionContainer: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    marginBottom: 10,
  },
  buttonScrollContainer: {
    paddingHorizontal: 15,
  },
  buttonContainer: {
    alignItems: "center",
    marginRight: 20,
    width: 70,
  },
  circleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.brandColor,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  squareButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3f3f3f",
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  buttonImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  buttonText: {
    fontSize: 12,
    textAlign: "center",
    color: "#333",
  },
  categorySectionContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    marginBottom: 10,
  },
  categoryScrollContainer: {
    paddingRight: 15,
  },
  categoryCard: {
    width: width / 2 - 25,
    height: 120,
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  categoryImage: {
    width: "100%",
    height: 80,
    resizeMode: "contain",
  },
  categoryName: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
    color: "#333",
  },
  productSectionContainer: {
    backgroundColor: "#fff",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 15,
    marginVertical: 10,
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
    backgroundColor: "#fff",
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
  productImage: {
    width: "100%",
    height: 120,
    resizeMode: "contain",
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
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 5,
  },
  mostPopularContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 15,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: COLORS.brandColor,
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: COLORS.brandColor,
    fontWeight: "bold",
  },
  popularItemsContainer: {
    paddingHorizontal: 15,
  },
  popularColumnContainer: {
    flexDirection: "row",
  },
  popularColumn: {
    flex: 1,
  },
  popularItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    // gap: 5,
  },
  popularItemNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 5,
    width: 20,
  },
  popularItemImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  topBrandsContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingBottom: 25,
  },
  brandRowContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  brandButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#8b0612",
  },
  brandButtonText: {
    fontSize: 16,
    color: "#8b0612",
    fontWeight: "bold",
  },
  // New styles for dynamic sections
  columnContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
  },
  column: {
    flex: 1,
    marginRight: 20,
    maxWidth: SIZES.width / 2 - 20,
    overflow: "hidden",
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  columnProductInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
});
