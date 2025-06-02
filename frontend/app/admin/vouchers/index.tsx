import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  ListRenderItem,
  Image,
} from "react-native";
import { useGetVouchers } from "@/hooks/react-query/useVoucherMutation";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { useRouter } from "expo-router";
import AdminHeader from "@/components/AdminHeader";
import Colors from "@/constants/Colors";
import { baseUrl } from "@/api/MainApi";

interface Voucher {
  _id: string;
  discountAmount: number;
  maxDiscount: number;
  minSpend?: number;
  startDate: string;
  endDate: string;
  status: string;
  [key: string]: any;
}

const TABS = [
  { key: "ongoing", label: "Ongoing" },
  { key: "expired", label: "Expired" },
];

const AdminVouchersPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("ongoing");
  const { data: vouchers = [], isLoading } = useGetVouchers();

  const filteredVouchers = vouchers.filter((v: Voucher) =>
    activeTab === "ongoing" ? v.status === "Ongoing" : v.status === "Expired"
  );

  const getDaysLeft = (endDate?: string): number | string => {
    if (!endDate) return "-";
    const now = new Date();
    const end = new Date(endDate);
    // Calculate the difference in milliseconds
    const diff = end.setHours(23, 59, 59, 999) - now.getTime();
    // Convert to days
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const renderVoucher: ListRenderItem<Voucher> = ({ item }) => (
    <TouchableOpacity
      style={styles.voucherCard}
      onPress={() =>
        router.push({
          pathname: "/admin/vouchers/add-edit-voucher",
          params: { id: item._id },
        })
      }
    >
      <View style={styles.posterContainer}>
        {item?.poster?.image_full_url ? (
          <Image
            source={{
              uri: item.poster.image_full_url
                ? `${baseUrl}${item.poster.image_full_url}`
                : item.poster.image_full_url,
            }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              left: 0,
              backgroundColor: Colors.brandDarkColor,
              padding: 5,
            }}
          >
            <Text
              style={activeTab === "ongoing" ? styles.ongoing : styles.expired}
            >
              {activeTab === "ongoing" ? "Ongoing" : "Expired"}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.voucherInfo}>
        <Text style={styles.voucherTitle}>
          {item.discountAmount}% off Up to {item.maxDiscount} Baht
        </Text>
        <Text style={styles.voucherSub}>
          Min Spend {item.minSpend || 0} Baht
        </Text>
        <Text style={styles.voucherPeriod}>
          Period: {new Date(item.startDate).toLocaleString()} -{" "}
          {new Date(item.endDate).toLocaleString()}
        </Text>
        <Text style={styles.voucherUse}>
          Use in: {getDaysLeft(item.endDate)} days{" "}
          <Text style={styles.tnc}>T&C</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <AdminHeader title="Vouchers" onBack={() => router.back()} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginHorizontal: 12,
          marginTop: 12,
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/admin/vouchers/add-edit-voucher")}
        >
          <Ionicons
            name="add-circle-outline"
            size={28}
            color={COLORS.primary}
          />
          <Text style={styles.addText}>Add New</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={
                activeTab === tab.key ? styles.activeTabText : styles.tabText
              }
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>Loading...</Text>
      ) : (
        <FlatList
          data={filteredVouchers}
          renderItem={renderVoucher}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No vouchers found
            </Text>
          }
          ListFooterComponent={<View style={{ height: 200 }} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  //Header section style close
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    color: "#888",
    fontWeight: "bold",
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  addText: {
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: "bold",
  },
  voucherCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 0,
    alignItems: "center",
    elevation: 2,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  posterContainer: {
    width: 110,
    height: 110,
    backgroundColor: "#eee",
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderRightWidth: 2,
    borderRightColor: "#ccc",
  },
  voucherInfo: {
    flex: 1,
  },
  voucherTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  voucherSub: {
    color: "#888",
    fontSize: 13,
  },
  voucherPeriod: {
    color: "#888",
    fontSize: 12,
  },
  voucherUse: {
    color: "#888",
    fontSize: 12,
  },
  tnc: {
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  statusTag: {
    marginLeft: 8,
    alignItems: "flex-end",
  },
  ongoing: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
  },
  expired: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default AdminVouchersPage;
