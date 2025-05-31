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
import { COLORS, images, SIZES } from "@/constants";
import Constants from "expo-constants";
import Colors from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import BottomSheet from "@gorhom/bottom-sheet";

import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useCreateHomeFeedButton,
  useGetHomeFeedButtons,
  useUpdateHomeFeedButton,
} from "@/hooks/react-query/homeFeedButtonApi";
import Toast from "react-native-toast-message";

const AddHomeFeedButton = ({ route }) => {
  const router = useRouter();
  const paramsRaw = useLocalSearchParams();
  const buttonId =
    typeof paramsRaw.buttonId === "string" ? paramsRaw.buttonId : null;

  const params: Params = {
    button: paramsRaw.button
      ? JSON.parse(paramsRaw.button as string)
      : undefined,
  };

  const isEditing = !!params.button;

  const { data: circleButtons = [] } = useGetHomeFeedButtons("circle");
  const { data: squareButtons = [] } = useGetHomeFeedButtons("square");

  const [buttonDesign, setButtonDesign] = useState("circle"); // 'circle' or 'square'
  const [buttonName, setButtonName] = useState("");
  const [linkPage, setLinkPage] = useState("");
  const [buttonImage, setButtonImage] = useState(null);
  const [availablePages, setAvailablePages] = useState([]);

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "75%"], []);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const createHomeFeedButton = useCreateHomeFeedButton();
  const updateHomeFeedButton = useUpdateHomeFeedButton();

  useEffect(() => {
    // If editing, populate fields with existing data
    if (isEditing && route.params?.button) {
      const { name, design, link, image_full_url } = route.params.button;
      setButtonName(name || "");
      setButtonDesign(design || "circle");
      setLinkPage(link || "");
      // For existing images, store the full URL
      if (image_full_url) {
        setButtonImage(API_URL + image_full_url);
      }
    }

    // Get all available pages from StackNavigator with readable names
    const pages = [
      { id: "Calendar", name: "Calendar", route: "Calendar" },
      {
        id: "SoleEssentialsProducts",
        name: "Sole Essentials",
        route: "SoleEssentialsProducts",
      },
      { id: "SoleServices", name: "Services", route: "SoleServices" },
      { id: "PreOwned", name: "Pre-Owned", route: "PreOwned" },
      { id: "SoleDraw", name: "Raffle", route: "SoleDraw" },
      { id: "Portfolio", name: "Portfolio", route: "Portfolio" },
      {
        id: "VouchersAndDiscounts",
        name: "Discounts",
        route: "VouchersAndDiscounts",
      },
      { id: "Trending", name: "Trending", route: "Trending" },
      { id: "HomePage", name: "Home Page", route: "HomePage" },
      { id: "SoleCare", name: "Sole Care", route: "SoleCare" },
      { id: "ViewAllProducts", name: "All Products", route: "ViewAllProducts" },
      { id: "SearchPage", name: "Search", route: "SearchPage" },
      { id: "ProductScreen", name: "Product Details", route: "ProductScreen" },
      { id: "CheckoutScreen", name: "Checkout", route: "CheckoutScreen" },
      { id: "SoleCheck", name: "Sole Check", route: "SoleCheck" },
      { id: "SoleCheckMain", name: "Sole Check Main", route: "SoleCheckMain" },
      { id: "SocialFeed", name: "Social Feed", route: "SocialFeed" },
      { id: "ActiveBids", name: "Active Bids", route: "ActiveBids" },
      { id: "ActiveAsks", name: "Active Asks", route: "ActiveAsks" },
      { id: "Settings", name: "Settings", route: "Settings" },
      { id: "WishList", name: "Wishlist", route: "WishList" },
      { id: "MyMessages", name: "Messages", route: "MyMessages" },
      { id: "ProfileInfo", name: "Profile Info", route: "ProfileInfo" },
      { id: "UserPortfolio", name: "User Portfolio", route: "UserPortfolio" },
      { id: "UserWishlist", name: "User Wishlist", route: "UserWishlist" },
      { id: "Orders", name: "Orders", route: "Orders" },
      { id: "Statistics", name: "Statistics", route: "Statistics" },
      { id: "SalesOverview", name: "Sales Overview", route: "SalesOverview" },
      {
        id: "SoleEssentialProductDetails",
        name: "Essential Product Details",
        route: "SoleEssentialProductDetails",
      },
      { id: "EssentialCart", name: "Essential Cart", route: "EssentialCart" },
      {
        id: "EssentialCheckout",
        name: "Essential Checkout",
        route: "EssentialCheckout",
      },
      {
        id: "EssentialOrderConfirmation",
        name: "Order Confirmation",
        route: "EssentialOrderConfirmation",
      },
      { id: "SelectBrand", name: "Select Brand", route: "SelectBrand" },
      { id: "SelectModel", name: "Select Model", route: "SelectModel" },
      { id: "SelectAddress", name: "Select Address", route: "SelectAddress" },
      { id: "SelectService", name: "Select Service", route: "SelectService" },
      {
        id: "ServiceConfirmation",
        name: "Service Confirmation",
        route: "ServiceConfirmation",
      },
      {
        id: "ServiceOrderConfirmation",
        name: "Service Order Confirmation",
        route: "ServiceOrderConfirmation",
      },
    ];
    setAvailablePages(pages);

    // Request camera permissions
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, [isEditing, route.params]);

  const handleSave = async () => {
    try {
      // Validate inputs
      if (!buttonName.trim()) {
        Toast.show({
          message: "Error",
          description: "Please enter a button name",
          type: "danger",
        });
        return;
      }

      if (!linkPage) {
        showMessage({
          message: "Error",
          description: "Please select a page to link",
          type: "danger",
        });
        return;
      }

      const buttonData = {
        name: buttonName,
        design: buttonDesign,
        link: linkPage,
        buttonImage,
      };

      if (isEditing) {
        await updateHomeFeedButton.mutateAsync({
          id: route.params.button._id,
          data: buttonData,
        });
        Toast.show({
          message: "Success",
          description: "Button updated successfully",
          type: "success",
        });
        router.back();
      } else {
        await createHomeFeedButton.mutateAsync(buttonData);
        Toast.show({
          message: "Success",
          description: "Button created successfully",
          type: "success",
        });
        router.back();
      }
    } catch (error) {
      console.error("Error saving button:", error);
      Toast.show({
        message: "Error",
        description: error.response?.data?.message || "Failed to save button",
        type: "danger",
      });
    }
  };

  const handleAddImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        // For new images, store the local URI
        setButtonImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error picking image:", error);
      showMessage({
        message: "Error",
        description: "Failed to pick image",
        type: "danger",
      });
    }
  };

  const handleRemoveImage = () => {
    setButtonImage(null);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleDelete = () => {
    if (isEditing) {
      // Pass delete action back to parent
      navigation.navigate("EditHomepage", {
        deleteButton: route.params.button.id,
      });
    } else {
      navigation.goBack();
    }
  };

  const handleSelectPage = (page) => {
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
  const getImageSource = () => {
    if (!buttonImage) return null;
    // If the image is a local URI (starts with file:// or content://)
    if (
      buttonImage.startsWith("file://") ||
      buttonImage.startsWith("content://")
    ) {
      return { uri: buttonImage };
    }
    // If the image is a full URL (starts with http:// or https://)
    if (
      buttonImage.startsWith("http://") ||
      buttonImage.startsWith("https://")
    ) {
      return { uri: buttonImage };
    }
    // If the image is a relative path
    return { uri: API_URL + buttonImage };
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
              <Text style={styles.sectionTitle}>Add Home Feed Button</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity style={{ padding: 5 }}>
                <Ionicons
                  name="notifications-outline"
                  size={25}
                  color={"black"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      {renderHeader()}
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <TextInput
            label="Button Name"
            value={buttonName}
            onChangeText={setButtonName}
            placeholder="Enter button name"
            containerStyle={styles.inputContainer}
          />

          <TextInput
            label="Button Design"
            value={buttonDesign}
            onChangeText={setButtonDesign}
            placeholder="Enter button design"
            containerStyle={styles.inputContainer}
          />

          <View style={styles.imageContainer}>
            <Text style={styles.label}>Button Image</Text>
            {buttonImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={getImageSource()} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemoveImage}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleAddImage}
              >
                <Text>Upload Image</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Link with Page */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Link with Page</Text>
            <TouchableOpacity
              style={styles.linkSelector}
              onPress={handleOpenLinkSelector}
            >
              <Text style={linkPage ? styles.linkText : styles.linkPlaceholder}>
                {linkPage
                  ? availablePages.find((page) => page.route === linkPage)
                      ?.name || "Select a page"
                  : "Select a page"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.buttonContainer} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
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
          keyExtractor={(item) => item.id}
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
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  uploadButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: "dashed",
    alignItems: "center",
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: "red",
  },
  buttonContainer: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
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
  },
});

export default AddHomeFeedButton;
