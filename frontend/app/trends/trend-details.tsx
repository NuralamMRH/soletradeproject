import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Modal,
  Animated,
  PanResponder,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import Constants from "expo-constants";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
const { width, height } = Dimensions.get("window");

const ITEM_HEIGHT = width * 0.5 + 16; // image height + margin

const mockTrendDetails = {
  id: 1,
  title: "Louis Vuitton",
  subtitle: "Spring-Summer 2025 Collection",
  description:
    "Nano shoe coating spray, special technology from Germany. When sprayed onto the shoe it will act like a thin filter, that protects your shoes and Can protect against stains that we may encounter at any time.",
  images: [
    {
      id: 1,
      uri: "https://images.unsplash.com/photo-1469398715555-76331a6c7c9b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      uri: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      uri: "https://images.unsplash.com/photo-1469398715555-76331a6c7c9b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      uri: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 5,
      uri: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 6,
      uri: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    },
  ],
};

const TrendDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Try to get data from params, fallback to mock
  const trend = {
    title: params.title || mockTrendDetails.title,
    subtitle: params.subtitle || mockTrendDetails.subtitle,
    description: params.description || mockTrendDetails.description,
    images: params.images
      ? JSON.parse(params.images as string)
      : mockTrendDetails.images,
  };

  // Carousel modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [zoomScale, setZoomScale] = useState(1);

  // Helper to handle scroll and update index
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const newIndex = Math.round(offsetY / (width * 0.5));
    if (newIndex !== carouselIndex) {
      setCarouselIndex(newIndex);
    }
  };

  // Close modal if tap on background
  const handleModalBackgroundPress = (e: any) => {
    if (e.target === e.currentTarget) {
      setModalVisible(false);
    }
  };

  const handleGridImagePress = (index: number) => {
    setCarouselIndex(index);
    setModalVisible(true);
    setTimeout(() => {
      try {
        flatListRef.current?.scrollToIndex({ index, animated: false });
      } catch (e) {
        // fallback: scroll after a delay
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index, animated: false });
        }, 100);
      }
    }, 0);
  };

  const renderCarouselItem = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    // Calculate scale based on distance from center
    const inputRange = [
      (index - 1) * ITEM_HEIGHT,
      index * ITEM_HEIGHT,
      (index + 1) * ITEM_HEIGHT,
    ];
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: "clamp",
    });

    // Pinch-to-zoom only for center image
    const isCenter = index === carouselIndex;

    return (
      <View style={styles.carouselImageWrapper}>
        <PinchGestureHandler
          enabled={isCenter}
          onGestureEvent={Animated.event(
            [{ nativeEvent: { scale: scrollY } }],
            { useNativeDriver: true }
          )}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.END) {
              setZoomScale(1);
            }
          }}
        >
          <Animated.Image
            source={{ uri: item.uri }}
            style={[
              styles.carouselImageBig,
              {
                transform: [{ scale: isCenter ? zoomScale : scale }],
              },
            ]}
          />
        </PinchGestureHandler>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Constants.statusBarHeight }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIcon}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{trend.title}</Text>
          <Text style={styles.headerSubtitle}>{trend.subtitle}</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons
            name="share-social-outline"
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.description}>{trend.description}</Text>
        <FlatList
          data={trend.images}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.gridImageContainer}
              onPress={() => handleGridImagePress(index)}
            >
              <Image source={{ uri: item.uri }} style={styles.gridImage} />
            </TouchableOpacity>
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.grid}
        />
      </ScrollView>
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleModalBackgroundPress}
        >
          <Animated.FlatList
            ref={flatListRef}
            data={trend.images}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCarouselItem}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            contentContainerStyle={styles.carouselList}
            getItemLayout={(_, i) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * i,
              index: i,
            })}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            pagingEnabled
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(
                e.nativeEvent.contentOffset.y / ITEM_HEIGHT
              );
              setCarouselIndex(newIndex);
            }}
          />
          <View style={styles.selectionBox} pointerEvents="none" />
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.dark1,
  },
  headerIcon: {
    padding: 4,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerSubtitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  scrollContainer: {
    paddingBottom: 40,
    alignItems: "center",
  },
  description: {
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  grid: {
    justifyContent: "center",
    alignItems: "center",
  },
  gridImageContainer: {
    margin: 5,
  },
  gridImage: {
    width: width / 2 - 24,
    height: width / 2 - 24,
    borderRadius: 10,
    resizeMode: "cover",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  carouselList: {
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  carouselImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  carouselImageBig: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.white,
    opacity: 1,
  },
  carouselImageSmall: {
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: 12,
    opacity: 0.7,
  },
  selectionBox: {
    position: "absolute",
    top: height / 2 - ITEM_HEIGHT / 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 16,
    zIndex: 10,
  },
});

export default TrendDetails;
