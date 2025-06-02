import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import Colors from "@/constants/Colors";
import Toast from "react-native-toast-message";
import {
  useCreateHomeFeedSection,
  useDeleteHomeFeedSection,
  useUpdateHomeFeedSection,
} from "@/hooks/react-query/useHomeFeedSectionMutations";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCategories } from "@/hooks/useCategories";
import { useSubCategories } from "@/hooks/useSubCategories";
import { useBrands } from "@/hooks/useBrands";
import { useSubBrands } from "@/hooks/useSubBrands";
import { useAttributes } from "@/hooks/useAttributes";
import { useAttributeOptions } from "@/hooks/useAttributeOptions";
import { useIndicators } from "@/hooks/useIndicators";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import ColumnConfig from "@/components/admin/ColumnConfig";
import { SIZES } from "@/constants";
import { useListCreation } from "@/context/ListCreationContext";
import { useProducts } from "@/hooks/useProducts";

interface Section {
  _id?: string;
  name: string;
  mode: "auto" | "manual";
  description?: string;
  number_of_items?: number;
  items_per_column?: number;
  column_count?: number;
  column_names?: { [key: string]: string };
  column_variables?: { [key: string]: string };
  column_products?: { column: string; products: string[] }[];
  column_brands?: { column: string; products: string[] }[];
  column_categories?: { column: string; products: string[] }[];
  display_type?: string; // e.g. "new-items", "trending", "featured", "custom"// e.g. "new-items", "trending", "featured", "custom"
  display_style?: number; // 1, 2, 3, etc.
  isActive?: boolean;
  order?: number;
  products?: string[];
  categories?: string[];
  brands?: string[];
  variable_source?: "products" | "categories" | "brands";
  autoCriteria?: {
    productType?: "all" | "essential" | "auction" | "deal";
    sortBy?: string;
    minRating?: number;
    priceRange?: { min: number; max: number };
  };
}

const displayStyleImages: { [key: number]: any } = {
  1: require("@/assets/images/type1.png"),
  2: require("@/assets/images/type2.png"),
  3: require("@/assets/images/type3.png"),
};

const AddNewHomeFeedSection: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = params.isEditing === "true";
  const defaultSection: Section = { name: "", mode: "manual" };
  let section: Section = defaultSection;
  if (params.section && typeof params.section === "string") {
    try {
      section = { ...defaultSection, ...JSON.parse(params.section) };
    } catch {}
  }
  const [sectionName, setSectionName] = useState<string>("");
  const [sectionDescription, setSectionDescription] = useState<string>("");
  const [numberOfItems, setNumberOfItems] = useState<string>("");
  const [displayStyle, setDisplayStyle] = useState<number>(1);
  const [selectedBrands, setSelectedBrands] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showBrandSheet, setShowBrandSheet] = useState(false);
  const { categories } = useCategories();
  const { brands } = useBrands();
  const [columns, setColumns] = useState<
    { name: string; products: any[]; categories: any[]; brands: any[] }[]
  >([
    { name: "", products: [], categories: [], brands: [] },
    { name: "", products: [], categories: [], brands: [] },
  ]);
  const [activeColumnIdx, setActiveColumnIdx] = useState<number | null>(null);

  const createSection = useCreateHomeFeedSection();
  const updateSection = useUpdateHomeFeedSection();
  const deleteSection = useDeleteHomeFeedSection();
  const bottomSheetRef = useRef<any>(null);
  const [mode, setMode] = useState<"auto" | "manual">("manual");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [variableSource, setVariableSource] = useState<
    "products" | "categories" | "brands"
  >("products");
  const [autoCriteria, setAutoCriteria] = useState<Section["autoCriteria"]>({
    productType: "all",
    sortBy: "newest",
    minRating: 0,
    priceRange: { min: 0, max: 0 },
  });
  const [itemCount, setItemCount] = useState<string>("10");
  const [columnCount, setColumnCount] = useState<string>("2");
  const [itemsPerColumn, setItemsPerColumn] = useState<string>("3");
  const [columnNames, setColumnNames] = useState<{ [key: string]: string }>({});
  const [columnVariables, setColumnVariables] = useState<{
    [key: string]: string;
  }>({});

  console.log(
    "columns",
    columns.map((col) => col.products)
  );

  const [selectedColumnProducts, setSelectedColumnProducts] = useState<{
    [key: string]: any[];
  }>({});

  const [columnSections, setColumnSections] = useState<
    {
      sectionName: string;
      mode: "auto" | "manual";
      columnCount: number;
      itemsPerColumn: number;
      columns: { name: string; products: any[] }[];
    }[]
  >([
    {
      sectionName: "",
      mode: "manual",
      columnCount: 2,
      itemsPerColumn: 3,
      columns: [
        { name: "", products: [] },
        { name: "", products: [] },
      ],
    },
  ]);
  const [displayType, setDisplayType] = useState<string>("brand");

  const { columnProducts, clearColumnProducts } = useListCreation();
  const { products: allProducts } = useProducts({ filter: {} });

  const getProductObjects = (
    idsOrObjects: (string | { _id: string; name: string })[]
  ): { _id: string; name: string }[] => {
    return idsOrObjects.map((idOrObj) => {
      if (typeof idOrObj === "object" && idOrObj._id) return idOrObj;
      const found = allProducts.find((p: any) => p._id === idOrObj);
      return found || { _id: String(idOrObj), name: "Unknown" };
    });
  };

  // Handle product selection from select-products page
  useEffect(() => {
    if (
      params.selectedProducts &&
      typeof params.selectedProducts === "string"
    ) {
      try {
        if (params.columnIdx !== undefined) {
          // Column-based selection
          const idx = parseInt(params.columnIdx as string, 10);
          setColumns((prev) =>
            prev.map((col, i) =>
              i === idx
                ? {
                    ...col,
                    products: JSON.parse(params.selectedProducts as string),
                  }
                : col
            )
          );
        } else {
          setSelectedProducts(JSON.parse(params.selectedProducts));
        }
      } catch {}
    }
  }, [params.selectedProducts, params.columnIdx]);

  useEffect(() => {
    // Only run if there are any columnProducts set
    if (columnProducts && Object.keys(columnProducts).length > 0) {
      setColumns((prev) =>
        prev.map((col, idx) =>
          columnProducts[idx] ? { ...col, products: columnProducts[idx] } : col
        )
      );
      clearColumnProducts();
    }
  }, [columnProducts]);

  const handleSelectProducts = (columnIdx?: number) => {
    router.push({
      pathname: "/admin/pages/select-products",
      params: {
        colIdx: columnIdx,
        selectedProducts: JSON.stringify(
          columnIdx !== undefined && columnIdx !== null
            ? columns[columnIdx].products
            : selectedProducts
        ),
      },
    });
  };

  const handleSave = () => {
    if (!sectionName.trim()) {
      Toast.show({ type: "error", text1: "Please enter a section name" });
      return;
    }
    setIsLoading(true);
    // Debug: Show all built column data before submit
    console.log("BUILT COLUMN DATA:", {
      builtColumnNames,
      builtColumnProducts,
      builtColumnBrands,
      builtColumnCategories,
      columns,
    });
    const newSection: Section = {
      name: sectionName.trim(),
      description: sectionDescription.trim(),
      number_of_items: parseInt(itemCount) || 100,
      items_per_column:
        displayStyle === 3 ? parseInt(itemsPerColumn) || 3 : undefined,
      column_count: displayStyle === 3 ? parseInt(columnCount) || 2 : undefined,
      column_names: displayStyle === 3 ? builtColumnNames : undefined,
      column_variables: displayStyle === 3 ? columnVariables : undefined,
      column_products: displayStyle === 3 ? builtColumnProducts : undefined,
      column_brands: displayStyle === 3 ? builtColumnBrands : undefined,
      column_categories: displayStyle === 3 ? builtColumnCategories : undefined,
      display_type: displayType,
      display_style: displayStyle,
      mode: mode,
      isActive: isActive,
      order: 0,
      products: mode === "manual" ? selectedProducts : undefined,
      categories: mode === "manual" ? selectedCategories : undefined,
      brands: mode === "manual" ? selectedBrands : undefined,
      variable_source: variableSource,
      autoCriteria: mode === "auto" ? autoCriteria : undefined,
    };
    if (isEditing && section && section._id) {
      updateSection.mutate(
        { id: section._id, sectionData: newSection },
        {
          onSuccess: () => {
            Toast.show({
              type: "success",
              text1: "Section updated successfully",
            });
            router.back();
          },
          onError: (error: any) => {
            Toast.show({
              type: "error",
              text1: error?.message || "Failed to update section",
            });
          },
          onSettled: () => setIsLoading(false),
        }
      );
    } else {
      createSection.mutate(newSection, {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: "Section created successfully",
          });
          router.back();
        },
        onError: (error: any) => {
          Toast.show({
            type: "error",
            text1: error?.message || "Failed to create section",
          });
        },
        onSettled: () => setIsLoading(false),
      });
    }
  };

  const handleDelete = () => {
    if (!section._id) return;
    Alert.alert(
      "Delete Section",
      "Are you sure you want to delete this section?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (section && section._id) {
                await deleteSection.mutateAsync(section._id);
                Toast.show({ type: "success", text1: "Section deleted" });
                router.back();
              }
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: error?.message || "Failed to delete section",
              });
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View
      style={{
        padding: 10,
        paddingTop: Constants.statusBarHeight,
        backgroundColor: Colors.brandGray,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={25} color="black" />
      </TouchableOpacity>
      <View style={[styles.headerCenter, { flex: 3 }]}>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111" }}>
          {isEditing ? "Edit Section" : "Add Section"}
        </Text>
      </View>

      <TouchableOpacity onPress={handleSave}>
        {isEditing ? (
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111" }}>
            Update
          </Text>
        ) : (
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111" }}>
            Save
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // BottomSheet for categories/brands
  const renderBottomSheet = (
    type: "category" | "brand",
    activeColumnIdx?: number
  ) => (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["50%"]}
      enablePanDownToClose={true}
      onChange={(index) => {
        if (index === -1) {
          setShowCategorySheet(false);
          setShowBrandSheet(false);
        }
      }}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <FlatList<any>
          data={type === "category" ? categories : brands}
          keyExtractor={(item) => item?._id || String(item)}
          renderItem={({ item }) => {
            const isSelected =
              displayStyle !== 3
                ? type === "category"
                  ? selectedCategories.some((c) => c._id === item._id)
                  : selectedBrands.some((b) => b._id === item._id)
                : activeColumnIdx !== undefined &&
                  ((type === "category" &&
                    columns[activeColumnIdx].categories.some(
                      (c) => c._id === item._id
                    )) ||
                    (type === "brand" &&
                      columns[activeColumnIdx].brands.some(
                        (b) => b._id === item._id
                      )));
            return (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  borderBottomWidth: 1,
                  borderColor: "#eee",
                  backgroundColor: isSelected ? "#e0e0e0" : "#fff",
                }}
                onPress={() => {
                  if (displayStyle !== 3) {
                    if (type === "category") {
                      const already = selectedCategories.some(
                        (c) => c._id === item._id
                      );
                      const newCategories = already
                        ? selectedCategories.filter((c) => c._id !== item._id)
                        : [...selectedCategories, item];
                      setSelectedCategories(newCategories);
                    } else {
                      const already = selectedBrands.some(
                        (b) => b._id === item._id
                      );
                      const newBrands = already
                        ? selectedBrands.filter((b) => b._id !== item._id)
                        : [...selectedBrands, item];
                      setSelectedBrands(newBrands);
                    }
                  } else {
                    if (activeColumnIdx === undefined) return;
                    if (type === "category") {
                      const already = columns[activeColumnIdx].categories.some(
                        (c) => c._id === item._id
                      );
                      const newCategories = already
                        ? columns[activeColumnIdx].categories.filter(
                            (c) => c._id !== item._id
                          )
                        : [...columns[activeColumnIdx].categories, item];
                      handleColumnCategoriesChange(
                        activeColumnIdx,
                        newCategories
                      );
                    } else {
                      const already = columns[activeColumnIdx].brands.some(
                        (b) => b._id === item._id
                      );
                      const newBrands = already
                        ? columns[activeColumnIdx].brands.filter(
                            (b) => b._id !== item._id
                          )
                        : [...columns[activeColumnIdx].brands, item];
                      handleColumnBrandsChange(activeColumnIdx, newBrands);
                    }
                  }
                }}
              >
                {/* Radio button */}
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: isSelected ? "#8B0000" : "#333",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    backgroundColor: isSelected ? "#8B0000" : "#fff",
                  }}
                >
                  {isSelected ? (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#fff",
                      }}
                    />
                  ) : null}
                </View>
                <Text>{item?.name || "Unnamed"}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </BottomSheetView>
    </BottomSheet>
  );

  const addColumn = () => {
    setColumns((prev) => [
      ...prev,
      { name: "", products: [], categories: [], brands: [] },
    ]);
  };

  const removeColumn = (colIdx: number) => {
    setColumns((prev) => prev.filter((_, idx) => idx !== colIdx));
  };

  const handleColumnNameChange = (colIdx: number, name: string) => {
    setColumns((prev) =>
      prev.map((col, idx) => (idx === colIdx ? { ...col, name } : col))
    );
  };

  const handleColumnProductsChange = (colIdx: number, products: any[]) => {
    setColumns((prev) =>
      prev.map((col, idx) => (idx === colIdx ? { ...col, products } : col))
    );
  };

  const handleColumnCategoriesChange = (colIdx: number, categories: any[]) => {
    setColumns((prev) =>
      prev.map((col, idx) => (idx === colIdx ? { ...col, categories } : col))
    );
  };

  const handleColumnBrandsChange = (colIdx: number, brands: any[]) => {
    setColumns((prev) =>
      prev.map((col, idx) => (idx === colIdx ? { ...col, brands } : col))
    );
  };

  // Section-level remove handlers
  const handleRemoveBrand = (id: string) => {
    setSelectedBrands((prev) => prev.filter((b) => b._id !== id));
  };
  const handleRemoveCategory = (id: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c._id !== id));
  };
  const handleRemoveProduct = (id: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p._id !== id));
  };
  // Column-level remove handlers
  const handleRemoveBrandColumn = (colIdx: number, id: string) => {
    setColumns((prev) =>
      prev.map((col, idx) =>
        idx === colIdx
          ? { ...col, brands: col.brands.filter((b) => b._id !== id) }
          : col
      )
    );
  };
  const handleRemoveCategoryColumn = (colIdx: number, id: string) => {
    setColumns((prev) =>
      prev.map((col, idx) =>
        idx === colIdx
          ? { ...col, categories: col.categories.filter((c) => c._id !== id) }
          : col
      )
    );
  };
  const handleRemoveProductColumn = (colIdx: number, id: string) => {
    setColumns((prev) =>
      prev.map((col, idx) =>
        idx === colIdx
          ? { ...col, products: col.products.filter((p) => p._id !== id) }
          : col
      )
    );
  };

  useEffect(() => {
    if (isEditing && params.section && typeof params.section === "string") {
      try {
        const parsed = JSON.parse(params.section);
        setSectionName(parsed.name || "");
        setNumberOfItems(parsed.number_of_items || 100);
        setSectionDescription(parsed.description || "");
        setNumberOfItems(
          parsed.number_of_items ? String(parsed.number_of_items) : ""
        );
        setDisplayStyle(parsed.display_style || 1);
        setDisplayType(parsed.display_type || "brand");
        setMode(parsed.mode || "manual");
        setIsActive(parsed.isActive !== undefined ? parsed.isActive : true);
        setSelectedBrands(parsed.brands || []);
        setSelectedCategories(parsed.categories || []);
        setSelectedProducts(parsed.products || []);

        // --- Fix: Reconstruct columns from column_names and column_products ---
        if (parsed.column_names && parsed.column_products) {
          const colKeys = Object.keys(parsed.column_names);
          const newColumns = colKeys.map((colKey) => {
            const colProdEntry = parsed.column_products.find(
              (cp: any) => cp.column === colKey
            );
            return {
              name: parsed.column_names[colKey] || "",
              products: colProdEntry
                ? getProductObjects(colProdEntry.products)
                : [],
              brands: [],
              categories: [],
            };
          });
          setColumns(newColumns);
        } else if (parsed.columns) {
          setColumns(parsed.columns);
        }
      } catch {}
    }
  }, [isEditing, params.section, allProducts]);

  // Build column_names and column_products from columns state
  let builtColumnNames: { [key: string]: string } = {};
  let builtColumnProducts: { column: string; products: string[] }[] = [];
  let builtColumnBrands: { column: string; products: string[] }[] = [];
  let builtColumnCategories: { column: string; products: string[] }[] = [];

  if (displayStyle === 3) {
    columns.forEach((col, idx) => {
      const colKey = `C${idx + 1}`;
      builtColumnNames[colKey] = col.name;
      builtColumnProducts.push({
        column: colKey,
        products: (col.products || []).map((p: any) => p._id),
      });
      builtColumnBrands.push({
        column: colKey,
        products: (col.brands || []).map((b: any) => b._id),
      });
      builtColumnCategories.push({
        column: colKey,
        products: (col.categories || []).map((c: any) => c._id),
      });
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {renderHeader()}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Top-level section fields */}
        <Text style={styles.label}>Section Name</Text>
        <TextInput
          value={sectionName}
          onChangeText={setSectionName}
          style={styles.input}
          placeholder="Enter section name"
        />
        <Text style={styles.label}>Description</Text>
        <TextInput
          value={sectionDescription}
          onChangeText={setSectionDescription}
          style={styles.input}
          placeholder="Enter description"
        />
        <Text style={styles.label}>Number of Items</Text>
        <TextInput
          value={numberOfItems}
          onChangeText={setNumberOfItems}
          style={styles.input}
          placeholder="e.g. 15"
          keyboardType="numeric"
        />
        {/* Display Type Selector */}
        <Text style={styles.label}>Display Type</Text>
        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          {["brand", "category", "product", "custom"].map((type) => (
            <TouchableOpacity
              key={type}
              style={{
                backgroundColor:
                  displayType === type ? Colors.brandGray : "#eee",
                padding: 10,
                borderRadius: 8,
                marginRight: 10,
              }}
              onPress={() => setDisplayType(type)}
            >
              <Text>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Mode Selector */}
        <Text style={styles.label}>Mode</Text>
        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          {["manual", "auto"].map((m) => (
            <TouchableOpacity
              key={m}
              style={{
                backgroundColor: mode === m ? Colors.brandGray : "#eee",
                padding: 10,
                borderRadius: 8,
                marginRight: 10,
              }}
              onPress={() => setMode(m as "auto" | "manual")}
            >
              <Text>{m.charAt(0).toUpperCase() + m.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Display Style Selector */}
        <Text style={styles.label}>Display Style</Text>
        <View style={{ flexDirection: "column", marginBottom: 16, gap: 10 }}>
          {[1, 2, 3].map((styleNum) => (
            <TouchableOpacity
              key={styleNum}
              style={{
                backgroundColor:
                  displayStyle === styleNum ? Colors.brandGray : "#eee",
                padding: 10,
                borderRadius: 8,
                marginRight: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onPress={() => setDisplayStyle(styleNum)}
            >
              <View
                style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
              >
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                  {styleNum}
                </Text>

                <Image
                  source={displayStyleImages[styleNum]}
                  style={{
                    width: SIZES.width * 0.452,
                    height: 100,
                    borderRadius: 8,
                    objectFit: "contain",
                  }}
                />
              </View>

              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 6,
                  backgroundColor:
                    displayStyle === styleNum ? "#fff" : Colors.brandGray,
                  borderWidth: 1,
                  borderColor: Colors.brandGray,
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
        {/* Section-level selectors for style 1 or 2 */}
        {displayStyle !== 3 && (
          <>
            {displayType === "brand" && (
              <>
                <Text style={styles.label}>Select Brand</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowBrandSheet(true)}
                >
                  <Text>
                    {Array.isArray(selectedBrands) && selectedBrands.length > 0
                      ? selectedBrands
                          .map((b) => b?.name || "Unnamed")
                          .join(", ")
                      : "Select a brand"}
                  </Text>
                </TouchableOpacity>

                {/* Slected brands */}
                <View
                  style={{
                    flexWrap: "wrap",
                    flexDirection: "row",
                    gap: 10,
                  }}
                >
                  {selectedBrands.map((b) => (
                    <View
                      key={b._id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 10,
                        backgroundColor: "#eee",
                        padding: 10,
                        borderRadius: 8,
                        justifyContent: "space-between",
                      }}
                    >
                      <Text>{b.name}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveBrand(b._id)}
                      >
                        <Ionicons name="trash" size={20} color="#8B0000" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}
            {displayType === "category" && (
              <>
                <Text style={styles.label}>Select Category</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowCategorySheet(true)}
                >
                  <Text>
                    {Array.isArray(selectedCategories) &&
                    selectedCategories.length > 0
                      ? selectedCategories
                          .map((c) => c?.name || "Unnamed")
                          .join(", ")
                      : "Select a category"}
                  </Text>
                </TouchableOpacity>

                {/* Slected categories */}
                <View
                  style={{
                    flexWrap: "wrap",
                    flexDirection: "row",
                    gap: 10,
                  }}
                >
                  {selectedCategories.map((c) => (
                    <View
                      key={c._id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 10,
                        backgroundColor: "#eee",
                        padding: 10,
                        borderRadius: 8,
                        justifyContent: "space-between",
                      }}
                    >
                      <Text>{c.name}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveCategory(c._id)}
                      >
                        <Ionicons name="trash" size={20} color="#8B0000" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}
            {displayType === "product" && (
              <>
                <Text style={styles.label}>Select Products</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => handleSelectProducts()}
                >
                  <Text>
                    {Array.isArray(selectedProducts) &&
                    selectedProducts.length > 0
                      ? `${selectedProducts.length} products selected`
                      : "Select products"}
                  </Text>
                </TouchableOpacity>

                {/* Slected products */}
                <View>
                  {selectedProducts.map((p) => (
                    <View
                      key={p._id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 10,
                        backgroundColor: "#eee",
                        padding: 10,
                        borderRadius: 8,
                        justifyContent: "space-between",
                      }}
                    >
                      <Text>{p.name}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveProduct(p._id)}
                      >
                        <Ionicons name="trash" size={20} color="#8B0000" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}
        {/* Column config for style 3 */}
        {displayStyle === 3 && (
          <View style={{ marginBottom: 16 }}>
            {columns.map((col, colIdx) => (
              <View
                key={colIdx}
                style={{
                  marginBottom: 32,
                  borderBottomWidth: 1,
                  borderColor: "#eee",
                }}
              >
                <Text style={styles.label}>Column {colIdx + 1} Name</Text>
                <TextInput
                  style={styles.input}
                  value={col.name}
                  onChangeText={(text) => handleColumnNameChange(colIdx, text)}
                  placeholder="Type name"
                />
                {/* Column-based selectors for display type */}
                {displayType === "brand" && (
                  <>
                    <Text style={styles.label}>Select Brands</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => {
                        setActiveColumnIdx(colIdx);
                        setShowBrandSheet(true);
                      }}
                    >
                      <Text>
                        {col.brands.length > 0
                          ? col.brands
                              .map((b) => b?.name || "Unnamed")
                              .join(", ")
                          : "Select brands"}
                      </Text>
                    </TouchableOpacity>

                    {/* Slected brands */}
                    <View
                      style={{
                        flexWrap: "wrap",
                        flexDirection: "row",
                        gap: 10,
                      }}
                    >
                      {col.brands.map((b) => (
                        <View
                          key={b._id}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 10,
                            backgroundColor: "#eee",
                            padding: 10,
                            borderRadius: 8,
                            justifyContent: "space-between",
                            width: SIZES.width * 0.452,
                          }}
                        >
                          <Text>{b.name}</Text>
                          <TouchableOpacity
                            onPress={() =>
                              handleRemoveBrandColumn(colIdx, b._id)
                            }
                          >
                            <Ionicons name="trash" size={20} color="#8B0000" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </>
                )}
                {displayType === "category" && (
                  <>
                    <Text style={styles.label}>Select Categories</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => {
                        setActiveColumnIdx(colIdx);
                        setShowCategorySheet(true);
                      }}
                    >
                      <Text>
                        {col.categories.length > 0
                          ? col.categories
                              .map((c) => c?.name || "Unnamed")
                              .join(", ")
                          : "Select categories"}
                      </Text>
                    </TouchableOpacity>

                    {/* Slected categories */}
                    <View
                      style={{
                        flexWrap: "wrap",
                        flexDirection: "row",
                        gap: 10,
                      }}
                    >
                      {col.categories.map((c) => (
                        <View
                          key={c._id}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 10,
                            backgroundColor: "#eee",
                            padding: 10,
                            borderRadius: 8,
                            justifyContent: "space-between",
                            width: SIZES.width * 0.452,
                          }}
                        >
                          <Text>{c.name}</Text>
                          <TouchableOpacity
                            onPress={() =>
                              handleRemoveCategoryColumn(colIdx, c._id)
                            }
                          >
                            <Ionicons name="trash" size={20} color="#8B0000" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </>
                )}
                {displayType === "product" && mode === "manual" && (
                  <>
                    <Text style={styles.label}>Select Products</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => handleSelectProducts(colIdx)}
                    >
                      <Text>
                        {col.products.length > 0
                          ? `${col.products.length} products selected`
                          : "Select products"}
                      </Text>
                    </TouchableOpacity>

                    {/* Slected products */}
                    <View>
                      {col.products.map((p) => (
                        <View
                          key={p._id}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 10,
                            backgroundColor: "#eee",
                            padding: 10,
                            borderRadius: 8,
                            justifyContent: "space-between",
                          }}
                        >
                          <Text>{p.name}</Text>
                          <TouchableOpacity
                            onPress={() =>
                              handleRemoveProductColumn(colIdx, p._id)
                            }
                          >
                            <Ionicons name="trash" size={20} color="#8B0000" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </>
                )}
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                  onPress={() => removeColumn(colIdx)}
                >
                  <Text style={{ color: "#D32F2F" }}>Remove Column</Text>
                </TouchableOpacity>
              </View>
            ))}
            {/* Add Column button below all columns */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 16,
                justifyContent: "center",
                backgroundColor: "#eee",
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
              }}
              onPress={addColumn}
            >
              <Text
                style={{ color: "#8B0000", fontWeight: "bold", fontSize: 14 }}
              >
                Add Column
              </Text>
              <Ionicons name="add" size={20} color="#8B0000" />
            </TouchableOpacity>
          </View>
        )}
        {/* Bottom sheets and loading overlay */}
        {showCategorySheet &&
          renderBottomSheet(
            "category",
            activeColumnIdx !== null ? activeColumnIdx : undefined
          )}
        {showBrandSheet &&
          renderBottomSheet(
            "brand",
            activeColumnIdx !== null ? activeColumnIdx : undefined
          )}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.brandGray} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 15,
    color: "#333",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: Colors.brandGray,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
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
    marginBottom: 16,
  },
  subContainer: {
    paddingHorizontal: 16,
  },
  //Container section style
});

export default AddNewHomeFeedSection;
