import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import AdminHeader from "@/components/AdminHeader";
import { ThemedText } from "@/components/ThemedText";

const SoleCheckPages: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (screen: string) => {
    router.push({
      pathname: `/admin/sole-check/${screen}`,
    });
  };

  return (
    <View>
      <AdminHeader title="Sole Check" onBack={() => router.back()} />
      <ScrollView>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("sole-check-orders")}
          >
            <ThemedText type="subtitle" style={styles.menuText}>
              Sole Check Orders
            </ThemedText>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("manage-sole-homepage")}
          >
            <ThemedText type="subtitle" style={styles.menuText}>
              Manage Sole Homepage
            </ThemedText>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("manage-check-data")}
          >
            <ThemedText type="subtitle" style={styles.menuText}>
              Manage Check Data
            </ThemedText>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("manage-auth-service")}
          >
            <ThemedText type="subtitle" style={styles.menuText}>
              Manage Authentication Service
            </ThemedText>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("manage-top-ups")}
          >
            <ThemedText type="subtitle" style={styles.menuText}>
              TopUp Packages
            </ThemedText>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  //Header section style
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
  logo: {
    maxWidth: 150,
    height: 40,
    resizeMode: "cover",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  subContainer: {
    paddingHorizontal: 16,
  },
  //Container section style
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    marginLeft: 12,
  },
});

export default SoleCheckPages;
