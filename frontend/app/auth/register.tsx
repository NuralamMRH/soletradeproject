import { Ionicons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useAppContent } from "@/context/AppContentContext";
import { baseUrl } from "@/api/MainApi";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Colors from "@/constants/Colors";
import { COUNTRY_CODES } from "@/utils/COUNTRY_CODES";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(COUNTRY_CODES[0]);
  const [countryCode, setCountryCode] = useState("+66");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { registerWithOtp } = useAuth();
  const { appContent } = useAppContent();
  const dateSheetRef = useRef<any>(null);
  const handleRegister = async () => {
    if (!(firstName && lastName && phone && email && password && agree)) return;

    try {
      const result = await registerWithOtp({
        firstName,
        lastName,
        callingCode: countryCode,
        phone: `${countryCode}${phone}`,
        email,
        password,
      });

      if (result.otpRequired) {
        // Redirect to OTP verification, pass userId, phone, email
        router.push({
          pathname: "/auth/otp-verification",
          params: { userId: result.userId, phone, email },
        });
      } else {
        Alert.alert("Success", "Registration successful!");
        router.push("/(tabs)/profile");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Registration failed");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={
              useAppContent?.appLogo
                ? {
                    uri: `${baseUrl}/public/uploads/app-settings/${appContent?.appLogo}`,
                  }
                : require("../../assets/images/top-logo.png")
            }
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>
          <View style={styles.inputRow}>
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Text style={styles.label}>Phone Number</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              style={styles.countryCodeBox}
              onPress={() => dateSheetRef.current?.expand()}
            >
              <Text style={styles.flag}>{country.flag}</Text>
              <Text style={styles.countryCodeText}>{countryCode}</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 10 }]}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.passwordInput,
                { flexDirection: "row", alignItems: "center" },
              ]}
            >
              <TextInput
                style={[{ height: "100%", flex: 1 }]}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#222"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.passwordHint}>
              At least 8 Characters, 1 Uppercase letter, 1 number, & 1 symbol
            </Text>
          </View>
          <View style={styles.termsRow}>
            <TouchableOpacity
              onPress={() => setAgree((v) => !v)}
              style={styles.checkbox}
            >
              {agree ? (
                <Ionicons name="checkbox" size={22} color="#000" />
              ) : (
                <Ionicons name="square-outline" size={22} color="#000" />
              )}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I have read and agree to the{" "}
              <Text style={styles.linkText}>Terms and Conditions</Text> and{" "}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.registerButton,
              { backgroundColor: agree ? "#000" : "#ccc" },
            ]}
            onPress={handleRegister}
            disabled={!agree}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={28} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={28} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an Account? </Text>

            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomSheet
        ref={dateSheetRef}
        index={-1}
        snapPoints={["35%"]}
        enablePanDownToClose={true}
        onClose={() => dateSheetRef.current?.close()}
        handleIndicatorStyle={{ backgroundColor: "#000" }}
        backgroundStyle={{ backgroundColor: "#f1f1f1" }}
      >
        <BottomSheetView style={{ flex: 1, padding: 16 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity
              style={[{ marginRight: 8 }]}
              onPress={() => dateSheetRef.current?.close()}
            >
              <Text style={{ color: Colors.dark, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <Text
              style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16 }}
            >
              {"Select Country Code"}
            </Text>
            <TouchableOpacity
              style={{}}
              onPress={() => {
                dateSheetRef.current?.close();
              }}
            >
              <Text style={{ color: Colors.primary, fontSize: 16 }}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <ScrollView>
              {COUNTRY_CODES.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                  }}
                  onPress={() => {
                    setCountry(item);
                    setCountryCode(item.code);
                    dateSheetRef.current?.close();
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
                    }}
                  >
                    {item.code}
                  </Text>
                  <Text style={{ fontSize: 16, color: "#666" }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 80,
    marginBottom: 20,
    borderRadius: 10,
    objectFit: "cover",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    height: 58,
    backgroundColor: "#f9f9f9",
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    height: 58,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  registerButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: "red",
    fontSize: 14,
    fontWeight: "bold",
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 20,
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
  passwordHint: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    marginLeft: 2,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 8,
  },
  termsText: {
    fontSize: 14,
    color: "#222",
    flex: 1,
    flexWrap: "wrap",
  },
  linkText: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  orText: {
    marginHorizontal: 10,
    color: "#888",
    fontWeight: "bold",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 20,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    width: 60,
    height: 50,
    justifyContent: "center",
  },
});
