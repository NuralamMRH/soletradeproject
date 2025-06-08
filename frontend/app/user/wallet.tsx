import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import { COLORS, SIZES } from "@/constants";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import AdminHeader from "@/components/AdminHeader";
import { router } from "expo-router";
import { useGetMyPaymentMethods } from "@/hooks/react-query/usePaymentMethodMutation";

const MyWallet = () => {
  const { data: methods, isLoading, isError, error } = useGetMyPaymentMethods();

  // Group payment methods by section
  const groupedMethods: Record<string, any[]> = React.useMemo(() => {
    const groups: Record<string, any[]> = {
      buying: [],
      selling: [],
      payout: [],
    };
    if (Array.isArray(methods)) {
      methods.forEach((m: any) => {
        if (m.section && groups[m.section]) {
          groups[m.section].push(m);
        }
      });
    }
    return groups;
  }, [methods]);

  const [showPaymentMethodSheet, setShowPaymentMethodSheet] = useState(false);
  const [currentEditingSection, setCurrentEditingSection] = useState<
    "buying" | "selling" | "payout" | null
  >(null);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);

  const bottomSheetRef = useRef<any>(null);

  const openPaymentMethodSheet = (section: "buying" | "selling" | "payout") => {
    setCurrentEditingSection(section);
    setShowPaymentMethodSheet(true);
    setSelectedMethod(null);
    bottomSheetRef.current?.expand();
  };

  const closePaymentMethodSheet = () => {
    bottomSheetRef.current?.close();
    setTimeout(() => {
      setShowPaymentMethodSheet(false);
      setSelectedMethod(null);
    }, 300);
  };

  const openAddPaymentMethod = () => {
    closePaymentMethodSheet();
    setTimeout(() => {
      const paymentType = currentEditingSection === "payout" ? "bank" : "card";
      router.push({
        pathname: "/user/add-payment-method",
        params: {
          method: JSON.stringify({
            section: currentEditingSection,
            paymentType,
          }),
        },
      });
    }, 300);
  };

  const openEditPaymentMethod = (method: any) => {
    closePaymentMethodSheet();
    setTimeout(() => {
      router.push({
        pathname: "/user/add-payment-method",
        params: {
          method: JSON.stringify(method),
        },
      });
    }, 300);
  };

  const renderSectionHeader = (
    title: string,
    section: "buying" | "selling" | "payout"
  ) => {
    let icon;
    if (section === "buying") {
      icon = <Ionicons name="cart-outline" size={24} color={COLORS.dark1} />;
    } else if (section === "selling") {
      icon = (
        <Ionicons name="storefront-outline" size={24} color={COLORS.dark1} />
      );
    } else {
      icon = (
        <MaterialIcons
          name="account-balance-wallet"
          size={24}
          color={COLORS.dark1}
        />
      );
    }

    return (
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          {icon}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <TouchableOpacity onPress={() => openPaymentMethodSheet(section)}>
          <Text style={styles.editButton}>Edit{">"}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPaymentMethod = (section: "buying" | "selling" | "payout") => {
    const methods = groupedMethods[section];
    const defaultMethod = methods?.find((m) => m.isDefault) || methods?.[0];
    if (!methods || methods.length === 0) {
      return <Text style={styles.noPaymentText}>No payment method added</Text>;
    }
    let label =
      defaultMethod?.paymentType === "card"
        ? `${
            defaultMethod?.name || "Card"
          } ending in **${defaultMethod?.cardNumber?.slice(-4)}`
        : `${
            defaultMethod?.bank || "Bank"
          } ending in *${defaultMethod?.accountNumber?.slice(-3)}`;
    return (
      <View style={styles.paymentMethodContainer}>
        <Text style={styles.paymentLabel}>
          {section === "payout" ? "Payout" : "Payment"}
        </Text>
        <Text style={styles.paymentValue}>
          {label}
          {defaultMethod?.isDefault ? " (Default)" : ""}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading payment methods...</Text>
      </View>
    );
  }
  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: COLORS.brandRed }}>
          Error loading payment methods: {error?.message || "Unknown error"}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="My Wallet" onBack={() => router.back()} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Buying Info Section */}
        <View style={styles.section}>
          {renderSectionHeader("Buying Info", "buying")}
          {renderPaymentMethod("buying")}
        </View>
        <View style={styles.divider} />
        {/* Selling Info Section */}
        <View style={styles.section}>
          {renderSectionHeader("Selling Info", "selling")}
          {renderPaymentMethod("selling")}
        </View>
        <View style={styles.divider} />
        {/* Payout Info Section */}
        <View style={styles.section}>
          {renderSectionHeader("Payout Info", "payout")}
          {renderPaymentMethod("payout")}
        </View>
      </ScrollView>
      {/* Payment Method Bottom Sheet */}
      {showPaymentMethodSheet && (
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={["50%", "50%"]}
          enablePanDownToClose={true}
          onClose={() => setShowPaymentMethodSheet(false)}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.bottomSheetIndicator}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            <View style={styles.bottomSheetHeader}>
              <TouchableOpacity onPress={closePaymentMethodSheet}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.bottomSheetTitle}>Payment Method</Text>
              <TouchableOpacity onPress={closePaymentMethodSheet}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.paymentMethodsList}>
              {currentEditingSection && groupedMethods[currentEditingSection]
                ? groupedMethods[currentEditingSection].map((method: any) => (
                    <TouchableOpacity
                      key={method._id || method.id}
                      style={styles.paymentMethodItem}
                      onPress={() => openEditPaymentMethod(method)}
                    >
                      <View style={styles.paymentMethodLeft}>
                        {method.paymentType === "card" ? (
                          <FontAwesome
                            name="credit-card"
                            size={24}
                            color={COLORS.white}
                            style={{ marginRight: 8 }}
                          />
                        ) : (
                          <MaterialIcons
                            name="account-balance"
                            size={24}
                            color={COLORS.white}
                            style={{ marginRight: 8 }}
                          />
                        )}
                        <Text style={styles.paymentMethodText}>
                          {method.paymentType === "card"
                            ? `${
                                method.name || "Card"
                              } ending in **${method.cardNumber?.slice(-4)}`
                            : `${
                                method.bank || "Bank"
                              } ending in *${method.accountNumber?.slice(-3)}`}
                          {method.isDefault ? " (Default)" : ""}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                : null}
              <TouchableOpacity
                style={styles.addPaymentButton}
                onPress={openAddPaymentMethod}
              >
                <Text style={styles.addPaymentText}>
                  Add New Payment Method
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </BottomSheetView>
        </BottomSheet>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  section: {
    padding: 16,
    backgroundColor: COLORS.white,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark1,
    marginLeft: 8,
  },
  editButton: {
    fontSize: 14,
    color: COLORS.grayTie,
  },
  paymentMethodContainer: {
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: COLORS.dark1,
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 14,
    color: COLORS.dark1,
  },
  noPaymentText: {
    fontSize: 14,
    color: COLORS.grayTie,
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayTie,
  },
  bottomSheetBackground: {
    backgroundColor: COLORS.dark1,
  },
  bottomSheetIndicator: {
    backgroundColor: COLORS.grayTie,
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: COLORS.dark1,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayTie,
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  cancelButton: {
    fontSize: 14,
    color: COLORS.white,
  },
  doneButton: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
  },
  paymentMethodsList: {
    flex: 1,
  },
  paymentMethodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardLogo: {
    width: 40,
    height: 24,
    marginRight: 12,
  },
  paymentMethodText: {
    fontSize: 14,
    color: COLORS.white,
  },
  deleteButton: {
    backgroundColor: COLORS.brandRed,
    width: 40,
    height: 40,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  addPaymentButton: {
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  addPaymentText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.backgroundGray,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SIZES.height * 0.8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.grayTie,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark1,
  },
  cardPreviewContainer: {
    padding: 24,
    alignItems: "center",
  },
  cardPreview: {
    width: 280,
    height: 180,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayTie,
    padding: 20,
    justifyContent: "center",
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: COLORS.dark1,
    borderRadius: 4,
    marginBottom: 30,
  },
  cardNumberPreview: {
    fontSize: 18,
    color: COLORS.grayTie,
    letterSpacing: 2,
  },
  formSection: {
    backgroundColor: COLORS.white,
    padding: 16,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark1,
    marginBottom: 16,
  },
  cardInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.grayTie,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cardTypeIcon: {
    marginRight: 8,
  },
  cardInput: {
    flex: 2,
    fontSize: 14,
    color: COLORS.dark1,
  },
  expiryInput: {
    width: 80,
    fontSize: 14,
    color: COLORS.dark1,
    textAlign: "center",
  },
  cvvInput: {
    width: 50,
    fontSize: 14,
    color: COLORS.dark1,
    textAlign: "center",
  },
});

export default MyWallet;
