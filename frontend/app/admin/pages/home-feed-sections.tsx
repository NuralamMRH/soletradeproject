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
import {
  useGetHomeFeedSections,
  useUpdateHomeFeedSectionOrder,
} from "@/hooks/react-query/useHomeFeedSectionMutations";
import type { HomeFeedSection } from "@/hooks/react-query/useHomeFeedSectionMutations";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useSections } from "@/hooks/useSections";
import { RefreshControl } from "react-native";

const TABS = [
  { key: "home", label: "Home" },
  { key: "search", label: "Search" },
];

const HomeFeedSections: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("home");
  const {
    sections: homeFeedSections,
    loading: isLoading,
    refetch: refetch,
  } = useSections();

  const filteredSections = homeFeedSections.filter((s: HomeFeedSection) =>
    activeTab === "home" ? s.pageType === "home" : s.pageType === "search"
  );

  const router = useRouter();

  const updateHomeFeedSectionOrder = useUpdateHomeFeedSectionOrder();

  // Drag and drop
  const handleDragEnd = ({ data }: { data: any[] }) => {
    updateHomeFeedSectionOrder.mutate({
      sections: data.map((item, idx) => ({
        _id: item._id,
        order: idx, // or idx+1 if you want 1-based order
      })),
    });
  };

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

  const renderSectionItem = ({
    item,
    drag,
  }: {
    item: HomeFeedSection;
    drag: () => void;
  }) => (
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
      <TouchableOpacity onLongPress={drag} style={{ marginRight: 12 }}>
        <Ionicons name="reorder-two" size={28} color="#888" />
      </TouchableOpacity>
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
      <View style={{ flex: 1 }}>
        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={
                  activeTab === tab.key ? styles.activeTabText : styles.tabText
                }
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <DraggableFlatList
          showsVerticalScrollIndicator={false}
          data={filteredSections?.sort((a, b) => a.order - b.order) || []}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderSectionItem}
          contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 10 }}
          onDragEnd={handleDragEnd}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
          // containerStyle={{ minHeight: 100 }}
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
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    color: "#888",
    fontWeight: "bold",
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
});

export default HomeFeedSections;
