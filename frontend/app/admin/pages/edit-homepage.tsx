import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "@/constants";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import Colors from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import {
  useGetAppContent,
  useUpdateAppContent,
  useDeleteGalleryImage,
} from "@/hooks/useAppContentApi";
import { useGetHomeFeedButtons } from "@/hooks/react-query/useHomeFeedButtonMutations";
import Toast from "react-native-toast-message";
import { baseUrl } from "@/api/MainApi";
import { useGetHomeFeedSections } from "@/hooks/react-query/useHomeFeedSectionMutations";

const EditHomePage: React.FC = () => {
  const router = useRouter();
  const {
    appContent,
    loading: isContentLoading,
    fetchAppContent,
  } = useGetAppContent();
  const updateAppContent = useUpdateAppContent();
  const deleteGalleryImage = useDeleteGalleryImage();

  const [animationType, setAnimationType] = useState("image");

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get circle and square buttons
  const { data: circleButtons = [] } = useGetHomeFeedButtons("circle");
  const { data: squareButtons = [] } = useGetHomeFeedButtons("square");
  const { data: homeFeedSections = [], isLoading } = useGetHomeFeedSections();
  // Ref for horizontal scroll
  const sliderScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchAppContent();
  }, []);
  // Always use appContent for rendering
  const appLogo = appContent?.appLogo
    ? `${baseUrl}/public/uploads/app-settings/${appContent.appLogo}`
    : null;
  const launchScreenFile = appContent?.launchScreenFile
    ? `${baseUrl}/public/uploads/app-settings/${appContent.launchScreenFile}`
    : null;

  // console.log("appLogo", appLogo);

  const homeSlider =
    appContent?.homeSlider?.map((image: any) => {
      const uri = image.file_full_url.startsWith("http")
        ? image.file_full_url
        : `${baseUrl}${image.file_full_url}`;
      // Guess type from extension
      const ext = image.file.split(".").pop()?.toLowerCase();
      let type = "image/jpeg";
      if (ext === "png") type = "image/png";
      else if (ext === "jpg" || ext === "jpeg") type = "image/jpeg";
      else if (ext === "webp") type = "image/webp";
      return {
        uri,
        name: image.file,
        type,
        file_full_url: image.file_full_url,
      };
    }) || [];

  // Pick and upload image (logo or slider)
  const pickImage = async (type: "logo" | "slider" | "lunch") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: type === "logo" ? [1, 1] : type === "lunch" ? [9, 16] : [16, 9],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setIsUploading(true);
      try {
        const asset = result.assets[0];
        const uri = asset.uri;

        const name = asset.fileName || uri.split("/").pop() || `image.jpg`;
        const ext = name.split(".").pop()?.toLowerCase();
        let fileType = "image/jpeg";
        if (ext === "png") fileType = "image/png";
        else if (ext === "jpg" || ext === "jpeg") fileType = "image/jpeg";
        else if (ext === "webp") fileType = "image/webp";
        console.log("fileType", fileType);
        if (type === "logo") {
          console.log("appLogo", { uri, name, type: fileType });
          await updateAppContent.mutateAsync({
            appLogo: { uri, name, type: fileType },
          });
        } else if (type === "slider") {
          // For slider, append to existing
          const newSlider = [...homeSlider, { uri, name, type: fileType }];
          await updateAppContent.mutateAsync({ homeSlider: newSlider });
        } else if (type === "lunch") {
          await updateAppContent.mutateAsync({
            launchScreenFile: { uri, name, type: fileType },
            animationType,
          });
        }
        await fetchAppContent();
        Toast.show({ type: "success", text1: "Image uploaded successfully" });
        setTimeout(() => {
          sliderScrollRef.current?.scrollToEnd({ animated: true });
        }, 500);
      } catch (error: any) {
        let message =
          error?.response?.data?.message ||
          error.message ||
          "Failed to upload image";
        let stack = error?.stack || "";
        Toast.show({ type: "error", text1: message, text2: stack });
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Delete slider image
  const handleDeleteSlider = async (image: any) => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setIsDeleting(true);
          try {
            const fileUrl = image.file_full_url || image.name;
            if (fileUrl) {
              await deleteGalleryImage.mutateAsync({
                field: "homeSlider",
                fileUrl,
              });
              await fetchAppContent();
            }
          } catch (error: any) {
            let message =
              error?.response?.data?.message ||
              error.message ||
              "Failed to delete image";
            let stack = error?.stack || "";
            Toast.show({ type: "error", text1: message, text2: stack });
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  // Save button (not really needed, but keep for manual save)
  const handleSave = async () => {
    await fetchAppContent();
    router.back();
  };

  const renderHeader = () => {
    return (
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

            <View style={[styles.headerCenter, { flex: 3 }]}>
              <Text style={styles.sectionTitle}>Edit Homepage</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity style={{ padding: 5 }} onPress={handleSave}>
                <Ionicons
                  name="save-outline"
                  size={25}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (isContentLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {renderHeader()}
      <ScrollView>
        {/* App Logo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Logo</Text>
          <View>
            {appLogo ? (
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={() => pickImage("logo")}
              >
                <Image
                  source={{
                    uri: appLogo,
                  }}
                  style={{
                    width: SIZES.width / 3 - 32,
                    height: SIZES.width / 3 - 32,
                    resizeMode: "contain",
                    borderRadius: 8,
                  }}
                />
                <View style={styles.deleteButton}>
                  <Ionicons name="remove-circle" size={24} color="#e74c3c" />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={() => pickImage("logo")}
              >
                <Ionicons name="add" size={40} color="#333" />
                <Text>Add App Icon</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Home Slider */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Home Slider</Text>
          <ScrollView
            horizontal
            ref={sliderScrollRef}
            showsHorizontalScrollIndicator={false}
            style={styles.buttonsContainer}
          >
            {homeSlider.map((slider: any, index: number) => (
              <View key={slider.uri || index} style={styles.imageContainer}>
                <Image
                  source={{
                    uri: slider.uri,
                  }}
                  style={{
                    width: SIZES.width / 3 - 32,
                    height: SIZES.width / 3 - 32,
                    resizeMode: "cover",
                    borderRadius: 8,
                  }}
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteSlider(slider)}
                >
                  <Ionicons name="remove-circle" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => pickImage("slider")}
              disabled={isUploading}
            >
              <Ionicons name="add" size={40} color="#333" />
              <Text>{isUploading ? "Uploading..." : "Upload Slider"}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.sectionTitle}>Home Feed Buttons</Text>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
              onPress={() => router.push("/admin/pages/add-home-feed-button")}
            >
              <Text>Add New Button</Text>
              <Ionicons name="add" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {/* Circle Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.buttonsContainer}
          >
            {circleButtons.map((item: any, index: number) => (
              <TouchableOpacity
                key={item.id || index}
                style={styles.buttonContainer}
                onPress={() =>
                  router.push({
                    pathname: "/admin/pages/add-home-feed-button",
                    params: { button: JSON.stringify(item) },
                  })
                }
              >
                <View style={[styles.button, styles.circleButton]}>
                  <Image
                    source={{
                      uri: `${process.env.EXPO_PUBLIC_API_URL}${
                        item.image_url || item.image_full_url
                      }`,
                    }}
                    style={styles.buttonImage}
                  />
                </View>
                <Text style={styles.buttonText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Square Buttons */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.buttonsContainer}
          >
            {squareButtons.map((item: any, index: number) => (
              <TouchableOpacity
                key={item.id || index}
                style={styles.buttonContainer}
                onPress={() =>
                  router.push({
                    pathname: "/admin/pages/add-home-feed-button",
                    params: { button: JSON.stringify(item) },
                  })
                }
              >
                <View style={[styles.button, styles.squareButton]}>
                  <Image
                    source={{
                      uri: `${baseUrl}${
                        item.image_full_url ||
                        `/public/uploads/feedButton/${item.image}`
                      }`,
                    }}
                    style={styles.buttonImage}
                  />
                </View>
                <Text style={styles.buttonText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.sectionTitle}>Home feed Sections</Text>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
              onPress={() => router.push("/admin/pages/home-feed-sections")}
            >
              <Text>Add New Section</Text>
              <Ionicons name="add" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {/* Sections */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {!isLoading &&
              homeFeedSections?.homeFeedSections
                ?.slice(0, 5)
                .map((item: any, index: number) => (
                  <TouchableOpacity
                    key={item.id || index}
                    style={{
                      padding: 10,
                      borderWidth: 2,
                      borderColor: Colors.brandDarkColor,
                      borderRadius: 8,
                      marginRight: 10,
                      width: SIZES.width / 3 - 32,
                      height: SIZES.width / 6 - 32,
                    }}
                    onPress={() =>
                      router.push({
                        pathname: "/admin/pages/add-new-home-feed-section",
                        params: { section: JSON.stringify(item) },
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          textOverflow: "ellipsis",
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            <TouchableOpacity
              style={{
                padding: 10,
                borderWidth: 2,
                borderColor: Colors.brandDarkColor,
                borderRadius: 8,
                marginRight: 10,
                width: SIZES.width / 3 - 32,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
              onPress={() =>
                router.push({
                  pathname: "/admin/pages/add-new-home-feed-section",
                })
              }
            >
              <Text style={styles.buttonText}>Add New</Text>
              <Ionicons name="add" size={16} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Logo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Lunch</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text>Animation with</Text>
            <View style={{ flexDirection: "row", marginLeft: "auto", gap: 0 }}>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#000000",
                  borderRadius: 0,
                  paddingVertical: 4,
                  paddingHorizontal: 18,
                  backgroundColor:
                    animationType === "video" ? "#000000" : "#fff",
                }}
                onPress={() => setAnimationType("video")}
              >
                <Text
                  style={{
                    color: animationType === "video" ? "#ffffff" : "#000000",
                  }}
                >
                  Video
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#000000",
                  borderRadius: 0,
                  paddingVertical: 4,
                  paddingHorizontal: 18,
                  backgroundColor:
                    animationType === "image" ? "#000000" : "#fff",
                }}
                onPress={() => setAnimationType("image")}
              >
                <Text
                  style={{
                    color: animationType === "image" ? "#ffffff" : "#000000",
                  }}
                >
                  Picture
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View>
            {launchScreenFile ? (
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={() => pickImage("lunch")}
              >
                <Image
                  source={{
                    uri: launchScreenFile,
                  }}
                  style={{
                    width: SIZES.width / 3 - 32,
                    height: SIZES.width / 3 - 32,
                    resizeMode: "cover",
                    borderRadius: 8,
                  }}
                />
                <View style={styles.deleteButton}>
                  <Ionicons name="remove-circle" size={24} color="#e74c3c" />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={() => pickImage("lunch")}
              >
                <Ionicons name="add" size={40} color="#333" />
                <Text>Add {animationType === "video" ? "Video" : "Image"}</Text>
              </TouchableOpacity>
            )}
          </View>
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
    marginBottom: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    marginTop: 12,
    alignItems: "center",
    width: SIZES.width / 3 - 32,
    height: SIZES.width / 3 - 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 16,
    position: "relative",
    justifyContent: "center",
  },
  slider: {
    width: SIZES.width / 3 - 32,
    height: SIZES.width / 3 - 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 16,
  },
  uploadButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: "dashed",
    alignItems: "center",
    marginTop: 8,
  },
  deleteButton: {
    alignItems: "center",
    position: "absolute",
    top: 0,
    right: 0,
  },
  deleteText: {
    color: "red",
  },
  sliderContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  buttonContainer: {
    marginVertical: 24,
    alignItems: "center",
    marginRight: 16,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  circleButton: {
    borderRadius: 30,
    backgroundColor: Colors.brandDarkColor,
  },
  squareButton: {
    borderRadius: 8,
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: Colors.brandDarkColor,
  },
  buttonImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 12,
    textAlign: "center",
    color: "#333",
  },
});

export default EditHomePage;
