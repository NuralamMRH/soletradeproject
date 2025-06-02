import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Modal,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import type * as ImagePickerTypes from "expo-image-picker";
import {
  useGetVoucher,
  useCreateVoucher,
  useUpdateVoucher,
  useDeleteVoucher,
} from "@/hooks/react-query/useVoucherMutation";
import { useCategories } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";
import { useTiers } from "@/hooks/react-query/useTierMutation";
import AdminHeader from "@/components/AdminHeader";
import { COLORS } from "@/constants";
import { baseUrl } from "@/api/MainApi";
import DateTimePicker from "@react-native-community/datetimepicker";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { usePosters } from "@/hooks/react-query/usePosterMutation";
import { useSubCategories } from "@/hooks/useSubCategories";
import { useSubBrands } from "@/hooks/useSubBrands";
import { useAttributes } from "@/hooks/useAttributes";

interface FormState {
  voucherType: "Weekly" | "One-Time";
  code: string;
  discountType: "Percentage" | "Fixed";
  discountAmount: number;
  maxDiscount: string;
  minSpend: string;
  startDate: string;
  endDate: string;
  appliesToEntireApp: boolean;
  categories: string[];
  subCategories: string[];
  brands: string[];
  subBrands: string[];
  attributes: string[];
  tiers: string[];
  totalIssued: string;
  limitPerCustomer: number;
  shipmentMethods: string[];
  paymentMethods: string[];
  orderTypes: string[];
  terms: string[];
  posterId: string | null;
  status: string;
  brand: string;
  image: string;
}

type Poster = {
  _id: string;
  image_full_url?: string;
  image?: string;
  [key: string]: any;
};

type Category = { _id: string; name: string };
type Brand = { _id: string; name: string };
type Tier = { _id: string; name: string };

const SHIPMENT_METHODS = ["Standard", "Express", "Pickup"];
const PAYMENT_METHODS = [
  "Credit Card",
  "Bank Transfer",
  "Cash on Delivery",
  "Wallet",
];
const ORDER_TYPES = ["Normal", "Preorder", "Flash Sale"];
const STATUS_OPTIONS = ["Ongoing", "Expired", "Scheduled"];

const AddEditVoucher: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const voucherId = params.id as string | undefined;
  const voucherType = params.voucherType as "Weekly" | "One-Time" | undefined;
  const isEdit = !!voucherId;

  const { data: voucherData } = useGetVoucher(voucherId || "");
  const { mutate: createVoucher } = useCreateVoucher();
  const { mutate: updateVoucher } = useUpdateVoucher();
  const { mutate: deleteVoucher } = useDeleteVoucher();

  const { categories = [] } = useCategories() as { categories: Category[] };
  const { brands = [] } = useBrands() as { brands: Brand[] };
  const { data: tiers = [] } = useTiers() as { data: Tier[] };
  const postersQuery = usePosters();
  const posters = postersQuery.data?.data || [];

  const { subCategories = [] } = useSubCategories(null) as {
    subCategories: Category[];
  };
  const { subBrands = [] } = useSubBrands(null) as { subBrands: Brand[] };
  const { attributes = [] } = useAttributes() as { attributes: Brand[] };

  const [bottomSheetType, setBottomSheetType] = useState("poster");

  const bottomSheetRef = useRef<any>(null);
  const snapPoints = useMemo(() => ["25%", "75%"], []);

  const openSheet = (type: string) => {
    setBottomSheetType(type);
    bottomSheetRef.current?.expand();
  };

  const [form, setForm] = useState<FormState>({
    voucherType: voucherType || "One-Time",
    code: "",
    discountType: "Percentage",
    discountAmount: 1,
    maxDiscount: "",
    minSpend: "",
    startDate: "",
    endDate: "",
    appliesToEntireApp: false,
    categories: [],
    subCategories: [],
    brands: [],
    subBrands: [],
    attributes: [],
    tiers: [],
    totalIssued: "",
    limitPerCustomer: 1,
    shipmentMethods: [],
    paymentMethods: [],
    orderTypes: [],
    terms: [""],
    posterId: null,
    status: "Ongoing",
    brand: "",
    image: "",
  });
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [showDateSheet, setShowDateSheet] = useState(false);
  const [dateType, setDateType] = useState<"start" | "end" | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const dateSheetRef = useRef<any>(null);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerOptions, setPickerOptions] = useState<string[]>([]);
  const [pickerKey, setPickerKey] = useState<keyof FormState | null>(null);
  const [pickerMulti, setPickerMulti] = useState(false);

  const [brandImage, setBrandImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null); // For upload

  const [pickerTemp, setPickerTemp] = useState<any>(null);
  const pickerSheetRef = useRef<any>(null);

  useEffect(() => {
    if (voucherData) {
      setForm({
        ...voucherData,
        brands:
          voucherData.brands?.map((b: any) =>
            typeof b === "string" ? b : b._id
          ) || [],
        categories:
          voucherData.categories?.map((c: any) =>
            typeof c === "string" ? c : c._id
          ) || [],
        subCategories:
          voucherData.subCategories?.map((sc: any) =>
            typeof sc === "string" ? sc : sc._id
          ) || [],
        subBrands:
          voucherData.subBrands?.map((sb: any) =>
            typeof sb === "string" ? sb : sb._id
          ) || [],
        attributes:
          voucherData.attributes?.map((a: any) =>
            typeof a === "string" ? a : a._id
          ) || [],
        tiers:
          voucherData.tiers?.map((t: any) =>
            typeof t === "string" ? t : t._id
          ) || [],
        terms:
          voucherData.terms && voucherData.terms.length
            ? voucherData.terms
            : [""],
      });
    }
  }, [voucherData]);

  useEffect(() => {
    if (voucherData) {
      setBrandImage(
        voucherData.image_full_url
          ? `${baseUrl}${voucherData.image_full_url}`
          : voucherData.image_full_url
      );
    }
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, [voucherData]);

  const handleChange = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleMultiSelect = (key: keyof FormState, value: string) => {
    setForm((prev) => {
      const arr = prev[key] as string[];
      return arr.includes(value)
        ? { ...prev, [key]: arr.filter((v) => v !== value) }
        : { ...prev, [key]: [...arr, value] };
    });
  };

  const handleTermChange = (idx: number, value: string) => {
    setForm((prev) => {
      const terms = [...prev.terms];
      terms[idx] = value;
      return { ...prev, terms };
    });
  };

  const addTerm = () => {
    setForm((prev) => ({ ...prev, terms: [...prev.terms, ""] }));
  };

  const removeTerm = (idx: number) => {
    setForm((prev) => {
      const terms = [...prev.terms];
      terms.splice(idx, 1);
      return { ...prev, terms };
    });
  };

  const handlePosterSelect = (posterId: string) => {
    setForm((prev) => ({ ...prev, posterId: posterId }));
    setShowPosterModal(false);
  };

  const handleSubmit = () => {
    // Validate required fields
    // console.log("startDate", form.startDate);

    if (
      !form.code ||
      !form.discountType ||
      !form.discountAmount ||
      !form.startDate ||
      !form.endDate ||
      !form.totalIssued
    ) {
      alert("Please fill all required fields.");
      return;
    }
    const payload = {
      ...form,
      discountAmount: Number(form.discountAmount),
      maxDiscount:
        form.maxDiscount !== "" ? Number(form.maxDiscount) : undefined,
      minSpend: form.minSpend !== "" ? Number(form.minSpend) : undefined,
      totalIssued: Number(form.totalIssued),
      limitPerCustomer: Number(form.limitPerCustomer),
      startDate: form.startDate,
      endDate: form.endDate,
      image: imageFile,
    };
    console.log("SUBMIT PAYLOAD", JSON.stringify(payload, null, 2));
    if (isEdit) {
      updateVoucher(
        { id: voucherId!, ...payload },
        { onSuccess: () => router.back() }
      );
    } else {
      createVoucher(payload, { onSuccess: () => router.back() });
    }
  };

  const handleDelete = () => {
    if (isEdit) {
      deleteVoucher(voucherId!, { onSuccess: () => router.back() });
    }
  };

  // Poster list with add new option

  const handleAddNewPoster = () => {
    // TODO: Implement poster upload/creation
    router.push("/admin/vouchers/manage-posters");
  };

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date: string | Date) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
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
          // Native: use uri as files
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

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      <AdminHeader
        title={isEdit ? "Edit Voucher" : "Add Voucher"}
        onBack={() => router.back()}
        right={
          <TouchableOpacity onPress={handleSubmit}>
            <Text>{isEdit ? "Update" : "Save"}</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView style={styles.container}>
        {voucherType === "Weekly" && (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Brand</Text>
              <TextInput
                style={styles.input}
                value={form.brand}
                onChangeText={(v) => handleChange("brand", v.toUpperCase())}
              />
            </View>
            <View style={styles.imageSection}>
              <Text style={styles.label}>Logo</Text>
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
          </>
        )}

        {/* Voucher Code, Discount Type, Amount, etc. */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Voucher Code</Text>
          <TextInput
            style={styles.input}
            value={form.code}
            onChangeText={(v) => handleChange("code", v.toUpperCase())}
          />
        </View>
        <View style={styles.formGroupRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Discount Type</Text>
            <TouchableOpacity
              onPress={() =>
                handleChange(
                  "discountType",
                  form.discountType === "Percentage" ? "Fixed" : "Percentage"
                )
              }
              style={styles.input}
            >
              <Text>{form.discountType}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Discount Amount</Text>
            <TextInput
              style={styles.input}
              value={form.discountAmount.toString()}
              onChangeText={(v) => handleChange("discountAmount", Number(v))}
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={styles.formGroupRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Max Discount</Text>
            <TextInput
              style={styles.input}
              value={form.maxDiscount?.toString()}
              onChangeText={(v) => handleChange("maxDiscount", v)}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Minimum Spend</Text>
            <TextInput
              style={styles.input}
              value={form.minSpend?.toString()}
              onChangeText={(v) => handleChange("minSpend", v)}
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={styles.formGroupRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Total Issued</Text>
            <TextInput
              style={styles.input}
              value={form.totalIssued?.toString()}
              onChangeText={(v) => handleChange("totalIssued", v)}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Limit Per Customer</Text>
            <TextInput
              style={styles.input}
              value={form.limitPerCustomer?.toString()}
              onChangeText={(v) => handleChange("limitPerCustomer", Number(v))}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroupRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Starting Date</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setDateType("start");
                setTempDate(
                  form.startDate ? new Date(form.startDate) : new Date()
                );
                setShowDateSheet(true);
                setTimeout(() => dateSheetRef.current?.expand(), 10);
              }}
              activeOpacity={0.7}
            >
              <Text>
                {form.startDate ? formatDate(form.startDate) : "YYYY-MM-DD"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Ending Date</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setDateType("end");
                setTempDate(form.endDate ? new Date(form.endDate) : new Date());
                setShowDateSheet(true);
                setTimeout(() => dateSheetRef.current?.expand(), 10);
              }}
              activeOpacity={0.7}
            >
              <Text>{formatDate(form.endDate) || "YYYY-MM-DD"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.label}>Shipment Methods</Text>
            <TouchableOpacity
              style={styles.selectAllBtn}
              onPress={() => {
                if (form.shipmentMethods.length === SHIPMENT_METHODS.length) {
                  handleChange("shipmentMethods", []);
                } else {
                  handleChange("shipmentMethods", [...SHIPMENT_METHODS]);
                }
              }}
            >
              <Text style={styles.selectAllText}>
                {form.shipmentMethods.length === SHIPMENT_METHODS.length
                  ? "Clear All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inlinePickerList}>
            {SHIPMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method}
                style={styles.inlinePickerItem}
                onPress={() => handleMultiSelect("shipmentMethods", method)}
              >
                <Ionicons
                  name={
                    form.shipmentMethods.includes(method)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={20}
                  color={COLORS.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: form.shipmentMethods.includes(method)
                      ? COLORS.primary
                      : undefined,
                  }}
                >
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.label}>Payment Methods</Text>
            <TouchableOpacity
              style={styles.selectAllBtn}
              onPress={() => {
                if (form.paymentMethods.length === PAYMENT_METHODS.length) {
                  handleChange("paymentMethods", []);
                } else {
                  handleChange("paymentMethods", [...PAYMENT_METHODS]);
                }
              }}
            >
              <Text style={styles.selectAllText}>
                {form.paymentMethods.length === PAYMENT_METHODS.length
                  ? "Clear All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inlinePickerList}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method}
                style={styles.inlinePickerItem}
                onPress={() => handleMultiSelect("paymentMethods", method)}
              >
                <Ionicons
                  name={
                    form.paymentMethods.includes(method)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={20}
                  color={COLORS.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: form.paymentMethods.includes(method)
                      ? COLORS.primary
                      : undefined,
                  }}
                >
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.label}>Order Types</Text>
            <TouchableOpacity
              style={styles.selectAllBtn}
              onPress={() => {
                if (form.orderTypes.length === ORDER_TYPES.length) {
                  handleChange("orderTypes", []);
                } else {
                  handleChange("orderTypes", [...ORDER_TYPES]);
                }
              }}
            >
              <Text style={styles.selectAllText}>
                {form.orderTypes.length === ORDER_TYPES.length
                  ? "Clear All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inlinePickerList}>
            {ORDER_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.inlinePickerItem}
                onPress={() => handleMultiSelect("orderTypes", type)}
              >
                <Ionicons
                  name={
                    form.orderTypes.includes(type)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={20}
                  color={COLORS.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: form.orderTypes.includes(type)
                      ? COLORS.primary
                      : undefined,
                  }}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.inlinePickerList}>
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.inlinePickerItem}
                onPress={() => handleChange("status", status)}
              >
                <Ionicons
                  name={
                    form.status === status
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={COLORS.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: form.status === status ? COLORS.primary : undefined,
                  }}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories, Brands, etc. */}
        <View style={styles.formGroup}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.label}>Categories</Text>
            <TouchableOpacity
              style={styles.selectAllBtn}
              onPress={() => {
                if (form.categories.length === categories.length) {
                  handleChange("categories", []);
                } else {
                  handleChange(
                    "categories",
                    categories.map((cat) => cat._id)
                  );
                }
              }}
            >
              <Text style={styles.selectAllText}>
                {form.categories.length === categories.length
                  ? "Clear All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inlinePickerList}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                style={styles.inlinePickerItem}
                onPress={() => handleMultiSelect("categories", cat._id)}
              >
                <Ionicons
                  name={
                    form.categories.includes(cat._id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={20}
                  color={COLORS.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: form.categories.includes(cat._id)
                      ? COLORS.primary
                      : undefined,
                  }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.formGroup}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.label}>Brands</Text>
            <TouchableOpacity
              style={styles.selectAllBtn}
              onPress={() => {
                if (form.brands.length === brands.length) {
                  handleChange("brands", []);
                } else {
                  handleChange(
                    "brands",
                    brands.map((brand) => brand._id)
                  );
                }
              }}
            >
              <Text style={styles.selectAllText}>
                {form.brands.length === brands.length
                  ? "Clear All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inlinePickerList}>
            {brands.map((brand) => (
              <TouchableOpacity
                key={brand._id}
                style={styles.inlinePickerItem}
                onPress={() => handleMultiSelect("brands", brand._id)}
              >
                <Ionicons
                  name={
                    form.brands.includes(brand._id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={20}
                  color={COLORS.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: form.brands.includes(brand._id)
                      ? COLORS.primary
                      : undefined,
                  }}
                >
                  {brand.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.formGroup}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.label}>Tiers</Text>
            <TouchableOpacity
              style={styles.selectAllBtn}
              onPress={() => {
                if (form.tiers.length === tiers.length) {
                  handleChange("tiers", []);
                } else {
                  handleChange(
                    "tiers",
                    tiers.map((tier) => tier._id)
                  );
                }
              }}
            >
              <Text style={styles.selectAllText}>
                {form.tiers.length === tiers.length
                  ? "Clear All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inlinePickerList}>
            {tiers.map((tier) => (
              <TouchableOpacity
                key={tier._id}
                style={styles.inlinePickerItem}
                onPress={() => handleMultiSelect("tiers", tier._id)}
              >
                <Ionicons
                  name={
                    form.tiers.includes(tier._id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={20}
                  color={COLORS.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: form.tiers.includes(tier._id)
                      ? COLORS.primary
                      : undefined,
                  }}
                >
                  {tier.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.formGroup}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.label}>Sub Categories</Text>
            <TouchableOpacity
              style={styles.selectAllBtn}
              onPress={() => {
                if (form.subCategories.length === subCategories.length) {
                  handleChange("subCategories", []);
                } else {
                  handleChange(
                    "subCategories",
                    subCategories.map((sc) => sc._id)
                  );
                }
              }}
            >
              <Text style={styles.selectAllText}>
                {form.subCategories.length === subCategories.length
                  ? "Clear All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inlinePickerList}>
            {subCategories.map((sc) => (
              <TouchableOpacity
                key={sc._id}
                style={styles.inlinePickerItem}
                onPress={() => handleMultiSelect("subCategories", sc._id)}
              >
                <Ionicons
                  name={
                    form.subCategories.includes(sc._id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={20}
                  color={COLORS.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: form.subCategories.includes(sc._id)
                      ? COLORS.primary
                      : undefined,
                  }}
                >
                  {sc.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.formGroup}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.label}>Sub Brands</Text>
            <TouchableOpacity
              style={styles.selectAllBtn}
              onPress={() => {
                if (form.subBrands.length === subBrands.length) {
                  handleChange("subBrands", []);
                } else {
                  handleChange(
                    "subBrands",
                    subBrands.map((sb) => sb._id)
                  );
                }
              }}
            >
              <Text style={styles.selectAllText}>
                {form.subBrands.length === subBrands.length
                  ? "Clear All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inlinePickerList}>
            {subBrands.map((sb) => (
              <TouchableOpacity
                key={sb._id}
                style={styles.inlinePickerItem}
                onPress={() => handleMultiSelect("subBrands", sb._id)}
              >
                <Ionicons
                  name={
                    form.subBrands.includes(sb._id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={20}
                  color={COLORS.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: form.subBrands.includes(sb._id)
                      ? COLORS.primary
                      : undefined,
                  }}
                >
                  {sb.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.formGroup}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.label}>Attributes</Text>
            <TouchableOpacity
              style={styles.selectAllBtn}
              onPress={() => {
                if (form.attributes.length === attributes.length) {
                  handleChange("attributes", []);
                } else {
                  handleChange(
                    "attributes",
                    attributes.map((a) => a._id)
                  );
                }
              }}
            >
              <Text style={styles.selectAllText}>
                {form.attributes.length === attributes.length
                  ? "Clear All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inlinePickerList}>
            {attributes.map((a) => (
              <TouchableOpacity
                key={a._id}
                style={styles.inlinePickerItem}
                onPress={() => handleMultiSelect("attributes", a._id)}
              >
                <Ionicons
                  name={
                    form.attributes.includes(a._id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={20}
                  color={COLORS.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: form.attributes.includes(a._id)
                      ? COLORS.primary
                      : undefined,
                  }}
                >
                  {a.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Terms and Conditions */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Terms and Conditions</Text>
          {form.terms.map((term, idx) => (
            <View key={idx} style={styles.termRow}>
              <TextInput
                style={{
                  ...styles.input,
                  flex: 1,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: "#eee",
                }}
                value={term}
                onChangeText={(v) => handleTermChange(idx, v)}
                placeholder={`Term ${idx + 1}`}
              />
              {form.terms.length > 1 && (
                <TouchableOpacity onPress={() => removeTerm(idx)}>
                  <Ionicons
                    name="remove-circle-outline"
                    size={24}
                    color={"#e53935"}
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity onPress={addTerm} style={styles.addTermBtn}>
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.addTermText}>Add</Text>
          </TouchableOpacity>
        </View>
        {/* Poster Picker */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { marginBottom: 10 }]}>
            Select poster +
          </Text>
          <TouchableOpacity
            style={styles.posterOption}
            onPress={() => openSheet("poster")}
          >
            {form.posterId ? (
              <Image
                source={{
                  uri: form.posterId
                    ? `${baseUrl}${
                        posters.find((p) => p._id === form.posterId)
                          ?.image_full_url
                      }`
                    : "",
                }}
                style={{
                  opacity: form.posterId === form.posterId ? 1 : 0.9,
                  backgroundColor:
                    form.posterId === form.posterId ? "#b2dfdb" : "#fff",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            ) : (
              <Ionicons name="image-outline" size={32} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>
        {/* Save/Delete/Cancel Buttons */}
        <View style={[styles.btnRow, { marginBottom: 50 }]}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          {isEdit && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Poster Modal */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        handleIndicatorStyle={{ backgroundColor: "#000" }}
        backgroundStyle={{ backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ flex: 1, padding: 16 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16 }}
            >
              Select Poster
            </Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
              <Text style={{ color: COLORS.primary, fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            {posters.map((item: Poster) => (
              <TouchableOpacity
                key={item._id}
                style={styles.posterOption}
                onPress={() => {
                  handlePosterSelect(item._id);
                  bottomSheetRef.current?.close();
                }}
              >
                {item?.image_full_url ? (
                  <Image
                    source={{
                      uri: item.image_full_url
                        ? `${baseUrl}${item.image_full_url}`
                        : item.image,
                    }}
                    style={{
                      opacity: form.posterId === item._id ? 1 : 0.9,
                      backgroundColor:
                        form.posterId === item._id ? "#b2dfdb" : "#eee",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#eee",
                    }}
                  >
                    <Ionicons
                      name="image-outline"
                      size={32}
                      color={COLORS.primary}
                    />
                    <Text style={{ color: COLORS.primary, marginTop: 8 }}>
                      Empty Poster
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.posterOption,
                {
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#eee",
                  borderRadius: 10,
                },
              ]}
              onPress={handleAddNewPoster}
            >
              <Ionicons
                name="add-circle-outline"
                size={40}
                color={COLORS.primary}
              />
              <Text style={{ color: COLORS.primary, marginTop: 8 }}>
                Add New
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
      {/* Date Picker Bottom Sheet */}
      <BottomSheet
        ref={dateSheetRef}
        index={-1}
        snapPoints={["35%"]}
        enablePanDownToClose={true}
        onClose={() => setShowDateSheet(false)}
        handleIndicatorStyle={{ backgroundColor: "#000" }}
        backgroundStyle={{ backgroundColor: "#fff" }}
      >
        <BottomSheetView
          style={{
            flex: 1,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={[{ marginRight: 8 }]}
              onPress={() => dateSheetRef.current?.close()}
            >
              <Text style={{ color: COLORS.primary, fontSize: 16 }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text
              style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16 }}
            >
              {dateType === "start"
                ? "Select Starting Date"
                : "Select Ending Date"}
            </Text>
            <TouchableOpacity
              style={{}}
              onPress={() => {
                if (dateType === "start") {
                  handleChange("startDate", tempDate.toISOString());
                } else if (dateType === "end") {
                  handleChange("endDate", tempDate.toISOString());
                }
                dateSheetRef.current?.close();
              }}
            >
              <Text style={{ color: COLORS.primary, fontSize: 16 }}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selectedDate) => {
                if (selectedDate) setTempDate(selectedDate);
              }}
              style={{ width: 320, backgroundColor: "white" }}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
      {/* Picker Bottom Sheet */}
      <BottomSheet
        ref={pickerSheetRef}
        index={-1}
        snapPoints={["40%"]}
        enablePanDownToClose={true}
        onClose={() => setPickerVisible(false)}
        handleIndicatorStyle={{ backgroundColor: "#000" }}
        backgroundStyle={{ backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16 }}>
            Select{" "}
            {pickerKey &&
              pickerKey.charAt(0).toUpperCase() +
                pickerKey.slice(1).replace(/([A-Z])/g, " $1")}
          </Text>
          <ScrollView>
            {pickerOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
                onPress={() => {
                  if (pickerMulti) {
                    if (pickerTemp.includes(option)) {
                      setPickerTemp(
                        pickerTemp.filter((v: string) => v !== option)
                      );
                    } else {
                      setPickerTemp([...pickerTemp, option]);
                    }
                  } else {
                    setPickerTemp(option);
                  }
                }}
              >
                {pickerMulti ? (
                  <Ionicons
                    name={
                      pickerTemp.includes(option)
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={24}
                    color={COLORS.primary}
                    style={{ marginRight: 12 }}
                  />
                ) : (
                  <Ionicons
                    name={
                      pickerTemp === option
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={24}
                    color={COLORS.primary}
                    style={{ marginRight: 12 }}
                  />
                )}
                <Text style={{ fontSize: 16 }}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: 16,
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              style={{ marginRight: 16 }}
              onPress={() => pickerSheetRef.current?.close()}
            >
              <Text style={{ color: COLORS.primary, fontSize: 16 }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (pickerKey) {
                  handleChange(
                    pickerKey,
                    pickerMulti ? pickerTemp : pickerTemp || ""
                  );
                }
                pickerSheetRef.current?.close();
              }}
            >
              <Text style={{ color: COLORS.primary, fontSize: 16 }}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7", padding: 16 },
  formGroup: { marginBottom: 16 },
  formGroupRow: { flexDirection: "row", marginBottom: 16 },
  label: { fontWeight: "bold", marginBottom: 4 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 4,
  },
  multiSelectRow: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    backgroundColor: "#eee",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  chipSelected: { backgroundColor: COLORS.primary },
  chipText: { color: "#333" },
  chipTextSelected: { color: "#fff" },
  termRow: { flexDirection: "row", marginBottom: 4, alignItems: "center" },
  addTermBtn: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  addTermText: { color: COLORS.primary, marginLeft: 4 },
  posterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelBtn: {
    backgroundColor: "#888",
    borderRadius: 6,
    padding: 12,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  cancelText: { color: "#fff", fontWeight: "bold" },
  deleteBtn: {
    backgroundColor: "#e53935", // fallback for COLORS.danger
    borderRadius: 6,
    padding: 12,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  deleteText: { color: "#fff", fontWeight: "bold" },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    padding: 12,
    flex: 1,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "bold" },
  posterModalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  posterModalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "60%",
  },
  posterOption: {
    width: "48%",
    height: 150,
    marginBottom: 10,
    borderRadius: 10,
    borderColor: "#8B0000",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
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
});

export default AddEditVoucher;
