import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCategories } from "@/hooks/useCategories";
import { useSubCategories } from "@/hooks/useSubCategories";
import { useBrands } from "@/hooks/useBrands";
import { useSubBrands } from "@/hooks/useSubBrands";
import { useIndicators } from "@/hooks/useIndicators";
import { useAttributes } from "@/hooks/useAttributes";
import { useAttributeOptions } from "@/hooks/useAttributeOptions";
// @ts-ignore
import Slider from "@react-native-community/slider";
import AdminHeader from "@/components/AdminHeader";
import { useListCreation } from "@/context/ListCreationContext";
import { SIZES } from "@/constants";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import Price from "@/utils/Price";
import { useProducts } from "@/hooks/useProducts";

// Types
interface AccordionSectionProps {
  title: string;
  expanded: boolean;
  onPress: () => void;
  children: React.ReactNode;
  showArrow?: boolean;
}

interface Category {
  _id: string;
  name: string;
}
interface SubCategory {
  _id: string;
  name: string;
}
interface Brand {
  _id: string;
  name: string;
}
interface Indicator {
  _id: string;
  name: string;
}
interface Attribute {
  _id: string;
  name: string;
}
interface AttributeOption {
  _id: string;
  optionName: string;
}

type ExpandedSections = {
  category: boolean;
  brands: boolean;
  year: boolean;
  month: boolean;
  day: boolean;
  serviceTypes: boolean;
  indicators: boolean;
  attributes: boolean;
  attribute: boolean;
  price: boolean;
  colors: boolean;
};

type SelectedAttributes = {
  [attributeId: string]: string[];
};

type AttributeOptionsMap = {
  [attributeId: string]: {
    attributeOptions: AttributeOption[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
  };
};

interface AttributeOptionsSectionProps {
  attribute: Attribute;
  selected: string[];
  onToggle: (optionId: string) => void;
}

const AttributeOptionsSection: React.FC<AttributeOptionsSectionProps> = ({
  attribute,
  selected,
  onToggle,
}) => {
  const { attributeOptions = [], loading } = useAttributeOptions(
    attribute._id
  ) as { attributeOptions: AttributeOption[]; loading: boolean };
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.attributeTitle}>{attribute.name}</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        attributeOptions.map((opt) => (
          <TouchableOpacity
            key={opt._id}
            style={styles.checkboxRow}
            onPress={() => onToggle(opt._id)}
          >
            <Ionicons
              name={selected?.includes(opt._id) ? "checkbox" : "square-outline"}
              size={20}
              color="#222"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.optionText}>{opt.optionName}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};
AttributeOptionsSection.displayName = "AttributeOptionsSection";

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  expanded,
  onPress,
  children,
  showArrow = true,
}) => (
  <View style={styles.accordionSection}>
    <TouchableOpacity style={styles.accordionHeader} onPress={onPress}>
      <Text style={styles.accordionTitle}>{title}</Text>
      {showArrow && (
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#222"
        />
      )}
    </TouchableOpacity>
    {expanded && <View style={styles.accordionContent}>{children}</View>}
  </View>
);

interface SubBrandsDropdownProps {
  brandId: string;
  selectedSubBrand: string[];
  setSelectedSubBrand: (ids: string[]) => void;
}

const SubBrandsDropdown: React.FC<SubBrandsDropdownProps> = ({
  brandId,
  selectedSubBrand,
  setSelectedSubBrand,
}) => {
  const { subBrands = [], loading: loadingSubBrands } = useSubBrands(
    brandId
  ) as { subBrands: Brand[]; loading: boolean };
  const toggleCheckbox = (
    arr: string[],
    setArr: (v: string[]) => void,
    value: string
  ) => {
    if (arr.includes(value)) {
      setArr(arr.filter((v) => v !== value));
    } else {
      setArr([...arr, value]);
    }
  };
  if (loadingSubBrands) return <ActivityIndicator />;
  if (!subBrands.length) return null;
  return (
    <View style={{ marginLeft: 24 }}>
      {subBrands.map((sub) => (
        <TouchableOpacity
          key={sub._id}
          style={styles.checkboxRow}
          onPress={() =>
            toggleCheckbox(selectedSubBrand, setSelectedSubBrand, sub._id)
          }
        >
          <Ionicons
            name={
              selectedSubBrand.includes(sub._id) ? "checkbox" : "square-outline"
            }
            size={20}
            color="#222"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.optionText}>{sub.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
SubBrandsDropdown.displayName = "SubBrandsDropdown";

const FilterPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const filterType = params.filterType as
    | string
    | "products"
    | "essentials"
    | "services";
  // Accordion state
  const [expanded, setExpanded] = useState<ExpandedSections>({
    category: true,
    brands: false,
    year: false,
    month: false,
    day: false,
    serviceTypes: false,
    indicators: false,
    attributes: false,
    attribute: false,
    price: false,
    colors: false,
  });

  // Filter state
  const {
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    selectedAttribute,
    setSelectedAttribute,
    selectedVariations,
    setSelectedVariations,
    selectedBrand,
    setSelectedBrand,
    selectedSubBrand,
    setSelectedSubBrand,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    selectedDay,
    setSelectedDay,
    selectedIndicators,
    setSelectedIndicators,
    selectedAttributes,
    setSelectedAttributes,
    selectedServiceTypes,
    setSelectedServiceTypes,
    price,
    setPrice,
    colors,
    setColors,
    clearAll,
  } = useListCreation();

  // Data hooks
  const { categories = [], loading: loadingCategories } = useCategories() as {
    categories: Category[];
    loading: boolean;
  };
  const { subCategories = [], loading: loadingSubCategories } =
    useSubCategories(selectedCategory) as {
      subCategories: SubCategory[];
      loading: boolean;
    };

  const { brands = [], loading: loadingBrands } = useBrands() as {
    brands: Brand[];
    loading: boolean;
  };
  const { subBrands = [], loading: loadingSubBrands } = useSubBrands(
    selectedBrand[0] || null
  ) as { subBrands: Brand[]; loading: boolean };
  const { indicators = [], loading: loadingIndicators } = useIndicators() as {
    indicators: Indicator[];
    loading: boolean;
  };
  const { attributes = [], loading: loadingAttributes } = useAttributes() as {
    attributes: Attribute[];
    loading: boolean;
  };

  const { attributeOptions = [], loading: loadingAttributeOptions } =
    useAttributeOptions(selectedAttribute) as {
      attributeOptions: AttributeOption[];
      loading: boolean;
    };
  const { products = [], loading: loadingProducts } = useProducts({
    filter: null,
  });
  // Years and months (static for now)
  const years: number[] = [2023, 2024];
  const months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const colorPalette: string[] = [
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "black",
    "white",
    "gray",
    "brown",
    "orange",
    "pink",
  ];

  // Accordion toggle
  const toggleSection = (key: keyof ExpandedSections) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle filter submit
  const handleViewResults = () => {
    router.back();
  };

  // Checkbox helper
  const toggleCheckbox = <T,>(arr: T[], setArr: (v: T[]) => void, value: T) => {
    if (arr.includes(value)) {
      setArr(arr.filter((v) => v !== value));
    } else {
      setArr([...arr, value]);
    }
  };

  // Renderers
  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <AdminHeader
        onBack={() => router.back()}
        title="Filter By"
        right={
          <TouchableOpacity onPress={() => clearAll()}>
            <Text style={styles.clearAll}>Clear All</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={{ flex: 1 }}>
        {filterType === "products" && (
          <>
            {/* CATEGORY */}
            <AccordionSection
              title="CATEGORY"
              expanded={expanded.category}
              onPress={() => toggleSection("category")}
            >
              {loadingCategories ? (
                <ActivityIndicator />
              ) : (
                !selectedCategory &&
                categories.map((cat) => (
                  <TouchableOpacity
                    key={cat._id}
                    style={[
                      styles.optionRow,
                      selectedCategory === cat._id && styles.selectedOption,
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat._id);
                      setSelectedSubCategory([]);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedCategory === cat._id &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}

              {/* Subcategories - now multiple select */}
              {selectedCategory && expanded.category && (
                <View style={{ marginLeft: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontWeight: "bold" }}>
                      {categories.find((c) => c._id === selectedCategory)?.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedSubCategory([]);
                        setSelectedCategory(null);
                        setExpanded({ ...expanded, category: false });
                      }}
                    >
                      <Text>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  {loadingSubCategories ? (
                    <ActivityIndicator />
                  ) : (
                    subCategories.map((sub) => (
                      <TouchableOpacity
                        key={sub._id}
                        style={styles.checkboxRow}
                        onPress={() =>
                          toggleCheckbox(
                            selectedSubCategory,
                            setSelectedSubCategory,
                            sub._id
                          )
                        }
                      >
                        <Ionicons
                          name={
                            selectedSubCategory.includes(sub._id)
                              ? "checkbox"
                              : "square-outline"
                          }
                          size={20}
                          color="#222"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.optionText}>{sub.name}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </AccordionSection>
            {/* BRANDS */}
            <AccordionSection
              title="BRANDS"
              expanded={expanded.brands}
              onPress={() => toggleSection("brands")}
            >
              {loadingBrands ? (
                <ActivityIndicator />
              ) : (
                brands.map((brand) => (
                  <React.Fragment key={brand._id}>
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        toggleCheckbox(
                          selectedBrand,
                          setSelectedBrand,
                          brand._id
                        )
                      }
                    >
                      <Ionicons
                        name={
                          selectedBrand.includes(brand._id)
                            ? "checkbox"
                            : "square-outline"
                        }
                        size={20}
                        color="#222"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.optionText}>{brand.name}</Text>
                    </TouchableOpacity>
                    {/* Sub-brands dropdown for this brand if selected */}
                    {selectedBrand.includes(brand._id) && (
                      <SubBrandsDropdown
                        brandId={brand._id}
                        selectedSubBrand={selectedSubBrand}
                        setSelectedSubBrand={setSelectedSubBrand}
                      />
                    )}
                  </React.Fragment>
                ))
              )}
            </AccordionSection>
            {/* SIZES */}
            <AccordionSection
              title="SIZES"
              expanded={expanded.attribute}
              onPress={() => toggleSection("attribute")}
            >
              {loadingAttributes ? (
                <ActivityIndicator />
              ) : (
                !selectedAttribute &&
                attributes.map((attr) => (
                  <TouchableOpacity
                    key={attr._id}
                    style={[
                      styles.optionRow,
                      selectedAttribute === attr._id && styles.selectedOption,
                    ]}
                    onPress={() => {
                      setSelectedAttribute(attr._id);
                      setSelectedVariations([]);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedAttribute === attr._id &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {attr.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}

              {/* Attribute Options - now multiple select */}
              {selectedAttribute && expanded.attribute && (
                <View style={{ marginLeft: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontWeight: "bold" }}>
                      {
                        attributes.find((a) => a._id === selectedAttribute)
                          ?.name
                      }
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedAttribute(null);
                        setSelectedVariations([]);
                        setExpanded({ ...expanded, attribute: false });
                      }}
                    >
                      <Text>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  {loadingAttributeOptions ? (
                    <ActivityIndicator />
                  ) : (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{
                        flexDirection: "row",
                        marginTop: 8,
                      }}
                    >
                      {attributeOptions.map((opt) => (
                        <TouchableOpacity
                          key={opt._id}
                          style={{
                            width: SIZES.width / 4 - 32,
                            height: SIZES.width / 4 - 32,
                            borderWidth: 2,
                            borderColor: selectedVariations.includes(opt._id)
                              ? "#8B0000"
                              : "#333",
                            marginRight: 8,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          onPress={() =>
                            toggleCheckbox(
                              selectedVariations,
                              setSelectedVariations,
                              opt._id
                            )
                          }
                        >
                          <Text
                            style={[styles.optionText, { textAlign: "center" }]}
                          >
                            {opt.optionName}{" "}
                            {
                              attributes.find(
                                (a) => a._id === selectedAttribute
                              )?.name
                            }
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}
            </AccordionSection>

            <AccordionSection
              title="PRICE"
              expanded={expanded.price}
              onPress={() => toggleSection("price")}
            >
              <MultiSlider
                values={price}
                min={0}
                max={1000000}
                step={100}
                sliderLength={SIZES.width - 50}
                onValuesChange={(vals: number[]) =>
                  setPrice(vals as [number, number])
                }
                selectedStyle={{ backgroundColor: "#8B0000" }}
                unselectedStyle={{ backgroundColor: "#ccc" }}
                containerStyle={{ flex: 1, marginHorizontal: 8 }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 8,
                }}
              >
                <Text>
                  <Price
                    price={Number(price[0].toString().padStart(2, "0"))}
                    currency="THB"
                  />
                </Text>

                <Text style={{ textAlign: "right" }}>
                  <Price
                    price={Number(price[1].toString().padStart(2, "0"))}
                    currency="THB"
                  />
                </Text>
              </View>
            </AccordionSection>
            {/* INDICATORS */}
            <AccordionSection
              title="INDICATORS"
              expanded={expanded.indicators}
              onPress={() => toggleSection("indicators")}
            >
              {loadingIndicators ? (
                <ActivityIndicator />
              ) : (
                indicators.map((indicator) => (
                  <TouchableOpacity
                    key={indicator._id}
                    style={styles.checkboxRow}
                    onPress={() =>
                      toggleCheckbox(
                        selectedIndicators,
                        setSelectedIndicators,
                        indicator._id
                      )
                    }
                  >
                    <Ionicons
                      name={
                        selectedIndicators.includes(indicator._id)
                          ? "checkbox"
                          : "square-outline"
                      }
                      size={20}
                      color="#222"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.optionText}>{indicator.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </AccordionSection>
            {/* COLORS */}
            <AccordionSection
              title="COLORS"
              expanded={expanded.colors}
              onPress={() => toggleSection("colors")}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  flexDirection: "row",
                  marginTop: 8,
                }}
              >
                {colorPalette.map((color) => (
                  <TouchableOpacity
                    style={{
                      marginRight: 8,
                      borderWidth: 2,
                      borderColor: colors.includes(color) ? "#000" : "#ccc",
                      width: 35,
                      height: 35,
                      borderRadius: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    key={color}
                    onPress={() => toggleCheckbox(colors, setColors, color)}
                  >
                    <Ionicons name="ellipse" size={30} color={color} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </AccordionSection>
          </>
        )}
        {filterType === "services" && (
          <>
            {/* YEAR */}
            <AccordionSection
              title="YEAR"
              expanded={expanded.year}
              onPress={() => toggleSection("year")}
            >
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={styles.checkboxRow}
                  onPress={() =>
                    toggleCheckbox(selectedYear, setSelectedYear, year)
                  }
                >
                  <Ionicons
                    name={
                      selectedYear.includes(year)
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={20}
                    color="#222"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.optionText}>{year}</Text>
                </TouchableOpacity>
              ))}
            </AccordionSection>
            {/* MONTH */}
            <AccordionSection
              title="MONTH"
              expanded={expanded.month}
              onPress={() => toggleSection("month")}
            >
              {months.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={styles.checkboxRow}
                  onPress={() =>
                    toggleCheckbox(selectedMonth, setSelectedMonth, month)
                  }
                >
                  <Ionicons
                    name={
                      selectedMonth.includes(month)
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={20}
                    color="#222"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.optionText}>{month}</Text>
                </TouchableOpacity>
              ))}
            </AccordionSection>
            {/* DAY */}
            <AccordionSection
              title="DAY"
              expanded={expanded.day}
              onPress={() => toggleSection("day")}
            >
              <MultiSlider
                values={selectedDay}
                min={1}
                max={31}
                step={1}
                sliderLength={SIZES.width - 50}
                onValuesChange={(vals: number[]) =>
                  setSelectedDay(vals as [number, number])
                }
                selectedStyle={{ backgroundColor: "#8B0000" }}
                unselectedStyle={{ backgroundColor: "#ccc" }}
                containerStyle={{ flex: 1, marginHorizontal: 8 }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 8,
                }}
              >
                <Text style={{ width: 50 }}>
                  {selectedDay[0].toString().padStart(2, "0")} Day
                </Text>

                <Text style={{ width: 50, textAlign: "right" }}>
                  {selectedDay[1].toString().padStart(2, "0")} Day
                </Text>
              </View>
            </AccordionSection>
            {/* SERVICE TYPES (example, can be dynamic) */}
            <AccordionSection
              title="SERVICE TYPES"
              expanded={expanded.serviceTypes}
              onPress={() => toggleSection("serviceTypes")}
            >
              {[
                "Sneaker Protect",
                "Sneaker Clean",
                "Customize your Pair",
                "Sneaker Repair",
              ].map((service) => (
                <TouchableOpacity
                  key={service}
                  style={styles.checkboxRow}
                  onPress={() =>
                    toggleCheckbox(
                      selectedServiceTypes,
                      setSelectedServiceTypes,
                      service
                    )
                  }
                >
                  <Ionicons
                    name={
                      selectedServiceTypes.includes(service)
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={20}
                    color="#222"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.optionText}>{service}</Text>
                </TouchableOpacity>
              ))}
            </AccordionSection>
          </>
        )}
      </ScrollView>
      {/* View Results Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.viewResultsBtn}
          onPress={handleViewResults}
        >
          <Text style={styles.viewResultsText}>View Results</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#e5e5e5",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    color: "#222",
  },
  clearAll: {
    color: "#888",
    fontSize: 14,
  },
  accordionSection: {
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  accordionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  optionRow: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 2,
  },
  selectedOption: {
    backgroundColor: "#e5e5e5",
  },
  optionText: {
    fontSize: 15,
    color: "#222",
  },
  selectedOptionText: {
    fontWeight: "bold",
    color: "#8B0000",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  attributeTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
  footer: {
    padding: 12,
    marginBottom: 10,
  },
  viewResultsBtn: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  viewResultsText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default FilterPage;
