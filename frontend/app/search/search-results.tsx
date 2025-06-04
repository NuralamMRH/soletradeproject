import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useProducts } from "@/hooks/useProducts";
import { Ionicons } from "@expo/vector-icons";
import { baseUrl } from "@/api/MainApi";
import Constants from "expo-constants";
export default function SearchResultsPage() {
  const router = useRouter();
  const { query } = useLocalSearchParams();
  const { products, loading } = useProducts({ filter: { keyword: query } });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: Constants.statusBarHeight,
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{query}</Text>
        <View style={{ flexDirection: "row" }}>
          <Ionicons name="filter" size={24} style={{ marginHorizontal: 8 }} />
          <Ionicons name="menu" size={24} />
        </View>
      </View>
      <Text style={styles.resultCount}>{products.length} Results</Text>
      {/* Product Grid */}
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <Image
              source={
                item.image_full_url
                  ? { uri: `${baseUrl}${item.image_full_url}` }
                  : require("@/assets/images/bg_8.png")
              }
              style={styles.gridImage}
            />
            <Text style={styles.brand}>{item.brand?.name}</Text>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.price}>
              {item.retailPrice ? `${item.retailPrice} Baht` : ""}
            </Text>
            <Text style={styles.lowestAsk}>Lowest Ask</Text>
            {/* Add badges and icons as needed */}
          </View>
        )}
        contentContainerStyle={styles.gridContainer}
      />
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
  gridContainer: { paddingHorizontal: 8 },
  gridItem: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    elevation: 1,
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
  lowestAsk: { fontSize: 12, color: "#888" },
});
