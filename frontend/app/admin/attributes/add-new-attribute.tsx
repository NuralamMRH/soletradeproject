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
  Switch,
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
  useCreateAttribute,
  useCreateAttributeOption,
  useDeleteAttributeOption,
  useUpdateAttribute,
  useUpdateAttributeOption,
} from "@/hooks/react-query/useAttributeMutations";
import { useAttributes } from "@/hooks/useAttributes";
import { useAttributeOptions } from "@/hooks/useAttributeOptions";
import Button from "@/components/Button";

// Type for attribute (adjust as needed)
type Attribute = {
  _id?: string;
  id?: string;
  name: string;
  image?: string; // URL or local URI
  image_full_url?: string;
  parentAttribute?: {
    _id?: string;
    name?: string;
  };
};

type AttributeOption = {
  _id?: string;
  id?: string;
  optionName: string;
  attributeId?: string;
};

type Params = {
  attribute?: Attribute;
};

export default function AddNewAttributePage() {
  const router = useRouter();
  const paramsRaw = useLocalSearchParams();
  const params: Params = {
    attribute: paramsRaw.attribute
      ? JSON.parse(paramsRaw.attribute as string)
      : undefined,
  };
  const isEditing = !!params.attribute;

  const [attributeName, setAttributeName] = useState<string>("");
  const [attributeOptionName, setAttributeOptionName] = useState<string>("");
  const [isWantImage, setIsWantImage] = useState<boolean>(false);

  const [attributeImage, setAttributeImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null); // For upload

  const createAttribute = useCreateAttribute();
  const updateAttribute = useUpdateAttribute();
  const createAttributeOption = useCreateAttributeOption();
  const updateAttributeOption = useUpdateAttributeOption();
  const deleteAttributeOption = useDeleteAttributeOption();
  const isLoading =
    createAttribute.status === "pending" ||
    updateAttribute.status === "pending" ||
    createAttributeOption.status === "pending" ||
    updateAttributeOption.status === "pending";

  // For sub-attribute parent selection
  const [parentAttributeId, setParentAttributeId] = useState<string | null>(
    null
  );
  const [editAttributeOptionId, setEditAttributeOptionId] = useState<
    string | null
  >(null);

  const {
    attributeOptions,
    loading: loadingAttributeOptions,
    refetch: refetchAttributeOptions,
  } = useAttributeOptions(parentAttributeId) as {
    attributeOptions: AttributeOption[];
    loading: boolean;
    error: any;
    refetch: () => Promise<void>;
  };

  useEffect(() => {
    if (parentAttributeId) {
      refetchAttributeOptions();
    }
  }, [parentAttributeId]);

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
    if (isEditing && params.attribute && attributeName === "") {
      setAttributeName(params.attribute.name || "");
      // Only set the image if a new one hasn't been picked
      setAttributeImage((prev) => {
        if (
          prev &&
          prev !== params.attribute?.image &&
          prev !== params.attribute?.image_full_url
        ) {
          return prev; // Don't overwrite if user picked a new image
        }
        // Use image_full_url if available, else image
        const url = params.attribute?.image_full_url || params.attribute?.image;
        if (!url) return null;
        return url.startsWith("http") ? url : `${baseUrl}${url}`;
      });
      setParentAttributeId(params.attribute?.id || null);
    }
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, [isEditing, params.attribute]);

  const handleSave = async () => {
    if (!attributeName.trim()) {
      Alert.alert("Error", "Please enter a attribute name");
      return;
    }

    const data: any = {
      name: attributeName,
      image: imageFile, // File or Blob
    };

    try {
      if (isEditing && params.attribute?.id) {
        await updateAttribute.mutateAsync({ id: params.attribute.id, ...data });
        Toast.show({ type: "success", text1: "Attribute updated" });
      } else {
        const attribute = await createAttribute.mutateAsync(data);
        if (attribute) {
          setParentAttributeId(attribute._id);
          Toast.show({ type: "success", text1: "Attribute created" });
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Something went wrong");
    }
  };

  const handleSaveAttributeOption = async () => {
    if (!attributeOptionName.trim()) {
      Alert.alert("Error", "Please enter a attribute name");
      return;
    }

    if (!parentAttributeId) {
      Alert.alert("Error", "Make parent attribute first");
      return;
    }

    const data: any = {
      optionName: attributeOptionName,
      attributeId: parentAttributeId,
    };

    console.log("Attribute data", data);
    try {
      await createAttributeOption.mutateAsync(data);
      setAttributeOptionName("");
      handleCloseBottomSheet();
      refetchAttributeOptions();
      Toast.show({ type: "success", text1: "Attribute option created" });
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Something went wrong");
    }
  };

  const handleEditAttributeOption = (option: AttributeOption) => {
    setEditAttributeOptionId(option.id || option._id || null);
    setAttributeOptionName(option.optionName);
    openBottomSheet();
  };

  const handleUpdateAttributeOption = async () => {
    if (!attributeOptionName.trim()) {
      Alert.alert("Error", "Please enter a attribute name");
      return;
    }

    if (!parentAttributeId) {
      Alert.alert("Error", "Make parent attribute first");
      return;
    }

    const data: any = {
      id: editAttributeOptionId,
      optionName: attributeOptionName,
      attributeId: parentAttributeId,
    };

    try {
      await updateAttributeOption.mutateAsync(data);
      setEditAttributeOptionId(null);
      setAttributeOptionName("");
      handleCloseBottomSheet();
      refetchAttributeOptions();
      Toast.show({ type: "success", text1: "Attribute option updated" });
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Something went wrong");
    }
  };

  const handleDeleteAttributeOption = async () => {
    await deleteAttributeOption.mutateAsync(editAttributeOptionId as string);
    setEditAttributeOptionId(null);
    setAttributeOptionName("");
    handleCloseBottomSheet();
    refetchAttributeOptions();
    Toast.show({ type: "success", text1: "Attribute option deleted" });
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
        setAttributeImage(asset.uri);
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
    setAttributeImage(null);
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
                  {isEditing ? "Edit Attribute" : "Add New Attribute"}
                </Text>
              </Text>
            </View>

            <View style={styles.headerRight}></View>
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
          <Text style={styles.inputLabel}>{"Attribute Name"}</Text>
          <TextInput
            style={styles.textInput}
            value={attributeName}
            onChangeText={setAttributeName}
            placeholder="Type name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={[styles.switcherRow]}>
          <Text style={styles.notificationLabel}>{"Attribute Image"}</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{isWantImage ? "Yes" : "No"}</Text>
            <Switch
              value={isWantImage}
              onValueChange={() => setIsWantImage(!isWantImage)}
              trackColor={{ false: "#ccc", true: "#222" }}
              thumbColor={isWantImage ? "#fff" : "#fff"}
            />
          </View>
        </View>
        {isWantImage && (
          <View style={styles.imageSection}>
            <Text style={styles.inputLabel}>Upload Attribute logo</Text>
            {attributeImage ? (
              <View style={styles.imageContainer}>
                <TouchableOpacity
                  onPress={handleAddImage}
                  style={{ alignSelf: "center" }}
                >
                  <Image
                    source={{ uri: attributeImage }}
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
        )}
      </View>
      {parentAttributeId && (
        <View
          style={[
            styles.subContainer,
            {
              paddingTop: 20,
              flex: 1,
              marginBottom: 100,
            },
          ]}
        >
          <FlatList
            showsVerticalScrollIndicator={false}
            data={attributeOptions as AttributeOption[]}
            keyExtractor={(option) => option._id || option.id || ""}
            renderItem={({ item: option, index }) => (
              <TouchableOpacity
                style={styles.attributeCard}
                onPress={() => handleEditAttributeOption(option)}
              >
                <View style={styles.attributeImage}>
                  <Text
                    style={[
                      styles.attributeName,
                      { textAlign: "center", fontSize: 20 },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {index + 1}
                  </Text>
                </View>

                <Text style={styles.attributeName}>{option.optionName}</Text>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              <View
                style={{
                  alignItems: "flex-start",
                  paddingBottom: 50,
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => openBottomSheet()}
                >
                  <Text
                    style={{
                      color: "#333",
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    Add
                  </Text>
                  <Ionicons name="add" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            }
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text>No attribute options found</Text>
              </View>
            }
          />
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 20,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingVertical: 10,
          marginBottom: 50,
        }}
      >
        <Button
          title="Cancel"
          onPress={() => router.back()}
          disabled={isLoading}
          textColor="#fff"
          style={{
            flex: 1,
            borderRadius: 0,
            backgroundColor: "#333333",
          }}
        />

        <Button
          title={isEditing ? (parentAttributeId ? "Update" : "Save") : "Save"}
          onPress={handleSave}
          disabled={isLoading}
          textColor="#fff"
          style={{ flex: 1, borderRadius: 0, backgroundColor: "#8B0000" }}
        />
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
        <BottomSheetView style={{ flex: 1, position: "relative", height: 300 }}>
          <View
            style={[
              styles.inputContainer,
              styles.subContainer,
              { marginTop: 20 },
            ]}
          >
            <Text style={[styles.inputLabel, { color: "#ffffff" }]}>Size</Text>
            <TextInput
              style={[styles.textInput, { color: "#ffffff" }]}
              value={attributeOptionName}
              onChangeText={setAttributeOptionName}
              placeholder="Type option name"
              placeholderTextColor="#999"
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 20,
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              paddingHorizontal: 16,
              paddingVertical: 10,
              marginBottom: 20,
            }}
          >
            {editAttributeOptionId ? (
              <>
                <Button
                  title="Update"
                  onPress={() => handleUpdateAttributeOption()}
                  disabled={isLoading}
                  textColor="#fff"
                  style={{
                    flex: 1,
                    borderRadius: 0,
                    backgroundColor: "#333333",
                  }}
                />
                <Button
                  title={"Delete"}
                  onPress={handleDeleteAttributeOption}
                  disabled={isLoading}
                  textColor="#fff"
                  style={{
                    flex: 1,
                    borderRadius: 0,
                    backgroundColor: "#8B0000",
                  }}
                />
              </>
            ) : (
              <>
                <Button
                  title="Cancel"
                  onPress={() => handleCloseBottomSheet()}
                  disabled={isLoading}
                  textColor="#fff"
                  style={{
                    flex: 1,
                    borderRadius: 0,
                    backgroundColor: "#333333",
                  }}
                />
                <Button
                  title={"Save"}
                  onPress={handleSaveAttributeOption}
                  disabled={isLoading}
                  textColor="#fff"
                  style={{
                    flex: 1,
                    borderRadius: 0,
                    backgroundColor: "#8B0000",
                  }}
                />
              </>
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
    backgroundColor: Colors.attributeGray,
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
  attributeItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  attributeItemText: {
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

  switcherRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  notificationLabel: {
    fontSize: 16,
    // fontWeight: "bold",
    color: "#111",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111",
    marginRight: 8,
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
    gap: 20,
  },
  attributeName: {
    fontSize: 16,
    textAlign: "left",
    color: "#333",
    width: "100%",
    fontWeight: "bold",
  },
  attributeImage: {
    justifyContent: "center",
    alignItems: "center",
  },
});
