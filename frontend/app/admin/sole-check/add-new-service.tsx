import React, { useState, useEffect } from "react";
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

import { useCategories } from "@/hooks/useCategories";
import { COLORS } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { showNotification } from "@/hooks/useLocalNotifications";
import {
  useCreateSoleCheckAuthService,
  useDeleteSoleCheckAuthService,
  useUpdateSoleCheckAuthService,
} from "@/hooks/react-query/useSoleCheckAuthServiceMutations";

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
  service?: Brand;
};

export default function AddNewSoleCheckServicePage() {
  const router = useRouter();
  const paramsRaw = useLocalSearchParams();
  const params: Params = {
    service: paramsRaw.service
      ? JSON.parse(paramsRaw.service as string)
      : undefined,
  };
  const isEditing = !!params.service;

  const [serviceName, setServiceName] = useState<string>("");
  const [credit, setCredit] = useState<string>("");

  const [duration, setDuration] = useState<string>("");

  const createService = useCreateSoleCheckAuthService();
  const updateService = useUpdateSoleCheckAuthService();
  const deleteService = useDeleteSoleCheckAuthService();

  const isLoading =
    createService.status === "pending" || updateService.status === "pending";

  const { categories: allCategories, loading: loadingCategories } =
    useCategories();
  // Handle bottom sheet opening
  const soleCategories = allCategories.filter(
    (cat: any) => cat.type === "sole-check"
  );
  // callbacks

  useEffect(() => {
    if (isEditing && params.service) {
      setServiceName(params.service.name || "");
      setCredit(params.service.credit || "");
      setDuration(params.service.duration || "");
    }
  }, [isEditing, params.service]);

  const handleSave = async () => {
    if (!serviceName.trim()) {
      Alert.alert("Error", "Please enter a service name");
      return;
    }
    if (!credit) {
      Alert.alert("Error", "Please enter a credit");
      return;
    }

    const data: any = {
      name: serviceName,
      credit: credit, // File or Blob
      duration: duration,
      categoryId: paramsRaw.categoryId,
    };

    try {
      if (isEditing && params.service?.id) {
        await updateService.mutateAsync({ id: params.service.id, ...data });
      } else {
        await createService.mutateAsync(data);
      }
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Something went wrong");
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
                  {
                    soleCategories.find(
                      (cat: any) => cat._id === paramsRaw.categoryId
                    )?.name
                  }
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

  const handleRemoveService = (id: string) => {
    Alert.alert(
      "Delete Service",
      "Are you sure you want to delete this service?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteService.mutateAsync(id);
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
          <Text style={styles.inputLabel}>Service Name</Text>
          <TextInput
            style={styles.textInput}
            value={serviceName}
            onChangeText={setServiceName}
            placeholder="Type name"
            placeholderTextColor="#999"
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
            Time limit
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
            Minutes
          </Text>
          <TextInput
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "black",
              paddingBottom: 10,
            }}
            placeholder="Time limit"
            value={
              duration !== undefined && duration !== null && duration !== ""
                ? Number(duration).toLocaleString()
                : ""
            }
            onChangeText={(text) => {
              const numeric = text.replace(/[^0-9]/g, "");
              setDuration(numeric ? Number(numeric).toString() : "");
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
            onPress={() => handleRemoveService(params.service?._id || "")}
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
