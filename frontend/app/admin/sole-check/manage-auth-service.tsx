import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCategories } from "@/hooks/useCategories";
import { baseUrl } from "@/api/MainApi";
import Colors from "@/constants/Colors";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";
import { SIZES } from "@/constants";
import { ThemedText } from "@/components/ThemedText";

import { useSoleCheckAuthServices } from "@/hooks/useSoleCheckAuthServices";

type Params = {
  isSubcategory?: boolean;
  type?: string;
};
type Brand = {
  _id: string;
  name: string;
  image_full_url?: string;
  // add other properties if needed
};

export default function ManageAuthServicePage() {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const { categories, loading, refetch } = useCategories();

  const {
    authServices,
    loading: authServiceLoading,
    refetch: authServiceRefetch,
  } = useSoleCheckAuthServices();

  useFocusEffect(
    useCallback(() => {
      refetch();
      authServiceRefetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleAddNewService = () => {
    router.push({
      pathname: "/admin/sole-check/add-new-service",
      params: {
        categoryId: categoryId,
      },
    });
  };
  const handleEditService = (service: any) => {
    router.push({
      pathname: "/admin/sole-check/add-new-service",
      params: {
        service: JSON.stringify(service),
        categoryId: categoryId,
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
              <Text style={styles.sectionTitle}>Manage Auth Service</Text>
            </View>

            <View style={styles.headerRight}></View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {!categoryId && (
        <>
          <View style={{ padding: 10 }}>
            <Text style={styles.sectionTitle}>Select Category</Text>
          </View>
          <ScrollView>
            <View style={[styles.subContainer, { paddingTop: 20 }]}>
              <View style={styles.categoriesGrid}>
                {categories
                  .filter((category: any) => category.type === "sole-check")
                  .map((category: any) => (
                    <TouchableOpacity
                      key={category._id}
                      style={styles.categoryCard}
                      onPress={() => setCategoryId(category._id)}
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
              </View>
            </View>
          </ScrollView>
        </>
      )}

      {categoryId && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              padding: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ThemedText type="subtitle">
              {
                categories.find((category: any) => category._id === categoryId)
                  ?.name
              }
            </ThemedText>
            <TouchableOpacity
              onPress={() => handleAddNewService()}
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <ThemedText type="default">Add new package</ThemedText>
              <Ionicons name="add" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.modelsGrid}>
            {authServices
              .filter((service: any) => service.categoryId === categoryId)
              .map((service: any) => (
                <TouchableOpacity
                  key={service._id}
                  onPress={() => handleEditService(service)}
                  style={{
                    width: SIZES.width / 2 - 16,
                    height: SIZES.width / 2 - 80,
                    backgroundColor: "#fff",
                    borderRadius: 18,
                    padding: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 3,
                    borderColor: Colors.brandDarkColor,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ThemedText type="subtitle">{service.name}</ThemedText>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Image
                      source={require("@/assets/images/logo2.png")}
                      style={{
                        width: 20,
                        height: 20,
                      }}
                      resizeMode="contain"
                    />
                    <ThemedText type="subtitle" style={styles.modelName}>
                      {service.credit} Credits
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        </ScrollView>
      )}
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

  brandsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  brandCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 40,
  },
  brandImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderColor: "#8B0000",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  brandName: {
    fontSize: 16,
    textAlign: "left",
    color: "#333",
    width: "100%",
    fontWeight: "bold",
  },
  modelsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 10,
  },
  modelCard: {
    // width: SIZES.width / 3 - 20,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: "center",
    backgroundColor: "#000",
    gap: 10,
  },
  modelImage: {
    width: SIZES.width / 3 - 20,
    height: SIZES.width / 3 - 20,
    marginBottom: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modelName: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
});
