import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { baseUrl } from "@/api/MainApi";
import Colors from "@/constants/Colors";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";
import { useSoleCheckBrands } from "@/hooks/useSoleCheckBrands";

// Add this type at the top (or import if you have it elsewhere)
type Brand = {
  _id: string;
  name: string;
  image_full_url?: string;
  // add other properties if needed
};

export default function SoleCheckManageBrands() {
  const router = useRouter();

  const { brands, loading, error, refetch } = useSoleCheckBrands();

  useFocusEffect(
    useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // console.log("Categories", categories);
  const handleAddNewBrand = () => {
    router.push({
      pathname: "/admin/sole-check/add-new-brand",
    });
  };

  const handleEditBrand = (brand: any) => {
    router.push({
      pathname: "/admin/sole-check/add-new-brand",
      params: {
        brand: JSON.stringify(brand),
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
              <Text style={styles.sectionTitle}>Brands</Text>
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
      <FlatList
        contentContainerStyle={[styles.subContainer, { paddingTop: 20 }]}
        data={brands as Brand[]}
        keyExtractor={(brand) => brand._id}
        renderItem={({ item: brand }) => (
          <TouchableOpacity
            style={styles.brandCard}
            onPress={() => handleEditBrand(brand)}
          >
            <Image
              source={
                brand.image_full_url
                  ? {
                      uri: brand.image_full_url.startsWith("http")
                        ? brand.image_full_url
                        : `${baseUrl}${brand.image_full_url}`,
                    }
                  : require("@/assets/images/bg_8.png")
              }
              style={styles.brandImage}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>{brand.name}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => (
          <Image
            source={require("@/assets/images/icons/divider.png")}
            style={{
              width: "100%",
              height: 40,
              resizeMode: "contain",
              alignSelf: "center",
            }}
          />
        )}
        ListHeaderComponent={
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.title}>Manage Brand</Text>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={handleAddNewBrand}
            >
              <Ionicons name="add" size={20} color="#333" />
              <Text style={{ color: "#333", fontSize: 16 }}>Add New</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
    backgroundColor: "#F2F2F7",
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
