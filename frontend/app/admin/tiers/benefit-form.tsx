// Standalone BenefitForm page for tier benefits.
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ToastAndroid,
  FlatList,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import AdminHeader from "@/components/AdminHeader";
import { useCategories } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";
import { useCreateTierBenefit } from "@/hooks/react-query/useTierBenefit";
import { COLORS } from "@/constants";
import { baseUrl } from "@/api/MainApi";

// Type definitions for benefit and tier
interface BenefitData {
  name: string;
  subTitle: string;
  description: string;
  sellerFee: number;
  buyerFee: number;
  category?: string;
  product?: string;
  brand?: string;
}

interface Tier {
  _id: string;
  name: string;
  timeLimit?: string;
}

interface BenefitFormProps {
  onCancel?: () => void;
}
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

type Brand = {
  _id: string;
  name: string;
  image_full_url?: string;
  // add other properties if needed
};

const BenefitForm: React.FC<BenefitFormProps> = ({ onCancel }) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tier: Tier = params.tier
    ? JSON.parse(params.tier as string)
    : { _id: "", name: "" };

  const { mutateAsync: createBenefit } = useCreateTierBenefit();

  const [name, setName] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sellerFee, setSellerFee] = useState("");
  const [buyerFee, setBuyerFee] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [brand, setBrand] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any>(null);

  const [isSaving, setIsSaving] = useState(false);

  const { categories = [], loading: loadingCategories } = useCategories() as {
    categories: Category[];
    loading: boolean;
    error: any;
  };

  const {
    brands = [],
    loading: loadingBrands,
    refetch: refetchBrands,
  } = useBrands() as {
    brands: Brand[];
    loading: boolean;
    error: any;
    refetch: () => void;
  };

  // Snap points for bottom sheet
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

  // Handle product selection return
  useEffect(() => {
    if (
      params.selectedProduct &&
      typeof params.selectedProduct === "string" &&
      selectedType === "product"
    ) {
      try {
        const prod = JSON.parse(params.selectedProduct);
        setProducts(
          prod.map((p: any) =>
            products.map((product: any) => product._id === p)
          )
        );
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.selectedProduct]);

  const showToast = (message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setBrand(null);
    setCategory(null);
    setProducts(null);
    if (type === "category" || type === "brand") {
      openBottomSheet();
    } else if (type === "product") {
      // Navigate to select-products with singleSelect param
      router.push({
        pathname: "/admin/pages/select-products",
        params: {
          singleSelect: "true",
          selectedProducts: products
            ? JSON.stringify(products)
            : JSON.stringify([]),
        },
      });
    }
  };

  const isFormComplete =
    name &&
    subTitle &&
    description &&
    sellerFee &&
    buyerFee &&
    selectedType &&
    ((selectedType === "category" && category) ||
      (selectedType === "brand" && brand) ||
      (selectedType === "product" && products));

  const handleSaveBenefit = async () => {
    if (!isFormComplete) return;
    setIsSaving(true);
    try {
      // Create the complete benefit data object with correct field casing
      const completeData: any = {
        tier: tier._id,
        name: name.trim(),
        subtitle: subTitle.trim(),
        description: description.trim(),
        seller_fee: parseFloat(sellerFee as any),
        buyer_fee: parseFloat(buyerFee as any),
        icon: "default-icon.png",
        icon_full_url: "/default-icon.png",
      };
      if (selectedType === "category") {
        completeData.category = category._id;
      } else if (selectedType === "product") {
        completeData.product = products;
      } else if (selectedType === "brand") {
        completeData.brand = brand._id;
      }
      await createBenefit(completeData);
      showToast("Benefit added successfully");
      router.back();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to add benefit");
    } finally {
      setIsSaving(false);
    }
  };

  // Fix: FlatList type for category/brand
  type SelectionItem = { _id: string; name: string };
  const getSelectionData = (): SelectionItem[] => {
    if (selectedType === "category") {
      return categories as SelectionItem[];
    } else if (selectedType === "brand") {
      return brands as SelectionItem[];
    }
    return [];
  };

  console.log(category, "category");
  return (
    <View style={{ flex: 1 }}>
      <AdminHeader
        title="Add New Benefit"
        onBack={onCancel || (() => router.back())}
      />
      <ScrollView style={styles.formScrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add New Benefit</Text>
          <TextInput
            style={styles.input}
            placeholder="Benefit Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Subtitle"
            value={subTitle}
            onChangeText={setSubTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <View style={styles.feeContainer}>
            <View style={styles.feeInput}>
              <Text style={styles.label}>Seller Fee (%)</Text>
              <TextInput
                style={styles.input}
                value={sellerFee}
                onChangeText={setSellerFee}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
            <View style={styles.feeInput}>
              <Text style={styles.label}>Buyer Fee (%)</Text>
              <TextInput
                style={styles.input}
                value={buyerFee}
                onChangeText={setBuyerFee}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
          </View>
          <View style={styles.typeSelection}>
            <Text style={styles.label}>Select Type</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  selectedType === "category" && styles.selectedType,
                ]}
                onPress={() => handleTypeSelect("category")}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === "category" && styles.selectedTypeText,
                  ]}
                >
                  Category
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  selectedType === "product" && styles.selectedType,
                ]}
                onPress={() => handleTypeSelect("product")}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === "product" && styles.selectedTypeText,
                  ]}
                >
                  Product
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  selectedType === "brand" && styles.selectedType,
                ]}
                onPress={() => handleTypeSelect("brand")}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === "brand" && styles.selectedTypeText,
                  ]}
                >
                  Brand
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Show selected item after type selection */}
          {selectedType === "brand" && brand && (
            <View style={styles.selectedItemContainer}>
              <Text style={styles.label}>Selected Brand:</Text>
              <View style={{ gap: 10 }}>
                <Image
                  source={{ uri: `${baseUrl}${brand.image_full_url}` }}
                  style={{ width: 80, height: 80 }}
                />
                <Text style={styles.selectedItemText}>{brand.name}</Text>
              </View>
            </View>
          )}
          {selectedType === "category" && category && (
            <View style={styles.selectedItemContainer}>
              <Text style={styles.label}>Selected Category:</Text>
              <View style={{ gap: 10 }}>
                <Image
                  source={{ uri: `${baseUrl}${category.image_full_url}` }}
                  style={{ width: 80, height: 80 }}
                />
                <Text style={styles.selectedItemText}>{category.name}</Text>
              </View>
            </View>
          )}
          {selectedType === "product" && products && (
            <View style={styles.selectedItemContainer}>
              <Text style={styles.label}>Selected Product:</Text>
              {products.length > 0 &&
                products.map((product: any) => (
                  <View
                    key={product}
                    style={{ flexDirection: "column", gap: 10 }}
                  >
                    <Image
                      source={{ uri: `${baseUrl}${product.image_full_url}` }}
                      style={{ width: 80, height: 80 }}
                    />
                    <Text style={styles.selectedItemText}>{product.name}</Text>
                  </View>
                ))}
            </View>
          )}
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel || (() => router.back())}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !isFormComplete || isSaving ? { opacity: 0.5 } : {},
              ]}
              onPress={handleSaveBenefit}
              disabled={!isFormComplete || isSaving}
            >
              <Text style={styles.saveButtonText}>Save Benefit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* BottomSheet for category/brand selection - moved outside ScrollView to fix VirtualizedLists error */}
      <BottomSheet
        index={-1}
        snapPoints={snapPoints}
        ref={bottomSheetModalRef}
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
            <Text style={{ color: "#ffff", fontSize: 16, marginBottom: 10 }}>
              Select {selectedType === "category" ? "Category" : "Brand"}
            </Text>
            {loadingCategories || loadingBrands ? (
              <ActivityIndicator size="large" color="#8B0000" />
            ) : (
              <FlatList
                data={selectedType === "categories" ? categories : brands}
                keyExtractor={(item) =>
                  item._id ? String(item._id) : String(item.id)
                }
                renderItem={({ item }) => (
                  <Pressable
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      paddingVertical: 10,
                    }}
                    onPress={() => {
                      if (selectedType === "brand") {
                        setBrand(item);
                        handleCloseBottomSheet();
                      } else if (selectedType === "category") {
                        setCategory(item);
                        handleCloseBottomSheet();
                      }
                    }}
                  >
                    <View style={styles.radioButton}>
                      {selectedType === "brand" && brand?._id === item._id ? (
                        <View style={styles.radioButtonSelected} />
                      ) : selectedType === "category" &&
                        category?._id === item._id ? (
                        <View style={[styles.radioButtonSelected]} />
                      ) : null}
                    </View>

                    <Text style={{ color: "#ffff", fontSize: 14 }}>
                      {item.name}
                    </Text>
                  </Pressable>
                )}
              />
            )}
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

// Styles (copied from edit-tier.tsx)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  subContainer: {
    paddingHorizontal: 16,
  },
  formScrollView: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    margin: 15,
    padding: 16,
    borderRadius: 8,
    flex: 1,
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  feeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  feeInput: {
    width: "48%",
  },
  typeSelection: {
    marginBottom: 15,
  },
  typeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  typeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    width: "30%",
    alignItems: "center",
  },
  selectedType: {
    backgroundColor: "#8B0000",
    borderColor: "#8B0000",
  },
  typeButtonText: {
    color: "#333",
    fontSize: 14,
  },
  selectedTypeText: {
    color: "#fff",
  },
  selectedItemContainer: {
    marginBottom: 15,
  },
  selectedItemText: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#8B0000",
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  saveButton: {
    padding: 12,
    backgroundColor: "#8B0000",
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#8B0000",
    fontSize: 16,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#ffffff",
    borderRadius: 10,
    marginRight: 8,
  },
  radioButtonSelected: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#ffffff",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginRight: 8,
  },
});

// Default export: page wrapper for Expo Router
const BenefitFormPage = () => {
  // You can add logic here to handle saving, e.g. call an API or pass data back
  return <BenefitForm />;
};

export default BenefitFormPage;
