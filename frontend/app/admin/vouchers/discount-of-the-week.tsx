import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  useGetDiscountOfTheWeekSection,
  useUpdateDiscountOfTheWeekSection,
  useCreateDiscountOfTheWeekSection,
  useCreateVoucherSection,
  useUpdateVoucherSection,
} from "@/hooks/react-query/voucherApi";
import { useQuery } from "@tanstack/react-query";
import { useGetVouchers } from "@/hooks/react-query/useVoucherMutation";
import COLORS from "@/constants/Colors";
import AdminHeader from "@/components/AdminHeader";

const DiscountOfTheWeek: React.FC = () => {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%"], []);

  const {
    data: section,
    isLoading,
    refetch,
  } = useGetDiscountOfTheWeekSection();
  const createMutation = useCreateVoucherSection();
  const updateMutation = useUpdateVoucherSection();
  const { data: allVouchers = [] } = useGetVouchers();

  console.log("section", section);

  // Prepare voucher list with position
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);

  React.useEffect(() => {
    if (section && section.voucherIds) {
      // voucherIds: [{voucher, position}]
      const sorted = [...section.voucherIds].sort(
        (a, b) => a.position - b.position
      );
      setVouchers(sorted);
    }
  }, [section]);

  // Remove voucher
  const handleRemove = (voucherId: string) => {
    const filtered = vouchers.filter((v) => v.voucher._id !== voucherId);
    saveVouchers(filtered);
  };

  // Save vouchers (update backend)
  const saveVouchers = (voucherArr: any[]) => {
    const payload = {
      name: "Discount of the week",
      voucherIds: voucherArr.map((v, idx) => ({
        voucher: v.voucher._id,
        position: idx,
      })),
    };

    console.log("payload", payload);

    if (section && section._id) {
      updateMutation.mutate(
        { id: section._id, ...payload, term: "weekly" },
        { onSuccess: refetch }
      );
    } else {
      createMutation.mutate(
        { ...payload, term: "weekly" },
        { onSuccess: refetch }
      );
    }
    setVouchers(voucherArr);
  };

  // Drag and drop
  const handleDragEnd = ({ data }: { data: any[] }) => {
    setVouchers(data);
    saveVouchers(data);
  };

  // Add vouchers
  const handleAddVouchers = () => {
    const newVouchers = [
      ...vouchers,
      ...allVouchers
        .filter((v: any) => selectedToAdd.includes(v._id))
        .map((v: any, idx) => ({
          voucher: v,
          position: vouchers.length + idx,
        })),
    ];
    saveVouchers(newVouchers);
    setAddSheetOpen(false);
    setSelectedToAdd([]);
    bottomSheetRef.current?.close();
  };

  // Render voucher row
  const renderItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<any>) => {
      const index = getIndex
        ? getIndex()
        : vouchers.findIndex((v) => v.voucher._id === item.voucher._id);
      const v = item.voucher;
      return (
        <View
          style={[styles.voucherCard, isActive && { backgroundColor: "#eee" }]}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() =>
              router.push({
                pathname: "/admin/vouchers/add-edit-voucher",
                params: { id: v._id, voucherType: "Weekly" },
              })
            }
          >
            <Text style={styles.voucherTitle}>{`Voucher ${index + 1}`}</Text>
            <Text style={styles.voucherBrand}>
              {v.brand || v.code || ""}: Up to{" "}
              {v.maxDiscount || v.discountAmount || 0}% Off
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onLongPress={drag} style={{ marginRight: 12 }}>
            <Ionicons name="reorder-three" size={28} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleRemove(v._id)}>
            <Ionicons name="remove-circle" size={28} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      );
    },
    [vouchers]
  );

  // Vouchers available to add
  const availableVouchers = allVouchers.filter(
    (v: any) => !vouchers.some((sel) => sel.voucher._id === v._id)
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
      <AdminHeader title="Discount of the week" onBack={() => router.back()} />

      <View style={{ padding: 20, paddingTop: 10 }}>
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 16 }}>
          Manage Discounts
        </Text>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <DraggableFlatList
            data={vouchers}
            keyExtractor={(item) => item.voucher._id}
            renderItem={renderItem}
            onDragEnd={handleDragEnd}
            containerStyle={{ minHeight: 100 }}
          />
        )}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setAddSheetOpen(true);
            bottomSheetRef.current?.expand();
          }}
        >
          <Text style={styles.addText}>ADD</Text>
          <Ionicons
            name="add"
            size={28}
            color="#6B1A1A"
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </View>
      {/* BottomSheet for adding vouchers */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={() => setAddSheetOpen(false)}
        backgroundStyle={{ backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ padding: 20 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Select Vouchers
          </Text>
          {availableVouchers.length === 0 ? (
            <Text style={{ textAlign: "center", color: "#888" }}>
              No more vouchers to add.
            </Text>
          ) : (
            availableVouchers.map((v: any) => (
              <TouchableOpacity
                key={v._id}
                style={styles.selectVoucherRow}
                onPress={() => {
                  setSelectedToAdd((prev) =>
                    prev.includes(v._id)
                      ? prev.filter((id) => id !== v._id)
                      : [...prev, v._id]
                  );
                }}
              >
                <Ionicons
                  name={
                    selectedToAdd.includes(v._id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={22}
                  color={COLORS.primary}
                  style={{ marginRight: 10 }}
                />
                <Text style={{ flex: 1 }}>
                  {v.brand || v.code || ""}: Up to{" "}
                  {v.maxDiscount || v.discountAmount || 0}% Off
                </Text>
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { marginTop: 24, opacity: selectedToAdd.length === 0 ? 0.5 : 1 },
            ]}
            onPress={handleAddVouchers}
            disabled={selectedToAdd.length === 0}
          >
            <Text style={styles.saveText}>Add Selected</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 48,
    backgroundColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderColor: "#aaa",
    position: "relative",
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 24,
    color: "#111",
  },
  voucherCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
    marginBottom: 16,
    padding: 12,
    borderBottomWidth: 2,
    borderColor: "#222",
    elevation: 1,
  },
  voucherTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 2,
    color: "#222",
  },
  voucherBrand: {
    color: "#222",
    fontSize: 15,
    marginBottom: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginLeft: 0,
  },
  addText: {
    color: "#6B1A1A",
    fontWeight: "bold",
    fontSize: 20,
    marginRight: 8,
  },
  selectVoucherRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    padding: 14,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default DiscountOfTheWeek;
