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

import Colors from "@/constants/Colors";
import { baseUrl } from "@/api/MainApi";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import { useBrands } from "@/hooks/useBrands";
import {
  useCreateSoleCheckModel,
  useDeleteSoleCheckModel,
  useUpdateSoleCheckModel,
} from "@/hooks/react-query/useSoleCheckModelMutations";
import { useSoleCheckBrands } from "@/hooks/useSoleCheckBrands";
import { useCategories } from "@/hooks/useCategories";
import { showNotification } from "@/hooks/useLocalNotifications";
import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants";
import {
  useCreateSoleCheckTopUp,
  useDeleteSoleCheckTopUp,
  useUpdateSoleCheckTopUp,
} from "@/hooks/react-query/useSoleCheckTopUpMutations";

// Type for brand (adjust as needed)
type TopUp = {
  _id?: string;
  id?: string;
  name: string;
  image?: string; // URL or local URI
  image_full_url?: string;
  categoryId?: string;
  brandId?: string;
};

type Params = {
  topUp?: TopUp;
};

export default function AddNewTopUpPage() {
  const router = useRouter();
  const paramsRaw = useLocalSearchParams();
  const params: Params = {
    topUp: paramsRaw.topUp ? JSON.parse(paramsRaw.topUp as string) : undefined,
  };
  const isEditing = !!params.topUp;

  const [topUpName, setTopUpName] = useState<string>("");
  const [credit, setCredit] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [topUpImage, setTopUpImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null); // For upload

  const createTopUp = useCreateSoleCheckTopUp();
  const updateTopUp = useUpdateSoleCheckTopUp();
  const deleteTopUp = useDeleteSoleCheckTopUp();
  const isLoading =
    createTopUp.status === "pending" || updateTopUp.status === "pending";

  useEffect(() => {
    if (isEditing && params.topUp && topUpName === "") {
      setTopUpName(params.topUp.name || "");
      setCredit(params.topUp.credit || "");
      setPrice(params.topUp.price || "");
      // Only set the image if a new one hasn't been picked
      setTopUpImage((prev) => {
        if (
          prev &&
          prev !== params.topUp?.image &&
          prev !== params.topUp?.image_full_url
        ) {
          return prev; // Don't overwrite if user picked a new image
        }
        // Use image_full_url if available, else image
        const url = params.topUp?.image_full_url || params.topUp?.image;
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
  }, [isEditing, params.topUp]);

  const handleSave = async () => {
    if (!topUpName.trim()) {
      Alert.alert("Error", "Please enter a top up name");
      return;
    }
    if (!topUpImage) {
      Alert.alert("Error", "Please upload a top up image");
      return;
    }

    const data: any = {
      name: topUpName,
      image: imageFile,
      credit: credit,
      price: price,
    };

    try {
      if (isEditing && params.topUp?.id) {
        await updateTopUp.mutateAsync({ id: params.topUp.id, ...data });
      } else {
        await createTopUp.mutateAsync(data);
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
        setTopUpImage(asset.uri);
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
    setTopUpImage(null);
    setImageFile(null);
  };

  const handleRemoveTopUp = (id: string) => {
    Alert.alert(
      "Delete Top Up",
      "Are you sure you want to delete this top up?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTopUp.mutateAsync(id);
              router.back();
            } catch (error: any) {
              showNotification({
                title: "Error",
                body: error?.message || "Failed to delete brand",
              });
            }
          },
        },
      ]
    );
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
                  {isEditing ? "Edit Top Up" : "Add New Top Up"}
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
          <Text style={styles.inputLabel}>Top Up Name</Text>
          <TextInput
            style={styles.textInput}
            value={topUpName}
            onChangeText={setTopUpName}
            placeholder="Type name"
            placeholderTextColor="#999"
          />
        </View>
        {/* Parent Brand Selector for Sub-brand */}

        <View style={styles.imageSection}>
          <Text style={styles.inputLabel}>Upload Top Up Image</Text>
          {topUpImage ? (
            <View style={styles.imageContainer}>
              <TouchableOpacity
                onPress={handleAddImage}
                style={{ alignSelf: "center" }}
              >
                <Image
                  source={{ uri: topUpImage }}
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
        <View
          style={{
            borderBottomWidth: 1,
            marginBottom: 16,
            position: "relative",
            borderColor: Colors.brandGray,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "black",
              paddingBottom: 10,
            }}
          >
            Price
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "black",
              position: "absolute",
              right: 0,
              bottom: 10,
            }}
          >
            Baht
          </Text>
          <TextInput
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "black",
              paddingBottom: 10,
            }}
            placeholder="Input price"
            value={
              price !== undefined && price !== null && price !== ""
                ? Number(price).toLocaleString("th-TH")
                : ""
            }
            onChangeText={(text) => {
              const numeric = text.replace(/[^0-9]/g, "");
              setPrice(numeric ? Number(numeric).toString() : "");
            }}
            keyboardType="numeric"
          />
        </View>
        <View
          style={{
            borderBottomWidth: 1,
            marginBottom: 16,
            position: "relative",
            borderColor: Colors.brandGray,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "black",
              paddingBottom: 10,
            }}
          >
            No. of Credits (Receive)
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "black",
              position: "absolute",
              right: 0,
              bottom: 10,
            }}
          >
            Credits
          </Text>
          <TextInput
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "black",
              paddingBottom: 10,
            }}
            placeholder="No. of Credits (Receive)"
            value={
              credit !== undefined && credit !== null && credit !== ""
                ? Number(credit).toLocaleString()
                : ""
            }
            onChangeText={(text) => {
              const numeric = text.replace(/[^0-9]/g, "");
              setCredit(numeric ? Number(numeric).toString() : "");
            }}
            keyboardType="numeric"
          />
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
            onPress={() => handleRemoveTopUp(params.topUp?._id || "")}
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
    resizeMode: "contain",
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
});
