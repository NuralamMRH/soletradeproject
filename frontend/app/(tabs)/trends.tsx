import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants";
import Constants from "expo-constants";
const { width, height } = Dimensions.get("window");

const featuredCollections = [
  {
    id: 1,
    title: "Louis Vuitton",
    subtitle: "Spring-Summer 2025 Collection",
    images: [
      {
        id: 2,
        uri: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
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
      {
        id: 7,
        uri: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
      },

      {
        id: 8,
        uri: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: 9,
        uri: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: 10,
        uri: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: 2,
    title: "Polo Ralph Lauren",
    subtitle: "The Key to Stylistic Prestige",
    images: [
      {
        id: 1,
        uri: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: 2,
        uri: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
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
  },
  {
    id: 3,
    title: "Where the streets meet style",
    subtitle: "#SpottedOnSoleTrade",
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
  },
  {
    id: 4,
    title: "STUSSY STREET STYLE",
    subtitle: "SUMMER HIGHLIGHTS",
    images: [
      {
        id: 1,
        uri: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
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
  },
];

const Trends = () => {
  const router = useRouter();

  const renderFeaturedCollection = ({
    item,
  }: {
    item: (typeof featuredCollections)[0];
  }) => {
    return (
      <View style={styles.collectionContainer}>
        <View style={styles.collectionHeader}>
          <View>
            <Text style={styles.collectionTitle}>{item.title}</Text>
            <Text style={styles.collectionSubtitle}>{item.subtitle}</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewMoreText}>View More &gt;</Text>
          </TouchableOpacity>
        </View>
        {item.images.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesScrollView}
          >
            {item.images.map((image) => (
              <TouchableOpacity
                key={image.id}
                style={styles.imageContainer}
                onPress={() =>
                  router.push({
                    pathname: "/trends/trend-details",
                    params: {
                      title: item.title,
                      subtitle: item.subtitle,
                      description:
                        "Nano shoe coating spray, special technology from Germany. When sprayed onto the shoe it will act like a thin filter, that protects your shoes and Can protect against stains that we may encounter at any time.",
                      images: JSON.stringify(item.images),
                    },
                  })
                }
              >
                <Image
                  source={{ uri: image.uri }}
                  style={styles.collectionImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <TouchableOpacity
            style={styles.singleImageContainer}
            onPress={() =>
              router.push({
                pathname: "/trends/trend-details",
                params: {
                  title: item.title,
                  subtitle: item.subtitle,
                  description:
                    "Nano shoe coating spray, special technology from Germany. When sprayed onto the shoe it will act like a thin filter, that protects your shoes and Can protect against stains that we may encounter at any time.",
                  images: JSON.stringify(item.images),
                },
              })
            }
          >
            <Image
              source={{ uri: item.images[0].uri }}
              style={styles.singleCollectionImage}
              resizeMode="cover"
            />
            {item.title === "STUSSY STREET STYLE" && (
              <View style={styles.overlayTextContainer}>
                <Text style={styles.overlayTitle}>{item.title}</Text>
                <Text style={styles.overlaySubtitle}>{item.subtitle}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.dark1,
        paddingTop: Constants.statusBarHeight,
      }}
    >
      <FlatList
        data={featuredCollections}
        renderItem={renderFeaturedCollection}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Text style={styles.headerTitle}>Trends</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: 24,
    marginBottom: 16,
    marginLeft: 16,
  },
  collectionContainer: {
    marginBottom: 30,
  },
  collectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  collectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  collectionSubtitle: {
    color: "white",
    fontSize: 16,
  },
  viewMoreText: {
    color: "white",
    fontSize: 14,
  },
  imagesScrollView: {
    paddingLeft: 15,
  },
  imageContainer: {
    marginRight: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  collectionImage: {
    width: width / 2 - 20,
    height: 250,
  },
  singleImageContainer: {
    marginHorizontal: 15,
    borderRadius: 5,
    overflow: "hidden",
    position: "relative",
  },
  singleCollectionImage: {
    width: "100%",
    height: 250,
  },
  overlayTextContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  overlayTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  overlaySubtitle: {
    color: "white",
    fontSize: 14,
  },
});

export default Trends;
