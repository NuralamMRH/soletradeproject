import { baseUrl } from "@/api/MainApi";
import AdminHeader from "@/components/AdminHeader";
import { SIZES } from "@/constants";
import { useListCreation } from "@/context/ListCreationContext";
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

const Id = () => {
  const params = useLocalSearchParams();
  const id = params.id;

  const { subCategories, loading: isLoadingCategory } = useSubCategories(
    id as string
  );
  const { clearAll } = useListCreation();
  // console.log("subCategories", subCategories);

  const renderSubCategory = ({ item: subCategory }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        clearAll();
        router.push({
          pathname: "/search/search-results",
          params: {
            title: subCategory.name,
            filter: JSON.stringify({ subCategoryId: subCategory.id }),
          },
        });
      }}
      key={subCategory._id}
      style={styles.subCategoryCard}
    >
      <Image
        source={{
          uri: `${baseUrl}${subCategory.image_full_url}`,
        }}
        style={styles.subCategoryImage}
      />
      <Text style={styles.subCategoryName}>{subCategory.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Sub Categories" onBack={() => router.back()} />
      <View style={{ flex: 1 }}>
        <FlatList
          data={subCategories}
          renderItem={renderSubCategory}
          keyExtractor={(item) => String(item._id)}
          numColumns={3}
          contentContainerStyle={styles.subCategoryList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  subCategoryList: {
    padding: 8,
  },
  subCategoryCard: {
    width: (SIZES.width - 32) / 3,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  subCategoryImage: {
    width: "100%",
    height: "70%",
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "cover",
  },
  subCategoryName: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Id;
