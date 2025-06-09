import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import Colors from "@/constants/Colors";

interface AdminHeaderProps {
  title?: string;
  onBack?: () => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
  center?: React.ReactNode;
  backgroundColor?: string;
  borderHide?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  onBack,
  left,
  right,
  center,
  backgroundColor,
  borderHide,
}) => {
  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: Constants.statusBarHeight,
          backgroundColor: backgroundColor || Colors.brandGray,
          borderBottomWidth: borderHide ? 0 : 1,
        },
      ]}
    >
      <View style={{ paddingBottom: 5 }}>
        <View style={styles.headerContent}>
          <View
            style={[styles.headerLeft, { flex: !center || !title ? 2 : 1 }]}
          >
            {onBack && (
              <TouchableOpacity style={{ padding: 5 }} onPress={onBack}>
                <Ionicons
                  name="arrow-back"
                  size={25}
                  color={backgroundColor === "black" ? "white" : "black"}
                />
              </TouchableOpacity>
            )}
            {left}
          </View>
          <View
            style={[styles.headerCenter, { flex: center || title ? 2 : 0 }]}
          >
            {center ? (
              center
            ) : title ? (
              <Text
                style={[
                  styles.sectionTitle,
                  { color: backgroundColor === "black" ? "white" : "black" },
                ]}
              >
                {title}
              </Text>
            ) : null}
          </View>
          <View
            style={[styles.headerRight, { flex: !center || !title ? 2 : 1 }]}
          >
            {right}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    paddingRight: 10,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
  },
});

export default AdminHeader;
