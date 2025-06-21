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
import {
  useCreateCategory,
  useUpdateCategory,
  useCreateSubCategory,
  useUpdateSubCategory,
} from "@/hooks/react-query/useCategoryMutations";
import Toast from "react-native-toast-message";
import Colors from "@/constants/Colors";
import { baseUrl } from "@/api/MainApi";
import { useCategories } from "@/hooks/useCategories";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

// Type for category (adjust as needed)
type Category = {
  _id?: string;
  id?: string;
  name: string;
  image?: string; // URL or local URI
  image_full_url?: string;
  parentCategory?: {
    _id?: string;
    name?: string;
  };
};

type Params = {
  category?: Category;
  type?: string;
};

export default function AddNewCategoryPage() {
  const router = useRouter();
  const paramsRaw = useLocalSearchParams();
  const params: Params = {
    category: paramsRaw.category
      ? JSON.parse(paramsRaw.category as string)
      : undefined,
    type: paramsRaw.type ? (paramsRaw.type as string) : undefined,
  };
  const isSoleCheck = params.type === "sole-check";

  const isEditing = !!params.category;

  const isSubcategory =
    typeof paramsRaw.isSubcategory === "string"
      ? paramsRaw.isSubcategory === "true"
      : false;

  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryImage, setCategoryImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null); // For upload

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const createSubCategory = useCreateSubCategory();
  const updateSubCategory = useUpdateSubCategory();
  const isLoading =
    createCategory.status === "pending" ||
    updateCategory.status === "pending" ||
    createSubCategory.status === "pending" ||
    updateSubCategory.status === "pending";

  // For subcategory parent selection
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [parentCategoryName, setParentCategoryName] = useState<string>("");
  const { categories: allCategories, loading: loadingCategories } =
    useCategories() as { categories: Category[]; loading: boolean; error: any };

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
    if (isEditing && params.category && categoryName === "") {
      setCategoryName(params.category.name || "");
      // Only set the image if a new one hasn't been picked
      setCategoryImage((prev) => {
        if (
          prev &&
          prev !== params.category?.image &&
          prev !== params.category?.image_full_url
        ) {
          return prev; // Don't overwrite if user picked a new image
        }
        // Use image_full_url if available, else image
        const url = params.category?.image_full_url || params.category?.image;
        if (!url) return null;
        return url.startsWith("http") ? url : `${baseUrl}${url}`;
      });
      setParentCategoryId(params.category?.parentCategory?._id || null);
      setParentCategoryName(params.category?.parentCategory?.name || "");
    }
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, [isEditing, params.category]);

  useEffect(() => {
    console.log("Category Image", categoryImage);
  }, [categoryImage]);

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }
    if (!categoryImage) {
      Alert.alert("Error", "Please upload a category image");
      return;
    }
    if (isSubcategory && !parentCategoryId) {
      Alert.alert("Error", "Please select a parent category");
      return;
    }

    const data: any = {
      name: categoryName,
      image: imageFile, // File or Blob
      type: isSoleCheck ? "sole-check" : "general",
    };
    if (isSubcategory) {
      data.parentCategory = parentCategoryId;
    }
    try {
      if (isSubcategory && isEditing && params.category?.id) {
        await updateSubCategory.mutateAsync({
          id: params.category.id,
          ...data,
        });
        Toast.show({ type: "success", text1: "Subcategory updated" });
      } else if (isEditing && !isSubcategory && params.category?.id) {
        await updateCategory.mutateAsync({ id: params.category.id, ...data });
        Toast.show({ type: "success", text1: "Category updated" });
      } else if (isSubcategory) {
        await createSubCategory.mutateAsync(data);
        Toast.show({ type: "success", text1: "Subcategory created" });
      } else {
        await createCategory.mutateAsync(data);
        Toast.show({ type: "success", text1: "Category created" });
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
        setCategoryImage(asset.uri);
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
    setCategoryImage(null);
    setImageFile(null);
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
                  {isEditing ? "Edit Category" : "Add New Category"}
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
      <View style={[styles.subContainer, { paddingTop: 20 }]}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        ></View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {isSubcategory ? "Sub Category Name" : "Category Name"}
          </Text>
          <TextInput
            style={styles.textInput}
            value={categoryName}
            onChangeText={setCategoryName}
            placeholder="Type name"
            placeholderTextColor="#999"
          />
        </View>
        {/* Parent Category Selector for Subcategory */}
        {isSubcategory && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Parent Category</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => {
                console.log("Opening bottom sheet");
                openBottomSheet();
              }}
            >
              <Text style={{ color: parentCategoryName ? "#333" : "#999" }}>
                {parentCategoryName || "Select parent category"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.imageSection}>
          <Text style={styles.inputLabel}>Upload Category logo</Text>
          {categoryImage ? (
            <View style={styles.imageContainer}>
              <TouchableOpacity
                onPress={handleAddImage}
                style={{ alignSelf: "center" }}
              >
                <Image
                  source={{ uri: categoryImage }}
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
      </View>
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
            <Text style={styles.sheetTitle}>Select Parent Category</Text>
            {loadingCategories ? (
              <ActivityIndicator size="large" color="#8B0000" />
            ) : (
              <FlatList
                data={allCategories}
                keyExtractor={(item) =>
                  item._id ? String(item._id) : String(item.id)
                }
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.categoryItem}
                    onPress={() => {
                      setParentCategoryId(
                        item._id ? String(item._id) : String(item.id)
                      );
                      setParentCategoryName(item.name);
                      handleCloseBottomSheet();
                    }}
                  >
                    <Text style={styles.categoryItemText}>{item.name}</Text>
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
  categoryItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryItemText: {
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
