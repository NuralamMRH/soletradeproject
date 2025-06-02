import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { COLORS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AdminHeader from "@/components/AdminHeader";

interface Voucher {
  id: string;
  title: string;
  minSpend: string;
  image: any;
  daysLeft: number;
  terms: string;
}

const ActiveRewards: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"input" | "claim">("input");
  const [promoCode, setPromoCode] = useState<string>("");

  const activeVouchers: Voucher[] = [
    {
      id: "1",
      title: "10% off Up to 100 Baht",
      minSpend: "Min Spend 0 Baht",
      image: require("@/assets/MainLanding/image37.png"),
      daysLeft: 2,
      terms: "T&C",
    },
    {
      id: "2",
      title: "10% off Up to 100 Baht",
      minSpend: "Min Spend 0 Baht",
      image: require("@/assets/MainLanding/image38.png"),
      daysLeft: 2,
      terms: "T&C",
    },
    {
      id: "3",
      title: "10% off Up to 100 Baht",
      minSpend: "Min Spend 0 Baht",
      image: require("@/assets/MainLanding/image38.png"),
      daysLeft: 2,
      terms: "T&C",
    },
    {
      id: "4",
      title: "10% off Up to 100 Baht",
      minSpend: "Min Spend 0 Baht",
      image: require("@/assets/MainLanding/image38.png"),
      daysLeft: 2,
      terms: "T&C",
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader
        title="Active Rewards"
        onBack={() => router.back()}
        right={
          <TouchableOpacity onPress={() => router.push("/user/points-history")}>
            <Ionicons name="time-outline" size={24} color={COLORS.dark1} />
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "input" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("input")}
          >
            <View style={styles.tabInner}>
              <Ionicons
                name="keypad-outline"
                size={18}
                color={activeTab === "input" ? COLORS.dark1 : COLORS.grayTie}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "input" && styles.activeTabText,
                ]}
              >
                Input Promo Code
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.tabDivider} />

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "claim" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("claim")}
          >
            <View style={styles.tabInner}>
              <Ionicons
                name="ticket-outline"
                size={18}
                color={activeTab === "claim" ? COLORS.dark1 : COLORS.grayTie}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "claim" && styles.activeTabText,
                ]}
              >
                Claim Vouchers
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Input Promo Code Section */}
        {activeTab === "input" && (
          <View style={styles.inputContainer}>
            <View style={styles.promoInputContainer}>
              <TextInput
                style={styles.promoInput}
                placeholder="Input Promo Code"
                value={promoCode}
                onChangeText={setPromoCode}
                placeholderTextColor={COLORS.grayTie}
              />
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  !promoCode && styles.disabledButton,
                ]}
                disabled={!promoCode}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Voucher List */}
        <ScrollView
          style={styles.voucherListContainer}
          showsVerticalScrollIndicator={false}
        >
          {activeVouchers.map((voucher) => (
            <View key={voucher.id} style={styles.voucherCard}>
              <Image source={voucher.image} style={styles.voucherImage} />

              <View style={styles.voucherContent}>
                <View>
                  <Text style={styles.voucherTitle}>{voucher.title}</Text>
                  <Text style={styles.voucherMinSpend}>{voucher.minSpend}</Text>
                </View>

                <View style={styles.voucherFooter}>
                  <View style={styles.voucherExpiry}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={COLORS.grayTie}
                    />
                    <Text style={styles.voucherExpiryText}>
                      Use in {voucher.daysLeft} days
                    </Text>
                    <Text style={styles.voucherTerms}>{voucher.terms}</Text>
                  </View>

                  <TouchableOpacity style={styles.useButton}>
                    <Text style={styles.useButtonText}>Use</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    margin: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.grayTie,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 4,
  },
  activeTabButton: {
    backgroundColor: COLORS.white,
  },
  tabInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.grayTie,
  },
  activeTabText: {
    color: COLORS.dark1,
    fontWeight: "500",
  },
  tabDivider: {
    width: 1,
    backgroundColor: COLORS.grayTie,
  },
  inputContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  promoInputContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayTie,
    overflow: "hidden",
  },
  promoInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.dark1,
  },
  applyButton: {
    backgroundColor: COLORS.dark1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: COLORS.grayTie,
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  voucherListContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  voucherCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.grayTie,
  },
  voucherImage: {
    width: 80,
    height: 80,
    resizeMode: "cover",
  },
  voucherContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  voucherTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark1,
  },
  voucherMinSpend: {
    fontSize: 12,
    color: COLORS.grayTie,
    marginTop: 2,
  },
  voucherFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  voucherExpiry: {
    flexDirection: "row",
    alignItems: "center",
  },
  voucherExpiryText: {
    fontSize: 12,
    color: COLORS.grayTie,
    marginLeft: 4,
  },
  voucherTerms: {
    fontSize: 12,
    color: COLORS.grayTie,
    marginLeft: 8,
  },
  useButton: {
    backgroundColor: COLORS.brandRed,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  useButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "500",
  },
});

export default ActiveRewards;
