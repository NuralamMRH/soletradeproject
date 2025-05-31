import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Switch,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/react-query/useProductMutations";
import Colors from "@/constants/Colors";
import { useCategories } from "@/hooks/useCategories";
import { useSubCategories } from "@/hooks/useSubCategories";
import { useBrands } from "@/hooks/useBrands";
import { useSubBrands } from "@/hooks/useSubBrands";
import { useAttributes } from "@/hooks/useAttributes";
import { useAttributeOptions } from "@/hooks/useAttributeOptions";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useIndicators } from "@/hooks/useIndicators";
import {
  useCreateIndicator,
  useUpdateIndicator,
} from "@/hooks/react-query/useIndicatorMutations";
import { baseUrl } from "@/api/MainApi";
// import your styles and any custom components as needed

const defaultProductData = {
  product_type: "",
  name: "",
  brandId: "",
  subBrandId: "",
  categoryId: "",
  subCategoryId: "",
  sku: "",
  attributeId: "",
  variations: [],
  releaseDate: new Date(),
  retailPrice: "",
  colorway: "",
  addToCalendar: false,
  images: [],
  indicatorId: "", // indicator id
  isIndicatorActive: false, // true or false
  indicatorDuration: 0, // in days
  sellerFee: 0,
  buyerFee: 0,
  feeStartDate: null,
  feeEndDate: null,
  tierIds: [],
  publishDate: new Date(),
};

const durationOptions = [
  { _id: "1", name: "1 Day", value: 1 },
  { _id: "2", name: "2 Days", value: 2 },
  { _id: "3", name: "3 Days", value: 3 },
  { _id: "4", name: "4 Days", value: 4 },
  { _id: "5", name: "5 Days", value: 5 },
  { _id: "6", name: "6 Days", value: 6 },
  { _id: "7", name: "7 Days", value: 7 },
  { _id: "8", name: "8 Days", value: 8 },
  { _id: "9", name: "9 Days", value: 9 },
  { _id: "10", name: "10 Days", value: 10 },
  { _id: "11", name: "11 Days", value: 11 },
  { _id: "12", name: "12 Days", value: 12 },
  { _id: "13", name: "13 Days", value: 13 },
  { _id: "14", name: "14 Days", value: 14 },
  { _id: "15", name: "15 Days", value: 15 },
  { _id: "16", name: "16 Days", value: 16 },
  { _id: "17", name: "17 Days", value: 17 },
  { _id: "18", name: "18 Days", value: 18 },
  { _id: "19", name: "19 Days", value: 19 },
  { _id: "20", name: "20 Days", value: 20 },
  { _id: "21", name: "21 Days", value: 21 },
  { _id: "22", name: "22 Days", value: 22 },
  { _id: "23", name: "23 Days", value: 23 },
  { _id: "24", name: "24 Days", value: 24 },
  { _id: "25", name: "25 Days", value: 25 },
  { _id: "26", name: "26 Days", value: 26 },
  { _id: "27", name: "27 Days", value: 27 },
  { _id: "28", name: "28 Days", value: 28 },
  { _id: "29", name: "29 Days", value: 29 },
  { _id: "30", name: "30 Days", value: 30 },
  { _id: "45", name: "45 Days", value: 45 },
  { _id: "60", name: "60 Days", value: 60 },
  { _id: "90", name: "90 Days", value: 90 },
  { _id: "120", name: "120 Days", value: 120 },
  { _id: "150", name: "150 Days", value: 150 },
  { _id: "180", name: "180 Days", value: 180 },
  { _id: "210", name: "210 Days", value: 210 },
  { _id: "240", name: "240 Days", value: 240 },
  { _id: "270", name: "270 Days", value: 270 },
  { _id: "300", name: "300 Days", value: 300 },
  { _id: "330", name: "330 Days", value: 330 },
  { _id: "360", name: "360 Days", value: 360 },
];

export default function AdminAddNewProduct() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.product;
  const productType = (params.productType as string) || "deal";
  const [loading, setLoading] = useState(false);

  // If editing, parse the product from params
  const initialProductData = isEditing
    ? JSON.parse(params.product as string)
    : defaultProductData;

  const [productData, setProductData] = useState(initialProductData);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bottomSheetType, setBottomSheetType] = useState<null | string>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (params.product) {
      const product = JSON.parse(params.product as string);
      setProductData((prev) => ({
        ...prev,
        product_type: productType,
        images: product.images.map((image) => {
          const uri = image.file_full_url.startsWith("http")
            ? image.file_full_url
            : `${baseUrl}${image.file_full_url}`;
          // Guess type from extension
          const ext = image.file.split(".").pop()?.toLowerCase();
          let type = "image/jpeg";
          if (ext === "png") type = "image/png";
          else if (ext === "jpg" || ext === "jpeg") type = "image/jpeg";
          else if (ext === "webp") type = "image/webp";
          return {
            uri,
            name: image.file,
            type,
          };
        }),
        // Normalize variations to array of IDs
        variations: Array.isArray(product.variations)
          ? product.variations.map(
              (variation) =>
                typeof variation === "string" ? variation : variation._id // <-- get the ID
            )
          : [],
      }));
    }
  }, [productType, params.product]);

  // Bottom sheet ref and snap points
  const snapPoints = useMemo(() => ["40%", "60%"], []);

  // Handle bottom sheet opening

  // Handle bottom sheet closing
  const handleCloseBottomSheet = () => {
    setTimeout(() => {
      bottomSheetRef.current?.close();
    }, 0);
  };

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const isLoading =
    createProduct.status === "pending" || updateProduct.status === "pending";

  const { categories } = useCategories();
  const { subCategories } = useSubCategories(productData.categoryId);
  const { brands } = useBrands();
  const { subBrands } = useSubBrands(productData.brandId);
  const { attributes } = useAttributes();
  const { attributeOptions, refetch: refetchAttributeOptions } =
    useAttributeOptions(productData.attributeId);
  const { indicators } = useIndicators();
  const createIndicator = useCreateIndicator();

  // console.log("indicators", indicators);

  const [indicatorName, setIndicatorName] = useState<string | null>(null);
  const [indicatorImage, setIndicatorImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null);

  useEffect(() => {
    if (productData.attributeId) {
      refetchAttributeOptions();
    }
  }, [productData.attributeId]);

  // --- Image Picker ---
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const name = asset.fileName || uri.split("/").pop() || `image.jpg`;
      // Guess the MIME type from the file extension
      const ext = name.split(".").pop()?.toLowerCase();
      let type = "image/jpeg";
      if (ext === "png") type = "image/png";
      else if (ext === "jpg" || ext === "jpeg") type = "image/jpeg";
      else if (ext === "webp") type = "image/webp";
      // fallback to jpeg

      setProductData((prev) => ({
        ...prev,
        images: [...prev.images, { uri, name, type }],
      }));
    }
  };

  const removeImage = (index: number) => {
    setProductData((prev) => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  // --- Date Picker ---
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setProductData((prev) => ({ ...prev, releaseDate: selectedDate }));
    }
  };

  const handleAddIndicatorImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIndicatorImage(asset.uri);
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

  const handleRemoveIndicatorImage = () => {
    setIndicatorImage(null);
    setImageFile(null);
  };

  // --- Save Handler ---
  const handleSave = async () => {
    setLoading(true);
    try {
      // Prepare data for API
      const payload = {
        ...productData,
        // Convert releaseDate to ISO string if needed
        releaseDate: productData.releaseDate
          ? new Date(productData.releaseDate).toISOString()
          : undefined,
        // You may need to handle image upload separately if your backend expects files
      };

      if (isEditing) {
        // Update product
        await updateProduct.mutateAsync({
          id: productData._id,
          data: payload,
        });
        Alert.alert("Success", "Product updated successfully!");
      } else {
        // Create product
        await createProduct.mutateAsync(payload);
        Alert.alert("Success", "Product created successfully!");
      }
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to save product. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openSheet = (type: string) => {
    setBottomSheetType(type);
    bottomSheetRef.current?.expand();
  };

  const openAttributeOptionSheet = () => {
    setBottomSheetType("attributeOption");
    bottomSheetRef.current?.expand();
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
                  {isEditing ? "Edit Product" : "Add New Product"}
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

  // --- UI ---
  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      {renderHeader()}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ padding: 16 }}>
          {/* Product Name */}
          <View style={{ borderBottomWidth: 1, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                color: "black",
                paddingBottom: 10,
              }}
            >
              Product Name
            </Text>
            <TextInput
              style={{
                fontSize: 16,
                fontWeight: "bold",
                paddingBottom: 10,
                color: "black",
              }}
              placeholder="Product Name"
              value={productData.name}
              onChangeText={(text) =>
                setProductData((prev) => ({ ...prev, name: text }))
              }
            />
          </View>

          {/* Brand */}
          <View style={{ borderBottomWidth: 1, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                paddingBottom: 10,
              }}
            >
              Brand
            </Text>
            <TouchableOpacity
              onPress={() => openSheet("brand")}
              style={{
                paddingBottom: 10,
              }}
            >
              <Text style={{ color: productData.brandId ? "black" : "gray" }}>
                {productData.brandId
                  ? brands.find((b) => b._id === productData.brandId)?.name
                  : "Select Brand"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* SubBrand */}
          <View style={{ borderBottomWidth: 1, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                paddingBottom: 10,
              }}
            >
              Sub Brand
            </Text>
            <TouchableOpacity
              onPress={() => openSheet("subBrand")}
              style={{
                paddingBottom: 10,
              }}
            >
              <Text
                style={{ color: productData.subBrandId ? "black" : "gray" }}
              >
                {productData.subBrandId
                  ? subBrands.find((sb) => sb._id === productData.subBrandId)
                      ?.name
                  : "Select Sub Brand"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Category */}
          <View style={{ borderBottomWidth: 1, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                paddingBottom: 10,
              }}
            >
              Category
            </Text>

            <TouchableOpacity
              onPress={() => openSheet("category")}
              style={{
                paddingBottom: 10,
              }}
            >
              <Text
                style={{ color: productData.categoryId ? "black" : "gray" }}
              >
                {productData.categoryId
                  ? categories.find((c) => c._id === productData.categoryId)
                      ?.name
                  : "Select Category"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* SubCategory */}
          <View style={{ borderBottomWidth: 1, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                paddingBottom: 10,
              }}
            >
              SubCategory
            </Text>
            <TouchableOpacity
              onPress={() => openSheet("subCategory")}
              style={{
                paddingBottom: 10,
              }}
            >
              <Text
                style={{ color: productData.subCategoryId ? "black" : "gray" }}
              >
                {productData.subCategoryId
                  ? subCategories.find(
                      (sc) => sc._id === productData.subCategoryId
                    )?.name
                  : "Select SubCategory"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* SKU */}
          <View style={{ borderBottomWidth: 1, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                paddingBottom: 10,
              }}
            >
              SKU
            </Text>
            <TextInput
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                paddingBottom: 10,
              }}
              placeholder="SKU"
              value={productData.sku}
              onChangeText={(text) =>
                setProductData((prev) => ({
                  ...prev,
                  sku: text.toUpperCase(),
                }))
              }
            />
          </View>
          {/* Sizing Attributes */}

          <View
            style={{
              borderBottomWidth: 1,
              marginBottom: 16,
              paddingBottom: 10,
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
              Sizing Attributes
            </Text>
            <TouchableOpacity
              onPress={() => {
                setBottomSheetType("attribute");
                bottomSheetRef.current?.expand();
              }}
              style={{
                paddingBottom: 10,
              }}
            >
              <View style={{ paddingBottom: 10 }}>
                {productData.variations && productData.variations.length > 0 ? (
                  <Text>
                    {productData.variations
                      .map(
                        (v) =>
                          attributeOptions.find((o) => o._id === v)?.optionName
                      )
                      .join(", ")}
                  </Text>
                ) : (
                  <Text style={{ color: "gray" }}>
                    Select Sizing Attributes
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Release Date */}
          <View style={{ borderBottomWidth: 1, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                paddingBottom: 10,
              }}
            >
              Release Date
            </Text>
            <TouchableOpacity
              style={{
                paddingBottom: 10,
              }}
              onPress={() => setShowDatePicker(true)}
            >
              {showDatePicker ? (
                <DateTimePicker
                  value={
                    productData.releaseDate
                      ? new Date(productData.releaseDate)
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              ) : (
                <Text>
                  {productData.releaseDate
                    ? new Date(productData.releaseDate).toLocaleDateString()
                    : "Select Release Date"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Retail Price */}
          <View
            style={{
              borderBottomWidth: 1,
              marginBottom: 16,
              position: "relative",
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
              Retail Price
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
              THB
            </Text>
            <TextInput
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                paddingBottom: 10,
              }}
              placeholder="Retail Price"
              value={
                productData.retailPrice !== undefined &&
                productData.retailPrice !== null &&
                productData.retailPrice !== ""
                  ? Number(productData.retailPrice).toLocaleString("th-TH")
                  : ""
              }
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, "");
                setProductData((prev) => ({
                  ...prev,
                  retailPrice: numeric ? Number(numeric) : "",
                }));
              }}
              keyboardType="numeric"
            />
          </View>
          {/* Colorway */}
          <View style={{ borderBottomWidth: 1, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                paddingBottom: 10,
              }}
            >
              Colorway
            </Text>
            <TextInput
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "black",
                paddingBottom: 10,
              }}
              placeholder="Colorway"
              value={productData.colorway}
              onChangeText={(text) =>
                setProductData((prev) => ({ ...prev, colorway: text }))
              }
            />
          </View>
          {/* Add to Calendar */}

          {productType !== "essential" && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Switch
                value={productData.addToCalendar}
                onValueChange={(value) =>
                  setProductData((prev) => ({ ...prev, addToCalendar: value }))
                }
              />
              <Text style={{ marginLeft: 8 }}>Add to Sneaker Calendar</Text>
            </View>
          )}
          {/* Images */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
              Product Images
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {productData.images.map((img, idx) => (
                <View key={idx} style={{ marginRight: 8, marginBottom: 8 }}>
                  <Image
                    source={{ uri: img.uri }}
                    style={{ width: 80, height: 80, borderRadius: 8 }}
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(idx)}
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      backgroundColor: "#fff",
                      borderRadius: 12,
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="add" size={40} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          {productType !== "essential" && (
            <View style={{ marginBottom: 16, paddingBottom: 10 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "black",
                  paddingBottom: 10,
                }}
              >
                Special Indicator
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() => openSheet("indicator")}
                  style={{
                    paddingBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      color: productData.indicatorId ? "black" : "gray",
                    }}
                  >
                    {productData.indicatorId
                      ? indicators.find(
                          (i) => i._id === productData.indicatorId
                        )?.name
                      : "Indicator"}
                  </Text>
                </TouchableOpacity>
                <View
                  style={{ flexDirection: "row", marginLeft: "auto", gap: 0 }}
                >
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderColor: "#000000",
                      borderRadius: 0,
                      paddingVertical: 4,
                      paddingHorizontal: 18,
                      backgroundColor: productData.isIndicatorActive
                        ? "#000000"
                        : "#fff",
                    }}
                    onPress={() =>
                      setProductData((prev) => ({
                        ...prev,
                        isIndicatorActive: true,
                      }))
                    }
                  >
                    <Text
                      style={{
                        color: productData.isIndicatorActive
                          ? "#ffffff"
                          : "#000000",
                      }}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderColor: "#000000",
                      borderRadius: 0,
                      paddingVertical: 4,
                      paddingHorizontal: 18,
                      backgroundColor: productData.isIndicatorActive
                        ? "#fff"
                        : "#000000",
                    }}
                    onPress={() =>
                      setProductData((prev) => ({
                        ...prev,
                        isIndicatorActive: false,
                      }))
                    }
                  >
                    <Text
                      style={{
                        color: !productData.isIndicatorActive
                          ? "#ffffff"
                          : "#000000",
                      }}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Duration */}
          {productType !== "essential" && (
            <View style={{ marginBottom: 16, paddingBottom: 10 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "black",
                  paddingBottom: 10,
                }}
              >
                Duration
              </Text>

              <TouchableOpacity
                onPress={() => openSheet("duration")}
                style={{
                  paddingBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: productData.indicatorDuration ? "black" : "gray",
                  }}
                >
                  {productData.indicatorDuration
                    ? durationOptions.find(
                        (d) => d.value === productData.indicatorDuration
                      )?.name
                    : "Select Duration"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["50%"]}
        onClose={handleCloseBottomSheet}
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
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 18,
                  marginBottom: 16,
                  color: "white",
                }}
              >
                {bottomSheetType === "category" && "Select Category"}
                {bottomSheetType === "subCategory" && "Select SubCategory"}
                {bottomSheetType === "brand" && "Select Brand"}
                {bottomSheetType === "subBrand" && "Select Sub-Brand"}
                {bottomSheetType === "attribute" && "Select Attribute"}
                {bottomSheetType === "attributeOption" &&
                  "Select Attribute Option"}
                {bottomSheetType === "indicatorCreate" && "Create Indicator"}
                {bottomSheetType === "indicator" && "Select Indicator"}
                {bottomSheetType === "duration" && "Select Duration"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (bottomSheetType === "indicatorCreate") {
                    setBottomSheetType("indicator");
                  } else {
                    handleCloseBottomSheet();
                    setBottomSheetType(null);
                  }
                }}
              >
                <Text style={{ color: "white" }}>
                  {bottomSheetType === "attributeOption"
                    ? `Save ${
                        attributes.find(
                          (a) => a._id === productData.attributeId
                        )?.name
                      }`
                    : bottomSheetType === "indicatorCreate"
                    ? "Back"
                    : "Close"}
                </Text>
              </TouchableOpacity>
            </View>

            {bottomSheetType === "indicatorCreate" ? (
              <View style={{ padding: 16 }}>
                <TextInput
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "white",
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "white",
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: "#000000",
                  }}
                  placeholder="Indicator Name"
                  placeholderTextColor="gray"
                  value={indicatorName}
                  onChangeText={setIndicatorName}
                />
                <View style={{ marginBottom: 16, marginTop: 16 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "white",
                      marginBottom: 16,
                    }}
                  >
                    Upload Indicator Icon
                  </Text>
                  {indicatorImage ? (
                    <View style={styles.imageContainer}>
                      <TouchableOpacity
                        onPress={handleAddIndicatorImage}
                        style={{
                          alignSelf: "flex-start",
                          marginBottom: 16,
                          backgroundColor: "#fff",
                          padding: 10,
                          borderRadius: 8,
                        }}
                      >
                        <Image
                          source={{ uri: indicatorImage }}
                          style={styles.imagePreview}
                        />
                        {/* Remove button at top right */}
                        <TouchableOpacity
                          onPress={handleRemoveIndicatorImage}
                          style={styles.removeButton}
                        >
                          <Ionicons
                            name="close-circle"
                            size={28}
                            color="#D32F2F"
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={{
                        width: 120,
                        height: 120,
                        borderWidth: 2,
                        borderColor: "#ffffff",
                        borderRadius: 10,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={handleAddIndicatorImage}
                    >
                      <Ionicons name="add" size={30} color="#ffffff" />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#ffffff",
                    padding: 10,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={async () => {
                    await createIndicator
                      .mutateAsync({
                        name: indicatorName,
                        image: imageFile,
                      })
                      .then((res) => {
                        console.log("res", res);
                        setProductData((prev) => ({
                          ...prev,
                          indicatorId: res._id,
                          isIndicatorActive: true,
                          indicatorDuration: 0,
                        }));
                        handleCloseBottomSheet();
                        setBottomSheetType(null);
                        setIndicatorName(null);
                        setIndicatorImage(null);
                        setImageFile(null);
                      });
                  }}
                >
                  <Text>Create</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={
                  bottomSheetType === "category"
                    ? categories
                    : bottomSheetType === "subCategory"
                    ? subCategories
                    : bottomSheetType === "brand"
                    ? brands
                    : bottomSheetType === "subBrand"
                    ? subBrands
                    : bottomSheetType === "attribute"
                    ? attributes
                    : bottomSheetType === "attributeOption"
                    ? attributeOptions
                    : bottomSheetType === "indicator"
                    ? indicators
                    : bottomSheetType === "duration"
                    ? durationOptions
                    : []
                }
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <Pressable
                    style={{
                      padding: 16,
                      color: "white",
                    }}
                    onPress={() => {
                      if (bottomSheetType === "category") {
                        setProductData((prev) => ({
                          ...prev,
                          categoryId: item._id,
                          subCategoryId: "",
                        }));
                        bottomSheetRef.current?.close();
                      } else if (bottomSheetType === "subCategory") {
                        setProductData((prev) => ({
                          ...prev,
                          subCategoryId: item._id,
                        }));
                        bottomSheetRef.current?.close();
                      } else if (bottomSheetType === "brand") {
                        setProductData((prev) => ({
                          ...prev,
                          brandId: item._id,
                          subBrandId: "",
                        }));
                        bottomSheetRef.current?.close();
                      } else if (bottomSheetType === "subBrand") {
                        setProductData((prev) => ({
                          ...prev,
                          subBrandId: item._id,
                        }));
                        bottomSheetRef.current?.close();
                      } else if (bottomSheetType === "indicator") {
                        setProductData((prev) => ({
                          ...prev,
                          indicatorId: item._id,
                          isIndicatorActive: true,
                          indicatorDuration: 0,
                        }));
                        bottomSheetRef.current?.close();
                      } else if (bottomSheetType === "duration") {
                        setProductData((prev) => ({
                          ...prev,
                          indicatorDuration: item.value,
                          isIndicatorActive: true,
                        }));
                        bottomSheetRef.current?.close();
                      } else if (bottomSheetType === "attribute") {
                        setProductData((prev) => ({
                          ...prev,
                          attributeId: item._id,
                          variations: [],
                        }));
                        openAttributeOptionSheet();
                      } else if (bottomSheetType === "attributeOption") {
                        setProductData((prev) => {
                          const alreadySelected = prev.variations?.includes(
                            item._id
                          );
                          return {
                            ...prev,
                            variations: alreadySelected
                              ? prev.variations.filter((id) => id !== item._id)
                              : [...(prev.variations || []), item._id],
                          };
                        });
                      }
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      {/* Circle Check mark icon */}
                      {bottomSheetType === "attributeOption" &&
                      productData.variations.includes(item._id) ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={Colors.brandGreen}
                        />
                      ) : productData.indicatorId === item._id ||
                        productData.category === item._id ||
                        productData.subCategory === item._id ||
                        productData.brand === item._id ||
                        productData.subBrand === item._id ||
                        productData.attributeId === item._id ||
                        productData.indicatorDuration === item.value ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={Colors.brandGreen}
                        />
                      ) : (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="white"
                        />
                      )}
                      <Text style={{ color: "white" }}>
                        {bottomSheetType === "attributeOption"
                          ? attributeOptions?.find((o) => o._id === item._id)
                              ?.optionName
                          : item.name}
                      </Text>
                    </View>
                  </Pressable>
                )}
                ListFooterComponent={() => (
                  <View style={styles.subContainer}>
                    {bottomSheetType === "indicator" && (
                      <TouchableOpacity
                        onPress={() => openSheet("indicatorCreate")}
                        style={{
                          paddingVertical: 16,
                          paddingHorizontal: 0,
                          backgroundColor: "#000000",
                          borderRadius: 8,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Text style={{ color: "white" }}>Add</Text>
                        <Ionicons name="add" size={24} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
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
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
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
    alignItems: "center",
    justifyContent: "center",
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
});
