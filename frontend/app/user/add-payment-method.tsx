import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { COLORS, SIZES } from "@/constants";
import { Ionicons, FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import AdminHeader from "@/components/AdminHeader";
import { router, useLocalSearchParams } from "expo-router";
import {
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
  useSetDefaultPaymentMethod,
} from "@/hooks/react-query/usePaymentMethodMutation";
import { useShowNotificationWithImage } from "@/hooks/useLocalNotifications";

type PaymentMethod = {
  _id?: string;
  id?: string;
  name: string;
  paymentType?: string;
  cardType?: string;
  section?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  bank?: string;
  accountName?: string;
  accountNumber?: string;
  isDefault?: boolean;
  isActive?: boolean;
  type?: string;
  data?: any;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Params = {
  method?: PaymentMethod;
};

const AddPaymentMethod = () => {
  const paramsRaw = useLocalSearchParams();

  const params: Params = {
    method: paramsRaw.method
      ? JSON.parse(paramsRaw.method as string)
      : undefined,
  };

  const isEditing = !!params.method?._id;
  const editingId = params.method?._id || params.method?.id;
  const { paymentType = "card", section = "buying" } = params.method || {};

  // React Query mutations
  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();
  const deleteMutation = useDeletePaymentMethod();
  const setDefaultMutation = useSetDefaultPaymentMethod();

  // States for card details
  const [cardType, setCardType] = useState(params.method?.cardType || "");
  const [cardNumber, setCardNumber] = useState(params.method?.cardNumber || "");
  const [expiryDate, setExpiryDate] = useState(params.method?.expiryDate || "");
  const [cvv, setCvv] = useState(params.method?.cvv || "");

  // States for bank details
  const [selectedBank, setSelectedBank] = useState(params.method?.bank || null);
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [accountHolderName, setAccountHolderName] = useState(
    params.method?.accountName || ""
  );
  const [accountNumber, setAccountNumber] = useState(
    params.method?.accountNumber || ""
  );

  // Default state
  const [isDefault, setIsDefault] = useState(params.method?.isDefault || false);

  // Title based on section
  const [pageTitle, setPageTitle] = useState("Add Payment Method");

  const showNotification = useShowNotificationWithImage();

  useEffect(() => {
    if (section === "payout") {
      setPageTitle(isEditing ? "Edit Bank Account" : "Add Bank Account");
    } else {
      setPageTitle(isEditing ? "Edit Payment Card" : "Add Payment Card");
    }
  }, [section, paymentType, isEditing]);

  function detectCardType(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, "");
    if (/^4[0-9]{0,}$/.test(cleaned)) return "VISA";
    if (/^5[1-5][0-9]{0,}$/.test(cleaned)) return "MASTERCARD";
    if (/^3[47][0-9]{0,}$/.test(cleaned)) return "AMEX";
    if (/^6(?:011|5[0-9]{2})[0-9]{0,}$/.test(cleaned)) return "DISCOVER";
    if (/^35(2[89]|[3-8][0-9])[0-9]{0,}$/.test(cleaned)) return "JCB";
    if (/^3(?:0[0-5]|[68][0-9])[0-9]{0,}$/.test(cleaned)) return "DINERS";
    return "";
  }

  useEffect(() => {
    setCardType(detectCardType(cardNumber));
  }, [cardNumber]);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length > 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 6)}`;
    }
    return cleaned;
  };

  const handleSave = () => {
    if (section === "payout") {
      if (!selectedBank || !accountHolderName || !accountNumber) {
        alert("Please fill in all bank details");
        return;
      }
      const payload = {
        name: selectedBank,
        paymentType: "bank",
        section,
        bank: selectedBank,
        accountName: accountHolderName,
        accountNumber,
        isDefault,
      };
      if (isEditing && editingId) {
        updateMutation.mutate(
          { id: editingId, ...payload },
          {
            onSuccess: () => {
              showNotification({
                title: "Payment Method Updated",
                body: "Your bank account has been updated successfully.",
              });
              router.replace("/user/wallet");
            },
          }
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: () => {
            showNotification({
              title: "Payment Method Added",
              body: "Your bank account has been added successfully.",
            });
            router.replace("/user/wallet");
          },
        });
      }
    } else {
      if (cardNumber.length < 19 || expiryDate.length < 5 || cvv.length < 3) {
        alert("Please fill in all card details correctly");
        return;
      }
      const payload = {
        name: cardType || "VISA", // Or detect card type
        paymentType: "card",
        section,
        cardNumber,
        expiryDate,
        cvv,
        isDefault,
      };
      if (isEditing && editingId) {
        updateMutation.mutate(
          { id: editingId, ...payload },
          {
            onSuccess: () => {
              showNotification({
                title: "Payment Method Updated",
                body: "Your card has been updated successfully.",
              });
              router.replace("/user/wallet");
            },
          }
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: () => {
            showNotification({
              title: "Payment Method Added",
              body: "Your card has been added successfully.",
            });
            router.replace("/user/wallet");
          },
        });
      }
    }
  };

  const handleDelete = () => {
    if (isEditing && editingId) {
      deleteMutation.mutate(editingId, {
        onSuccess: () => {
          showNotification({
            title: "Payment Method Deleted",
            body: "Your payment method has been deleted.",
          });
          router.replace("/user/wallet");
        },
      });
    }
  };

  const handleMakeDefault = () => {
    if (isEditing && editingId) {
      setDefaultMutation.mutate(editingId, {
        onSuccess: () => {
          setIsDefault(true);
          showNotification({
            title: "Default Payment Method",
            body: "This payment method is now your default.",
          });
          router.replace("/user/wallet");
        },
      });
    }
  };

  const banks = [
    "Kasikorn Bank",
    "Krungsri Bank",
    "Siam Commercial Bank",
    "Bangkok Bank",
    "United Overseas Bank (UOB)",
    "Krungthai Bank",
  ];

  const renderBankSelector = () => {
    if (!showBankSelector) return null;

    return (
      <View style={styles.bankSelectorOverlay}>
        <View style={styles.bankSelectorContainer}>
          <View style={styles.bankSelectorHeader}>
            <TouchableOpacity onPress={() => setShowBankSelector(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.bankSelectorTitle}>Bank Account</Text>
            <TouchableOpacity onPress={() => setShowBankSelector(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.bankList}>
            {banks.map((bank) => (
              <TouchableOpacity
                key={bank}
                style={styles.bankItem}
                onPress={() => {
                  setSelectedBank(bank);
                  setShowBankSelector(false);
                }}
              >
                <Text style={styles.bankItemText}>{bank}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader
        title={pageTitle}
        onBack={() => router.back()}
        right={
          <TouchableOpacity
            onPress={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Text style={styles.doneButton}>
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : "Done"}
            </Text>
          </TouchableOpacity>
        }
      />
      <ScrollView style={styles.container}>
        {/* Card/Bank Preview */}
        <View style={styles.cardPreviewContainer}>
          <View style={styles.cardPreview}>
            <FontAwesome6
              name={
                cardType === "VISA"
                  ? "cc-visa"
                  : cardType === "MASTERCARD"
                  ? "cc-mastercard"
                  : cardType === "AMEX"
                  ? "cc-amex"
                  : cardType === "DISCOVER"
                  ? "cc-discover"
                  : cardType === "JCB"
                  ? "cc-jcb"
                  : "cc-visa"
              }
              size={40}
              color={COLORS.dark1}
              style={styles.cardChip}
            />

            <Text style={styles.cardNumberPreview}>
              {cardNumber.length > 0
                ? cardNumber
                    .replace(/\D/g, "")
                    .replace(/(\d{4})(?=\d)/g, "•••• $1")
                : "•••• •••• •••• ••••"}
            </Text>
          </View>
        </View>

        {section === "payout" ? (
          // Bank Account Form
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Select Bank:</Text>
            <TouchableOpacity
              style={styles.bankSelector}
              onPress={() => setShowBankSelector(true)}
            >
              <Text
                style={
                  selectedBank
                    ? styles.selectedBankText
                    : styles.placeholderText
                }
              >
                {selectedBank || "Select"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.grayTie} />
            </TouchableOpacity>

            <Text style={[styles.formSectionTitle, { marginTop: 16 }]}>
              Account Holder Name:
            </Text>
            <TextInput
              style={styles.bankInput}
              placeholder="Name"
              value={accountHolderName}
              onChangeText={setAccountHolderName}
            />

            <Text style={[styles.formSectionTitle, { marginTop: 16 }]}>
              Bank Account Number:
            </Text>
            <TextInput
              style={styles.bankInput}
              placeholder="xxxx xxxx xxxx xxxx"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="number-pad"
            />
          </View>
        ) : (
          // Card Form
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Card</Text>

            <View style={styles.cardInputContainer}>
              <View style={styles.cardTypeIcon}>
                <FontAwesome
                  name="credit-card"
                  size={20}
                  color={COLORS.grayTie}
                />
              </View>
              <TextInput
                style={styles.cardInput}
                placeholder="XXXX XXXX XXXX XXXX"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="number-pad"
                maxLength={19}
              />
              <TextInput
                style={styles.expiryInput}
                placeholder="MM/YYYY"
                value={expiryDate}
                onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                keyboardType="number-pad"
                maxLength={5}
              />
              <TextInput
                style={styles.cvvInput}
                placeholder="CVC"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </View>
        )}
        {isEditing && (
          <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.brandRed,
                padding: 12,
                borderRadius: 6,
                marginBottom: 12,
              }}
              onPress={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Text style={{ color: COLORS.white, textAlign: "center" }}>
                {deleteMutation.isPending
                  ? "Deleting..."
                  : "Delete Payment Method"}
              </Text>
            </TouchableOpacity>
            {!isDefault && (
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.primary,
                  padding: 12,
                  borderRadius: 6,
                }}
                onPress={handleMakeDefault}
                disabled={setDefaultMutation.isPending}
              >
                <Text style={{ color: COLORS.white, textAlign: "center" }}>
                  {setDefaultMutation.isPending
                    ? "Making Default..."
                    : "Make Default"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {(createMutation.isError ||
          updateMutation.isError ||
          deleteMutation.isError ||
          setDefaultMutation.isError) && (
          <Text
            style={{
              color: COLORS.brandRed,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            {createMutation.error?.message ||
              updateMutation.error?.message ||
              deleteMutation.error?.message ||
              setDefaultMutation.error?.message}
          </Text>
        )}
      </ScrollView>

      {renderBankSelector()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  cardPreviewContainer: {
    padding: 24,
    alignItems: "center",
  },
  cardPreview: {
    width: SIZES.width - 32,
    height: 180,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayTie,
    padding: 20,
    justifyContent: "center",
  },
  cardChip: {
    // backgroundColor: COLORS.dark1,
    borderRadius: 4,
    marginBottom: 30,
  },
  cardNumberPreview: {
    fontSize: 16,
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
  bankSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.grayTie,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  selectedBankText: {
    fontSize: 14,
    color: COLORS.dark1,
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.grayTie,
  },
  bankInput: {
    borderWidth: 1,
    borderColor: COLORS.grayTie,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.dark1,
  },
  bankSelectorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bankSelectorContainer: {
    backgroundColor: COLORS.dark1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "50%",
  },
  bankSelectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  bankSelectorTitle: {
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
    color: COLORS.dark1,
    fontWeight: "600",
  },
  bankList: {
    maxHeight: 300,
  },
  bankItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  bankItemText: {
    fontSize: 14,
    color: COLORS.white,
    textAlign: "center",
  },
});

export default AddPaymentMethod;
