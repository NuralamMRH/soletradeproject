import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { COLORS } from "@/constants";
import { useTiers, Tier } from "@/hooks/react-query/useTierMutation";

const CategoryBenefits: React.FC = () => {
  const { data: tiers = [], isLoading } = useTiers();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Tier Benefits</Text>

      <View style={styles.categoriesContainer}>
        {tiers.map((tier: Tier) => (
          <View key={tier._id} style={styles.categoryItem}>
            <Text style={styles.categoryName}>{tier.name}</Text>
            {/* If tier has benefits, display them here */}
            {/* <Text style={styles.categoryFee}>{tier.benefit}</Text> */}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  categoryImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
  },
  categoryFee: {
    fontSize: 14,
    color: COLORS.grayTie,
  },
});

export default CategoryBenefits;
