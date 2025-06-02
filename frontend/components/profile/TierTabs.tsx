import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "@/constants";
import { useTiers, Tier } from "@/hooks/react-query/useTierMutation";

interface TierTabsProps {
  activeTab: number;
  onTabChange: (index: number) => void;
  tierType: string;
}

const TierTabs: React.FC<TierTabsProps> = ({
  activeTab,
  onTabChange,
  tierType,
}) => {
  const { data: tiers = [], isLoading } = useTiers(tierType);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tiers.map((tier: Tier, index: number) => (
          <TouchableOpacity
            key={tier._id}
            style={[
              styles.tabButton,
              activeTab === index && styles.activeTabButton,
            ]}
            onPress={() => onTabChange(index)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === index && styles.activeTabText,
              ]}
            >
              {tier.name}
            </Text>
            {activeTab === index && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.bottomBorder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  tabButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    position: "relative",
  },
  activeTabButton: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.brandRed,
  },
  bottomBorder: {
    height: 1,
    backgroundColor: COLORS.grayTie,
  },
});

export default TierTabs;
