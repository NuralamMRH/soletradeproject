import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import { useAppContent } from "@/context/AppContentContext";
import { baseUrl } from "@/api/MainApi";
import { RefreshControl } from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const sliderImages = [
  {
    id: 1,
    uri: "https://images.unsplash.com/photo-1517263904808-5dc0d6d3fa0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    uri: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    uri: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=800&q=80",
  },
];

const featuredBrands = [
  {
    id: 1,
    name: "Air Jordan",
    image: {
      uri: "https://upload.wikimedia.org/wikipedia/commons/3/36/Jordan_brand.svg",
    },
  },
  {
    id: 2,
    name: "Nike",
    image: {
      uri: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
    },
  },
  {
    id: 3,
    name: "Yeezy",
    image: {
      uri: "https://seeklogo.com/images/Y/yeezy-logo-6B2C2B6B2B-seeklogo.com.png",
    },
  },
  {
    id: 4,
    name: "Louis Vuitton",
    image: {
      uri: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Louis_Vuitton_logo_and_wordmark.svg",
    },
  },
];

const checkHistory = [
  {
    id: 1,
    status: "Authentic",
    statusColor: COLORS.success || "#218838",
    image: {
      uri: "https://images.unsplash.com/photo-1517263904808-5dc0d6d3fa0c?auto=format&fit=crop&w=800&q=80",
    },
    brand: "Air Jordan",
    model: "Jordan 1 Low",
    date: "19 Feb 2023",
    time: "19:11",
  },
  {
    id: 2,
    status: "Fake",
    statusColor: COLORS.error || "#b71c1c",
    image: {
      uri: "https://images.unsplash.com/photo-1517263904808-5dc0d6d3fa0c?auto=format&fit=crop&w=800&q=80",
    },
    brand: "Air Jordan",
    model: "Jordan 1 Low",
    date: "19 Feb 2023",
    time: "20:58",
  },
];

const SoleCheck = () => {
  const router = useRouter();
  const {
    appContent,
    loading: contentLoading,
    fetchAppContent,
  } = useAppContent();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAppContent();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchAppContent()]).finally(() => setRefreshing(false));
  }, [fetchAppContent]);

  console.log(appContent?.sliderImages);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Slider Images */}
      <View style={styles.sliderContainer}>
        <SwiperFlatList
          autoplay
          autoplayDelay={3000}
          autoplayLoop
          index={0}
          showPagination
          paginationActiveColor={COLORS.brandColor}
          paginationDefaultColor={COLORS.gray}
          paginationStyleItem={styles.paginationDot}
          data={[...appContent.homeSlider]}
          renderItem={({ item }) => (
            <View style={styles.sliderSlide}>
              <Image
                source={{ uri: `${baseUrl}${item.file_full_url}` }}
                style={styles.sliderImage}
              />
            </View>
          )}
        />
      </View>
      {/* Credit Balance */}
      <View style={styles.balanceRow}>
        <View>
          <Text style={styles.balanceLabel}>CREDIT BALANCE</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.balanceValue}>₮ 0.00</Text>
            <TouchableOpacity
              onPress={() => router.push("/sole-check/buy-credits")}
              style={styles.buyButton}
            >
              <Ionicons name="cart" size={18} color="#fff" />
              <Text style={styles.buyButtonText}>Buy</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <TouchableOpacity
            onPress={() => router.push("/sole-check/check-now")}
            style={styles.checkNowButton}
          >
            <Text style={styles.checkNowButtonText}>Check Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pendingButton}>
            <Text style={styles.pendingButtonText}>
              Pending Checks & History
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Featured Brands */}
      <Text style={styles.sectionTitle}>Featured Brands</Text>
      <FlatList
        data={featuredBrands}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.brandList}
        renderItem={({ item }) => (
          <View style={styles.brandCard}>
            <Image
              source={item.image}
              style={styles.brandImage}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>{item.name}</Text>
          </View>
        )}
      />
      {/* Portfolio */}
      <TouchableOpacity
        onPress={() => router.push("/sole-check/sole-check-details")}
        style={styles.portfolioBox}
      >
        <Text style={styles.portfolioText}>
          Legit Check{" "}
          <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
            Portfolio
          </Text>
        </Text>
        <Text style={styles.portfolioNumber}>39634</Text>
      </TouchableOpacity>
      {/* Check History */}
      <View style={styles.historyHeaderRow}>
        <Text style={styles.sectionTitle}>Check History</Text>
        <TouchableOpacity>
          <Text style={styles.viewMoreText}>View More &gt;</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.historyRow}>
        {checkHistory.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View
              style={[styles.statusBar, { backgroundColor: item.statusColor }]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
            <Image source={item.image} style={styles.historyImage} />
            <View style={styles.historyInfoRow}>
              <Ionicons name="logo-javascript" size={20} color="#000" />
              <Text style={styles.historyBrand}>{item.brand}</Text>
            </View>
            <Text style={styles.historyModel}>{item.model}</Text>
            <View style={styles.historyFooterRow}>
              <Text style={styles.historyDate}>{item.date}</Text>
              <Text style={styles.historyTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  sliderContainer: {
    width: width,
    height: width * 0.45,
    marginBottom: 8,
  },
  sliderSlide: {
    width: width,
    height: width * 0.45,
  },
  sliderImage: {
    width: width,
    height: width * 0.45,
    resizeMode: "cover",
    borderRadius: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  headerSection: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  headerImage: {
    width: width,
    height: width * 0.45,
    resizeMode: "cover",
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#222",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#b71c1c",
    marginRight: 8,
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#a0522d",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 4,
  },
  checkNowButton: {
    backgroundColor: "#145c2c",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 6,
  },
  checkNowButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  pendingButton: {
    backgroundColor: "#b71c1c",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pendingButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginLeft: 16,
    marginTop: 18,
    marginBottom: 8,
  },
  brandList: {
    paddingLeft: 16,
    paddingBottom: 8,
  },
  brandCard: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#b71c1c",
    borderRadius: 8,
    marginRight: 12,
    padding: 8,
    width: 80,
    backgroundColor: "#fff",
  },
  brandImage: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 13,
    color: "#222",
    textAlign: "center",
  },
  portfolioBox: {
    backgroundColor: "#111",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
    padding: 16,
    alignItems: "center",
  },
  portfolioText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 4,
  },
  portfolioNumber: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 18,
  },
  viewMoreText: {
    color: "#b71c1c",
    fontWeight: "bold",
    fontSize: 15,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 8,
  },
  historyCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: "#b71c1c",
    overflow: "hidden",
  },
  statusBar: {
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  historyImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  historyInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginLeft: 8,
  },
  historyBrand: {
    fontSize: 14,
    color: "#222",
    marginLeft: 4,
    fontWeight: "bold",
  },
  historyModel: {
    fontSize: 13,
    color: "#222",
    marginLeft: 8,
    marginTop: 2,
  },
  historyFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 12,
    color: "#222",
  },
  historyTime: {
    fontSize: 12,
    color: "#222",
  },
});

export default SoleCheck;
