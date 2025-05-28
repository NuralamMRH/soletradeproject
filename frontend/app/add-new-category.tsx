import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AddNewCategoryPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add or Edit Category</Text>
      <Text style={styles.subtitle}>
        This is a placeholder page. Implement the form here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F7",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
