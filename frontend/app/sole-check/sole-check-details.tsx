import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { useRouter } from "expo-router";
import { SwiperFlatList } from "react-native-swiper-flatlist";

const { width } = Dimensions.get("window");

const shoeImages = [
  {
    id: 1,
    uri: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    uri: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    uri: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
  },
];

const SoleCheckDetails = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIcon}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.black} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons
            name="share-social-outline"
            size={24}
            color={COLORS.black}
          />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Card */}
        <View style={styles.resultCard}>
          <Text style={styles.cardId}>#53959302</Text>
          <View style={styles.resultCardInner}>
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/3/36/Jordan_brand.svg",
              }}
              style={styles.brandLogo}
            />
            <View style={{ alignItems: "center", flex: 1 }}>
              <Image
                source={{ uri: shoeImages[0].uri }}
                style={styles.shoeThumb}
              />
              <Text style={styles.modelName}>Jordan 1 Low</Text>
            </View>
          </View>
          <Text style={styles.resultLabel}>CHECK RESULT</Text>
          <TouchableOpacity style={styles.resultButton}>
            <Text style={styles.resultButtonText}>Authentic</Text>
          </TouchableOpacity>
          <Text style={styles.resultCompleted}>
            Completed on 2 Sep 24, 11:10 PM
          </Text>
        </View>
        {/* Authentication Review */}
        <Text style={styles.reviewTitle}>Authentication Review</Text>
        <TouchableOpacity
          style={styles.reviewCard}
          onPress={() => setModalVisible(true)}
        >
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
            style={styles.reviewerAvatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.reviewerName}>Sukhchot Pruthi</Text>
            <Text style={styles.reviewerRole}>
              Sneaker Authentication Expert
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.reviewStatus}>AUTHENTIC</Text>
            <Text style={styles.reviewDate}>2 Sep 24, 10:52 PM</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      {/* Modal Image Slider */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent} pointerEvents="box-none">
            <SwiperFlatList
              showPagination
              paginationActiveColor={COLORS.brandColor}
              paginationDefaultColor={COLORS.gray}
              paginationStyleItem={styles.paginationDot}
              data={shoeImages}
              renderItem={({ item }) => (
                <View style={styles.shoeSlide}>
                  <Image source={{ uri: item.uri }} style={styles.shoeImage} />
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  headerIcon: {
    padding: 4,
  },
  resultCard: {
    backgroundColor: "#f7f7f7",
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#bbb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardId: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    textAlign: "center",
    marginBottom: 8,
  },
  resultCardInner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    width: "100%",
    justifyContent: "center",
  },
  brandLogo: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    marginRight: 12,
  },
  shoeThumb: {
    width: 70,
    height: 48,
    resizeMode: "contain",
    marginBottom: 2,
  },
  modelName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginTop: 2,
  },
  resultLabel: {
    fontSize: 18,
    color: "#222",
    fontWeight: "500",
    marginTop: 8,
    marginBottom: 8,
  },
  resultButton: {
    backgroundColor: COLORS.success || "#218838",
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 10,
    marginBottom: 8,
  },
  resultButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  resultCompleted: {
    color: "#222",
    fontSize: 13,
    marginTop: 2,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginLeft: 16,
    marginBottom: 8,
  },
  reviewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.brandColor || "#b71c1c",
  },
  reviewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  reviewerName: {
    fontWeight: "bold",
    color: "#222",
    fontSize: 15,
  },
  reviewerRole: {
    color: COLORS.brandColor || "#b71c1c",
    fontSize: 13,
    fontWeight: "bold",
    fontStyle: "italic",
    marginBottom: 2,
  },
  reviewStatus: {
    fontWeight: "bold",
    color: COLORS.success || "#218838",
    fontSize: 16,
    marginBottom: 2,
  },
  reviewDate: {
    color: "#888",
    fontSize: 13,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width,
    height: width * 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  shoeSlide: {
    width: width,
    height: width * 0.7,
    alignItems: "center",
    justifyContent: "center",
  },
  shoeImage: {
    width: width * 0.85,
    height: width * 0.5,
    resizeMode: "cover",
    borderRadius: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
});

export default SoleCheckDetails;
