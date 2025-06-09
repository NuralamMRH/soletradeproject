import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useListCreation } from "@/context/ListCreationContext";

import {
  CameraView,
  CameraType,
  useCameraPermissions,
  FlashMode,
} from "expo-camera";
import AdminHeader from "@/components/AdminHeader";
import { COLORS, SIZES } from "@/constants";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DotsView from "@/components/DotsView";

const imageLabels = [
  "Outer Exterior",
  "Inner Exterior",
  "Heel",
  "Front Tongue",
  "Back Tongue",
  "Inside Label",
  "Insole",
  "Back of Insole",
  "Box",
];

const imagePlaceholders = [
  require("@/assets/images/product-conditions/outer-exterior.png"),
  require("@/assets/images/product-conditions/inner-exterior.png"),
  require("@/assets/images/product-conditions/heel.png"),
  require("@/assets/images/product-conditions/top.png"),
  require("@/assets/images/product-conditions/bottom.png"),
  require("@/assets/images/product-conditions/inside-label.png"),
  require("@/assets/images/product-conditions/insole.png"),
  require("@/assets/images/product-conditions/back-of-insole.png"),
  require("@/assets/images/product-conditions/box.png"),
];

export default function CaptureImage() {
  const router = useRouter();
  const { slot } = useLocalSearchParams();
  const { images, setImage } = useListCreation();
  const [currentSlot, setCurrentSlot] = useState(Number(slot) || 0);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const cameraRef = useRef<any>(null);
  const [captured, setCaptured] = useState(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const labelWidth = SIZES.width / 3 - 16 + 12; // label width + margin
    const totalWidth = SIZES.width + 300;
    const maxScrollX = totalWidth - SIZES.width;
    let x = Math.max(
      0,
      labelWidth * currentSlot - SIZES.width / 2 + labelWidth / 2
    );
    if (x > maxScrollX) {
      x = 0; // Scroll to start if at the end
    }
    scrollRef.current?.scrollTo({ x, animated: true });
  }, [currentSlot]);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={{ marginTop: 20 }}>
          <Text style={{ color: "#fff", fontSize: 18 }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current && !isTakingPhoto) {
      try {
        setIsTakingPhoto(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          skipProcessing: true,
        });

        // Set captured image
        if (photo?.uri) {
          setImage(currentSlot, photo.uri);
          setCaptured(true);
        }
      } catch (error) {
        console.error("Capture failed:", error);
      } finally {
        setIsTakingPhoto(false);
      }
    }
  };

  const handleRetake = () => {
    setImage(currentSlot, "");
    setCaptured(false);
  };

  const handleSelectImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(currentSlot, result.assets[0].uri);
      setCaptured(true);
    }
  };

  const handleFlashLightToggle = async () => {
    try {
      const newState = !torchOn;
      setTorchOn(newState);
    } catch (error) {
      console.warn("Failed to toggle flashlight:", error);
    }
  };

  const handleNext = () => {
    // Find the next label without an image
    const nextIdx = images.findIndex((img, idx) => !img && idx !== currentSlot);
    if (nextIdx !== -1) {
      setCurrentSlot(nextIdx);
      setCaptured(false);
    }
  };

  const handleSubmit = () => {
    router.back();
  };

  const allFilled = images.every(Boolean);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <AdminHeader
        borderHide
        backgroundColor="black"
        onBack={() => router.back()}
        center={
          <Text style={{ fontSize: 16, color: "#fff" }}>
            {imageLabels[currentSlot]}
          </Text>
        }
        right={
          <TouchableOpacity onPress={allFilled ? handleSubmit : undefined}>
            <Text style={styles.headerBtn}>Save</Text>
          </TouchableOpacity>
        }
      />

      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        {!images[currentSlot] ? (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            flash={torchOn ? "on" : "off"}
            onMediaCaptured={handleCapture}
            mode="photo"
          />
        ) : (
          <Image
            source={{ uri: images[currentSlot] }}
            style={styles.capturedImage}
          />
        )}
        {/* Top-right preview of all images */}
        {/* <View style={styles.previewGrid}>
          {images.map((img, idx) => (
            <View
              key={idx}
              style={[
                styles.previewBox,
                idx === currentSlot && { borderColor: "#c00" },
              ]}
            >
              <Image
                source={img ? { uri: img } : imagePlaceholders[idx]}
                style={{ width: 36, height: 36, borderRadius: 6 }}
              />
            </View>
          ))}
        </View> */}
      </View>

      {/* Label grid */}
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <ScrollView ref={scrollRef} horizontal>
          <View style={styles.labelGrid}>
            {imageLabels.map((label, idx) => (
              <TouchableOpacity
                key={label}
                onPress={() => {
                  setCurrentSlot(idx);
                  setCaptured(false);
                }}
              >
                <Image
                  source={
                    images[idx] ? { uri: images[idx] } : imagePlaceholders[idx]
                  }
                  style={[
                    styles.labelBox,
                    {
                      borderColor:
                        idx === currentSlot
                          ? "#c00"
                          : images[idx]
                          ? COLORS.brandGreen
                          : "#fff",
                    },
                  ]}
                />
                <Text style={styles.labelText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <DotsView
          progress={1}
          numDots={2}
          activeDotColor="#fff"
          dotColor="#fff"
          dotSize={5}
        />

        {/* Controls */}
        {!images[currentSlot] ? (
          <View style={styles.controls}>
            <TouchableOpacity onPress={handleSelectImageFromGallery}>
              <MaterialCommunityIcons
                name="image-multiple-outline"
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCapture}>
              <MaterialCommunityIcons
                name="camera-iris"
                size={60}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleFlashLightToggle}>
              <MaterialCommunityIcons
                name={torchOn ? "flashlight" : "flashlight-off"}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.controls}>
            <TouchableOpacity onPress={handleRetake} style={styles.retakeBtn}>
              <Text style={{ color: "#fff" }}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={
                images[currentSlot]
                  ? allFilled
                    ? handleSubmit
                    : handleNext
                  : handleCapture
              }
              style={[
                styles.nextBtn,
                images[currentSlot]
                  ? allFilled
                    ? { backgroundColor: "#c00" }
                    : { backgroundColor: "#444" }
                  : { backgroundColor: "#fff" },
              ]}
            >
              <Text
                style={{
                  color: images[currentSlot] ? "#fff" : "#000",
                  fontWeight: "bold",
                }}
              >
                {allFilled
                  ? "Submit"
                  : images[currentSlot]
                  ? "Next"
                  : "Capture"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#000",
  },
  headerBtn: { color: "#fff", fontSize: 16 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  cameraContainer: {
    width: SIZES.width,
    height: SIZES.width - 50,
    aspectRatio: 16 / 9,
    backgroundColor: "#111",
    position: "relative",
  },
  camera: { ...StyleSheet.absoluteFillObject },
  capturedImage: { ...StyleSheet.absoluteFillObject, resizeMode: "cover" },
  previewGrid: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    zIndex: 10,
  },
  previewBox: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 8,
    marginLeft: 4,
    marginBottom: 4,
    backgroundColor: "#222",
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  labelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: SIZES.width + 300,
    height: 280,
    overflowY: "scroll",
  },
  labelBox: {
    width: SIZES.width / 3 - 16,
    height: SIZES.width / 3 - 16,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
    margin: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
  },
  labelText: { color: "#fff", fontSize: 10, textAlign: "center", marginTop: 2 },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#000",
    marginBottom: 10,
  },
  retakeBtn: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginRight: 16,
  },
  nextBtn: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
});
