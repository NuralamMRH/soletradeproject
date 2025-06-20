import { baseUrl } from "@/api/MainApi";
import AdminHeader from "@/components/AdminHeader";
import { SIZES } from "@/constants";
import { useListCreation } from "@/context/ListCreationContext";
import { useSubBrands } from "@/hooks/useSubBrands";
import { useSubCategories } from "@/hooks/useSubCategories";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";

const Brand = () => {
  const params = useLocalSearchParams();
  const id = params.id;

  const { subBrands, loading: isLoadingBrand } = useSubBrands(id as string);
  const { clearAll } = useListCreation();
  const renderSubBrand = ({ item: subBrand }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        clearAll();
        router.push({
          pathname: "/search/search-results",
          params: {
            title: subBrand.name,
            filter: JSON.stringify({
              subBrandId: subBrand.id,
              product_type: "deal",
            }),
          },
        });
      }}
      key={subBrand._id}
      style={styles.subBrandCard}
    >
      <Image
        source={{
          uri: `${baseUrl}${subBrand.image_full_url}`,
        }}
        style={styles.subBrandImage}
      />
      <Text style={styles.subBrandName}>{subBrand.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Sub Brands" onBack={() => router.back()} />
      <View style={{ flex: 1 }}>
        <FlatList
          data={subBrands}
          renderItem={renderSubBrand}
          keyExtractor={(item) => String(item._id)}
          numColumns={3}
          contentContainerStyle={styles.subBrandList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  subBrandList: {
    padding: 8,
  },
  subBrandCard: {
    width: (SIZES.width - 32) / 3,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  subBrandImage: {
    width: "100%",
    height: "70%",
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "cover",
  },
  subBrandName: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Brand;
