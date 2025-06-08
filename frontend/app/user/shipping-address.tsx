import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useShippingAddress } from "../../hooks/useShippingAddress";
import { useLocalSearchParams, useRouter } from "expo-router";
import AdminHeader from "@/components/AdminHeader";
import { Platform } from "react-native";

export default function ShippingAddress() {
  const params = useLocalSearchParams();
  const { address } = params;
  const isEdit = address ? true : false;
  // Assume only one address per user; fetch or receive as prop if editing

  useEffect(() => {
    if (address) {
      setForm({
        name: address.name || "",
        street: address.street || "",
        street2: address.street2 || "",
        subDistrict: address.subDistrict || "",
        district: address.district || "",
        province: address.province || "",
        postalCode: address.postalCode || "",
        phone: address.phone || "",
        isDefault: address.isDefault || true,
      });
    }
  }, [address]);

  console.log("address:", address);
  const [form, setForm] = useState({
    name: "",
    street: "",
    street2: "",
    subDistrict: "",
    district: "",
    province: "",
    postalCode: "",
    phone: "",
    isDefault: true,
  });
  const { addShippingAddress, updateShippingAddress, loading } =
    useShippingAddress();
  const router = useRouter();

  // If you want to fetch the address on mount, do it here (not shown)

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      if (isEdit) {
        await updateShippingAddress(address._id, form);
      } else {
        await addShippingAddress(form);
      }
      // Try to go back, if not possible, replace

      router.back();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, backgroundColor: "#eee" }}>
        <AdminHeader
          onBack={() => router.back()}
          title="Shipping Address"
          right={
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              style={styles.headerSave}
            >
              <Text
                style={{
                  color: loading ? "#aaa" : "#444",
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
          }
        />

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(v) => handleChange("name", v)}
          />
          <Text style={styles.label}>Street Adress</Text>
          <TextInput
            style={styles.input}
            value={form.street}
            onChangeText={(v) => handleChange("street", v)}
          />
          <Text style={styles.label}>Street Address 2 (Optional)</Text>
          <TextInput
            style={styles.input}
            value={form.street2}
            onChangeText={(v) => handleChange("street2", v)}
          />
          <Text style={styles.label}>Sub-District</Text>
          <TextInput
            style={styles.input}
            value={form.subDistrict}
            onChangeText={(v) => handleChange("subDistrict", v)}
          />
          <Text style={styles.label}>District</Text>
          <TextInput
            style={styles.input}
            value={form.district}
            onChangeText={(v) => handleChange("district", v)}
          />
          <Text style={styles.label}>Province</Text>
          <TextInput
            style={styles.input}
            value={form.province}
            onChangeText={(v) => handleChange("province", v)}
          />
          <Text style={styles.label}>Postal Code</Text>
          <TextInput
            style={styles.input}
            value={form.postalCode}
            onChangeText={(v) => handleChange("postalCode", v)}
          />
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={form.phone}
            onChangeText={(v) => handleChange("phone", v)}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
});
