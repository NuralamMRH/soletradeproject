import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useShippingAddress } from "../hooks/useShippingAddress";
import { useRouter } from "expo-router";

export default function ShippingAddress() {
  const { getShippingAddress } = useShippingAddress();
  // Assume only one address per user; fetch or receive as prop if editing
  const [address, setAddress] = useState<any>(null);

  useEffect(() => {
    // Fetch the user's shipping address on mount
    (async () => {
      try {
        const res = await getShippingAddress();
        console.log(res);
        const addresses = res.shipping || res;
        setAddress(Array.isArray(addresses) ? addresses[0] : addresses);
      } catch (e) {
        console.error(e);
        setAddress(null);
      }
    })();
  }, []);

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
  });
  const { addShippingAddress, updateShippingAddress, loading } =
    useShippingAddress();
  const router = useRouter();

  // If you want to fetch the address on mount, do it here (not shown)

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (address._id) {
      await updateShippingAddress(address._id, form);
    } else {
      await addShippingAddress(form);
    }
    // Try to go back, if not possible, replace
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace("/edit-profile");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eee" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIcon}
        >
          <Text style={{ fontSize: 28 }}>{"\u2039"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipping Address</Text>
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
      </View>
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
    </SafeAreaView>
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
