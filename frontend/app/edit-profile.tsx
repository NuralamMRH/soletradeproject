import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useShippingAddress } from "../hooks/useShippingAddress";

export default function EditProfile() {
  const { user } = useAuth();
  const { getShippingAddress } = useShippingAddress();
  const [form, setForm] = useState({
    name:
      (user?.firstName ? user.firstName : "") +
      (user?.lastName ? " " + user.lastName : ""),
    email: user?.email || "",
    password: "",
    phone: user?.phone || "",
    sneaker_size: user?.sneaker_size || "",
  });
  const { updateUser, loading } = useUpdateUser();
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const res = await getShippingAddress();
          const addresses = res.shipping || res;
          setShippingAddress(
            Array.isArray(addresses) ? addresses[0] : addresses
          );
        } catch (e) {
          setShippingAddress(null);
        }
      })();
    }, [])
  );

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    await updateUser(form);
    router.back();
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={styles.headerSave}
        >
          <Text style={{ color: "#444", fontWeight: "bold", fontSize: 18 }}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Avatar and Name */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Image
            source={
              user?.image_full_url
                ? { uri: process.env.EXPO_PUBLIC_API_URL + user.image_full_url }
                : require("../assets/images/avatar.png")
            }
            style={styles.avatar}
          />
          <Text style={styles.name}>{form.name}</Text>
          <View
            style={{
              borderBottomWidth: 2,
              borderColor: "#a00",
              width: 160,
              marginTop: 2,
            }}
          />
        </View>
        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={form.email}
          onChangeText={(v) => handleChange("email", v)}
          autoCapitalize="none"
        />
        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={form.password}
          onChangeText={(v) => handleChange("password", v)}
          secureTextEntry
          placeholder="***************"
        />
        {/* Phone (disabled) */}
        <Text style={[styles.label, { color: "#bbb" }]}>Phone Number</Text>
        <TextInput
          style={[styles.input, { color: "#bbb" }]}
          value={form.phone}
          editable={false}
        />
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
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/shipping-address",
                  params: { address: JSON.stringify(shippingAddress) },
                })
              }
            >
              <Text style={styles.addAction}>Edit Shipping Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => router.push("/shipping-address")}>
            <Text style={styles.addAction}>Add Shipping Address</Text>
          </TouchableOpacity>
        )}
        <View style={styles.inputDivider} />
        {/* Sneaker Size */}
        <Text style={styles.label}>Sneaker Size</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.addAction}>Add Size</Text>
        </TouchableOpacity>
        <View style={styles.inputDivider} />
      </ScrollView>
    </SafeAreaView>
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
});
