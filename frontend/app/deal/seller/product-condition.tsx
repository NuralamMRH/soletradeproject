import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useListCreation } from "@/context/ListCreationContext";
import AdminHeader from "@/components/AdminHeader";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "@/constants";

const imageLabels = [
  "Outer Exterior",
  "Inner Exterior",
  "Heel",
  "Top",
  "Bottom",
  "Inside Label",
  "Insole",
  "Back of Insole",
  "Box",
];

const imagePlaceholders = [
  require("@/assets/images/product-conditions/outer-exterior.png"),
  require("@/assets/images/product-conditions/inner-exterior.png"),
  require("@/assets/images/product-conditions/heel.png"),
  require("@/assets/images/product-conditions/top.png"),
  require("@/assets/images/product-conditions/bottom.png"),
  require("@/assets/images/product-conditions/inside-label.png"),
  require("@/assets/images/product-conditions/insole.png"),
  require("@/assets/images/product-conditions/back-of-insole.png"),
  require("@/assets/images/product-conditions/box.png"),
];

export default function ProductCondition() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const attribute = params.attribute as any;
  const size = params.size as string;
  const [tab, setTab] = useState<"product" | "box">("product");
  const [selectedCondition, setSelectedCondition] = useState<string | null>(
    null
  );
  const [selectedBoxCondition, setSelectedBoxCondition] = useState<
    string | null
  >(null);

  const [showSizeSheet, setShowSizeSheet] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");

  const { images } = useListCreation();

  const sizeSheetRef = useRef<any>(null);

  let variations: any[] = [];
  if (typeof params.variations === "string") {
    try {
      variations = JSON.parse(params.variations);
    } catch {
      variations = [];
    }
  } else if (Array.isArray(params.variations)) {
    variations = params.variations;
  }

  const attributeName = !params.attribute?.name
    ? variations.find(
        (variation: any) => variation.optionName === selectedSize || size
      )?.attributeId.name
    : params.attribute?.name;
  // When a condition is selected, switch to box tab
  const handleSelectCondition = (condition: string) => {
    setSelectedCondition(condition);
  };
  // When a condition is selected, switch to box tab
  const handleSelectBoxCondition = (condition: string) => {
    setSelectedBoxCondition(condition);
    router.push({
      pathname: "/deal/seller/place-ask",
      params: {
        attribute: attribute,
        size: selectedSize || size,
        sizeId: selectedSize
          ? variations.find(
              (variation: any) => variation.optionName === selectedSize
            )?._id
          : (params.sizeId as string),
        variations: variations,
        boxCondition: condition,
        productCondition: selectedCondition,
        image: params.image,
        images: images,
        ...params,
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <AdminHeader
        onBack={() => router.back()}
        backgroundColor={"black"}
        center={
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
            Air Jordan
          </Text>
        }
      />

      <View style={{ padding: 16, alignItems: "center" }}>
        <Text style={{ color: "#aaa" }}>
          Air Jordan 1 Low OG Travis Scott Medium Olive
        </Text>
      </View>

      {/* Header */}
      <View style={{ padding: 16 }}>
        <TouchableOpacity onPress={() => setShowSizeSheet(true)}>
          <Text style={{ color: "#fff", marginTop: 8 }}>
            Size: {`${selectedSize || size} ${attributeName}`}
            <Ionicons name="pencil" size={14} color="#fff" />
          </Text>
        </TouchableOpacity>

        <Image
          source={{ uri: params.image as string }}
          style={{ width: 100, height: 60, alignSelf: "flex-end" }}
        />
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderColor: "#333",
        }}
      >
        <TouchableOpacity
          style={[styles.tab, tab === "product" && styles.activeTab]}
          onPress={() => setTab("product")}
        >
          <Text style={{ color: "#fff" }}>Product Condition</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "box" && styles.activeTab]}
          onPress={() => setTab("box")}
        >
          <Text style={{ color: "#fff" }}>Box Condition</Text>
        </TouchableOpacity>
      </View>

      {/* Product Condition List */}
      {tab === "product" && (
        <>
          {!selectedCondition && (
            <View style={{ flex: 1, padding: 16 }}>
              <Text style={{ color: "#fff", fontSize: 18, marginBottom: 16 }}>
                Select Product Condition
              </Text>
              {["New", "Used", "New with Defects"].map((cond) => (
                <TouchableOpacity
                  key={cond}
                  style={[
                    styles.conditionOption,
                    selectedCondition === cond && { borderColor: "#c00" },
                  ]}
                  onPress={() => handleSelectCondition(cond)}
                >
                  <Text style={{ color: "#fff", fontSize: 16 }}>{cond}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {selectedCondition && (
            <ScrollView contentContainerStyle={styles.gridContainer}>
              <Text style={{ color: "#fff", fontSize: 18, marginBottom: 16 }}>
                Upload Images
              </Text>
              <View style={styles.grid}>
                {imageLabels.map((label, idx) => (
                  <View key={label} style={styles.gridItem}>
                    <TouchableOpacity
                      style={[
                        styles.imageBlock,
                        images[idx]
                          ? { borderColor: "#c00" }
                          : { borderColor: "#fff" },
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: "/capture-image",
                          params: { slot: idx },
                        })
                      }
                    >
                      <Image
                        source={
                          images[idx]
                            ? { uri: images[idx] }
                            : imagePlaceholders[idx]
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 8,
                        }}
                      />
                    </TouchableOpacity>
                    <Text style={styles.imageLabel}>{label}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={[
                  styles.nextBtn,
                  images.every(Boolean)
                    ? { backgroundColor: "#444" }
                    : { backgroundColor: "#222" },
                ]}
                disabled={!images.every(Boolean)}
                onPress={() => {
                  setTab("box");
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16 }}>Next</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </>
      )}

      {/* Box Condition Image Grid */}
      {tab === "box" && (
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ color: "#fff", fontSize: 18, marginBottom: 16 }}>
            Select Product Condition
          </Text>
          {["Good Condition", "Damaged Condition", "Missing Box"].map(
            (cond) => (
              <TouchableOpacity
                key={cond}
                style={[
                  styles.conditionOption,
                  selectedBoxCondition === cond && { borderColor: "#c00" },
                ]}
                onPress={() => handleSelectBoxCondition(cond)}
              >
                <Text style={{ color: "#fff", fontSize: 16 }}>{cond}</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )}

      {/* Size BottomSheet */}
      <BottomSheet
        ref={sizeSheetRef}
        index={showSizeSheet ? 0 : -1}
        snapPoints={["50%"]}
        enablePanDownToClose={true}
        onClose={() => setShowSizeSheet(false)}
        backgroundStyle={{ backgroundColor: "#222" }}
        handleIndicatorStyle={{ backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ flex: 1, padding: 20 }}>
          {/* Size Selection Grid */}

          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 20 }}
              >
                Select Size
              </Text>
              <TouchableOpacity>
                <Text style={{ color: "white", fontSize: 14 }}>
                  Size Chart &gt;
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {variations &&
                variations?.map((variation: any, idx: number) => (
                  <TouchableOpacity
                    key={variation._id}
                    style={{
                      width: "30%",
                      marginBottom: 16,
                      borderWidth: 2,
                      borderColor:
                        selectedSize === variation.optionName ? "red" : "#888",
                      borderRadius: 8,
                      paddingVertical: 16,
                      alignItems: "center",
                      backgroundColor:
                        selectedSize === variation.optionName
                          ? "#222"
                          : "transparent",
                    }}
                    onPress={() => {
                      setSelectedSize(variation.optionName);
                      sizeSheetRef.current?.close();
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      {variation.optionName} {attributeName}
                    </Text>
                    <Text style={{ color: "#fff", fontSize: 14, marginTop: 4 }}>
                      {variation.retailPrice} Baht
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: COLORS.grayTie,
  },
  activeTab: {
    borderColor: COLORS.brandRed,
  },
  conditionOption: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  gridContainer: {
    padding: 16,
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 24,
  },
  gridItem: {
    width: SIZES.width / 3 - 32,
    alignItems: "center",
    margin: 8,
  },
  imageBlock: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  imageLabel: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
  },
  nextBtn: {
    width: SIZES.width - 32,
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "center",
  },
});
