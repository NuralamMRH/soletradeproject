import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ConfirmPhoneScreen() {
  const handleContinue = () => {
    router.push("/auth/otp-verification" as any);
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons
          name="phone-portrait-outline"
          size={64}
          color="#000"
          style={{ marginBottom: 24 }}
        />
        <Text style={styles.title}>Confirm Phone Number</Text>
        <Text style={styles.subtitle}>
          A 6 digits OTP will be sent via SMS to verify your Phone number
        </Text>
        <View style={styles.phoneRow}>
          <View style={styles.countryBox}>
            <Text style={styles.flag}>🇹🇭</Text>
            <Text style={styles.countryCode}>+66</Text>
          </View>
          <View style={styles.phoneBox}>
            <Text style={styles.phoneText}>090 979 1104</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    padding: 20,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#444",
    marginBottom: 24,
    textAlign: "center",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  countryBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e5e5e5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
  },
  flag: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "bold",
  },
  phoneBox: {
    backgroundColor: "#e5e5e5",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  phoneText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginBottom: 20,
  },
  continueButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
