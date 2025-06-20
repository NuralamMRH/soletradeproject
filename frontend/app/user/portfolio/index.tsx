import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
} from "react-native";
import { FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { baseUrl } from "@/api/MainApi";
import Colors from "@/constants/Colors";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";
import { useAttributes } from "@/hooks/useAttributes";
import { useAttributeOptions } from "@/hooks/useAttributeOptions";
import { useProducts } from "@/hooks/useProducts";
import AdminHeader from "@/components/AdminHeader";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Alert } from "react-native";
import {
  useRemoveFromPortfolio,
  useRemoveManyFromPortfolio,
} from "@/hooks/react-query/usePortfolioMutation";
import { showNotification } from "@/hooks/useLocalNotifications";
import Animated from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import Button from "@/components/Button";

// Add this type at the top (or import if you have it elsewhere)
type Product = {
  _id: string;
  name: string;
  product_type: string;
  image_full_url?: string;
  price: number;
  discountPrice: number;
  description: string;
  richDescription: string;
  image: string;
  images: any[];
  indicator: string;
  isIndicatorActive: boolean;
  brand: { name: string };
  category: { name: string };
  subCategory: string;
  isUnpublished: boolean;
  publishDate: Date;
  releaseDate: Date;
  duration: number;
  duration_icon: string;
  dateCreated: Date;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isTopRated: boolean;
  isTrending: boolean;
  isSpecial: boolean;
  isHot: boolean;
  isDeleted: boolean;
  isActive: boolean;
  // add other properties if needed
};

export default function AllProductManagePage() {
  const router = useRouter();

  const { isAuthenticated } = useAuth();

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [ids, setIds] = useState<string[]>([]);

  const { mutate: deletePortfolioItem } = useRemoveManyFromPortfolio();
  const { mutate: removeFromPortfolio } = useRemoveFromPortfolio();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/(tabs)/dashboard");
    }
  }, [isAuthenticated]);

  const [filter, setFilter] = useState({
    product_type: "deal",
  });
  const {
    portfolioProducts: products,
    portfolioItems,
    loading,
    error,
    refetch,
  } = usePortfolio();

  // console.log("Products", products);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  // console.log("Products", products);
  const handleAddNewProduct = () => {
    router.push({
      pathname: "/search",
      params: {
        searchFor: "portfolio",
      },
    });
  };

  const handleViewProduct = (product: any) => {
    const id = portfolioItems.find(
      (item: any) => item.productId === product._id
    )?.id;
    router.push({
      pathname: "/user/portfolio/item/[id]",
      params: {
        id: id,
      },
    });
  };

  const handleSelectProduct = (product: any) => {
    //Toggle selection
    const id = portfolioItems.find(
      (item: any) => item.productId === product._id
    )?.id;
    if (ids.includes(id)) {
      setIds(ids.filter((itemId) => itemId !== id));
    } else {
      setIds([...ids, id]);
    }
  };

  const handleSelectAllProducts = () => {
    if (ids.length === portfolioItems.length) {
      setIds([]);
      setIsSelectionMode(false);
    } else {
      setIds(portfolioItems.map((item: any) => item.id));
    }
  };

  const handleDeleteSelectedProducts = () => {
    Alert.alert(
      "Delete Portfolio Items",
      "Are you sure you want to delete selected portfolio items?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (ids.length) {
                await deletePortfolioItem(ids);

                setIsSelectionMode(false);
                setIds([]);
                refetch();
                showNotification({
                  title: "Success",
                  body: "Portfolio items deleted",
                });
              }
            } catch (error: any) {
              showNotification({
                title: "Error",
                body: error?.message || "Failed to delete portfolio items",
              });
            }
          },
        },
      ]
    );
  };

  const handleRemoveFromPortfolio = (productId: string) => {
    Alert.alert(
      "Delete Portfolio Item",
      "Are you sure you want to delete this item from your portfolio?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const portfolioItem = portfolioItems?.find(
                (portfolioItem: any) => portfolioItem?.productId === productId
              );
              if (portfolioItem) {
                removeFromPortfolio((portfolioItem as any)._id);
              }
            } catch (error: any) {
              showNotification({
                title: "Error",
                body: error?.message || "Failed to delete portfolio item",
              });
            }
          },
        },
      ]
    );
    // Find the portfolio entry for this product
  };

  const SwipeAbleRenderItem = ({ product }: { product: any }) => {
    const RightAction = (
      prog: SharedValue<number>,
      drag: SharedValue<number>
    ) => {
      const styleAnimation = useAnimatedStyle(() => {
        return {
          transform: [{ translateX: drag.value + 80 }],
        };
      });

      return (
        <Pressable
          onPress={() => {
            if (process.env.EXPO_OS === "ios") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
            handleRemoveFromPortfolio(product._id);
          }}
        >
          <Reanimated.View style={[styleAnimation, styles.rightAction]}>
            <IconSymbol name="trash.fill" size={24} color="white" />
          </Reanimated.View>
        </Pressable>
      );
    };

    return (
      <ReanimatedSwipeable
        key={product.id}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={RightAction}
        overshootRight={false}
        enableContextMenu
        containerStyle={{
          paddingVertical: 12,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={() => {
              if (process.env.EXPO_OS === "ios") {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
              }
              handleViewProduct(product);
            }}
            style={styles.productCard}
          >
            <Image
              source={
                product.images[0]?.file_full_url
                  ? {
                      uri: product.images[0]?.file_full_url.startsWith("http")
                        ? product.images[0]?.file_full_url
                        : `${baseUrl}${product.images[0]?.file_full_url}`,
                    }
                  : product?.image_full_url
                  ? {
                      uri: product.image_full_url.startsWith("http")
                        ? product.image_full_url
                        : `${baseUrl}${product.image_full_url}`,
                    }
                  : require("@/assets/images/bg_8.png")
              }
              style={styles.productImage}
              resizeMode="contain"
            />

            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={{ fontSize: 12, color: "#333" }}>
                {product.brand?.name || product.category?.name}
              </Text>
              <Text style={{ fontSize: 12, color: "#333" }}>
                {product?.richDescription?.length > 0
                  ? product?.richDescription?.slice(0, 30)
                  : product?.description?.slice(0, 30)}
              </Text>
            </View>

            {isSelectionMode && (
              <TouchableOpacity
                onPress={() => handleSelectProduct(product)}
                style={{ padding: 10 }}
              >
                <Ionicons
                  name={
                    ids.includes(
                      portfolioItems.find(
                        (item: any) => item.productId === product._id
                      )?.id
                    )
                      ? "checkmark-circle"
                      : "radio-button-off"
                  }
                  size={20}
                  color="#333"
                />
              </TouchableOpacity>
            )}
          </Pressable>
        </View>
      </ReanimatedSwipeable>
    );
  };

  return (
    <View style={styles.container}>
      <AdminHeader
        title="My Portfolio"
        onBack={() => router.back()}
        right={
          <View style={{ flexDirection: "row", gap: 10 }}>
            {isSelectionMode ? (
              <>
                <TouchableOpacity onPress={() => handleSelectAllProducts()}>
                  <MaterialIcons
                    name="library-add-check"
                    size={30}
                    color="#333"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteSelectedProducts()}
                >
                  <Ionicons name="trash" size={30} color="#333" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => setIsSelectionMode(!isSelectionMode)}
                >
                  <FontAwesome6 name="pencil" size={22} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleAddNewProduct()}>
                  <MaterialIcons name="add" size={30} color="#333" />
                </TouchableOpacity>
              </>
            )}
          </View>
        }
      />

      {/* <FlatList
        contentContainerStyle={[styles.subContainer, { paddingTop: 20 }]}
        data={products as Product[]}
        keyExtractor={(product) => product._id}
        renderItem={({ item: product }) => <RenderItem product={product} />}
      /> */}

      <Animated.FlatList
        data={products as Product[]}
        renderItem={({ item: product }) => (
          <SwipeAbleRenderItem product={product} />
        )}
        contentContainerStyle={{
          paddingTop: 12,
        }}
        contentInsetAdjustmentBehavior="automatic"
        ListEmptyComponent={() => (
          <BodyScrollView
            contentContainerStyle={{
              alignItems: "center",
              gap: 8,
              paddingTop: 100,
            }}
          >
            <Button
              onPress={() => {
                if (process.env.EXPO_OS === "ios") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                handleAddNewProduct();
              }}
              variant="ghost"
            >
              Add the first product to this list
            </Button>
          </BodyScrollView>
        )}
      />
    </View>
  );
}

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
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  //Header section style close
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  subContainer: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  attributesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  productName: {
    fontSize: 14,
    textAlign: "left",
    color: "#333",
    width: "100%",
    fontWeight: "bold",
  },

  addNewCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    height: 150,
  },
  addNewText: {
    fontSize: 16,
    marginTop: 8,
    color: "#333",
  },
  swipeable: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
    gap: 8,
    paddingVertical: 8,
  },
  rightAction: {
    width: 80,
    height: 80,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
  },
});
