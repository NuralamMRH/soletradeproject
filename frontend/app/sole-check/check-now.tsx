import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { useRouter } from "expo-router";
import { useCategories } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";
import { useSubBrands } from "@/hooks/useSubBrands";
import { baseUrl } from "@/api/MainApi";
import PhotoCaptureModal from "./PhotoCaptureModal";

const { width } = Dimensions.get("window");

const steps = ["Category", "Brand", "Model", "Details", "Submit"];

const models = [
  {
    id: 1,
    brandId: 2,
    name: "Jordan 1 Low",
    image:
      "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b1e2e8d-2e7e-4e2e-8e7e-2e7e4e2e8e7e/air-jordan-1-low-shoes-6Q1tFM.png",
  },
  {
    id: 2,
    brandId: 2,
    name: "Jordan 1",
    image:
      "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b1e2e8d-2e7e-4e2e-8e7e-2e7e4e2e8e7e/air-jordan-1-low-shoes-6Q1tFM.png",
  },
  {
    id: 3,
    brandId: 2,
    name: "Jordan 2",
    image:
      "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b1e2e8d-2e7e-4e2e-8e7e-2e7e4e2e8e7e/air-jordan-1-low-shoes-6Q1tFM.png",
  },
  {
    id: 4,
    brandId: 1,
    name: "Adidas Superstar",
    image:
      "https://assets.adidas.com/images/w_600,f_auto,q_auto/0c6e2e8d2e7e4e2e8e7e2e7e4e2e8e7e_9366/Superstar_Shoes_White_FV3284_01_standard.jpg",
  },
  {
    id: 5,
    brandId: 6,
    name: "Nike Air Max",
    image:
      "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b1e2e8d-2e7e-4e2e-8e7e-2e7e4e2e8e7e/air-jordan-1-low-shoes-6Q1tFM.png",
  },
];

const photoInstructions = [
  { id: 1, label: "Outer Exterior", image: models[0].image },
  { id: 2, label: "Inner Exterior", image: models[0].image },
  { id: 3, label: "Heel", image: models[0].image },
  { id: 4, label: "Front Tongue", image: models[0].image },
  { id: 5, label: "Back Tongue", image: models[0].image },
  { id: 6, label: "Inside Label", image: models[0].image },
  { id: 7, label: "Outsole", image: models[0].image },
  { id: 8, label: "Insole", image: models[0].image },
  { id: 9, label: "Back of Insole", image: models[0].image },
  { id: 10, label: "Insole Sewing", image: models[0].image },
  { id: 11, label: "Date Code", image: models[0].image },
  { id: 12, label: "Box Label", image: models[0].image },
];

const CheckNow = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<
    { id: number; uri: string }[]
  >([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhotoInstruction, setSelectedPhotoInstruction] =
    useState<any>(null);
  const [photoUris, setPhotoUris] = useState<{ [id: number]: string }>({});

  // Fetch from hooks
  const { categories: rawCategories = [], loading: loadingCategories } =
    useCategories();
  const { brands: rawBrands = [], loading: loadingBrands } = useBrands();
  const { subBrands: rawModels = [], loading: loadingModels } =
    useSubBrands(selectedBrand);

  // Explicitly type as any[] for linter
  const categories: any[] = rawCategories;
  const brands: any[] = rawBrands;
  const models: any[] = rawModels;
  const photoInstructions: any[] = [
    {
      id: 1,
      label: "Outer Exterior",
      image: models[0]?.logo || models[0]?.image,
    },
    {
      id: 2,
      label: "Inner Exterior",
      image: models[0]?.logo || models[0]?.image,
    },
    { id: 3, label: "Heel", image: models[0]?.logo || models[0]?.image },
    {
      id: 4,
      label: "Front Tongue",
      image: models[0]?.logo || models[0]?.image,
    },
    { id: 5, label: "Back Tongue", image: models[0]?.logo || models[0]?.image },
    {
      id: 6,
      label: "Inside Label",
      image: models[0]?.logo || models[0]?.image,
    },
    { id: 7, label: "Outsole", image: models[0]?.logo || models[0]?.image },
    { id: 8, label: "Insole", image: models[0]?.logo || models[0]?.image },
    {
      id: 9,
      label: "Back of Insole",
      image: models[0]?.logo || models[0]?.image,
    },
    {
      id: 10,
      label: "Insole Sewing",
      image: models[0]?.logo || models[0]?.image,
    },
    { id: 11, label: "Date Code", image: models[0]?.logo || models[0]?.image },
    { id: 12, label: "Box Label", image: models[0]?.logo || models[0]?.image },
  ];

  // Progress bar rendering
  const renderProgress = () => (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarLine} />
      <View style={styles.progressBarSteps}>
        {steps.map((label, idx) => (
          <View key={label} style={styles.progressStepContainer}>
            <View
              style={[
                styles.progressCircle,
                idx <= step && {
                  borderColor: COLORS.brandColor,
                  backgroundColor: idx === step ? COLORS.brandColor : "#fff",
                },
              ]}
            />
            <Text
              style={[
                styles.progressLabel,
                idx === step && {
                  color: COLORS.brandColor,
                  fontWeight: "bold",
                },
              ]}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Step 1: Category
  if (step === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerIcon}
          >
            <Ionicons name="arrow-back" size={28} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select a Category</Text>
        </View>
        {renderProgress()}
        {loadingCategories ? (
          <Text style={{ textAlign: "center", marginTop: 40 }}>Loading...</Text>
        ) : (
          <View style={styles.gridContainer}>
            {categories.map((cat: any) => (
              <TouchableOpacity
                key={cat._id}
                style={styles.gridItem}
                onPress={() => {
                  setSelectedCategory(cat._id);
                  setStep(1);
                }}
              >
                <Image
                  source={{
                    uri:
                      `${baseUrl}${cat.image_full_url}` ||
                      "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b1e2e8d-2e7e-4e2e-8e7e-2e7e4e2e8e7e/air-jordan-1-low-shoes-6Q1tFM.png",
                  }}
                  style={styles.gridImage}
                />
                <Text style={styles.gridLabel}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }

  // Step 2: Brand
  if (step === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => setStep(0)}
            style={styles.headerIcon}
          >
            <Ionicons name="arrow-back" size={28} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select a Brand</Text>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="search" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>
        {renderProgress()}
        {loadingBrands ? (
          <Text style={{ textAlign: "center", marginTop: 40 }}>Loading...</Text>
        ) : (
          <ScrollView style={{ flex: 1 }}>
            {brands.map((brand: any) => (
              <TouchableOpacity
                key={brand._id}
                style={styles.brandRow}
                onPress={() => {
                  setSelectedBrand(brand._id);
                  setStep(2);
                }}
              >
                <Image
                  source={{
                    uri:
                      `${baseUrl}${brand.image_full_url}` ||
                      "https://upload.wikimedia.org/wikipedia/commons/3/36/Jordan_brand.svg",
                  }}
                  style={styles.brandLogo}
                />
                <Text style={styles.brandName}>{brand.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  // Step 3: Model (subBrand)
  if (step === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => setStep(1)}
            style={styles.headerIcon}
          >
            <Ionicons name="arrow-back" size={28} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select a Model</Text>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="search" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>
        {renderProgress()}
        {loadingModels ? (
          <Text style={{ textAlign: "center", marginTop: 40 }}>Loading...</Text>
        ) : (
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.modelGridContainer}>
              {models.map((model: any) => (
                <TouchableOpacity
                  key={model._id}
                  style={styles.gridItem}
                  onPress={() => {
                    setSelectedModel(model._id);
                    setStep(3);
                  }}
                >
                  <Image
                    source={{
                      uri:
                        `${baseUrl}${model.image_full_url}` ||
                        "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b1e2e8d-2e7e-4e2e-8e7e-2e7e4e2e8e7e/air-jordan-1-low-shoes-6Q1tFM.png",
                    }}
                    style={styles.gridImage}
                  />
                  <Text style={styles.gridLabel}>{model.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    );
  }

  // Step 4: Details
  if (step === 3) {
    const selectedBrandObj = brands.find((b: any) => b._id === selectedBrand);
    const selectedModelObj = models.find((m: any) => m._id === selectedModel);
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => setStep(2)}
            style={styles.headerIcon}
          >
            <Ionicons name="arrow-back" size={28} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Start Authentication</Text>
        </View>
        {renderProgress()}
        <View style={styles.selectedRow}>
          {selectedBrandObj && (
            <Image
              source={{
                uri:
                  selectedBrandObj.logo ||
                  selectedBrandObj.image ||
                  "https://upload.wikimedia.org/wikipedia/commons/3/36/Jordan_brand.svg",
              }}
              style={styles.brandLogo}
            />
          )}
          {selectedModelObj && (
            <View style={{ alignItems: "center" }}>
              <Image
                source={{
                  uri:
                    selectedModelObj.logo ||
                    selectedModelObj.image ||
                    "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b1e2e8d-2e7e-4e2e-8e7e-2e7e4e2e8e7e/air-jordan-1-low-shoes-6Q1tFM.png",
                }}
                style={styles.shoeThumb}
              />
              <Text style={styles.modelName}>{selectedModelObj.name}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.photoInstructionsBtn}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={COLORS.brandColor}
          />
          <Text style={styles.photoInstructionsText}>
            View Photo Instructions
          </Text>
        </TouchableOpacity>
        <View style={styles.photoGridContainer}>
          {photoInstructions.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.photoGridItem}
              onPress={() => {
                setSelectedPhotoInstruction(item);
                setModalVisible(true);
              }}
            >
              <Image
                source={{
                  uri:
                    photoUris[item.id] ||
                    item.image ||
                    "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b1e2e8d-2e7e-4e2e-8e7e-2e7e4e2e8e7e/air-jordan-1-low-shoes-6Q1tFM.png",
                }}
                style={styles.photoGridImage}
              />
              <Text style={styles.photoGridLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.photoGridItem}>
            <View style={styles.photoGridAddBox}>
              <Ionicons name="add" size={32} color={COLORS.brandColor} />
            </View>
            <Text style={styles.photoGridLabel}>Additional</Text>
          </View>
        </View>
        <PhotoCaptureModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onPhotoTaken={(uri: string) => {
            if (selectedPhotoInstruction) {
              setPhotoUris((prev) => ({
                ...prev,
                [selectedPhotoInstruction.id]: uri,
              }));
            }
          }}
          photoType={selectedPhotoInstruction?.label || "Photo"}
          initialPhotoUri={
            selectedPhotoInstruction
              ? photoUris[selectedPhotoInstruction.id]
              : undefined
          }
        />
      </View>
    );
  }

  // Step 5: Submit (not shown in images, so just a placeholder)
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Submit</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  headerIcon: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
  },
  progressBarContainer: {
    marginTop: 8,
    marginBottom: 12,
    marginHorizontal: 8,
    height: 48,
    justifyContent: "center",
  },
  progressBarLine: {
    position: "absolute",
    top: 22,
    left: 24,
    right: 24,
    height: 4,
    backgroundColor: COLORS.brandColor,
    borderRadius: 2,
  },
  progressBarSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 8,
  },
  progressStepContainer: {
    alignItems: "center",
    width: 60,
  },
  progressCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#bbb",
    backgroundColor: "#fff",
    marginBottom: 2,
  },
  progressLabel: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 16,
  },
  gridItem: {
    width: width / 2.5,
    alignItems: "center",
    marginBottom: 24,
  },
  gridImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: "#eee",
  },
  gridLabel: {
    fontSize: 15,
    color: "#222",
    textAlign: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.brandColor,
    backgroundColor: "#fff",
  },
  brandLogo: {
    width: 44,
    height: 44,
    resizeMode: "contain",
    marginRight: 16,
  },
  brandName: {
    fontSize: 18,
    color: "#222",
    fontWeight: "bold",
  },
  modelGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 16,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  shoeThumb: {
    width: 70,
    height: 48,
    resizeMode: "contain",
    marginBottom: 2,
  },
  modelName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginTop: 2,
  },
  photoInstructionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.brandColor,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    padding: 10,
  },
  photoInstructionsText: {
    color: COLORS.brandColor,
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 8,
  },
  photoGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 8,
  },
  photoGridItem: {
    width: width / 4.2,
    alignItems: "center",
    marginBottom: 18,
  },
  photoGridImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: "#eee",
  },
  photoGridLabel: {
    fontSize: 12,
    color: "#222",
    textAlign: "center",
  },
  photoGridAddBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.brandColor,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});

export default CheckNow;
