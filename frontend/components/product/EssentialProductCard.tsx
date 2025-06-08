import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { Image } from "expo-image";
import { router } from "expo-router";
import { baseUrl } from "@/api/MainApi";

const EssentialProductCard = ({ item }: { item: any }) => {
  return (
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
};

const styles = StyleSheet.create({
  productCard: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
});

export default EssentialProductCard;
