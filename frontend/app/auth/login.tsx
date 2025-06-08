import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { router } from "expo-router";
import { useAppContent } from "@/context/AppContentContext";
import { baseUrl } from "@/api/MainApi";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { appContent } = useAppContent();

  const handleLogin = async () => {
    try {
      const res = await login(email, password);
      if (res.user) {
        router.push("/(tabs)/dashboard");
      } else {
        Alert.alert("Error", "Invalid credentials");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.header}>
          <Image
            source={
              appContent?.appLogo
                ? {
                    uri: `${baseUrl}/public/uploads/app-settings/${appContent?.appLogo}`,
                  }
                : require("../../assets/images/top-logo.png")
            }
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
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
          </View>

          <View style={styles.rowBetween}>
            <Link href="./register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerNow}>Register Now</Text>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forget Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.socialDivider}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={28} color="#000" />
              <Text style={styles.socialButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.socialDivider}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={28} color="#000" />
              <Text style={styles.socialButtonText}>Sign in with Apple</Text>
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: "center", marginTop: 20 }}>
            <TouchableOpacity onPress={() => router.push("/(tabs)")}>
              <Text
                style={{ fontSize: 14, color: "#007AFF", fontWeight: "bold" }}
              >
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginTop: 10,
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
    height: 60,
    backgroundColor: "#f9f9f9",
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    height: 60,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#000",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#666",
    fontSize: 14,
  },
  registerLink: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  registerNow: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  socialDivider: {
    marginVertical: 8,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    marginBottom: 4,
  },
  socialButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
});
