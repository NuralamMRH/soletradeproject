import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCategories } from "@/hooks/useCategories";
import { baseUrl } from "@/api/MainApi";
import Colors from "@/constants/Colors";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";
import { useSubCategories } from "@/hooks/useSubCategories";
import { useSoleCheckBrands } from "@/hooks/useSoleCheckBrands";
import { useSoleCheckModels } from "@/hooks/useSoleCheckModels";
import { SIZES } from "@/constants";
import { ThemedText } from "@/components/ThemedText";
import { useSoleCheckLabels } from "@/hooks/useSoleCheckLabels";
import { useSoleCheckSuggestions } from "@/hooks/useSoleCheckSuggestions";
import {
  useCreateSoleCheckSuggestion,
  useDeleteSoleCheckSuggestion,
  useUpdateSoleCheckSuggestion,
} from "@/hooks/react-query/useSoleCheckSuggestionMutations";
import { showNotification } from "@/hooks/useLocalNotifications";

type Params = {
  isSubcategory?: boolean;
  type?: string;
};
type Brand = {
  _id: string;
  name: string;
  image_full_url?: string;
  // add other properties if needed
};

export default function WhenUploadingPicturesPage() {
  const router = useRouter();
  const [brandId, setBrandId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const [isSuggestionAdd, setIsSuggestionAdd] = useState<boolean>(false);
  const [suggestionName, setSuggestionName] = useState<string>("");
  const [suggestionId, setSuggestionId] = useState<string | null>(null);

  const { categories, loading, refetch } = useCategories();
  const {
    brands,
    loading: brandLoading,
    refetch: brandRefetch,
  } = useSoleCheckBrands();
  const {
    models,
    loading: modelLoading,
    refetch: modelRefetch,
  } = useSoleCheckModels();

  const {
    labels,
    loading: labelLoading,
    refetch: labelRefetch,
  } = useSoleCheckLabels();
  const {
    suggestions,
    loading: suggestionLoading,
    refetch: suggestionRefetch,
  } = useSoleCheckSuggestions();

  const suggestionMutation = useCreateSoleCheckSuggestion();
  const updateSuggestionMutation = useUpdateSoleCheckSuggestion();
  const deleteSuggestionMutation = useDeleteSoleCheckSuggestion();

  useFocusEffect(
    useCallback(() => {
      refetch();
      brandRefetch();
      modelRefetch();
      labelRefetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleAddNewLabel = () => {
    router.push({
      pathname: "/admin/sole-check/add-new-label",
      params: {
        categoryId: categoryId,
        brandId: brandId,
        modelId: modelId,
      },
    });
  };
  const handleEditLabel = (label: any) => {
    router.push({
      pathname: "/admin/sole-check/add-new-label",
      params: {
        label: JSON.stringify(label),
        categoryId: categoryId,
        brandId: brandId,
        modelId: modelId,
      },
    });
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
              <Text style={styles.sectionTitle}>When Uploading Picture</Text>
            </View>

            <View style={styles.headerRight}></View>
          </View>
        </View>
      </View>
    );
  };

  const handleSuggestionSave = async () => {
    if (!suggestionName.trim()) {
      Alert.alert("Error", "Please enter a suggestion name");
      return;
    }

    const data: any = {
      name: suggestionName,
      brandId: brandId,
      categoryId: categoryId,
      modelId: modelId,
    };

    try {
      if (suggestionId) {
        await updateSuggestionMutation.mutateAsync({
          id: suggestionId,
          ...data,
        });
      } else {
        await suggestionMutation.mutateAsync(data);
      }

      setIsSuggestionAdd(false);
      setSuggestionName("");
      setSuggestionId(null);
      suggestionRefetch();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Something went wrong");
    }
  };

  const handleRemoveSuggestion = (id: string) => {
    Alert.alert(
      "Delete Suggestion",
      "Are you sure you want to delete this suggestion?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSuggestionMutation.mutateAsync(id);
              setIsSuggestionAdd(false);
              setSuggestionName("");
              setSuggestionId(null);
              suggestionRefetch();
            } catch (error: any) {
              showNotification({
                title: "Error",
                body: error?.message || "Failed to delete suggestion",
              });
            }
          },
        },
      ]
    );
    // Find the portfolio entry for this product
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {!categoryId && !brandId && !modelId && (
        <>
          <View style={{ padding: 10 }}>
            <Text style={styles.sectionTitle}>Select Category</Text>
          </View>
          <ScrollView>
            <View style={[styles.subContainer, { paddingTop: 20 }]}>
              <View style={styles.categoriesGrid}>
                {categories
                  .filter((category: any) => category.type === "sole-check")
                  .map((category: any) => (
                    <TouchableOpacity
                      key={category._id}
                      style={styles.categoryCard}
                      onPress={() => setCategoryId(category._id)}
                    >
                      <Image
                        source={
                          category.image_full_url
                            ? {
                                uri: category.image_full_url.startsWith("http")
                                  ? category.image_full_url
                                  : `${baseUrl}${category.image_full_url}`,
                              }
                            : require("@/assets/images/bg_8.png")
                        }
                        style={styles.categoryImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          </ScrollView>
        </>
      )}

      {!brandId && !modelId && categoryId && (
        <>
          <View style={{ padding: 10 }}>
            <Text style={styles.sectionTitle}>Select brand</Text>
          </View>
          <FlatList
            contentContainerStyle={[styles.subContainer, { paddingTop: 20 }]}
            data={
              brands.filter((brand: any) =>
                brand.categories.some((cat: any) => cat.id === categoryId)
              ) as Brand[]
            }
            keyExtractor={(brand) => brand._id}
            renderItem={({ item: brand }) => (
              <TouchableOpacity
                style={styles.brandCard}
                onPress={() => setBrandId(brand._id)}
              >
                <Image
                  source={
                    brand.image_full_url
                      ? {
                          uri: brand.image_full_url.startsWith("http")
                            ? brand.image_full_url
                            : `${baseUrl}${brand.image_full_url}`,
                        }
                      : require("@/assets/images/bg_8.png")
                  }
                  style={styles.brandImage}
                  resizeMode="contain"
                />
                <Text style={styles.brandName}>{brand.name}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => (
              <Image
                source={require("@/assets/images/icons/divider.png")}
                style={{
                  width: "100%",
                  height: 40,
                  resizeMode: "contain",
                  alignSelf: "center",
                }}
              />
            )}
          />
        </>
      )}

      {!modelId && categoryId && brandId && (
        <>
          <View style={{ padding: 10 }}>
            <Text style={styles.sectionTitle}>Select model</Text>
          </View>
          <ScrollView
            contentContainerStyle={styles.modelsGrid}
            showsVerticalScrollIndicator={false}
          >
            {models.map((model: any) => (
              <TouchableOpacity
                key={model._id}
                onPress={() => setModelId(model._id)}
              >
                <Image
                  source={
                    model.image_full_url
                      ? {
                          uri: model.image_full_url.startsWith("http")
                            ? model.image_full_url
                            : `${baseUrl}${model.image_full_url}`,
                        }
                      : require("@/assets/images/bg_8.png")
                  }
                  style={styles.modelImage}
                  resizeMode="contain"
                />
                <Text style={styles.modelName}>{model.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {categoryId && brandId && modelId && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ padding: 10 }}>
            <ThemedText type="subtitle">When Uploading Pictures</ThemedText>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={
                  brandId
                    ? {
                        uri: brands
                          .find((brand: any) => brand._id === brandId)
                          ?.image_full_url.startsWith("http")
                          ? brands.find((brand: any) => brand._id === brandId)
                              ?.image_full_url
                          : `${baseUrl}${
                              brands.find((brand: any) => brand._id === brandId)
                                ?.image_full_url
                            }`,
                      }
                    : require("@/assets/images/bg_8.png")
                }
                style={{
                  width: SIZES.width / 3 - 50,
                  height: SIZES.width / 3 - 50,
                  marginBottom: 10,
                  borderRadius: 10,
                }}
                resizeMode="contain"
              />
              <Text style={styles.categoryName}>
                {brands.find((brand: any) => brand._id === brandId)?.name}
              </Text>
            </View>

            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={
                  modelId
                    ? {
                        uri: models
                          .find((model: any) => model._id === modelId)
                          ?.image_full_url.startsWith("http")
                          ? models.find((model: any) => model._id === modelId)
                              ?.image_full_url
                          : `${baseUrl}${
                              models.find((model: any) => model._id === modelId)
                                ?.image_full_url
                            }`,
                      }
                    : require("@/assets/images/bg_8.png")
                }
                style={{
                  width: SIZES.width / 3 - 50,
                  height: SIZES.width / 3 - 50,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
                resizeMode="contain"
              />
              <Text style={styles.categoryName}>
                {models.find((model: any) => model._id === modelId)?.name}
              </Text>
            </View>
          </View>

          <View style={styles.modelsGrid}>
            {labels
              .filter(
                (label: any) =>
                  label.brandId === brandId &&
                  label.modelId === modelId &&
                  label.categoryId === categoryId
              )
              .map((label: any) => (
                <TouchableOpacity
                  key={label._id}
                  onPress={() => handleEditLabel(label)}
                >
                  <Image
                    source={
                      label.image_full_url
                        ? {
                            uri: label.image_full_url.startsWith("http")
                              ? label.image_full_url
                              : `${baseUrl}${label.image_full_url}`,
                          }
                        : require("@/assets/images/bg_8.png")
                    }
                    style={[
                      styles.modelImage,
                      { borderWidth: 2, borderColor: Colors.brandDarkColor },
                    ]}
                    resizeMode="contain"
                  />
                  <Text style={styles.modelName}>{label.name}</Text>
                </TouchableOpacity>
              ))}
            <TouchableOpacity
              style={{
                width: SIZES.width / 3 - 20,
                height: SIZES.width / 3 - 20,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={handleAddNewLabel}
            >
              <View
                style={[
                  styles.modelImage,
                  { borderWidth: 2, borderColor: Colors.brandDarkColor },
                ]}
              >
                <Ionicons name="add" size={40} color="#333" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ padding: 10 }}>
            <ThemedText type="subtitle">Suggestions</ThemedText>

            {suggestions.length > 0 &&
              suggestions
                .filter(
                  (label: any) =>
                    label.brandId === brandId &&
                    label.modelId === modelId &&
                    label.categoryId === categoryId
                )
                .map((suggestion: any, index: number) => (
                  <View
                    key={suggestion._id}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setSuggestionId(
                          suggestionId === suggestion._id
                            ? null
                            : suggestion._id
                        );
                        setSuggestionName(suggestion.name);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <ThemedText type="subtitle">{index + 1}</ThemedText>
                      <ThemedText type="default">{`${suggestion.name}`}</ThemedText>
                    </TouchableOpacity>

                    {suggestionId && suggestionId === suggestion?._id && (
                      <TouchableOpacity
                        onPress={() => handleRemoveSuggestion(suggestion?._id)}
                        style={{
                          backgroundColor: Colors.brandRed,
                          padding: 10,
                          width: 40,
                          marginLeft: 15,
                        }}
                      >
                        <Ionicons name="trash" size={20} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

            {isSuggestionAdd && (
              <View style={{ padding: 10 }}>
                <TextInput
                  placeholder="Suggestion Name"
                  value={suggestionName}
                  onChangeText={setSuggestionName}
                  style={{
                    borderWidth: 1,
                    borderColor: "#333",
                    borderRadius: 10,
                    padding: 10,
                    marginVertical: 10,
                  }}
                />
              </View>
            )}

            <View style={{ padding: 10 }}>
              {isSuggestionAdd ? (
                <TouchableOpacity
                  onPress={() => {
                    handleSuggestionSave();
                  }}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    width: SIZES.width / 3,
                  }}
                >
                  <ThemedText
                    type="subtitle"
                    style={{ color: "#000", textAlign: "center" }}
                  >
                    Save
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsSuggestionAdd(true)}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    width: SIZES.width / 3,
                  }}
                >
                  <ThemedText
                    type="subtitle"
                    style={{ color: "#000", textAlign: "center" }}
                  >
                    Add +
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  //Header section style close
  container: {
    flex: 1,
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
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  categoryImage: {
    width: 130,
    height: 130,
    marginBottom: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryName: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
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

  brandsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  brandCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 40,
  },
  brandImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderColor: "#8B0000",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  brandName: {
    fontSize: 16,
    textAlign: "left",
    color: "#333",
    width: "100%",
    fontWeight: "bold",
  },
  modelsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 10,
  },
  modelCard: {
    // width: SIZES.width / 3 - 20,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: "center",
    backgroundColor: "#000",
    gap: 10,
  },
  modelImage: {
    width: SIZES.width / 3 - 20,
    height: SIZES.width / 3 - 20,
    marginBottom: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modelName: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
});
