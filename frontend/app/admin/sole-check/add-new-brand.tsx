import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
// @ts-ignore
import type * as ImagePickerTypes from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";

import Toast from "react-native-toast-message";
import Colors from "@/constants/Colors";
import { baseUrl } from "@/api/MainApi";

import { useBrands } from "@/hooks/useBrands";
import {
  useCreateSoleCheckBrand,
  useDeleteSoleCheckBrand,
  useUpdateSoleCheckBrand,
} from "@/hooks/react-query/useSoleCheckBrandMutations";
import { useCategories } from "@/hooks/useCategories";
import { COLORS } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { showNotification } from "@/hooks/useLocalNotifications";

// Type for brand (adjust as needed)
type Brand = {
  _id?: string;
  id?: string;
  name: string;
  image?: string; // URL or local URI
  image_full_url?: string;
  categories?: any[];
  parentBrand?: {
    _id?: string;
    name?: string;
  };
};

type Params = {
  brand?: Brand;
};

export default function AddNewSoleCheckBrandPage() {
  const router = useRouter();
  const paramsRaw = useLocalSearchParams();
  const params: Params = {
    brand: paramsRaw.brand ? JSON.parse(paramsRaw.brand as string) : undefined,
  };
  const isEditing = !!params.brand;

  const [brandName, setBrandName] = useState<string>("");
  const [brandImage, setBrandImage] = useState<string | null>(null);

  const [categories, setCategories] = useState<any[]>(
    params.brand?.categories || []
  );

  const [imageFile, setImageFile] = useState<any>(null); // For upload

  const createBrand = useCreateSoleCheckBrand();
  const updateBrand = useUpdateSoleCheckBrand();
  const deleteBrand = useDeleteSoleCheckBrand();

  const isLoading =
    createBrand.status === "pending" || updateBrand.status === "pending";

  const { categories: allCategories, loading: loadingCategories } =
    useCategories();
  // Handle bottom sheet opening
  const soleCategories = allCategories.filter(
    (cat: any) => cat.type === "sole-check"
  );
  // callbacks

  useEffect(() => {
    if (isEditing && params.brand && brandName === "") {
      setBrandName(params.brand.name || "");
      // Only set the image if a new one hasn't been picked
      setBrandImage((prev) => {
        if (
          prev &&
          prev !== params.brand?.image &&
          prev !== params.brand?.image_full_url
        ) {
          return prev; // Don't overwrite if user picked a new image
        }
        // Use image_full_url if available, else image
        const url = params.brand?.image_full_url || params.brand?.image;
        if (!url) return null;
        return url.startsWith("http") ? url : `${baseUrl}${url}`;
      });
    }

    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, [isEditing, params.brand]);

  const handleSave = async () => {
    if (!brandName.trim()) {
      Alert.alert("Error", "Please enter a brand name");
      return;
    }
    if (!brandImage) {
      Alert.alert("Error", "Please upload a brand image");
      return;
    }

    const data: any = {
      name: brandName,
      image: imageFile, // File or Blob
      categories: categories,
    };

    try {
      if (isEditing && params.brand?.id) {
        await updateBrand.mutateAsync({ id: params.brand.id, ...data });
      } else {
        await createBrand.mutateAsync(data);
      }
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Something went wrong");
    }
  };

  const handleAddImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setBrandImage(asset.uri);
        // Convert to file/blob for upload
        if (Platform.OS === "web") {
          // Web: fetch the blob
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          setImageFile(blob);
        } else {
          // Native: use uri as file
          console.log("Asset", asset.uri);
          setImageFile({
            uri: asset.uri,
            name: asset.fileName || "image.jpg",
            type: asset.type || "image/jpeg",
          });
        }
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  const handleRemoveImage = () => {
    setBrandImage(null);
    setImageFile(null);
  };

  const handleSelectCategory = (category: any) => {
    //Toggle selection
    if (categories.includes(category._id)) {
      setCategories(categories.filter((itemId) => itemId !== category._id));
    } else {
      setCategories([...categories, category._id]);
    }
  };

  const handleSelectAllCategories = () => {
    if (categories.length === soleCategories.length) {
      setCategories([]);
    } else {
      setCategories(soleCategories.map((item: any) => item._id));
    }
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
              <Text style={styles.sectionTitle}>
                <Text style={styles.title}>
                  {isEditing ? "Edit Brand" : "Add New Brand"}
                </Text>
              </Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#8B0000" />
                ) : (
                  <Text style={styles.saveButton}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const handleRemoveBrand = (id: string) => {
    Alert.alert("Delete Brand", "Are you sure you want to delete this brand?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteBrand.mutateAsync(id);
            router.back();
          } catch (error: any) {
            showNotification({
              title: "Error",
              body: error?.message || "Failed to delete brand",
            });
          }
        },
      },
    ]);
    // Find the portfolio entry for this product
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[styles.subContainer, { paddingTop: 20, flex: 1 }]}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        ></View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Brand Name</Text>
          <TextInput
            style={styles.textInput}
            value={brandName}
            onChangeText={setBrandName}
            placeholder="Type name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.imageSection}>
          <Text style={styles.inputLabel}>Upload Brand Logo</Text>
          {brandImage ? (
            <View style={styles.imageContainer}>
              <TouchableOpacity
                onPress={handleAddImage}
                style={{ alignSelf: "center" }}
              >
                <Image
                  source={{ uri: brandImage }}
                  style={styles.imagePreview}
                />
                {/* Remove button at top right */}
                <TouchableOpacity
                  onPress={handleRemoveImage}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={28} color="#D32F2F" />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleAddImage}
            >
              <Ionicons name="add" size={30} color="#8B0000" />
            </TouchableOpacity>
          )}
        </View>

        <View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <ThemedText type="subtitle" style={styles.inputLabel}>
              Choose Category to display brand in
            </ThemedText>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: "#8B0000",
                borderRadius: 8,
                padding: 12,
                backgroundColor: "#fff",
              }}
              onPress={() => handleSelectAllCategories()}
            >
              <Text>
                {categories.length === soleCategories.length
                  ? "Clear All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inlinePickerList}>
            {soleCategories.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                style={styles.inlinePickerItem}
                onPress={() => handleSelectCategory(cat)}
              >
                <Ionicons
                  name={
                    categories.includes(cat._id) ? "checkbox" : "square-outline"
                  }
                  size={20}
                  color={COLORS.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: categories.includes(cat._id)
                      ? COLORS.primary
                      : undefined,
                  }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {isEditing && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            paddingHorizontal: 16,
            gap: 10,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: COLORS.gray2,
              paddingVertical: 10,
            }}
            onPress={() => router.back()}
          >
            <ThemedText type="subtitle" style={{ color: "#fff" }}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: COLORS.brandDarkColor,
              paddingVertical: 10,
            }}
            onPress={() => handleRemoveBrand(params.brand?._id || "")}
          >
            <ThemedText type="subtitle" style={{ color: "#fff" }}>
              Delete
            </ThemedText>
          </TouchableOpacity>
        </View>
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
  subContainer: {
    paddingHorizontal: 16,
  },
  //Container section style
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    paddingHorizontal: 15,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  textInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#8B0000",
    paddingVertical: 8,
    fontSize: 16,
  },
  imageSection: {
    marginBottom: 30,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  uploadButton: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: "#8B0000",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  imageContainer: {
    marginTop: 10,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  removeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "white",
    borderRadius: 14,
    zIndex: 2,
  },
  selectButton: {
    borderWidth: 1,
    borderColor: "#8B0000",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "60%",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#ffffff",
  },
  brandItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  brandItemText: {
    fontSize: 16,
    color: "#ffffff",
  },
  closeButton: {
    marginTop: 16,
    alignSelf: "center",
    padding: 10,
    backgroundColor: "#8B0000",
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  inlinePickerList: {
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 4,
  },
  inlinePickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectAllBtn: {
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },
  selectAllText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 13,
  },
});
