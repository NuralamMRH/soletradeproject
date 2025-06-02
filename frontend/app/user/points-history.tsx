import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { COLORS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AdminHeader from "@/components/AdminHeader";

interface PointsHistoryItem {
  id: string;
  transactionId: string;
  pointsEarned: number;
  transactionDate: string;
  productName: string;
  productColor: string;
  size: string;
  image: any;
}

const PointsHistory = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pointsHistory, setPointsHistory] = useState<PointsHistoryItem[]>([]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPointsHistory([
        {
          id: "1",
          transactionId: "ST29485383930",
          pointsEarned: 330,
          transactionDate: "20 Jul 24",
          productName: "Asics Gel-Kayano 14",
          productColor: "Cream/Black",
          size: "9 US",
          image: require("@/assets/MainLanding/image1.png"),
        },
        {
          id: "2",
          transactionId: "ST29485094820",
          pointsEarned: 1040,
          transactionDate: "12 Aug 24",
          productName: "Jordan 1 Low x Travis",
          productColor: "Scott Retro Low OG",
          size: "8.5 US",
          image: require("@/assets/MainLanding/image2.png"),
        },
        {
          id: "3",
          transactionId: "ST29485383744",
          pointsEarned: 380,
          transactionDate: "20 Aug 24",
          productName: "New Balance 530",
          productColor: "White Silver Navy",
          size: "8.5 US",
          image: require("@/assets/MainLanding/image3.png"),
        },
        {
          id: "4",
          transactionId: "ST29485383744",
          pointsEarned: 380,
          transactionDate: "20 Aug 24",
          productName: "New Balance 530",
          productColor: "White Silver Navy",
          size: "8.5 US",
          image: require("@/assets/MainLanding/image3.png"),
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const renderPointHistoryItem = ({ item }: { item: PointsHistoryItem }) => (
    <View style={styles.historyItem}>
      <View style={styles.productContainer}>
        <Image
          source={item.image}
          style={styles.productImage}
          resizeMode="contain"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.productColor}>{item.productColor}</Text>
          <Text style={styles.productSize}>Size: {item.size}</Text>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Transaction ID:</Text>
          <Text style={styles.transactionValue}>{item.transactionId}</Text>
        </View>

        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Points Earned:</Text>
          <Text style={styles.pointsValue}>{item.pointsEarned}</Text>
        </View>

        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Transaction Date:</Text>
          <Text style={styles.transactionValue}>{item.transactionDate}</Text>
        </View>
      </View>

      <View style={styles.divider} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader
        title="Points History"
        onBack={() => router.back()}
        right={
          <TouchableOpacity>
            <Ionicons name="filter-outline" size={24} color={COLORS.dark1} />
          </TouchableOpacity>
        }
      />
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.brandRed} />
          </View>
        ) : (
          <FlatList
            data={pointsHistory}
            renderItem={renderPointHistoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  historyItem: {
    padding: 16,
    backgroundColor: COLORS.white,
  },
  productContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  productImage: {
    width: 70,
    height: 70,
    marginRight: 12,
  },
  productInfo: {
    justifyContent: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.dark1,
  },
  productColor: {
    fontSize: 12,
    color: COLORS.grayTie,
    marginBottom: 4,
  },
  productSize: {
    fontSize: 12,
    color: COLORS.dark1,
  },
  transactionDetails: {
    marginTop: 8,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  transactionLabel: {
    fontSize: 12,
    color: COLORS.grayTie,
  },
  transactionValue: {
    fontSize: 12,
    color: COLORS.dark1,
  },
  pointsValue: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.brandRed,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayTie,
    marginTop: 12,
  },
});

export default PointsHistory;
