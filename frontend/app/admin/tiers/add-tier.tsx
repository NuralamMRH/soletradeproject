import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { COLORS } from "@/constants";
import { useCreateTier } from "@/hooks/react-query/useTierMutation";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import AdminHeader from "@/components/AdminHeader";

const AddTier: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tier = params.tier as string;
  const benefit = params.benefit as string;
  const createTier = useCreateTier();
  const [formData, setFormData] = useState({
    name: tier ? JSON.parse(tier).name : "",
    spendingRequired: tier ? JSON.parse(tier).spendingRequired : "",
    ordersRequired: "",
    timeLimit: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.spendingRequired ||
      !formData.ordersRequired
    ) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    createTier.mutate(
      {
        name: formData.name,
        spendingRequired: parseFloat(formData.spendingRequired),
        ordersRequired: parseInt(formData.ordersRequired),
        timeLimit: formData.timeLimit,
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: (error: any) => {
          Alert.alert("Error", error.message);
        },
      }
    );
  };

  const headerRight = (
    <TouchableOpacity onPress={handleSubmit}>
      <Text style={styles.saveButton}>Save</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <AdminHeader
        title="Add New Tier"
        onBack={() => router.back()}
        right={headerRight}
      />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tier name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter tier name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Spending amount required</Text>
          <TextInput
            style={styles.input}
            value={formData.spendingRequired}
            onChangeText={(text) =>
              setFormData({ ...formData, spendingRequired: text })
            }
            placeholder="Enter amount"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Number of Orders required</Text>
          <TextInput
            style={styles.input}
            value={formData.ordersRequired}
            onChangeText={(text) =>
              setFormData({ ...formData, ordersRequired: text })
            }
            placeholder="Enter quantity"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Time Limit</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{formData.timeLimit.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.timeLimit}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setFormData({ ...formData, timeLimit: selectedDate });
              }
            }}
          />
        )}
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
  },
  saveButton: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "500",
    marginRight: 16,
  },
});

export default AddTier;
