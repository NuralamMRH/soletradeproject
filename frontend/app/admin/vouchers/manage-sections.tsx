import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminHeader from "@/components/AdminHeader";
import { COLORS } from "@/constants";
import { useRouter } from "expo-router";
import { useVoucherSectionsQuery } from "@/hooks/react-query/voucherApi";

interface Section {
  id: number;
  name: string;
}

const ManageSections: React.FC = () => {
  const router = useRouter();

  const { data: sections = [], isLoading } = useVoucherSectionsQuery();

  const handleAddSection = () => {
    router.push("/admin/vouchers/new-section");
  };

  const handleEditSection = (section: Section) => {
    router.push({
      pathname: "/admin/vouchers/new-section",
      params: { section: JSON.stringify(section) },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Manage Sections" onBack={() => router.back()} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>List of Sections</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddSection}>
            <Text style={styles.addButtonText}>Add New Section</Text>
            <Ionicons name="add" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        {sections
          .filter((section: any) => section.term !== "weekly")
          .map((section: any) => (
            <TouchableOpacity
              key={section._id}
              style={styles.sectionItem}
              onPress={() => handleEditSection(section)}
            >
              <Text style={styles.sectionName}>{section?.name}</Text>
              <TouchableOpacity onPress={() => handleEditSection(section)}>
                <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  sectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  sectionName: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
});

export default ManageSections;
