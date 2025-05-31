import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { baseUrl } from "@/api/MainApi";
import Colors from "@/constants/Colors";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";
import { useAttributes } from "@/hooks/useAttributes";
import { useAttributeOptions } from "@/hooks/useAttributeOptions";

type Params = {
  attributeId?: string;
};

// Add this type at the top (or import if you have it elsewhere)
type Attribute = {
  _id: string;
  name: string;
  image_full_url?: string;
  // add other properties if needed
};

export default function AllAttributesManagePage() {
  const router = useRouter();
  const paramsRaw = useLocalSearchParams();
  const attributeId =
    typeof paramsRaw.attributeId === "string" ? paramsRaw.attributeId : null;
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState("");
  const isAttributeOption =
    typeof paramsRaw.isAttributeOption === "string"
      ? paramsRaw.isAttributeOption === "true"
      : false;

  const attributeOptions = useAttributeOptions(attributeId);
  const attribute = useAttributes();

  const attributes = isAttributeOption
    ? attributeOptions.attributeOptions
    : attribute.attributes.filter((x: any) =>
        x.name.toLowerCase().includes(searchText.toLowerCase())
      );
  const loading = isAttributeOption
    ? attributeOptions.loading
    : attribute.loading;
  const error = isAttributeOption ? attributeOptions.error : attribute.error;
  const refetch = isAttributeOption
    ? attributeOptions.refetch
    : attribute.refetch;

  useFocusEffect(
    useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // console.log("Categories", categories);
  const handleAddNewAttribute = () => {
    router.push({
      pathname: "/admin/attributes/add-new-attribute",
      params: { isAttributeOption: isAttributeOption.toString() },
    });
  };

  const handleEditAttribute = (attribute: any) => {
    router.push({
      pathname: "/admin/attributes/add-new-attribute",
      params: {
        attribute: JSON.stringify(attribute),
        isAttributeOption: isAttributeOption.toString(),
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
              <Text style={styles.sectionTitle}>Attributes</Text>
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
      {searchActive && (
        <View style={styles.subContainer}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 8,
              marginVertical: 10,
            }}
            placeholder="Search attributes..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
        </View>
      )}
      <FlatList
        contentContainerStyle={[styles.subContainer, { paddingTop: 20 }]}
        data={attributes as Attribute[]}
        keyExtractor={(attribute) => attribute._id}
        renderItem={({ item: attribute }) => (
          <TouchableOpacity
            style={styles.attributeCard}
            onPress={() => handleEditAttribute(attribute)}
          >
            {attribute.image_full_url ? (
              <Image
                source={
                  attribute.image_full_url
                    ? {
                        uri: attribute.image_full_url.startsWith("http")
                          ? attribute.image_full_url
                          : `${baseUrl}${attribute.image_full_url}`,
                      }
                    : require("@/assets/images/bg_8.png")
                }
                style={styles.attributeImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.attributeImage}>
                <Text
                  style={[
                    styles.attributeName,
                    { textAlign: "center", fontSize: 30 },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {attribute.name.toUpperCase().slice(0, 2)}
                </Text>
              </View>
            )}

            <Text style={styles.attributeName}>{attribute.name}</Text>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.title}>
              {isAttributeOption
                ? "Manage Attribute Option"
                : "Manage Attribute"}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  setSearchActive(!searchActive);
                  setSearchText("");
                }}
              >
                <Ionicons
                  name={!searchActive ? "search" : "close"}
                  size={20}
                  color="#333"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={handleAddNewAttribute}
              >
                <Ionicons name="add" size={20} color="#333" />
                <Text style={{ color: "#333", fontSize: 16 }}>Add New</Text>
              </TouchableOpacity>
            </View>
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
  attributesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  attributeCard: {
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
  attributeImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderColor: "#8B0000",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  attributeName: {
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
