import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  SafeAreaView,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";

interface PhotoCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onPhotoTaken: (uri: string) => void;
  photoType: string;
  initialPhotoUri?: string;
}

const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  visible,
  onClose,
  onPhotoTaken,
  photoType,
  initialPhotoUri,
}) => {
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>(initialPhotoUri);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [type, setType] = useState(CameraType.back);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  React.useEffect(() => {
    setPhotoUri(initialPhotoUri);
  }, [initialPhotoUri, visible]);

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  if (hasPermission === null) {
    return null;
  }
  if (hasPermission === false) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={{ color: "#fff" }}>No access to camera</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ color: "#fff" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.headerBtn}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{photoType}</Text>
          <TouchableOpacity
            onPress={() => {
              if (photoUri) onPhotoTaken(photoUri);
              onClose();
            }}
            disabled={!photoUri}
          >
            <Text
              style={[
                styles.headerBtn,
                { color: photoUri ? COLORS.brandColor : "#888" },
              ]}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>
        {/* Camera or Photo Preview */}
        <View style={styles.cameraPreviewContainer}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.cameraPreview} />
          ) : (
            <Camera
              ref={cameraRef}
              style={styles.cameraPreview}
              type={type}
              onCameraReady={() => setIsCameraReady(true)}
              ratio="16:9"
            />
          )}
          {/* Small preview in top right */}
          <View style={styles.smallPreviewBox}>
            <Image
              source={{
                uri:
                  photoUri ||
                  "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/6b1e2e8d-2e7e-4e2e-8e7e-2e7e4e2e8e7e/air-jordan-1-low-shoes-6Q1tFM.png",
              }}
              style={styles.smallPreview}
            />
          </View>
        </View>
        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={pickImage}>
            <Ionicons name="images-outline" size={32} color="#fff" />
            <Text style={styles.controlLabel}>Select from Album</Text>
          </TouchableOpacity>
          {!photoUri ? (
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
              <Ionicons name="camera" size={48} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={() => setPhotoUri(undefined)}
            >
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.controlBtn}>
            <Ionicons name="flash-off" size={32} color="#fff" />
            <Text style={styles.controlLabel}>Flash Off</Text>
          </TouchableOpacity>
        </View>
        {/* Next button */}
        {photoUri && (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => {
              onPhotoTaken(photoUri);
              onClose();
            }}
          >
            <Text style={styles.nextBtnText}>Next</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#111",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerBtn: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  cameraPreviewContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraPreview: {
    width: "100%",
    height: "100%",
    flex: 1,
    borderRadius: 0,
  },
  smallPreviewBox: {
    position: "absolute",
    top: 16,
    right: 16,
    borderWidth: 2,
    borderColor: COLORS.brandColor,
    borderRadius: 8,
    padding: 2,
    backgroundColor: "#222",
  },
  smallPreview: {
    width: 60,
    height: 40,
    borderRadius: 6,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#111",
  },
  controlBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  controlLabel: {
    color: "#fff",
    fontSize: 13,
    marginTop: 4,
  },
  captureBtn: {
    backgroundColor: COLORS.brandColor,
    borderRadius: 40,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  retakeBtn: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  retakeText: {
    color: COLORS.brandColor,
    fontWeight: "bold",
    fontSize: 16,
  },
  nextBtn: {
    backgroundColor: COLORS.brandColor,
    borderRadius: 8,
    margin: 24,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    marginTop: 24,
    backgroundColor: COLORS.brandColor,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
});

export default PhotoCaptureModal;
