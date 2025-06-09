import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProduct } from "@/hooks/useProduct";
import Essential from "@/components/product/Essential";
import Deal from "@/components/product/Deal";

const { width } = Dimensions.get("window");

// Mock product data
const product = {
  id: "1",
  name: "Nike Air Max",
  price: 299.99,
  description:
    "The Nike Air Max is a classic running shoe that combines style and comfort. Perfect for both casual wear and athletic activities.",
  images: [
    require("../../assets/images/shoe1.png"),
    require("../../assets/images/shoe2.png"),
  ],
  sizes: ["US 7", "US 8", "US 9", "US 10", "US 11"],
  colors: ["#000000", "#FFFFFF", "#FF0000"],
};

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  console.log("id", id);
  const {
    product: productData,
    loading,
    error,
    refetch,
  } = useProduct(id as string);

  useEffect(() => {
    refetch();
  }, [id]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      {productData?.product_type === "essential" ? (
        <Essential product={productData} />
      ) : (
        <Deal product={productData} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
