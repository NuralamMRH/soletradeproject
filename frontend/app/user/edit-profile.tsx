import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  FlatList,
} from "react-native";
import { useUpdateUser } from "../../hooks/useUpdateUser";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import * as ImagePicker from "expo-image-picker";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useShippingAddress } from "../../hooks/useShippingAddress";
import { baseUrl } from "@/api/MainApi";
import AdminHeader from "@/components/AdminHeader";
import { Ionicons } from "@expo/vector-icons";
import { COUNTRY_CODES } from "@/utils/COUNTRY_CODES";
import { COLORS } from "@/constants";
import { useAttributes } from "@/hooks/useAttributes";
import { useAttributeOptions } from "@/hooks/useAttributeOptions";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  callingCode?: string;
  sneaker_size?: string;
  avatar?: string;
  role?: string;
  ref_code?: string;
  createdAt?: string;
  updatedAt?: string;
  image?: string;
  image_full_url?: string;
  // Add these fields:
  name?: string;
  gender?: string;
  is_email_verified?: boolean;
  is_phone_verified?: boolean;
}
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
export default function EditProfile() {
  const { user } = useAuth();
  const { getMyShippingAddress } = useShippingAddress();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null); // For upload

  const [form, setForm] = useState({
    name: user?.name || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    sneaker_size: user?.sneaker_size || "",
    gender: user?.gender || "",
    image: "",
  });

  useEffect(() => {
    setForm({
      name: user?.name || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      sneaker_size: user?.sneaker_size || "",
      gender: user?.gender || "",
      email: user?.email || "",
      image: "",
    });
  }, [user]);

  const { updateUser, loading: updating, error: updateError } = useUpdateUser();
  const router = useRouter();
  const [addresses, setAddresses] = useState<any>(null);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [country, setCountry] = useState(COUNTRY_CODES[0]);
  const [countryCode, setCountryCode] = useState("+66");
  const [password, setPassword] = useState<string>("");
  const [isNameEditable, setIsNameEditable] = useState<boolean>(false);
  const [bottomSheet, setBottomSheet] = useState<boolean>(false);
  const [currentEditingSection, setCurrentEditingSection] = useState<
    "address" | "sneaker_size" | "phone" | null
  >(null);

  const [gender, setGender] = useState<string | null>(user?.gender || null);

  const [parentAttributeId, setParentAttributeId] = useState<string | null>(
    null
  );
  const attribute = useAttributes();

  const attributes = attribute.attributes;

  const {
    attributeOptions,
    loading: loadingAttributeOptions,
    error: attributeOptionsError,
    refetch: refetchAttributeOptions,
  } = useAttributeOptions(parentAttributeId) as {
    attributeOptions: AttributeOption[];
    loading: boolean;
    error: any;
    refetch: () => Promise<void>;
  };

  useEffect(() => {
    if (user?.image_full_url) {
      setAvatar(`${baseUrl}${user.image_full_url}`);
    }
  }, [user?.image_full_url]);

  useEffect(() => {
    if (parentAttributeId) {
      refetchAttributeOptions();
    }
  }, [parentAttributeId]);

  const bottomSheetRef = useRef<any>(null);
  const [enableHandlePan, setEnableHandlePan] = useState(true);

  const openBottomSheet = (section: "address" | "sneaker_size" | "phone") => {
    setCurrentEditingSection(section);
    setBottomSheet(true);
    setShippingAddress(null);
    bottomSheetRef.current?.expand();
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close();
    setTimeout(() => {
      setBottomSheet(false);
    }, 300);
  };

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const res = await getMyShippingAddress();
          const addresses = res.shipping || res;

          setAddresses(addresses);
          setShippingAddress(
            addresses.map((address: any) => address.isDefault)[0]
          );
        } catch (e) {
          setAddresses(null);
        }
      })();
    }, [getMyShippingAddress])
  );

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      // Build a plain object, not FormData
      const data: any = {
        name: form.name,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        sneaker_size: form.sneaker_size,
        gender: form.gender,
        email: form.email,
      };
      if (imageFile) {
        data.image = imageFile;
        console.log("data.image", data.image);
      }
      if (password) {
        data.password = password;
      }
      await updateUser(data); // Pass plain object
      router.back();
    } catch (e) {
      // Error is handled by updateError
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
        setAvatar(asset.uri);
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
            name: asset.fileName || asset.uri.split("/").pop() || "image.jpg",
            type: asset.type || "image/jpeg",
          });
        }
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  const handleRemoveImage = () => {
    setAvatar(null);
    setImageFile(null);
  };

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading user data...</Text>
      </View>
    );
  }
  if (attribute.loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading attributes...</Text>
      </View>
    );
  }
  if (attribute.error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: COLORS.brandRed }}>
          Error loading attributes: {attribute.error}
        </Text>
      </View>
    );
  }

  if (attributeOptionsError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: COLORS.brandRed }}>
          Error loading attribute options: {attributeOptionsError}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#eee" }}>
      <AdminHeader
        onBack={() => router.back()}
        title="Edit Profile"
        right={
          <TouchableOpacity
            onPress={handleSave}
            disabled={updating}
            style={styles.headerSave}
          >
            <Text style={{ color: "#444", fontWeight: "bold", fontSize: 18 }}>
              {updating ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        }
      />
      {updateError && (
        <Text
          style={{ color: COLORS.brandRed, textAlign: "center", marginTop: 8 }}
        >
          {updateError}
        </Text>
      )}

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Avatar and Name */}
        <View
          style={{
            alignItems: "center",
            marginBottom: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <TouchableOpacity onPress={handleAddImage}>
            <Image
              source={
                avatar
                  ? {
                      uri: avatar,
                    }
                  : require("@/assets/images/avatar.png")
              }
              style={styles.avatar}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsNameEditable(!isNameEditable)}
            style={{ flex: 1 }}
          >
            {isNameEditable ? (
              <View
                style={[
                  styles.nameInput,
                  { flexDirection: "row", alignItems: "center" },
                ]}
              >
                <TextInput
                  style={[{ height: "100%", flex: 1 }]}
                  placeholder="Enter your name"
                  value={form.name}
                  onChangeText={(v) => handleChange("name", v)}
                />
                <TouchableOpacity
                  onPress={() => setIsNameEditable(!isNameEditable)}
                >
                  <Ionicons
                    name={"checkmark-circle-outline"}
                    size={22}
                    color="#222"
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.name}>{form.name}</Text>
            )}
          </TouchableOpacity>
        </View>
        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={form.email}
          onChangeText={(v) => handleChange("email", v)}
          autoCapitalize="none"
        />
        <View
          style={[
            styles.nameInput,
            { flexDirection: "row", alignItems: "center" },
          ]}
        >
          <TextInput
            style={[{ height: "100%", flex: 1 }]}
            placeholder="Enter your email"
            value={form.email}
            onChangeText={(v) => handleChange("email", v)}
          />
          <TouchableOpacity onPress={() => {}}>
            <Text style={{ color: "#a00", fontWeight: "bold" }}>
              {user?.is_email_verified ? "2FA Verified" : "2FA Required"}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View
          style={[
            styles.nameInput,
            { flexDirection: "row", alignItems: "center" },
          ]}
        >
          <TextInput
            style={[{ height: "100%", flex: 1 }]}
            placeholder="Enter your password"
            value={password}
            onChangeText={(v) => setPassword(v)}
            secureTextEntry
            placeholder="***************"
          />
          <TouchableOpacity onPress={() => {}}>
            <Text style={{ color: "#a00", fontWeight: "bold" }}>
              Change password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Phone (disabled) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
            borderBottomWidth: 2,
            borderColor: "#222",
          }}
        >
          <TouchableOpacity
            style={styles.countryCodeBox}
            onPress={() => openBottomSheet("phone")}
          >
            <Text style={styles.flag}>{country.flag}</Text>
            <Text style={styles.countryCodeText}>{countryCode}</Text>
          </TouchableOpacity>
          <TextInput
            style={[{ flex: 1, marginLeft: 10 }]}
            placeholder="Phone Number"
            value={form.phone}
            onChangeText={(v) => handleChange("phone", v)}
            keyboardType="phone-pad"
          />
          <TouchableOpacity onPress={() => {}}>
            <Text style={{ color: "#a00", fontWeight: "bold" }}>
              {user?.is_phone_verified ? "Verified" : "Unverified"}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Shipping Address */}
        <Text style={styles.label}>Shipping Address</Text>
        {shippingAddress ? (
          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: "#111" }}>
              {shippingAddress.name}
              {"\n"}
              {shippingAddress.street} {shippingAddress.street2}
              {"\n"}
              {shippingAddress.subDistrict}, {shippingAddress.district}
              {"\n"}
              {shippingAddress.province} {shippingAddress.postalCode}
              {"\n"}
              {shippingAddress.phone}
            </Text>
            <TouchableOpacity onPress={() => openBottomSheet("address")}>
              <Text style={styles.addAction}>Edit Shipping Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => openBottomSheet("address")}>
            <Text style={styles.addAction}>Add Shipping Address</Text>
          </TouchableOpacity>
        )}
        <View style={styles.inputDivider} />
        {/* Sneaker Size */}
        <Text style={styles.label}>Sneaker Size</Text>
        <TouchableOpacity onPress={() => openBottomSheet("sneaker_size")}>
          <Text style={styles.addAction}>
            {form.sneaker_size ? form.sneaker_size : "Add Size"}
          </Text>
        </TouchableOpacity>
        <View style={styles.inputDivider} />
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["50%"]}
        enablePanDownToClose={true}
        enableHandlePanningGesture={enableHandlePan}
        onClose={() => setBottomSheet(false)}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={styles.bottomSheetHeader}>
            <TouchableOpacity onPress={closeBottomSheet}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.bottomSheetTitle}>
              {currentEditingSection === "sneaker_size" && parentAttributeId
                ? "Size Options"
                : currentEditingSection === "sneaker_size" && !parentAttributeId
                ? "Select Size"
                : currentEditingSection === "phone"
                ? "Select Country"
                : "Address"}
            </Text>
            <TouchableOpacity onPress={closeBottomSheet}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          {currentEditingSection === "sneaker_size" && parentAttributeId && (
            <>
              <View
                style={{
                  padding: 16,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}
                >
                  Select{" "}
                  {attributes.map((method: any) =>
                    method.id === parentAttributeId ? method.name : ""
                  )}
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setForm({ ...form, gender: "Men" })}
                    style={{
                      paddingRight: 10,
                      borderRightWidth: 1,
                      borderRightColor: "#fff",
                    }}
                  >
                    <Text
                      style={{ color: form.gender === "Men" ? "#fff" : "#666" }}
                    >
                      Men
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setForm({ ...form, gender: "Women" })}
                  >
                    <Text
                      style={{
                        color: form.gender === "Women" ? "#fff" : "#666",
                      }}
                    >
                      Women
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {currentEditingSection === "sneaker_size" &&
                parentAttributeId && (
                  <BottomSheetFlatList
                    data={attributeOptions}
                    horizontal
                    keyExtractor={(item) => (item._id || item.id) + ""}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                    }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() =>
                          setForm({ ...form, sneaker_size: item.optionName })
                        }
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 16,
                          backgroundColor: COLORS.black,
                          marginRight: 10,
                          borderRadius: 5,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              form.sneaker_size === item.optionName
                                ? COLORS.brandRed
                                : "#fff",
                          }}
                        >
                          {item.optionName}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
            </>
          )}

          <ScrollView
            style={styles.methodsList}
            showsVerticalScrollIndicator={false}
          >
            {currentEditingSection === "address"
              ? addresses.map((method: any) => (
                  <TouchableOpacity
                    key={method._id || method.id}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: "#333",
                    }}
                    onPress={() => {
                      setShippingAddress(method);
                      closeBottomSheet();
                    }}
                  >
                    <View style={styles.paymentMethodLeft}>
                      <Text style={{ color: "#fff", fontSize: 16 }}>
                        {`${method.name} ${method.street} ${method.street2} ${method.subDistrict} ${method.district} ${method.province} ${method.postalCode} ${method.phone}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              : currentEditingSection === "sneaker_size" && !parentAttributeId
              ? attributes.map((method: any) => (
                  <TouchableOpacity
                    onPress={() => setParentAttributeId(method._id)}
                    key={method._id || method.id}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: "#333",
                    }}
                  >
                    <Text style={{ color: "#fff" }}>{method.name}</Text>
                  </TouchableOpacity>
                ))
              : currentEditingSection === "phone" &&
                COUNTRY_CODES.map((item) => (
                  <TouchableOpacity
                    key={item.code}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: "#eee",
                      paddingHorizontal: 16,
                    }}
                    onPress={() => {
                      setCountry(item);
                      setCountryCode(item.code);
                      closeBottomSheet();
                    }}
                  >
                    <Text style={{ fontSize: 22, marginRight: 10 }}>
                      {item.flag}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        marginRight: 10,
                        color: "#fff",
                      }}
                    >
                      {item.code}
                    </Text>
                    <Text style={{ fontSize: 16, color: "#666" }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            {currentEditingSection === "address" && (
              <TouchableOpacity
                style={{
                  padding: 16,
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderBottomColor: "#333",
                }}
                onPress={() => router.push("/user/shipping-address")}
              >
                <Text style={styles.addAction}>Add New Address</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eee",
    paddingTop: 0,
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#bbb",
    position: "relative",
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    zIndex: 0,
  },
  headerIcon: {
    width: 40,
    alignItems: "flex-start",
    zIndex: 1,
  },
  headerSave: {
    width: 50,
    alignItems: "flex-end",
    zIndex: 1,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#bbb",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 2,
    fontFamily: "serif",
  },
  nameInput: {
    borderBottomWidth: 2,
    borderColor: "#222",
    fontSize: 16,
    paddingVertical: 6,
    marginBottom: 2,
    color: "#111",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 18,
    marginBottom: 2,
    color: "#111",
  },
  input: {
    borderBottomWidth: 2,
    borderColor: "#222",
    fontSize: 16,
    paddingVertical: 6,
    marginBottom: 2,
    color: "#111",
  },
  addAction: {
    color: "#a00",
    fontWeight: "bold",
    marginTop: 2,
    marginBottom: 8,
    fontSize: 15,
  },
  inputDivider: {
    borderBottomWidth: 2,
    borderColor: "#222",
    marginBottom: 2,
  },

  countryCodeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    height: 58,
  },
  flag: {
    fontSize: 18,
    marginRight: 4,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomSheetBackground: {
    backgroundColor: COLORS.dark1,
  },
  bottomSheetIndicator: {
    backgroundColor: COLORS.grayTie,
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: COLORS.dark1,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayTie,
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  cancelButton: {
    fontSize: 14,
    color: COLORS.white,
  },
  doneButton: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
  },
  methodsList: {
    flex: 1,
  },
});
