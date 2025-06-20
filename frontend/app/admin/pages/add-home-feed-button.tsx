import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "@/constants";
import Constants from "expo-constants";
import Colors from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useCreateHomeFeedButton,
  useDeleteHomeFeedButton,
  useGetHomeFeedButtons,
  useUpdateHomeFeedButton,
} from "@/hooks/react-query/homeFeedButtonApi";
import Toast from "react-native-toast-message";
import STATIC_APP_ROUTES from "@/utils/staticAppRoutes";
import { baseUrl } from "@/api/MainApi";

interface Params {
  button?: any;
}

const AddHomeFeedButton: React.FC = () => {
  const router = useRouter();
  const paramsRaw = useLocalSearchParams();
  const params: Params = {
    button: paramsRaw.button
      ? JSON.parse(paramsRaw.button as string)
      : undefined,
  };

  const button = params.button;

  const isEditing = !!params.button;

  const [buttonDesign, setButtonDesign] = useState<string>(
    button?.design || "circle"
  ); // 'circle' or 'square'
  const [buttonName, setButtonName] = useState<string>("");
  const [linkPage, setLinkPage] = useState<string>("");
  const [buttonImage, setButtonImage] = useState<string | undefined>(undefined);
  const [availablePages, setAvailablePages] = useState<
    { name: string; route: string }[]
  >([]);

  const bottomSheetRef = useRef<any>(null);
  const snapPoints = useMemo(() => ["25%", "75%"], []);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const createHomeFeedButton = useCreateHomeFeedButton();
  const updateHomeFeedButton = useUpdateHomeFeedButton();
  const deleteHomeFeedButton = useDeleteHomeFeedButton();

  useEffect(() => {
    if (isEditing && params.button) {
      const { name, design, link, image_full_url } = params.button;
      setButtonName(name || "");
      setButtonDesign(design || "circle");
      setLinkPage(link || "");
      if (image_full_url) {
        setButtonImage(
          image_full_url.startsWith("http")
            ? image_full_url
            : `${baseUrl}${image_full_url}`
        );
      }
    }
    setAvailablePages(STATIC_APP_ROUTES);
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      if (!buttonName.trim()) {
        Toast.show({ type: "error", text1: "Please enter a button name" });
        return;
      }
      if (!linkPage) {
        Toast.show({ type: "error", text1: "Please select a page to link" });
        return;
      }
      const buttonData = {
        name: buttonName,
        design: buttonDesign,
        link: linkPage,
        buttonImage: buttonImage || undefined,
      };
      if (isEditing && params?.button) {
        await updateHomeFeedButton.mutateAsync({
          id: params.button._id,
          data: buttonData,
        });
        Toast.show({ type: "success", text1: "Button updated successfully" });
        router.back();
      } else {
        await createHomeFeedButton.mutateAsync(buttonData);
        Toast.show({ type: "success", text1: "Button created successfully" });
        router.back();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to save button",
      });
    }
  };

  const handleDelete = async () => {
    await deleteHomeFeedButton.mutateAsync(button._id);
    Toast.show({ type: "success", text1: "Button deleted successfully" });
    router.back();
  };

  const handleAddImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setButtonImage(result.assets[0].uri);
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed to pick image" });
    }
  };

  const handleRemoveImage = () => {
    setButtonImage(undefined);
  };

  const handleSelectPage = (page: { name: string; route: string }) => {
    setLinkPage(page.route);
    if (!buttonName.trim()) {
      setButtonName(page.name);
    }
    bottomSheetRef.current?.close();
  };

  const handleOpenLinkSelector = () => {
    bottomSheetRef.current?.expand(0);
    setIsBottomSheetOpen(true);
  };

  // Helper function to get image source

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
              <Text style={styles.sectionTitle}>Add Home Feed Button</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity style={{ padding: 5 }} onPress={handleSave}>
                <Text style={{ color: "black" }}>
                  {isEditing ? "Update" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {renderHeader()}
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Select Button Design</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              marginBottom: 20,
              alignItems: "center",
              gap: 10,
            }}
          >
            <TouchableOpacity
              style={{
                marginVertical: 24,
                alignItems: "center",
                marginRight: 16,
                borderWidth: 2,
                borderColor:
                  buttonDesign === "circle"
                    ? COLORS.brandColor
                    : COLORS.grayTie,
                borderRadius: 10,
                padding: 10,
                backgroundColor: Colors.grayEEE,
              }}
              onPress={() => setButtonDesign("circle")}
            >
              <View style={[styles.button, styles.circleButton]}>
                <Image
                  source={{ uri: buttonImage }}
                  style={styles.buttonImage}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                marginVertical: 24,
                alignItems: "center",
                marginRight: 16,
                borderWidth: 2,
                borderColor:
                  buttonDesign === "square"
                    ? COLORS.brandColor
                    : COLORS.grayTie,
                borderRadius: 10,
                padding: 10,
                backgroundColor: Colors.grayEEE,
              }}
              onPress={() => setButtonDesign("square")}
            >
              <View style={[styles.button, styles.squareButton]}>
                <Image
                  source={{ uri: buttonImage }}
                  style={styles.buttonImage}
                />
              </View>
            </TouchableOpacity>
          </View>
          {/* Button Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Button Name</Text>
            <TextInput
              value={buttonName}
              onChangeText={setButtonName}
              placeholder="Enter button name"
              style={styles.textInput}
            />
          </View>
          {/* Link with Page */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Link with Page</Text>
            <TouchableOpacity
              style={styles.linkSelector}
              onPress={handleOpenLinkSelector}
            >
              <Text style={linkPage ? styles.linkText : styles.linkPlaceholder}>
                {availablePages.find((page) => page.route === linkPage)?.name ||
                  linkPage ||
                  "Select a page"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={styles.imageSection}>
            <Text style={styles.inputLabel}>Upload Brand logo</Text>
            {buttonImage ? (
              <View style={styles.imageContainer}>
                <TouchableOpacity
                  onPress={handleAddImage}
                  style={{ alignSelf: "center" }}
                >
                  <Image
                    source={{ uri: buttonImage }}
                    style={styles.imagePreview}
                  />
                  {/* Remove button at top right */}
                  <TouchableOpacity
                    onPress={handleRemoveImage}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={28} color="#D32F2F" />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageContainer}>
                <TouchableOpacity
                  onPress={handleAddImage}
                  style={{ alignSelf: "center" }}
                >
                  <View style={styles.imagePreview}>
                    <Ionicons
                      name="add"
                      size={30}
                      color="#8B0000"
                      style={{ alignSelf: "center" }}
                    />
                  </View>
                  {/* Remove button at top right */}
                  <TouchableOpacity
                    onPress={handleRemoveImage}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={28} color="#D32F2F" />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {isEditing && (
              <>
                <TouchableOpacity
                  style={[
                    styles.buttonContainer,
                    { backgroundColor: COLORS.dark3 },
                  ]}
                  onPress={() => router.back()}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.buttonContainer,
                    { backgroundColor: COLORS.primary },
                  ]}
                  onPress={handleDelete}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        handleIndicatorStyle={styles.bottomSheetIndicator}
        backgroundStyle={styles.bottomSheetBackground}
        onChange={(index) => {
          if (index === -1) setIsBottomSheetOpen(false);
        }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Link with Page</Text>
            <TouchableOpacity
              style={styles.bottomSheetDoneButton}
              onPress={() => bottomSheetRef.current?.close()}
            >
              <Text style={styles.bottomSheetDoneText}>Done</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={availablePages}
            keyExtractor={(item) => item.route}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pageItem}
                onPress={() => handleSelectPage(item)}
              >
                <View style={styles.radioButton}>
                  {linkPage === item.route && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
                <Text style={styles.pageItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            style={styles.pageList}
          />
        </BottomSheetView>
      </BottomSheet>
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
    backgroundColor: "#fff",
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  imageSection: {
    marginBottom: 30,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  imageContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  imagePreviewContainer: {
    alignItems: "center",
  },
  imagePreview: {
    width: SIZES.width / 3 - 32,
    height: SIZES.width / 3 - 32,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.grayTie,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: "dashed",
    alignItems: "center",
  },

  removeButtonText: {
    color: "red",
  },
  buttonContainer: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 0,
    width: SIZES.width / 2 - 32,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonPreview: {
    width: SIZES.width / 4 - 30,
    height: SIZES.width / 4 - 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  removeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "white",
    borderRadius: 14,
    zIndex: 2,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  circleButton: {
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.black,
    backgroundColor: "#49070c",
  },
  squareButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3f3f3f",
    backgroundColor: "#f9f9f9",
  },
  selectedDesign: {
    borderColor: COLORS.primary,
  },
  buttonImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSheetHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  bottomSheetDoneButton: {
    padding: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  bottomSheetDoneText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  pageItem: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#ffffff",
    borderRadius: 10,
    marginRight: 8,
  },
  radioButtonSelected: {
    backgroundColor: COLORS.grayTie,
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#ffffff",
    borderRadius: 10,
    marginRight: 8,
  },
  pageItemText: {
    fontSize: 16,
    color: "#ffffff",
  },
  pageList: {
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputLabel: {
    fontSize: 15,
    color: "#333",
    marginBottom: 10,
  },
  linkSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9f9f9",
    justifyContent: "space-between",
  },
  linkText: {
    color: "#333",
    fontSize: 16,
  },
  linkPlaceholder: {
    color: "#aaa",
    fontSize: 16,
  },
  bottomSheetIndicator: {
    backgroundColor: "#ccc",
    height: 4,
    borderRadius: 2,
    width: 40,
    alignSelf: "center",
    marginVertical: 8,
  },
  bottomSheetBackground: {
    backgroundColor: "#000000",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});

export default AddHomeFeedButton;
