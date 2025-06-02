import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { COLORS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useTiers } from "@/hooks/react-query/useTierMutation";
import { useRouter, useLocalSearchParams } from "expo-router";
import AdminHeader from "@/components/AdminHeader";

const TierList: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = params.type as string;
  const { data: tiers, isLoading, error } = useTiers(type);

  const handleAddTier = () => {
    router.push({ pathname: "/admin/tiers/add-tier", params: { type } } as any);
  };

  const handleEditTier = (tier: any) => {
    router.push({
      pathname: "/admin/tiers/edit-tier",
      params: { tier: JSON.stringify(tier) },
    } as any);
  };

  const headerRight = (
    <TouchableOpacity onPress={handleAddTier} style={styles.addButton}>
      <Text style={styles.addButtonText}>Add Tier</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          Error loading tiers:{" "}
          {error instanceof Error ? error.message : String(error)}
        </Text>
      </View>
    );
  }

  if (!tiers || tiers.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <AdminHeader
          title={type === "buyer" ? "Buyer Tier" : "Seller Tier"}
          onBack={() => router.back()}
          right={headerRight}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No tiers found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <AdminHeader
        title={type === "buyer" ? "Buyer Tier" : "Seller Tier"}
        onBack={() => router.back()}
        right={headerRight}
      />
      <ScrollView style={styles.container}>
        {tiers?.map((tier: any) => (
          <TouchableOpacity
            key={tier._id}
            style={styles.tierItem}
            onPress={() => handleEditTier(tier)}
          >
            <Text style={styles.tierName}>{tier.name}</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  addButton: {
    marginRight: 16,
  },
  addButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  tierItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  tierName: {
    fontSize: 16,
    color: "#000",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
  },
});

export default TierList;
