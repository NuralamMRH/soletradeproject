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
  useCreateBrand,
  useCreateSubBrand,
  useUpdateBrand,
  useUpdateSubBrand,
} from "@/hooks/react-query/useBrandMutations";
import { useBrands } from "@/hooks/useBrands";
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
};
type Category = {
  _id?: string;
  id?: string;
  name: string;
};

type Params = {
  model?: Model;
};

export default function AddNewModelPage() {
  const router = useRouter();
  const paramsRaw = useLocalSearchParams();
  const params: Params = {
    model: paramsRaw.model ? JSON.parse(paramsRaw.model as string) : undefined,
  };
  const isEditing = !!params.model;

  const [categories, setCategories] = useState<Category[]>([]);

  const [bottomSheetType, setBottomSheetType] = useState<string>("brand");

  const [modelName, setModelName] = useState<string>("");
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null); // For upload

  const createModel = useCreateSoleCheckModel();
  const updateModel = useUpdateSoleCheckModel();
  const deleteModel = useDeleteSoleCheckModel();
  const isLoading =
    createModel.status === "pending" || updateModel.status === "pending";

  // For sub-brand parent selection
  const [brandId, setBrandId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const { brands: allBrands, loading: loadingBrands } =
    useSoleCheckBrands() as {
      brands: Brand[];
      loading: boolean;
      error: any;
    };

  const { categories: allCategories, loading: loadingCategories } =
    useCategories() as {
      categories: Category[];
      loading: boolean;
      error: any;
    };

  useEffect(() => {
    if (!loadingCategories) {
      const filteredCategories = allCategories.filter(
        (category) => category.type === "sole-check"
      );
      setCategories(filteredCategories);
    }
  }, [allCategories, loadingCategories]);

  // Bottom sheet ref and snap points
  const bottomSheetModalRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["40%", "60%"], []);

  // Handle bottom sheet opening
  const openBottomSheet = () => {
    bottomSheetModalRef.current?.snapToIndex(1);
  };

  // Handle bottom sheet closing
  const handleCloseBottomSheet = () => {
    setTimeout(() => {
      bottomSheetModalRef.current?.close();
    }, 0);
  };

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  useEffect(() => {
    if (isEditing && params.model && modelName === "") {
      setModelName(params.model.name || "");
      // Only set the image if a new one hasn't been picked
      setModelImage((prev) => {
        if (
          prev &&
          prev !== params.model?.image &&
          prev !== params.model?.image_full_url
        ) {
          return prev; // Don't overwrite if user picked a new image
        }
        // Use image_full_url if available, else image
        const url = params.model?.image_full_url || params.model?.image;
        if (!url) return null;
        return url.startsWith("http") ? url : `${baseUrl}${url}`;
      });
      setBrandId(params.model?.brandId || null);
      setCategoryId(params.model?.categoryId || null);
    }
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, [isEditing, params.model]);

  const handleSave = async () => {
    if (!modelName.trim()) {
      Alert.alert("Error", "Please enter a model name");
      return;
    }
    if (!modelImage) {
      Alert.alert("Error", "Please upload a model image");
      return;
    }

    const data: any = {
      name: modelName,
      image: imageFile, // File or Blob
      brandId: brandId,
      categoryId: categoryId,
    };

    try {
      if (isEditing && params.model?.id) {
        await updateModel.mutateAsync({ id: params.model.id, ...data });
      } else {
        await createModel.mutateAsync(data);
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
        setModelImage(asset.uri);
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
    setModelImage(null);
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
            await deleteModel.mutateAsync(id);
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
                  {isEditing ? "Edit Model" : "Add New Model"}
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

  console.log("BottomSheet ref:", bottomSheetModalRef.current);

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
            value={modelName}
            onChangeText={setModelName}
            placeholder="Type name"
            placeholderTextColor="#999"
          />
        </View>
        {/* Parent Brand Selector for Sub-brand */}

        <View style={styles.imageSection}>
          <Text style={styles.inputLabel}>Upload Brand logo</Text>
          {modelImage ? (
            <View style={styles.imageContainer}>
              <TouchableOpacity
                onPress={handleAddImage}
                style={{ alignSelf: "center" }}
              >
                <Image
                  source={{ uri: modelImage }}
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

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Brand</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => {
              console.log("Opening bottom sheet");
              setBottomSheetType("brand");
              openBottomSheet();
            }}
          >
            <Text style={{ color: brandId ? "#333" : "#999" }}>
              {brandId
                ? allBrands.find((brand) => brand.id === brandId)?.name
                : "Select brand"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Category</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => {
              console.log("Opening bottom sheet");
              setBottomSheetType("category");
              openBottomSheet();
            }}
          >
            <Text style={{ color: categoryId ? "#333" : "#999" }}>
              {categoryId
                ? allCategories.find((category) => category.id === categoryId)
                    ?.name
                : "Select category"}
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
            marginBottom: 70,
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
      <BottomSheet
        index={-1}
        snapPoints={snapPoints}
        ref={bottomSheetModalRef}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backgroundStyle={{
          backgroundColor: "#000",
          borderRadius: 0,
        }}
        handleIndicatorStyle={{
          backgroundColor: "white",
        }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <View style={[styles.subContainer, { flex: 1 }]}>
            <Text style={styles.sheetTitle}>
              {bottomSheetType === "brand" ? "Select Brand" : "Select Category"}
            </Text>
            {bottomSheetType === "brand" && loadingBrands ? (
              <ActivityIndicator size="large" color="#8B0000" />
            ) : (
              <FlatList
                data={bottomSheetType === "brand" ? allBrands : categories}
                keyExtractor={(item) =>
                  item._id ? String(item._id) : String(item.id)
                }
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.brandItem}
                    onPress={() => {
                      if (bottomSheetType === "brand") {
                        setBrandId(
                          item._id ? String(item._id) : String(item.id)
                        );
                      } else {
                        setCategoryId(
                          item._id ? String(item._id) : String(item.id)
                        );
                      }
                      handleCloseBottomSheet();
                    }}
                  >
                    <Text style={styles.brandItemText}>{item.name}</Text>
                  </Pressable>
                )}
              />
            )}
          </View>
        </BottomSheetView>
      </BottomSheet>
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
});
