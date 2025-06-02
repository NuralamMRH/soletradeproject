import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { COLORS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AdminHeader from "@/components/AdminHeader";

interface Discount {
  id: string;
  title: string;
  image: any;
  points: number;
}

interface Redemption {
  id: string;
  title: string;
  image: any | null;
  points: number;
  value: string;
}

const VoucherAndDeals: React.FC = () => {
  const router = useRouter();
  const totalPoints = 860;

  const specialDiscounts: Discount[] = [
    {
      id: "1",
      title: "10% off Jordans",
      image: require("@/assets/MainLanding/image1.png"),
      points: 200,
    },
    {
      id: "2",
      title: "5% off Stussy Apparels",
      image: require("@/assets/MainLanding/image2.png"),
      points: 150,
    },
  ];

  const pointsRedemption: Redemption[] = [
    {
      id: "3",
      title: "Discount 300 Baht",
      image: null,
      points: 450,
      value: "300 BAHT",
    },
    {
      id: "4",
      title: "Discount 600 Baht",
      image: null,
      points: 900,
      value: "600 BAHT",
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Voucher and Deals" onBack={() => router.back()} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Points and Vouchers Card */}
        <View style={styles.card}>
          {/* Points Section */}
          <View style={styles.pointsSection}>
            <View style={styles.pointsIconContainer}>
              <Ionicons name="medal-outline" size={24} color={COLORS.dark1} />
            </View>
            <View style={styles.pointsTextContainer}>
              <Text style={styles.pointsValue}>{totalPoints} Points</Text>
              <TouchableOpacity
                style={styles.historyLink}
                onPress={() => router.push("/user/points-history")}
              >
                <Text style={styles.historyLinkText}>
                  View points history ›
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Vouchers Section */}
          <View style={styles.vouchersSection}>
            <View style={styles.voucherIconContainer}>
              <Ionicons name="ticket-outline" size={24} color={COLORS.dark1} />
            </View>
            <View style={styles.voucherTextContainer}>
              <Text style={styles.voucherTitle}>Vouchers</Text>
              {/* Update the voucherLink TouchableOpacity to navigate to active-rewards */}
              <TouchableOpacity
                style={styles.voucherLink}
                onPress={() => router.push("/user/active-rewards")}
              >
                <Text style={styles.voucherLinkText}>View my vouchers ›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Special Discount Section */}
        <Text style={styles.sectionTitle}>Special Discount</Text>
        <View style={styles.discountGrid}>
          {specialDiscounts.map((discount) => (
            <TouchableOpacity key={discount.id} style={styles.discountCard}>
              <Image source={discount.image} style={styles.discountImage} />
              <View style={styles.discountInfo}>
                <Text style={styles.discountTitle}>{discount.title}</Text>
                <Text style={styles.discountPoints}>
                  {discount.points} points
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Points Redemption Section */}
        <Text style={styles.sectionTitle}>Points Redemption</Text>
        <View style={styles.discountGrid}>
          {pointsRedemption.map((redemption) => (
            <TouchableOpacity key={redemption.id} style={styles.redemptionCard}>
              {redemption.image ? (
                <Image source={redemption.image} style={styles.discountImage} />
              ) : (
                <View style={styles.redemptionValueContainer}>
                  <Text style={styles.redemptionValue}>{redemption.value}</Text>
                  <Ionicons
                    name="pricetag"
                    size={24}
                    color={COLORS.brandRed}
                    style={styles.tagIcon}
                  />
                </View>
              )}
              <View style={styles.redemptionInfo}>
                <Text style={styles.redemptionTitle}>{redemption.title}</Text>
                <Text style={styles.redemptionPoints}>
                  {redemption.points} points
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pointsSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  pointsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pointsTextContainer: {
    flex: 1,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.dark1,
    marginBottom: 4,
  },
  historyLink: {
    marginTop: 4,
  },
  historyLinkText: {
    fontSize: 14,
    color: COLORS.grayTie,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayTie,
    marginVertical: 16,
  },
  vouchersSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  voucherIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  voucherTextContainer: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.dark1,
    marginBottom: 4,
  },
  voucherLink: {
    marginTop: 4,
  },
  voucherLinkText: {
    fontSize: 14,
    color: COLORS.grayTie,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.dark1,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  discountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  discountCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.grayTie,
  },
  discountImage: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
  },
  discountInfo: {
    padding: 12,
  },
  discountTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark1,
    marginBottom: 4,
  },
  discountPoints: {
    fontSize: 12,
    color: COLORS.grayTie,
  },
  redemptionCard: {
    width: "48%",
    backgroundColor: COLORS.black,
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  redemptionValueContainer: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  redemptionValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.brandRed,
    textAlign: "center",
  },
  tagIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  redemptionInfo: {
    padding: 12,
    backgroundColor: COLORS.black,
  },
  redemptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 4,
  },
  redemptionPoints: {
    fontSize: 12,
    color: COLORS.grayTie,
  },
});

export default VoucherAndDeals;
