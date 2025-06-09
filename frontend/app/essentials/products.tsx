import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

import { Image } from "expo-image";
import { router } from "expo-router";
import AdminHeader from "@/components/AdminHeader";
import { useProducts } from "@/hooks/useProducts";
import { baseUrl } from "@/api/MainApi";

const SoleEssentialsProducts = () => {
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: "all",
    brands: [],
  });
  const { products, loading } = useProducts({
    filter: {
      product_type: "essential",
      keyword: searchQuery,
    },
  });

  const applyFilters = () => {
    let filtered = [...products];

    // Filter by price range
    if (filters.priceRange !== "all") {
      filtered = filtered.filter((item) => {
        const price = item?.retailPrice || 0;
        if (filters.priceRange === "low" && price <= 500) return true;
        if (filters.priceRange === "medium" && price > 500 && price <= 1000)
          return true;
        if (filters.priceRange === "high" && price > 1000) return true;
        return false;
      });
    }

    // Filter by brands
    if (filters.brands.length > 0) {
      filtered = filtered.filter((item) =>
        filters.brands.includes(item.brand.name)
      );
    }

    setFilteredProducts(filtered);
    setShowFilter(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item._id}`)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `${baseUrl}${item.images[0]?.file_full_url}` }}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.brandName}>{item.brand?.name}</Text>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.price}>{item.retailPrice} Baht</Text>
        {item.indicator && (
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
              source={{ uri: `${baseUrl}${item.indicator?.image_full_url}` }}
              style={{
                width: 15,
                height: 15,
                marginRight: 5,
                tintColor: "#fff",
              }}
            />
            <Text style={styles.expressText}>{item.indicator?.name}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <View style={styles.filterModal}>
      <View style={styles.filterHeader}>
        <TouchableOpacity onPress={() => setShowFilter(false)}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.filterTitle}>Filter By</Text>
        <TouchableOpacity
          onPress={() => {
            setFilters({ priceRange: "all", brands: [] });
            setFilteredProducts(products);
            setShowFilter(false);
          }}
        >
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Price Range</Text>
        <TouchableOpacity
          style={[
            styles.filterOption,
            filters.priceRange === "all" && styles.selectedOption,
          ]}
          onPress={() => setFilters({ ...filters, priceRange: "all" })}
        >
          <Text style={styles.filterOptionText}>All Prices</Text>
          <View style={styles.radioButton}>
            {filters.priceRange === "all" && (
              <View style={styles.radioButtonSelected} />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterOption,
            filters.priceRange === "low" && styles.selectedOption,
          ]}
          onPress={() => setFilters({ ...filters, priceRange: "low" })}
        >
          <Text style={styles.filterOptionText}>Under 500 Baht</Text>
          <View style={styles.radioButton}>
            {filters.priceRange === "low" && (
              <View style={styles.radioButtonSelected} />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterOption,
            filters.priceRange === "medium" && styles.selectedOption,
          ]}
          onPress={() => setFilters({ ...filters, priceRange: "medium" })}
        >
          <Text style={styles.filterOptionText}>500 - 1000 Baht</Text>
          <View style={styles.radioButton}>
            {filters.priceRange === "medium" && (
              <View style={styles.radioButtonSelected} />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterOption,
            filters.priceRange === "high" && styles.selectedOption,
          ]}
          onPress={() => setFilters({ ...filters, priceRange: "high" })}
        >
          <Text style={styles.filterOptionText}>Over 1000 Baht</Text>
          <View style={styles.radioButton}>
            {filters.priceRange === "high" && (
              <View style={styles.radioButtonSelected} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
        <Text style={styles.applyButtonText}>Apply Filters</Text>
      </TouchableOpacity>
    </View>
  );

  // <StatusBar barStyle="dark-content" backgroundColor="#fff" />
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <AdminHeader
        left={
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <View style={{ marginLeft: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                Sole Essentials
              </Text>
              <Text style={{ fontSize: 12, color: "#666" }}>
                {products.length} Results
              </Text>
            </View>
          </View>
        }
        right={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilter(true)}
            >
              <MaterialCommunityIcons
                name="filter-outline"
                size={24}
                color="#000"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <Ionicons name="menu-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <Ionicons name="cart-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        }
      />

      {/* <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View> */}

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => String(item._id)}
        numColumns={2}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
      />

      {showFilter && renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultsText: {
    fontSize: 14,
    color: "#666",
  },
  productList: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  imageContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    padding: 12,
  },
  brandName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  productName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
  },
  expressTag: {
    marginTop: 8,
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  expressText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  filterModal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: "80%",
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  clearText: {
    fontSize: 14,
    color: "#094622",
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#f9f9f9",
  },
  filterOptionText: {
    fontSize: 14,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#000",
  },
  applyButton: {
    margin: 16,
    backgroundColor: "#000",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SoleEssentialsProducts;
