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

// Type for brand (adjust as needed)
type Brand = {
  _id?: string;
  id?: string;
  name: string;
  image?: string; // URL or local URI
  image_full_url?: string;
  parentBrand?: {
    _id?: string;
    name?: string;
  };
};

type Params = {
  brand?: Brand;
};

export default function AddNewBrandPage() {
  const router = useRouter();
  const paramsRaw = useLocalSearchParams();
  const params: Params = {
    brand: paramsRaw.brand ? JSON.parse(paramsRaw.brand as string) : undefined,
  };
  const isEditing = !!params.brand;

  const isSubBrand =
    typeof paramsRaw.isSubBrand === "string"
      ? paramsRaw.isSubBrand === "true"
      : false;

  const [brandName, setBrandName] = useState<string>("");
  const [brandImage, setBrandImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null); // For upload

  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const createSubBrand = useCreateSubBrand();
  const updateSubBrand = useUpdateSubBrand();
  const isLoading =
    createBrand.status === "pending" ||
    updateBrand.status === "pending" ||
    createSubBrand.status === "pending" ||
    updateSubBrand.status === "pending";

  // For sub-brand parent selection
  const [parentBrandId, setParentBrandId] = useState<string | null>(null);
  const [parentBrandName, setParentBrandName] = useState<string>("");
  const { brands: allBrands, loading: loadingBrands } = useBrands() as {
    brands: Brand[];
    loading: boolean;
    error: any;
  };

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
      setParentBrandId(params.brand?.parentBrand?._id || null);
      setParentBrandName(params.brand?.parentBrand?.name || "");
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
    if (isSubBrand && !parentBrandId) {
      Alert.alert("Error", "Please select a parent brand");
      return;
    }
    const data: any = {
      name: brandName,
      image: imageFile, // File or Blob
    };
    if (isSubBrand) {
      data.parentBrand = parentBrandId;
    }
    try {
      if (isSubBrand && isEditing && params.brand?.id) {
        await updateSubBrand.mutateAsync({
          id: params.brand.id,
          ...data,
        });
        Toast.show({ type: "success", text1: "Sub-brand updated" });
      } else if (isEditing && !isSubBrand && params.brand?.id) {
        await updateBrand.mutateAsync({ id: params.brand.id, ...data });
        Toast.show({ type: "success", text1: "Brand updated" });
      } else if (isSubBrand) {
        await createSubBrand.mutateAsync(data);
        Toast.show({ type: "success", text1: "Sub-brand created" });
      } else {
        await createBrand.mutateAsync(data);
        Toast.show({ type: "success", text1: "Brand created" });
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
            {isSubBrand ? "Sub Brand Name" : "Brand Name"}
          </Text>
          <TextInput
            style={styles.textInput}
            value={brandName}
            onChangeText={setBrandName}
            placeholder="Type name"
            placeholderTextColor="#999"
          />
        </View>
        {/* Parent Brand Selector for Sub-brand */}
        {isSubBrand && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Parent Brand</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => {
                console.log("Opening bottom sheet");
                openBottomSheet();
              }}
            >
              <Text style={{ color: parentBrandName ? "#333" : "#999" }}>
                {parentBrandName || "Select parent brand"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.imageSection}>
          <Text style={styles.inputLabel}>Upload Brand logo</Text>
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
            <Text style={styles.sheetTitle}>Select Parent Brand</Text>
            {loadingBrands ? (
              <ActivityIndicator size="large" color="#8B0000" />
            ) : (
              <FlatList
                data={allBrands}
                keyExtractor={(item) =>
                  item._id ? String(item._id) : String(item.id)
                }
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.brandItem}
                    onPress={() => {
                      setParentBrandId(
                        item._id ? String(item._id) : String(item.id)
                      );
                      setParentBrandName(item.name);
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
