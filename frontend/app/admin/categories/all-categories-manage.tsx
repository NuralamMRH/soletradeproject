import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCategories } from "@/hooks/useCategories";
import { baseUrl } from "@/api/MainApi";
import Colors from "@/constants/Colors";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";
import { useSubCategories } from "@/hooks/useSubCategories";

type Params = {
  isSubcategory?: boolean;
  type?: string;
};

export default function AllCategoriesManagePage() {
  const router = useRouter();
  const paramsRaw = useLocalSearchParams();
  const parentCategoryId =
    typeof paramsRaw.parentCategoryId === "string"
      ? paramsRaw.parentCategoryId
      : null;
  const type = typeof paramsRaw.type === "string" ? paramsRaw.type : null;
  const isSoleCheck = type === "sole-check";
  const isSubcategory =
    typeof paramsRaw.isSubcategory === "string"
      ? paramsRaw.isSubcategory === "true"
      : false;

  const subCat = useSubCategories(parentCategoryId);
  const cat = useCategories();

  const categories = isSubcategory ? subCat.subCategories : cat.categories;

  const loading = isSubcategory ? subCat.loading : cat.loading;
  const error = isSubcategory ? subCat.error : cat.error;

  const refetch = isSubcategory ? subCat.refetch : cat.refetch;

  useFocusEffect(
    useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // console.log("Categories", categories);
  const handleAddNewCategory = () => {
    router.push({
      pathname: "/admin/categories/add-new-category",
      params: {
        isSubcategory: isSubcategory.toString(),
        type: isSoleCheck ? "sole-check" : "general",
      },
    });
  };

  const handleEditCategory = (category: any) => {
    router.push({
      pathname: "/admin/categories/add-new-category",
      params: {
        category: JSON.stringify(category),
        isSubcategory: isSubcategory.toString(),
        type: isSoleCheck ? "sole-check" : "general",
      },
    });
  };

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
              <TouchableOpacity
                style={{ padding: 5 }}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={25} color={"black"} />
              </TouchableOpacity>
            </View>

            <View style={[styles.headerCenter, { flex: 3 }]}>
              <Text style={styles.sectionTitle}>Categories</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity style={{ padding: 5 }}>
                <Ionicons
                  name="notifications-outline"
                  size={25}
                  color={"black"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView>
        <View style={[styles.subContainer, { paddingTop: 20 }]}>
          <Text style={styles.title}>
            {isSubcategory ? "Manage Sub Category" : "Manage Category"}
          </Text>
          <View style={styles.categoriesGrid}>
            {categories
              .filter((category: any) =>
                isSoleCheck ? category.type === "sole-check" : true
              )
              .map((category: any) => (
                <TouchableOpacity
                  key={category._id}
                  style={styles.categoryCard}
                  onPress={() => handleEditCategory(category)}
                >
                  <Image
                    source={
                      category.image_full_url
                        ? {
                            uri: category.image_full_url.startsWith("http")
                              ? category.image_full_url
                              : `${baseUrl}${category.image_full_url}`,
                          }
                        : require("@/assets/images/bg_8.png")
                    }
                    style={styles.categoryImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            <TouchableOpacity
              style={{
                width: "48%",
                padding: 16,
                marginBottom: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={handleAddNewCategory}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                }}
              >
                <Ionicons name="add" size={40} color="#333" />
              </View>
              <Text style={styles.addNewText}>Add New</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  //Header section style
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  //Header section style close
  container: {
    flex: 1,
  },
  subContainer: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  categoryImage: {
    width: 130,
    height: 130,
    marginBottom: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryName: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  addNewCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    height: 150,
  },
  addNewText: {
    fontSize: 16,
    marginTop: 8,
    color: "#333",
  },
});
