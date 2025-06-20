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
import { useProduct } from "@/hooks/useProduct";
import ContentLoader, { Rect } from "react-content-loader/native";
import LottieView from "lottie-react-native";
import AddToPortfolio from "@/components/product/AddToPortfolio";

const { width } = Dimensions.get("window");

// Mock product data

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

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
      <AddToPortfolio product={productData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
