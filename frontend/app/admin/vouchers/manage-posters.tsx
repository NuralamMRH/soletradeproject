import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AdminHeader from "@/components/AdminHeader";
import { COLORS, SIZES } from "@/constants";
import * as ImagePicker from "expo-image-picker";
import {
  usePosters,
  useCreatePoster,
  useUpdatePoster,
  useDeletePoster,
} from "@/hooks/react-query/usePosterMutation";
import { baseUrl } from "@/api/MainApi";
import { useRouter } from "expo-router";
import type { Poster } from "@/hooks/react-query/posterApi";
import { Ionicons } from "@expo/vector-icons";

const ManagePosters: React.FC = () => {
  const router = useRouter();
  const [selectedPoster, setSelectedPoster] = useState<Poster | null>(null);
  const postersQuery = usePosters();
  const posters = postersQuery.data?.data || [];
  const createPoster = useCreatePoster();
  const updatePoster = useUpdatePoster();
  const deletePoster = useDeletePoster();

  const handleAddPost = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        createPoster.mutate({ image: result.assets[0].uri });
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  const handleRemoveImage = (poster: Poster) => {
    Alert.alert(
      "Remove Poster",
      "Do you want to delete this poster or change the image?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Change Image", onPress: () => handleChangeImage(poster) },
        {
          text: "Delete",
          onPress: () => handleDeletePoster(poster),
          style: "destructive",
        },
      ]
    );
  };

  const handleChangeImage = async (poster: Poster) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        updatePoster.mutate({
          id: poster._id,
          posterData: { image: result.assets[0].uri },
        });
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  const handleDeletePoster = (poster: Poster) => {
    Alert.alert(
      "Delete Poster",
      "Are you sure you want to delete this poster?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => deletePoster.mutate(poster._id),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <AdminHeader title="Manage Posters" onBack={() => router.back()} />
      <View>
        <View style={[styles.header, { padding: 16 }]}>
          <Text style={styles.headerText}>Manage Posters</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPost}>
            <Text style={styles.addButtonText}>Add New Poster</Text>
          </TouchableOpacity>
        </View>
        {postersQuery.isLoading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <ScrollView>
            <View style={styles.posterList}>
              <View style={styles.posterItem}>
                <TouchableOpacity
                  style={styles.posterImage}
                  onPress={handleAddPost}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={32}
                    color="#000000"
                  />
                  <Text
                    style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}
                  >
                    Add Poster
                  </Text>
                </TouchableOpacity>
              </View>
              {posters.map((item) => (
                <View style={styles.posterItem} key={item._id}>
                  <TouchableOpacity onPress={() => handleChangeImage(item)}>
                    <Image
                      source={{
                        uri: item.image_full_url
                          ? `${baseUrl}${item.image_full_url}`
                          : item.image,
                      }}
                      style={styles.posterImage}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      backgroundColor: COLORS.brandRed,
                      padding: 5,
                      borderRadius: 30,
                    }}
                    onPress={() => handleDeletePoster(item)}
                  >
                    <Ionicons name="trash-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  posterList: {
    paddingBottom: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 200,
  },
  posterItem: {
    width: SIZES.width / 2 - 32,
    height: SIZES.width / 2 - 32,
    margin: 8,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  posterImage: {
    width: "100%",
    height: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
    alignItems: "center",
    justifyContent: "center",
  },
  posterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    position: "relative",
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  actionButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default ManagePosters;
