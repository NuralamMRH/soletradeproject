import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const plans = [
  {
    id: 1,
    name: "BASIC",
    price: 149,
    credits: 3,
    icon: "crown" as const,
    iconColor: "#222",
    borderColor: "#b71c1c",
  },
  {
    id: 2,
    name: "STANDARD",
    price: 279,
    credits: 6,
    icon: "crown" as const,
    iconColor: "#e09c2b",
    borderColor: "#b71c1c",
  },
  {
    id: 3,
    name: "PREMIUM",
    price: 499,
    credits: 10,
    icon: "crown" as const,
    iconColor: "#aaa",
    borderColor: "#b71c1c",
  },
  {
    id: 4,
    name: "ULTIMATE",
    price: 899,
    credits: 20,
    icon: "crown" as const,
    iconColor: "#ffd700",
    borderColor: "#b71c1c",
  },
];

const BuyCredits = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [discount, setDiscount] = useState("");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIcon}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.black} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Credit Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>CREDIT BALANCE</Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
          >
            <MaterialCommunityIcons
              name="alpha-t-circle"
              size={32}
              color="#b71c1c"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.balanceValue}>0.00</Text>
          </View>
        </View>
        {/* Info Row */}
        <View style={styles.infoRow}>
          <Ionicons name="help-circle-outline" size={18} color="#888" />
          <Text style={styles.infoText}>
            What are{" "}
            <MaterialCommunityIcons
              name="alpha-t-circle"
              size={16}
              color="#b71c1c"
            />{" "}
            credits?
          </Text>
        </View>
        {/* Top-Up Plans */}
        <Text style={styles.sectionTitle}>Top-Up Plans</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.plansRow}
        >
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                {
                  borderColor: plan.borderColor,
                  backgroundColor:
                    selectedPlan.id === plan.id ? "#f7f7f7" : "#fff",
                },
              ]}
              onPress={() => setSelectedPlan(plan)}
              activeOpacity={0.85}
            >
              <View style={styles.planCardHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <MaterialCommunityIcons
                  name={plan.icon}
                  size={18}
                  color={plan.iconColor}
                  style={{ marginLeft: 4 }}
                />
              </View>
              <Text style={styles.planPrice}>{plan.price} Baht</Text>
              <Text style={styles.planCredits}>{plan.credits} Credits</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Checkout Card */}
        <View style={styles.checkoutCard}>
          <Text style={styles.checkoutTitle}>CHECKOUT</Text>
          <View style={styles.checkoutRow}>
            <Text style={styles.checkoutPlan}>{selectedPlan.name}</Text>
            <Text style={styles.checkoutPrice}>{selectedPlan.price} Baht</Text>
          </View>
          <View style={styles.checkoutRow}>
            <MaterialCommunityIcons
              name="alpha-t-circle"
              size={22}
              color="#b71c1c"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.checkoutCredits}>
              {selectedPlan.credits} Authentication Credits
            </Text>
          </View>
          <View style={styles.checkoutDivider} />
          <View style={styles.checkoutRow}>
            <Text style={styles.checkoutSubtotal}>SUBTOTAL</Text>
            <Text style={styles.checkoutSubtotalValue}>
              {selectedPlan.price} Baht
            </Text>
          </View>
          <View style={styles.discountRow}>
            <TextInput
              style={styles.discountInput}
              placeholder="Enter Discount Code"
              placeholderTextColor="#888"
              value={discount}
              onChangeText={setDiscount}
            />
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>APPLY</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.swipePayRow}>
            <View style={styles.swipeArrowBox}>
              <Ionicons name="arrow-forward" size={28} color="#444" />
            </View>
            <View style={styles.swipePayBox}>
              <Text style={styles.swipePayText}>Swipe to Pay</Text>
            </View>
          </View>
          <Text style={styles.termsText}>
            By purchasing credits for authentication, you agree to our: {"\n"}
            <Text style={{ fontWeight: "bold" }}>Privacy Policy</Text> &{" "}
            <Text style={{ fontWeight: "bold" }}>Terms and Conditions</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const CARD_RADIUS = 18;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  headerIcon: {
    padding: 4,
  },
  balanceCard: {
    borderWidth: 2,
    borderColor: "#222",
    borderRadius: CARD_RADIUS,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 18,
    alignItems: "flex-start",
    backgroundColor: "#fff",
  },
  balanceLabel: {
    fontWeight: "bold",
    fontSize: 22,
    color: "#111",
  },
  balanceValue: {
    fontWeight: "bold",
    fontSize: 28,
    color: "#b71c1c",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    marginBottom: 8,
  },
  infoText: {
    color: "#222",
    fontSize: 15,
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    marginLeft: 16,
    marginTop: 18,
    marginBottom: 8,
  },
  plansRow: {
    paddingLeft: 16,
    paddingBottom: 8,
    paddingRight: 8,
  },
  planCard: {
    borderWidth: 2,
    borderRadius: CARD_RADIUS,
    marginRight: 12,
    padding: 16,
    width: 120,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  planCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  planName: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#222",
    marginRight: 2,
  },
  planPrice: {
    fontWeight: "bold",
    fontSize: 22,
    color: "#222",
    marginBottom: 2,
  },
  planCredits: {
    fontSize: 15,
    color: "#b71c1c",
    marginTop: 2,
  },
  checkoutCard: {
    borderWidth: 2,
    borderColor: "#222",
    borderRadius: CARD_RADIUS,
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
    padding: 18,
    backgroundColor: "#fff",
  },
  checkoutTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#111",
    marginBottom: 12,
    textAlign: "center",
  },
  checkoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  checkoutPlan: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#111",
  },
  checkoutPrice: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#111",
  },
  checkoutCredits: {
    fontSize: 15,
    color: "#b71c1c",
    fontWeight: "500",
  },
  checkoutDivider: {
    borderBottomWidth: 2,
    borderBottomColor: "#b71c1c",
    marginVertical: 10,
  },
  checkoutSubtotal: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#111",
  },
  checkoutSubtotalValue: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#111",
  },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  discountInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#bbb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    marginRight: 8,
    backgroundColor: "#f2f2f2",
    color: "#222",
  },
  applyButton: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  swipePayRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  swipeArrowBox: {
    backgroundColor: "#222",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  swipePayBox: {
    flex: 1,
    backgroundColor: "#111",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  swipePayText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  termsText: {
    color: "#222",
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
  },
});

export default BuyCredits;
