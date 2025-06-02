import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import Constants from "expo-constants";
import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useGetHomeFeedSections } from "@/hooks/react-query/useHomeFeedSectionMutations";
import type { HomeFeedSection } from "@/hooks/react-query/useHomeFeedSectionMutations";

const HomeFeedSections: React.FC = () => {
  const { data: homeFeedSections = [], isLoading } = useGetHomeFeedSections();

  console.log("homeFeedSections", homeFeedSections);
  const router = useRouter();

  const handleEditSection = (section: HomeFeedSection) => {
    router.push({
      pathname: "/admin/pages/add-new-home-feed-section",
      params: { isEditing: true, section: JSON.stringify(section) },
    });
  };

  const handleAddNewSection = () => {
    router.push({
      pathname: "/admin/pages/add-new-home-feed-section",
      params: { isEditing: false },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderHeader = () => (
    <View
      style={[
        styles.header,
        {
          paddingTop: Constants.statusBarHeight,
          backgroundColor: Colors.brandGray,
        },
      ]}
    >
      <View style={{ paddingBottom: 5 }}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={{ padding: 5 }}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={25} color={"black"} />
            </TouchableOpacity>
          </View>
          <View style={[styles.headerCenter, { flex: 2 }]}>
            <Text style={styles.sectionTitle}>Home Feed Sections</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={{ padding: 5 }}
              onPress={handleAddNewSection}
            >
              <Text style={{ color: "black" }}>Add Section</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSectionItem = ({ item }: { item: HomeFeedSection }) => (
    <View key={item.id} style={styles.sectionItem}>
      <View style={styles.sectionInfo}>
        <View style={styles.sectionDetails}>
          <Text style={styles.sectionName}>{item.name}</Text>
          <Text style={styles.sectionType}>
            {(item as any).description ||
              "Display up to 15 latest launched items (A)"}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditSection(item)}
      >
        <Ionicons name="create-outline" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {renderHeader()}
      <View style={{ flex: 1, padding: 10 }}>
        <FlatList
          data={homeFeedSections?.homeFeedSections || []}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderSectionItem}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 10,
    backgroundColor: Colors.brandGray,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    flex: 1,
    flexDirection: "row",
    paddingRight: 10,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  sectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionDetails: {
    flex: 1,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  sectionType: {
    fontSize: 13,
    color: "#888",
  },
  editButton: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
});

export default HomeFeedSections;
