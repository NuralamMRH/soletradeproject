import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { COLORS, SIZES } from "@/constants";
import { MaterialIcons } from "@expo/vector-icons";
import CategoryBenefits from "@/components/profile/CategoryBenefits";
import TierTabs from "@/components/profile/TierTabs";
import AdminHeader from "@/components/AdminHeader";
import { useRouter } from "expo-router";
import { useTiers, Tier } from "@/hooks/react-query/useTierMutation";
import Colors from "@/constants/Colors";

interface TiersAndBenefitsProps {
  navigation?: any;
}

const TiersAndBenefits: React.FC<TiersAndBenefitsProps> = ({ navigation }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");
  const [activeTierTab, setActiveTierTab] = useState(0);
  const { data: tiers = [], isLoading, error } = useTiers(activeTab);

  // Progress data
  const progressData = {
    buyer: {
      currentSpent: 5000,
      targetSpent: 20000,
      currentOrders: 5,
      targetOrders: 10,
      daysLeft: 178,
      period: "January - June",
      nextTier: 2,
    },
    seller: {
      currentSpent: 6000,
      targetSpent: 10000,
      currentOrders: 12,
      targetOrders: 20,
      daysLeft: 178,
      period: "January - June",
      nextTier: 2,
    },
  };

  // Benefits data
  const benefits = [
    {
      title: "Special Tier Discount",
      description: "Receive an exclusive monthly discount for your tier.",
      icon: "local-offer",
    },
    {
      title: "Special Birthday Discount",
      description: "Receive an exclusive discount on your birth month.",
      icon: "cake",
    },
    {
      title: "Special Tier Discount",
      description: "Receive an exclusive monthly discount for your tier.",
      icon: "local-offer",
    },
  ];

  // Calculate progress percentage
  const calculateProgress = () => {
    const data = progressData[activeTab];
    const spentPercentage = (data.currentSpent / data.targetSpent) * 100;
    return Math.min(spentPercentage, 100);
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "buyer" && styles.activeTabButton,
        ]}
        onPress={() => {
          setActiveTab("buyer");
          setActiveTierTab(0); // Reset tier tab when switching between buyer/seller
        }}
      >
        <Text
          style={{
            color: activeTab === "buyer" ? Colors.black : Colors.darkGrayText,
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          Buyer Tier
        </Text>
        {activeTab === "buyer" && <View style={styles.activeTabIndicator} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "seller" && styles.activeTabButton,
        ]}
        onPress={() => {
          setActiveTab("seller");
          setActiveTierTab(0); // Reset tier tab when switching between buyer/seller
        }}
      >
        <Text
          style={{
            color: activeTab === "seller" ? Colors.black : Colors.darkGrayText,
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          Seller Tier
        </Text>
        {activeTab === "seller" && <View style={styles.activeTabIndicator} />}
      </TouchableOpacity>
    </View>
  );

  const renderProgressSection = () => {
    const data = progressData[activeTab];
    const progressPercentage = calculateProgress();

    return (
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>
          Level Progress for Next Semi-Annual
        </Text>

        <View style={styles.dateContainer}>
          <MaterialIcons name="calendar-today" size={24} color={COLORS.white} />
          <View style={styles.dateTextContainer}>
            <Text style={styles.dateText}>{data.period}</Text>
            <Text style={styles.daysLeftText}>{data.daysLeft} days left</Text>
          </View>
        </View>

        <View style={styles.progressCircleContainer}>
          <View style={styles.progressCircle}>
            <View style={styles.progressInnerCircle}>
              <Text style={styles.progressAmountText}>
                {activeTab === "buyer"
                  ? data.targetSpent.toLocaleString()
                  : data.targetSpent.toLocaleString()}{" "}
                Baht
              </Text>
              <Text style={styles.progressOrText}>or</Text>
              <Text style={styles.progressOrdersText}>
                {activeTab === "buyer" ? data.targetOrders : data.targetOrders}{" "}
                orders to unlock Tier {data.nextTier}
              </Text>
            </View>

            {/* Progress Arc */}
            <View
              style={[
                styles.progressArc,
                {
                  borderColor: COLORS.primary,
                  transform: [
                    { rotate: `-${180 - progressPercentage * 1.8}deg` },
                  ],
                },
              ]}
            />
          </View>
        </View>

        <Text style={styles.progressInfoText}>
          Enjoy additional benefits on your next tier. Spend{" "}
          <Text style={styles.highlightText}>
            {activeTab === "buyer"
              ? (data.targetSpent - data.currentSpent).toLocaleString()
              : (data.targetSpent - data.currentSpent).toLocaleString()}{" "}
            Baht
          </Text>{" "}
          or purchase{" "}
          <Text style={styles.highlightText}>
            {activeTab === "buyer"
              ? data.targetOrders - data.currentOrders
              : data.targetOrders - data.currentOrders}{" "}
            orders
          </Text>{" "}
          to unlock Prestige Tier by{" "}
          <Text style={styles.highlightText}>30th June, 2024</Text>.
        </Text>
      </View>
    );
  };

  const renderBenefitsSection = () => (
    <View style={styles.benefitsSection}>
      <Text style={styles.sectionTitle}>Current Tier Benefits</Text>

      {benefits.map((benefit, index) => (
        <View key={index} style={styles.benefitItem}>
          <MaterialIcons
            name={benefit.icon as any}
            size={24}
            color={COLORS.white}
            style={styles.benefitIcon}
          />
          <View style={styles.benefitTextContainer}>
            <Text style={styles.benefitTitle}>{benefit.title}</Text>
            <Text style={styles.benefitDescription}>{benefit.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCurrentTierSection = () => (
    <View style={styles.currentTierSection}>
      <View>
        <Text style={styles.currentTierTitle}>
          Current {activeTab === "buyer" ? "Buyer" : "Seller"} Tier
        </Text>

        <Text style={styles.eliteLevelText}>Elite Level</Text>
      </View>

      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>View all tier benefits</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Tiers and Benefits" onBack={() => router.back()} />
      {renderTabs()}
      <TierTabs
        activeTab={activeTierTab}
        onTabChange={setActiveTierTab}
        tierType={activeTab}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: COLORS.white }]}
        showsVerticalScrollIndicator={false}
      >
        {renderProgressSection()}
        {renderBenefitsSection()}
        <CategoryBenefits />
      </ScrollView>
      {renderCurrentTierSection()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    position: "relative",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "100%",
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  progressSection: {
    padding: 16,
  },
  sectionTitle: {
    // color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dateTextContainer: {
    marginLeft: 10,
  },
  dateText: {
    // color: COLORS.white,
    fontSize: 16,
    fontWeight: "500",
  },
  daysLeftText: {
    // color: COLORS.grayTie,
    fontSize: 12,
  },
  progressCircleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  progressCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 10,
    borderColor: COLORS.grayTie,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  progressInnerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  progressAmountText: {
    // color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  progressOrText: {
    // color: COLORS.grayTie,
    fontSize: 14,
    marginVertical: 5,
  },
  progressOrdersText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: "center",
  },
  progressArc: {
    position: "absolute",
    top: -10,
    left: -10,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 10,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    borderLeftColor: COLORS.primary,
    borderBottomColor: COLORS.primary,
    transform: [{ rotate: "-90deg" }],
  },
  progressInfoText: {
    // color: COLORS.grayTie,
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  highlightText: {
    // color: COLORS.white,
    fontWeight: "600",
  },
  benefitsSection: {
    padding: 16,
    // backgroundColor: COLORS.black,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  benefitIcon: {
    marginRight: 15,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    // color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  benefitDescription: {
    color: Colors.darkGrayText,
    fontSize: 14,
  },
  currentTierSection: {
    padding: 16,
    backgroundColor: Colors.black,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayTie,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  currentTierTitle: {
    color: Colors.grayEEE,
    fontSize: 14,
    fontWeight: "600",
  },
  eliteLevelText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  viewAllButton: {
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  viewAllText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TiersAndBenefits;
