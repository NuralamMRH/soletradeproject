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
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import {
  useCreateSoleCheckModel,
  useDeleteSoleCheckModel,
  useUpdateSoleCheckModel,
} from "@/hooks/react-query/useSoleCheckModelMutations";
import { useSoleCheckModels } from "@/hooks/useSoleCheckModels";
import { useSoleCheckBrands } from "@/hooks/useSoleCheckBrands";
import { useCategories } from "@/hooks/useCategories";
import { showNotification } from "@/hooks/useLocalNotifications";
import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants";
import {
  useCreateSoleCheckLabel,
  useDeleteSoleCheckLabel,
  useUpdateSoleCheckLabel,
} from "@/hooks/react-query/useSoleCheckLabelMutations";

// Type for brand (adjust as needed)
type Model = {
  _id?: string;
  id?: string;
  name: string;
  image?: string; // URL or local URI
  image_full_url?: string;
  categoryId?: string;
  brandId?: string;
};
type Brand = {
  _id?: string;
  id?: string;
  name: string;
  image?: string; // URL or local URI
  image_full_url?: string;
  categoryId?: string;
  modelId?: string;
};
type Label = {
  _id?: string;
  id?: string;
  name: string;
  image?: string; // URL or local URI
  image_full_url?: string;
  categoryId?: string;
  brandId?: string;
  modelId?: string;
  forAllSelectedBrands?: boolean;
  forAllSelectedModels?: boolean;
};
type Category = {
  _id?: string;
  id?: string;
  name: string;
  image?: string; // URL or local URI
  image_full_url?: string;
};

type Params = {
  label?: Label;
  brandId?: string;
  categoryId?: string;
  modelId?: string;
};

export default function AddNewLabelPage() {
  const router = useRouter();
  const paramsRaw = useLocalSearchParams();
  const params: Params = {
    label: paramsRaw.label ? JSON.parse(paramsRaw.label as string) : undefined,
  };
  const isEditing = !!params.label;

  const [labelName, setLabelName] = useState<string>("");
  const [forAllSelectedBrands, setForAllSelectedBrands] =
    useState<boolean>(false);
  const [forAllSelectedModels, setForAllSelectedModels] =
    useState<boolean>(false);
  const [labelImage, setLabelImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null); // For upload

  const createLabel = useCreateSoleCheckLabel();
  const updateLabel = useUpdateSoleCheckLabel();
  const deleteLabel = useDeleteSoleCheckLabel();
  const isLoading =
    createLabel.status === "pending" || updateLabel.status === "pending";

  // For sub-brand parent selection

  const { brands: allBrands, loading: loadingBrands } =
    useSoleCheckBrands() as {
      brands: Brand[];
      loading: boolean;
      error: any;
    };

  const { models: allModels, loading: loadingModels } =
    useSoleCheckModels() as {
      models: Model[];
      loading: boolean;
      error: any;
    };

  useEffect(() => {
    if (isEditing && params.label && labelName === "") {
      setLabelName(params.label.name || "");
      setForAllSelectedBrands(params.label.forAllSelectedBrands || false);
      setForAllSelectedModels(params.label.forAllSelectedModels || false);
      // Only set the image if a new one hasn't been picked
      setLabelImage((prev) => {
        if (
          prev &&
          prev !== params.label?.image &&
          prev !== params.label?.image_full_url
        ) {
          return prev; // Don't overwrite if user picked a new image
        }
        // Use image_full_url if available, else image
        const url = params.label?.image_full_url || params.label?.image;
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
  }, [isEditing, params.label]);

  const handleSave = async () => {
    if (!labelName.trim()) {
      Alert.alert("Error", "Please enter a label name");
      return;
    }
    if (!labelImage) {
      Alert.alert("Error", "Please upload a label image");
      return;
    }

    const data: any = {
      name: labelName,
      image: imageFile, // File or Blob
      brandId: paramsRaw.brandId,
      categoryId: paramsRaw.categoryId,
      modelId: paramsRaw.modelId,
      forAllSelectedBrands: forAllSelectedBrands,
      forAllSelectedModels: forAllSelectedModels,
    };

    try {
      if (isEditing && params.label?.id) {
        await updateLabel.mutateAsync({ id: params.label.id, ...data });
      } else {
        await createLabel.mutateAsync(data);
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
        setLabelImage(asset.uri);
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
    setLabelImage(null);
    setImageFile(null);
  };

  const handleRemoveBrand = (id: string) => {
    Alert.alert("Delete Brand", "Are you sure you want to delete this brand?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteLabel.mutateAsync(id);
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
                  {isEditing ? "Edit Label" : "Add New Label"}
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

  return (
    <View style={styles.container}>
      {renderHeader()}
      <View style={[styles.subContainer, { paddingTop: 20, flex: 1 }]}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        ></View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Model Name</Text>
          <TextInput
            style={styles.textInput}
            value={labelName}
            onChangeText={setLabelName}
            placeholder="Type name"
            placeholderTextColor="#999"
          />
        </View>
        {/* Parent Brand Selector for Sub-brand */}

        <View style={styles.imageSection}>
          <Text style={styles.inputLabel}>Upload Brand logo</Text>
          {labelImage ? (
            <View style={styles.imageContainer}>
              <TouchableOpacity
                onPress={handleAddImage}
                style={{ alignSelf: "center" }}
              >
                <Image
                  source={{ uri: labelImage }}
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

        <View style={{ padding: 10 }}>
          <TouchableOpacity
            style={styles.inlinePickerItem}
            onPress={() => setForAllSelectedBrands(!forAllSelectedBrands)}
          >
            <Ionicons
              name={forAllSelectedBrands ? "checkbox" : "square-outline"}
              size={20}
              color={COLORS.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: forAllSelectedBrands ? COLORS.primary : undefined,
              }}
            >
              Add this Variable to all{" "}
              {params.brandId
                ? allBrands.find((brand) => brand.id === paramsRaw.brandId)
                    ?.name
                : ""}{" "}
              Brands
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inlinePickerItem}
            onPress={() => setForAllSelectedModels(!forAllSelectedModels)}
          >
            <Ionicons
              name={forAllSelectedModels ? "checkbox" : "square-outline"}
              size={20}
              color={COLORS.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: forAllSelectedModels ? COLORS.primary : undefined,
              }}
            >
              Add this Variable to all{" "}
              {params.modelId
                ? allModels.find((model) => model.id === paramsRaw.modelId)
                    ?.name
                : ""}{" "}
              Models
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isEditing && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30,
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
            onPress={() => handleRemoveBrand(params.model?._id || "")}
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
    borderWidth: 2,
    borderColor: "#8B0000",
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
});
