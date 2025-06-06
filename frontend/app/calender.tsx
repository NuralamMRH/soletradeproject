import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  Text,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useProducts } from "@/hooks/useProducts";
import { useRouter } from "expo-router";
import COLORS from "@/constants/Colors";
import { baseUrl } from "@/api/MainApi";
import AdminHeader from "@/components/AdminHeader";
import { Image } from "react-native";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Price from "@/utils/Price";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/hooks/useAuth";

import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlists,
} from "@/hooks/react-query/useWishlistMutation";
import SwiperFlatList from "react-native-swiper-flatlist";
import GlobalTimer from "@/components/GlobalTimer";
import { SIZES } from "@/constants";

// Helper to get date-only (no time)
function getDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const Calender: React.FC = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();
  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();
  const { data: wishlists, isLoading: wishlistsLoading } = useWishlists();

  const [filter] = useState({
    product_type: "deal",
    addToCalendar: true,
  });
  const {
    products = [],
    loading,
    error,
    refetch,
  } = useProducts({
    filter: JSON.stringify(filter),
  });

  // Extract unique, sorted date objects from products
  const uniqueDateObjs = useMemo(() => {
    const dates = products
      .map((p: any) =>
        p.calenderDateTime ? getDateOnly(new Date(p.calenderDateTime)) : null
      )
      .filter(Boolean) as Date[];
    // Remove duplicates by time value
    const unique = Array.from(
      new Map(dates.map((d) => [d.getTime(), d])).values()
    );
    // Sort ascending
    unique.sort((a, b) => a.getTime() - b.getTime());
    return unique;
  }, [products]);

  // Map to display strings for the UI (e.g., 'Jun 7')
  const uniqueDates = useMemo(
    () =>
      uniqueDateObjs.map((d) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      ),
    [uniqueDateObjs]
  );

  // Find the closest future date or today
  useEffect(() => {
    if (uniqueDateObjs.length === 0) {
      setSelectedDate(null);
      return;
    }
    const today = getDateOnly(new Date());
    // Find the first date that is today or in the future
    const idx = uniqueDateObjs.findIndex((d) => d.getTime() >= today.getTime());
    if (idx !== -1) {
      setSelectedDate(
        uniqueDateObjs[idx].toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      );
    } else {
      // If all dates are in the past, select the last one
      setSelectedDate(
        uniqueDateObjs[uniqueDateObjs.length - 1].toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      );
    }
  }, [uniqueDateObjs]);

  // Filter products by selected date
  const filteredProducts = useMemo(() => {
    if (!selectedDate) return products;
    return products.filter(
      (item: any) =>
        new Date(item.calenderDateTime).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }) === selectedDate
    );
  }, [products, selectedDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAddToWishlist = (productId: string) => {
    console.log("productId", productId);
    addToWishlist(productId, "calender");
  };

  const handleRemoveFromWishlist = (productId: string) => {
    console.log("productId", productId);
    // Find the wishlist entry for this product
    const wishlistEntry = wishlists?.find(
      (wishlist: any) => wishlist?.productId === productId
    );
    if (wishlistEntry) {
      removeFromWishlist(wishlistEntry._id);
    }
  };

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!selectedDate) return;
    // Find the index of the selected date
    const index = uniqueDates.findIndex((d) => d === selectedDate);
    if (index === -1) return;
    // Assume each date button has a fixed width, e.g., 60px + margin
    const ITEM_WIDTH = 60 + 8; // adjust to your actual style
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: Math.max(0, ITEM_WIDTH * index - ITEM_WIDTH * 2), // scroll so selected is visible, maybe a bit left-padded
        animated: true,
      });
    }, 100); // slight delay to ensure layout is ready
  }, [selectedDate, uniqueDates]);

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Calendar" onBack={() => router.back()} />

      {/* Swiper for featured products */}

      <View
        style={{
          position: "relative",
          width: SIZES.width,
          height: SIZES.height / 3.5,
        }}
      >
        {products.length > 0 ? (
          <SwiperFlatList
            data={products.slice(0, 3)}
            index={0}
            autoplay={true}
            autoplayDelay={60}
            autoplayLoop
            showPagination
            paginationActiveColor={COLORS.brandColor}
            paginationStyleItem={{
              width: (SIZES.width / 3) * 0.5,
              height: 1,
            }}
            paginationStyle={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
            renderItem={({ item }) => (
              <ImageBackground
                source={{ uri: baseUrl + item.images[0].file_full_url }}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "red",
                }}
                resizeMode="cover"
              >
                <LinearGradient
                  // Button Linear Gradient
                  colors={["#3330", "#000000"]}
                  style={styles.sliderContainer}
                >
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "flex-end",
                      alignItems: "center",
                      marginBottom: 50,
                    }}
                  >
                    <Text style={styles.title}>{item.name}</Text>
                    <GlobalTimer
                      itemPublishTime={item.calenderDateTime}
                      fontSize={14}
                    />
                  </View>
                </LinearGradient>
              </ImageBackground>
            )}
            // length={products.length}
          />
        ) : loading ? (
          <ActivityIndicator size="large" color={COLORS.brandColor} />
        ) : null}
      </View>

      {/* Date Filter Bar */}
      <View style={{ height: 100 }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          style={styles.dateBar}
          contentContainerStyle={{ alignItems: "center" }}
          showsHorizontalScrollIndicator={false}
        >
          {uniqueDates.map((date) => {
            // date is already in "Jun 3" format
            const [month, day] = date.split(" ");
            return (
              <TouchableOpacity
                key={date}
                onPress={() => setSelectedDate(date)}
                style={[
                  styles.dateButton,
                  {
                    height: 60,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dateText,
                    selectedDate === date && styles.dateTextActive,
                  ]}
                >
                  {month}
                </Text>
                <Text
                  style={[
                    {
                      fontSize: 18,
                      color: selectedDate === date ? "white" : "black",
                    },
                    selectedDate === date && styles.dateTextActive,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={() => setSelectedDate(null)}
            style={[
              !selectedDate && styles.dateButtonActive,

              {
                marginLeft: 8,
                height: 40,
                borderRadius: 4,
                paddingHorizontal: 10,
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <Text
              style={[
                styles.dateText,
                !selectedDate && { color: Colors.white },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            disabled={
              new Date(item.calenderDateTime) <= new Date() ? false : true
            }
            style={styles.productCard}
            onPress={() => router.push(`/product/${item._id}`)}
          >
            <View style={styles.imageBlock}>
              <Image
                style={{ width: "100%", height: 150 }}
                resizeMode="contain"
                source={{ uri: baseUrl + item.images[0].file_full_url }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <View style={styles.bottomCard}>
                <Text style={[styles.productName]}>
                  {item.name.length > 15
                    ? item.name.substring(0, 50)
                    : item.name}
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    {
                      color: Colors.darkGrayText,
                      fontSize: 14,
                    },
                  ]}
                >
                  {item.description}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="pricetag-outline"
                    size={25}
                    style={{ marginTop: 5 }}
                  />
                  <Text
                    style={[
                      styles.price,
                      {
                        color: Colors.black,
                        fontSize: 18,
                        paddingLeft: 5,
                      },
                    ]}
                  >
                    <Price price={item.retailPrice} currency="THB" />
                  </Text>
                </View>
              </View>

              {isAuthenticated && (
                <TouchableOpacity
                  disabled={
                    new Date(item.calenderDateTime) >= new Date() ? false : true
                  }
                  style={[
                    styles.notifyBtn,
                    {
                      backgroundColor:
                        new Date(item.calenderDateTime) >= new Date()
                          ? "rgb(217,217,217)"
                          : "#eee",
                    },
                  ]}
                  onPress={() =>
                    wishlists?.some(
                      (wishlist: any) => wishlist?.productId === item._id
                    )
                      ? handleRemoveFromWishlist(item._id)
                      : handleAddToWishlist(item._id)
                  }
                >
                  <Text style={{ fontFamily: "Beirut Black" }}>
                    {new Date(item.calenderDateTime) <= new Date()
                      ? "Launched"
                      : wishlists?.some(
                          (wishlist: any) => wishlist?.productId === item._id
                        )
                      ? "Notified"
                      : "Notify Me"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40 }}>
            No calendar items available.
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  sliderContainer: {
    width: SIZES.width,
    height: SIZES.height / 3.5,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderContent: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 40,
  },
  title: {
    color: "white",
    fontWeight: "600",
    fontSize: 22,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  dateBar: {
    paddingVertical: 10,
    borderBottomWidth: 4,
    borderBottomColor: "#fff",
  },
  dateButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  dateButtonActive: {
    backgroundColor: COLORS.brandColor,
  },
  dateText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  dateTextActive: {
    color: COLORS.brandColor,
  },
  productCard: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: "hidden",
    elevation: 2,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: "hidden",
  },
  productInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  productDate: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)", // adjust alpha for more/less shadow
    borderRadius: 10, // match your image border radius
  },
  imageBlock: {
    borderRadius: 10,
    marginBottom: 5,
    alignItems: "center",
  },
  bottomCard: {
    backgroundColor: "transparent",
    alignItems: "flex-start",
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: "transparent",

    alignItems: "flex-start",
  },

  subtitle: {
    fontWeight: "500",
    fontSize: 12,
    color: Colors.black,
  },
  price: {
    fontSize: 14,
    marginTop: 5,
  },
  notifyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderColor: COLORS.brandColor,
    borderWidth: 2,
    borderRadius: 6,
    width: 100,
    alignItems: "center",
  },
});

export default Calender;
