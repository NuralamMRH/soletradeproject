import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import Colors from "@/constants/Colors";
// Mock data for products
const products = [
  {
    id: "1",
    name: "Nike Air Max",
    price: 299.99,
    image: require("../../assets/images/shoe1.png"),
    category: "Shoes",
  },
  {
    id: "2",
    name: "Adidas Ultraboost",
    price: 249.99,
    image: require("../../assets/images/shoe2.png"),
    category: "Shoes",
  },
  // Add more products as needed
];

const categories = ["All", "Shoes", "Clothing", "Accessories", "Electronics"];

export default function HomeScreen() {
  const renderProduct = ({ item }) => (
    <Link href={`/product/${item.id}`} asChild>
      <TouchableOpacity style={styles.productCard}>
        <Image source={item.image} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>${item.price}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

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
        <View
          style={{
            paddingBottom: 5,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <TouchableOpacity style={{ paddingLeft: 10 }}>
                <Ionicons name="bookmark-outline" size={25} color={"black"} />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={require("@/assets/images/top-logo.png")}
                style={{
                  maxWidth: 150,
                  height: 40,
                  resizeMode: "cover",
                }}
              />
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                paddingRight: 10,
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <>
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
              </>
            </View>
          </View>
        </View>
        {/* <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <Text style={styles.searchText}>Search products...</Text>
        </View> */}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryButton,
              index === 0 && styles.categoryButtonActive,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                index === 0 && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsGrid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 10,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: "#666",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  cartButton: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  searchText: {
    marginLeft: 10,
    color: "#666",
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#f5f5f5",
  },
  categoryButtonActive: {
    backgroundColor: "#007AFF",
  },
  categoryText: {
    color: "#666",
  },
  categoryTextActive: {
    color: "#fff",
  },
  productsGrid: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "bold",
  },
});
