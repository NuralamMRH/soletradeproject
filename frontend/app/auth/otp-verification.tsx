import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  Clipboard,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../hooks/useAuth";

const OTP_LENGTH = 6;

export default function OTPVerificationScreen() {
  const { userId, phone, email } = useLocalSearchParams();
  const { otpVerification } = useAuth();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const pasteTimer = useRef<number | null>(null);

  const checkClipboardAndStartTimer = async () => {
    const clipboardContent = (await Clipboard.getString()).trim();
    if (/^[0-9]{6}$/.test(clipboardContent) && otp.every((d) => d === "")) {
      // Start timer to show modal after 10 seconds if not pasted
      pasteTimer.current = setTimeout(() => {
        setShowPasteModal(true);
      }, 10000);
    }
  };

  const handleChange = (value: string, idx: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);

    // Move to next input if value entered
    if (value && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }

    // Auto-submit if all filled
    if (newOtp.every((digit) => digit.length === 1)) {
      handleContinue(newOtp.join(""));
    }

    // If user types, cancel timer and hide modal
    if (pasteTimer.current) clearTimeout(pasteTimer.current);
    setShowPasteModal(false);
  };

  // Handle backspace
  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && otp[idx] === "" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
      const newOtp = [...otp];
      newOtp[idx - 1] = "";
      setOtp(newOtp);
    }
  };

  const handlePaste = async () => {
    const text = (await Clipboard.getString()).trim();
    if (/^[0-9]{6}$/.test(text)) {
      setOtp(text.split(""));
      setShowPasteModal(false);
      if (pasteTimer.current) clearTimeout(pasteTimer.current);
      handleContinue(text);
    }
  };

  // Show paste modal if SMS received (simulate for now)
  const showPastePopup = () => setShowPasteModal(true);

  // Submit OTP
  const handleContinue = async (otpValue?: string) => {
    const code = otpValue || otp.join("");
    if (code.length !== OTP_LENGTH) {
      Alert.alert("Error", "Please enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await otpVerification({
        userId: userId as string,
        otp: code,
        phone: phone as string,
        email: email as string,
      });
      if (res.success) {
        Alert.alert("Success", "OTP verified!");
        router.push("/(tabs)/profile");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "OTP verification failed");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkClipboardAndStartTimer();
    return () => {
      if (pasteTimer.current) clearTimeout(pasteTimer.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons
          name="phone-portrait-outline"
          size={64}
          color="#000"
          style={{ marginBottom: 24 }}
        />
        <Text style={styles.title}>Enter One Time Password (OTP)</Text>
        <Text style={styles.subtitle}>
          A Verification code has been sent to your phone number
        </Text>
        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(ref) => {
                if (ref) {
                  inputRefs.current[idx] = ref;
                }
              }}
              style={styles.otpInput}
              value={digit}
              onChangeText={(v) => {
                if (v.length > 1) {
                  // Handle paste directly in input
                  if (/^[0-9]{6}$/.test(v)) {
                    setOtp(v.split(""));
                    handleContinue(v);
                  }
                  return;
                }
                handleChange(v, idx);
              }}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              onKeyPress={(e) => handleKeyPress(e, idx)}
              autoFocus={idx === 0}
              onFocus={async () => {
                if (Platform.OS !== "web") {
                  const clipboardContent = (await Clipboard.getString()).trim();
                  if (/^[0-9]{6}$/.test(clipboardContent)) {
                    setShowPasteModal(true);
                  }
                }
              }}
            />
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => handleContinue()}
        disabled={loading}
      >
        <Text style={styles.continueButtonText}>
          {loading ? "Verifying..." : "Continue"}
        </Text>
      </TouchableOpacity>

      {/* Paste Modal */}
      <Modal
        visible={showPasteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, marginBottom: 12 }}>
              Paste verification code from SMS?
            </Text>
            <TouchableOpacity style={styles.pasteButton} onPress={handlePaste}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Paste Code
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 10 }}
              onPress={() => setShowPasteModal(false)}
            >
              <Text style={{ color: "#007AFF" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 30,
    gap: 10,
  },
  otpInput: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#e5e5e5",
    fontSize: 24,
    color: "#222",
    fontWeight: "bold",
    marginHorizontal: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    width: 300,
  },
  pasteButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    marginTop: 8,
  },
});
