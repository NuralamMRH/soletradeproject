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
import ContentLoader, { Rect } from "react-content-loader/native";
import LottieView from "lottie-react-native";

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
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LottieView
          source={require("@/assets/animation/Animation - 1749724935003.json")}
          autoPlay
          loop
          style={{ width: 120, height: 120, marginBottom: 24 }}
        />
        <ContentLoader
          speed={1}
          width={width - 32}
          height={400}
          viewBox={`0 0 ${width - 32} 400`}
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          {/* Image area */}
          <Rect x="0" y="0" rx="16" ry="16" width={width - 32} height="220" />
          {/* Title */}
          <Rect x="0" y="240" rx="6" ry="6" width="180" height="24" />
          {/* Price */}
          <Rect x="0" y="275" rx="6" ry="6" width="120" height="20" />
          {/* Buy button */}
          <Rect x="0" y="320" rx="10" ry="10" width="160" height="44" />
          {/* Sell button */}
          <Rect x="180" y="320" rx="10" ry="10" width="160" height="44" />
        </ContentLoader>
      </View>
    );
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
