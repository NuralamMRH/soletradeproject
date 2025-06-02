import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ToastAndroid,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  useGetTierBenefits,
  useCreateTierBenefit,
  useDeleteTierBenefit,
} from "@/hooks/react-query/useTierBenefit";
import { useCategories } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";
import { useLocalSearchParams, useRouter } from "expo-router";
import AdminHeader from "@/components/AdminHeader";

// Type definitions for benefit and tier
interface BenefitData {
  name: string;
  subTitle: string;
  description: string;
  sellerFee: number;
  buyerFee: number;
  category?: string;
  product?: string;
  brand?: string;
}

interface Tier {
  _id: string;
  name: string;
  timeLimit?: string;
}

const EditTierAndBenefit = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const tier: Tier = params.tier
    ? JSON.parse(params.tier as string)
    : { _id: "", name: "" };

  const {
    data: benefits = [],
    isLoading,
    error,
  } = useGetTierBenefits(tier._id);
  const createBenefit = useCreateTierBenefit();
  const deleteBenefit = useDeleteTierBenefit();

  const showToast = (message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  // Check if tier is expired
  const isTierExpired = () => {
    if (!tier.timeLimit) return false;
    const currentDate = new Date();
    const tierEndDate = new Date(tier.timeLimit);
    return currentDate > tierEndDate;
  };

  // Separate benefits into current and expired
  const currentBenefits = benefits.filter((benefit: any) => !isTierExpired());
  const expiredBenefits = benefits.filter((benefit: any) => isTierExpired());

  const handleDeleteBenefit = async (benefitId: string) => {
    try {
      await deleteBenefit.mutateAsync(benefitId);
      showToast("Benefit deleted successfully");
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to delete benefit");
    }
  };

  const renderBenefitItem = (benefit: any) => (
    <View key={benefit._id} style={styles.benefitItem}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/admin/tiers/add-tier",
            params: {
              tier: JSON.stringify(tier),
              benefit: JSON.stringify(benefit),
            },
          })
        }
        style={styles.benefitHeader}
      >
        <View>
          <Text style={styles.benefitName}>{benefit.name}</Text>
          <Text style={styles.benefitSubtitle}>{benefit.subtitle}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteBenefit(benefit._id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#8B0000" />
        </TouchableOpacity>
      </TouchableOpacity>
      <Text style={styles.benefitDescription}>{benefit.description}</Text>
      <View style={styles.benefitDetails}>
        <Text style={styles.feeText}>
          Seller Fee: {benefit.seller_fee || benefit.sellerFee}%
        </Text>
        <Text style={styles.feeText}>
          Buyer Fee: {benefit.buyer_fee || benefit.buyerFee}%
        </Text>
      </View>
      {benefit.category && (
        <Text style={styles.itemText}>Category: {benefit.category.name}</Text>
      )}
      {benefit.product && (
        <Text style={styles.itemText}>Product: {benefit.product.name}</Text>
      )}
      {benefit.brand && (
        <Text style={styles.itemText}>Brand: {benefit.brand.name}</Text>
      )}
    </View>
  );

  return (
    <>
      <AdminHeader
        title={`${tier.name} Benefits`}
        onBack={() => router.back()}
      />
      <View style={styles.container}>
        <ScrollView style={styles.listContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Benefits</Text>
            {isLoading ? (
              <Text style={styles.emptyText}>Loading benefits...</Text>
            ) : error ? (
              <Text style={styles.errorText}>
                Error loading benefits: {error.message}
              </Text>
            ) : currentBenefits && currentBenefits.length > 0 ? (
              currentBenefits.map(renderBenefitItem)
            ) : (
              <Text style={styles.emptyText}>No current benefits</Text>
            )}
          </View>

          {expiredBenefits && expiredBenefits.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expired Benefits</Text>
              {expiredBenefits.map(renderBenefitItem)}
            </View>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              router.push({
                pathname: "/admin/tiers/benefit-form",
                params: {
                  tier: JSON.stringify(tier),
                },
              })
            }
          >
            <Ionicons name="add-circle" size={24} color="#8B0000" />
            <Text style={styles.addButtonText}>Add New Benefit</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  listContainer: {
    flex: 1,
  },
  formScrollView: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    margin: 15,
    padding: 16,
    borderRadius: 8,
    flex: 1,
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginTop: 15,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 20,
  },
  errorText: {
    textAlign: "center",
    color: "#FF0000",
    marginVertical: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  feeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  feeInput: {
    width: "48%",
  },
  typeSelection: {
    marginBottom: 15,
  },
  typeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  typeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    width: "30%",
    alignItems: "center",
  },
  selectedType: {
    backgroundColor: "#8B0000",
    borderColor: "#8B0000",
  },
  typeButtonText: {
    color: "#333",
    fontSize: 14,
  },
  selectedTypeText: {
    color: "#fff",
  },
  selectedItemContainer: {
    marginBottom: 15,
  },
  selectedItemText: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#8B0000",
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  saveButton: {
    padding: 12,
    backgroundColor: "#8B0000",
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#8B0000",
    fontSize: 16,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  benefitItem: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  benefitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  benefitName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  benefitSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  benefitDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  feeText: {
    fontSize: 14,
    color: "#666",
  },
  itemText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginTop: 15,
    marginBottom: 30,
  },
  addButtonText: {
    fontSize: 16,
    color: "#8B0000",
    marginLeft: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginLeft: 8,
  },
});

export default EditTierAndBenefit;
