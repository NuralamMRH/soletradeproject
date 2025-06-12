import React from "react";
import { Modal, View, TouchableOpacity, Dimensions } from "react-native";
import SwiperFlatList from "react-native-swiper-flatlist";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";

const { width } = Dimensions.get("window");

type ImageZoomModalProps = {
  visible: boolean;
  onClose: () => void;
  images: { file_full_url: string }[]; // or string[] if you use plain URLs
  initialIndex?: number;
  baseUrl?: string;
};

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  visible,
  onClose,
  images,
  initialIndex = 0,
  baseUrl = "",
}) => {
  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.95)",
          paddingTop: 100,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SwiperFlatList
          data={images}
          index={initialIndex}
          showPagination
          renderItem={({ item }) => (
            <ExpoImage
              source={{
                uri: baseUrl
                  ? `${baseUrl}${item.file_full_url}`
                  : item.file_full_url,
              }}
              style={{
                width: width,
                height: width,
                flex: 1,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
              contentFit="contain"
            />
          )}
        />
        <TouchableOpacity
          style={{ position: "absolute", top: 40, right: 20, zIndex: 10 }}
          onPress={onClose}
        >
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ImageZoomModal;
