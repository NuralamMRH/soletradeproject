import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/AdminHeader";
import COLORS from "@/constants/Colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  useCreateVoucherSection,
  useUpdateVoucherSection,
  useDeleteVoucherSection,
} from "@/hooks/react-query/voucherApi";
import { useGetVouchers } from "@/hooks/react-query/useVoucherMutation";
import { baseUrl } from "@/api/MainApi";

interface Voucher {
  _id: string;
  term: string;
  poster?: { image_full_url?: string };
  discountAmount: number;
  maxDiscount: number;
  minSpend?: number;
  startDate: string;
  endDate: string;
  status?: string;
  [key: string]: any;
}

const NewSection: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const term = "one-time";
  const isEdit = Boolean(params.section);

  const sectionData = useMemo(() => {
    if (isEdit && typeof params.section === "string") {
      try {
        return JSON.parse(params.section);
      } catch {
        return null;
      }
    }
    return null;
  }, [isEdit, params.section]);

  const [name, setName] = useState(sectionData?.name || "");
  const [vouchers, setVouchers] = useState<string[]>(
    sectionData?.voucherIds || []
  );

  useEffect(() => {
    if (sectionData) {
      setVouchers(sectionData.voucherIds.map((v: any) => v.voucher?._id || ""));
    }
  }, [sectionData]);

  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const { data: allVouchers = [], isLoading: isLoadingVouchers } =
    useGetVouchers();
  const createMutation = useCreateVoucherSection();
  const updateMutation = useUpdateVoucherSection();
  const deleteMutation = useDeleteVoucherSection();

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Section name is required");
      return;
    }
    const payload = {
      name,
      voucherIds: vouchers.map((v, idx) => ({
        voucher: v,
        position: idx,
      })),
      term,
    };
    if (isEdit) {
      updateMutation.mutate(
        { id: sectionData._id, ...payload },
        { onSuccess: () => router.back() }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => router.back() });
    }
  };

  const handleDelete = () => {
    if (!isEdit) return;
    Alert.alert("Delete Section", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(sectionData._id, {
            onSuccess: () => router.back(),
          });
        },
      },
    ]);
  };

  const handleAddVoucher = (voucher: Voucher) => {
    if (!vouchers.includes(voucher._id)) {
      setVouchers((prev) => [...prev, voucher._id]);
    }
    setBottomSheetOpen(false);
    bottomSheetRef.current?.close();
  };

  const handleRemoveVoucher = (id: string) => {
    setVouchers((prev) => prev.filter((v) => v !== id));
  };

  // Card design (from renderVoucher)
  const renderVoucher = ({
    item,
    showRemove,
  }: {
    item: Voucher;
    showRemove?: boolean;
  }) => (
    <View style={styles.voucherCard}>
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
          <View style={{ flex: 1, backgroundColor: COLORS.brandDarkColor }} />
        )}
      </View>
      <View style={styles.voucherInfo}>
        <Text style={styles.voucherTitle}>
          {item?.discountAmount || 0}% off Up to {item?.maxDiscount || 0} Baht
        </Text>
        <Text style={styles.voucherSub}>
          Min Spend {item?.minSpend || 0} Baht
        </Text>
        <Text style={styles.voucherPeriod}>
          Claim in:{" "}
          {Math.ceil(
            (new Date(item?.endDate).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          )}{" "}
          days <Text style={styles.tnc}>T&C</Text>
        </Text>
      </View>
      {showRemove && (
        <TouchableOpacity onPress={() => handleRemoveVoucher(item._id)}>
          <Ionicons
            name="remove-circle"
            size={28}
            color={COLORS.brandDarkColor}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <AdminHeader
        title="New Sections"
        right={
          <TouchableOpacity onPress={handleSave} style={{ marginRight: 12 }}>
            <Text
              style={{
                color: COLORS.primary,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Save
            </Text>
          </TouchableOpacity>
        }
        onBack={() => router.back()}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.editTitle}>Edit Section</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={styles.label}>Section name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Section name"
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            marginBottom: 8,
          }}
        >
          <Text style={styles.label}>Manage Vouchers</Text>
          <TouchableOpacity
            onPress={() => {
              router.push("/admin/vouchers");
            }}
          >
            <Text style={{ color: COLORS.primary, fontWeight: "bold" }}>
              Manage all Vouchers&gt;
            </Text>
          </TouchableOpacity>
        </View>
        {vouchers.map((voucherId, idx) => {
          const voucherData = allVouchers.find(
            (v) => v._id === voucherId
          ) as Voucher;
          if (!voucherData) return null;
          return (
            <View key={voucherId} style={{ marginTop: 16 }}>
              <Text style={styles.voucherLabel}>Voucher {idx + 1}</Text>
              {renderVoucher({ item: voucherData, showRemove: true })}
            </View>
          );
        })}
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", marginTop: 24 }}
          onPress={() => {
            setBottomSheetOpen(true);
            bottomSheetRef.current?.expand();
          }}
        >
          <Text
            style={{
              color: COLORS.brandDarkColor,
              fontWeight: "bold",
              fontSize: 18,
              marginRight: 8,
            }}
          >
            ADD
          </Text>
          <Ionicons name="add" size={28} color={COLORS.brandDarkColor} />
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.footerBtns}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        {isEdit && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* BottomSheet for selecting voucher */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["60%"]}
        enablePanDownToClose={true}
        onClose={() => setBottomSheetOpen(false)}
        handleIndicatorStyle={{ backgroundColor: "#000" }}
        backgroundStyle={{ backgroundColor: "#fff" }}
      >
        <BottomSheetView>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Select Voucher
          </Text>
          <FlatList
            data={allVouchers.filter(
              (v: Voucher) =>
                !vouchers.includes(v._id) && v.status === "Ongoing"
            )}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleAddVoucher(item)}>
                {renderVoucher({ item })}
              </TouchableOpacity>
            )}
            contentContainerStyle={{ marginBottom: 200, paddingHorizontal: 16 }}
          />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  editTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#888",
    fontSize: 16,
    paddingVertical: 8,
    marginLeft: 12,
    flex: 1,
  },
  voucherLabel: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    color: "#222",
  },
  voucherCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
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
  tnc: {
    color: COLORS.brandDarkColor,
    fontWeight: "bold",
  },
  footerBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#666",
    padding: 16,
    borderRadius: 6,
    marginRight: 8,
    alignItems: "center",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: COLORS.brandDarkColor,
    padding: 16,
    borderRadius: 6,
    marginLeft: 8,
    alignItems: "center",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default NewSection;
