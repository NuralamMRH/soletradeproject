import { baseUrl } from "@/api/MainApi";
import Price from "@/utils/Price";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SwiperFlatList from "react-native-swiper-flatlist";

import { Image as ExpoImage } from "expo-image";

const SellerAsk = ({
  sel,
  modalVisible,
  setModalVisible,
  zoomIndex,
  setZoomIndex,
  onPress,
}: {
  sel: any;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  zoomIndex: number;
  setZoomIndex: (index: number) => void;
  onPress: () => void;
}) => {
  const [showImages, setShowImages] = useState(false);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <TouchableOpacity onPress={() => setShowImages(!showImages)}>
          <Text
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: "bold",
            }}
          >
            <Price price={sel.sellingPrice} currency="THB" />
          </Text>
          <Text
            style={{
              color: "#fff",
              fontSize: 14,
              marginTop: 2,
            }}
          >
            {`Lowest Price / ${sel.condition || "Brand New"}`}
          </Text>
          <Text
            style={{
              color: "#aaa",
              fontSize: 12,
              marginTop: 2,
            }}
          >
            3-5 days / verified before shipping
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPress}
          style={{
            borderWidth: 2,
            borderColor: "#fff",
            borderRadius: 4,
            paddingVertical: 6,
            paddingHorizontal: 18,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Select</Text>
        </TouchableOpacity>
      </View>
      {showImages && (
        <>
          <ScrollView horizontal>
            {sel.images.map((img: any, idx: number) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  setZoomIndex(idx);
                }}
                style={{
                  width: 100,
                  height: 100,
                  marginRight: 10,
                  borderRadius: 8,
                }}
              >
                <Image
                  source={{
                    uri: `${baseUrl}${img.file_full_url}`,
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 8,
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Modal
            visible={modalVisible}
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.95)",
                paddingTop: insets.top + 100,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SwiperFlatList
                data={sel.images}
                index={zoomIndex}
                showPagination
                renderItem={({ item }: { item: any }) => (
                  <ExpoImage
                    source={{ uri: `${baseUrl}${item.file_full_url}` }}
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
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({});

export default SellerAsk;
