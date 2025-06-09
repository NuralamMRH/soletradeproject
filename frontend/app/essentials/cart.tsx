import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
} from "@/Redux/slices/product";
import Colors from "@/constants/Colors";
import { router } from "expo-router";
import AdminHeader from "@/components/AdminHeader";

const { width } = Dimensions.get("window");

const EssentialCart = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state: any) => state.product.checkout);
  const [selectedItems, setSelectedItems] = useState<{ [id: string]: boolean }>(
    {}
  );
  const [selectedBrands, setSelectedBrands] = useState<{
    [brand: string]: boolean;
  }>({});
  const [selectAll, setSelectAll] = useState(false);
  const [openQuantity, setOpenQuantity] = useState<{ [id: string]: boolean }>(
    {}
  );

  // Group items by brand
  const groupedItems: { [brand: string]: any[] } = items.reduce(
    (groups: { [brand: string]: any[] }, item: any) => {
      const brand = item.brand || "Unknown Brand";
      if (!groups[brand]) groups[brand] = [];
      groups[brand].push(item);
      return groups;
    },
    {}
  );

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const updated = { ...prev, [itemId]: !prev[itemId] };
      Object.entries(groupedItems).forEach(([brand, items]) => {
        if (items.every((item) => updated[item.id])) {
          setSelectedBrands((prev) => ({ ...prev, [brand]: true }));
        } else {
          setSelectedBrands((prev) => ({ ...prev, [brand]: false }));
        }
      });
      return updated;
    });
  };

  // Toggle brand selection
  const toggleBrandSelection = (brand: string) => {
    const newBrandSelection = !selectedBrands[brand];
    setSelectedBrands((prev) => ({ ...prev, [brand]: newBrandSelection }));
    setSelectedItems((prev) => {
      const updated = { ...prev };
      groupedItems[brand].forEach((item) => {
        updated[item.id] = newBrandSelection;
      });
      return updated;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    const updatedSelectedItems: { [id: string]: boolean } = {};
    const updatedSelectedBrands: { [brand: string]: boolean } = {};
    Object.entries(groupedItems).forEach(([brand, items]) => {
      updatedSelectedBrands[brand] = newSelectAll;
      items.forEach((item) => {
        updatedSelectedItems[item.id] = newSelectAll;
      });
    });
    setSelectedItems(updatedSelectedItems);
    setSelectedBrands(updatedSelectedBrands);
  };

  // Calculate total price of selected items
  const calculateTotal = () => {
    let total = 0;
    Object.values(groupedItems).forEach((items) => {
      (items as any[]).forEach((item) => {
        if (selectedItems[item.id]) {
          total += item.price * item.quantity;
        }
      });
    });
    return total;
  };

  // Handle quantity change
  const handleQuantityChange = (item: any, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateCartItemQuantity({ id: item.id, quantity: newQuantity }));
    } else {
      dispatch(removeFromCart(item.id));
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    // Get selected items
    const itemsToCheckout: any[] = [];
    Object.values(groupedItems).forEach((items) => {
      (items as any[]).forEach((item) => {
        if (selectedItems[item.id]) {
          itemsToCheckout.push(item);
        }
      });
    });
    // Navigate to checkout with selected items
    router.push({
      pathname: "/essentials/checkout",
      params: {
        selectedItems: JSON.stringify(itemsToCheckout),
        totalAmount: calculateTotal(),
      },
    });
  };

  // Remove selected items from cart
  const handleRemoveSelected = () => {
    Object.keys(selectedItems).forEach((itemId) => {
      if (selectedItems[itemId]) {
        dispatch(removeFromCart(itemId));
      }
    });
    // Optionally clear selection after removal
    setSelectedItems({});
    setSelectedBrands({});
    setSelectAll(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader
        onBack={() => router.back()}
        title="Shopping Cart"
        right={
          Object.values(selectedItems).some(Boolean) && (
            <TouchableOpacity
              style={{
                backgroundColor: Colors.brandRed,
                padding: 5,
                borderRadius: 8,
                alignItems: "center",
              }}
              onPress={handleRemoveSelected}
            >
              <Ionicons name="trash-outline" size={24} color={Colors.white} />
            </TouchableOpacity>
          )
        }
      />
      {/* Remove Selected Button */}

      <ScrollView style={styles.container}>
        {Object.entries(groupedItems).length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <MaterialCommunityIcons
              name="cart-outline"
              size={80}
              color={Colors.brandGray}
            />
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <TouchableOpacity
              style={styles.continueShopping}
              onPress={() => router.push("/essentials/products")}
            >
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Select All Checkbox */}
            {/* <View style={styles.brandHeader}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={toggleSelectAll}
              >
                <View
                  style={[
                    styles.checkbox,
                    selectAll && styles.checkboxSelected,
                  ]}
                >
                  {selectAll && (
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                  )}
                </View>
                <Text style={styles.brandName}>Select All</Text>
              </TouchableOpacity>
            </View> */}
            {Object.entries(groupedItems).map(([brand, items], index) => (
              <View key={brand + index} style={styles.brandSection}>
                <View style={styles.brandHeader}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => toggleBrandSelection(brand)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedBrands[brand] && styles.checkboxSelected,
                      ]}
                    >
                      {selectedBrands[brand] && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={Colors.white}
                        />
                      )}
                    </View>
                    <Text style={styles.brandName}>{brand}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={Colors.brandGray}
                    />
                  </TouchableOpacity>
                </View>
                {(items as any[]).map((item) => (
                  <View key={item.id} style={styles.cartItem}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => toggleItemSelection(item.id)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          selectedItems[item.id] && styles.checkboxSelected,
                        ]}
                      >
                        {selectedItems[item.id] && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color={Colors.white}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                    <Image
                      source={
                        typeof item.image === "string"
                          ? { uri: item.image }
                          : item.image
                      }
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productBrand}>{brand}</Text>
                      <Text style={styles.productName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.productPrice}>{item.price} Baht</Text>
                    </View>
                    {/* Quantity Selector Toggle */}
                    <TouchableOpacity
                      style={[styles.quantitySelector]}
                      onPress={() =>
                        setOpenQuantity((prev) => ({
                          ...prev,
                          [item.id]: !prev[item.id],
                        }))
                      }
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 5,
                          borderWidth: 1,
                          padding: 5,
                        }}
                      >
                        <Text style={styles.quantityText}>
                          QTY: {item.quantity}
                        </Text>
                        <Ionicons
                          name="chevron-down"
                          size={16}
                          color={Colors.black}
                        />
                      </View>

                      {openQuantity[item.id] && (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 4,
                          }}
                        >
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() =>
                              handleQuantityChange(item, item.quantity - 1)
                            }
                          >
                            <Ionicons
                              name="remove-outline"
                              size={16}
                              color={Colors.brandRed}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() =>
                              handleQuantityChange(item, item.quantity + 1)
                            }
                          >
                            <Ionicons
                              name="add-outline"
                              size={16}
                              color={Colors.brandGreen}
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}
      </ScrollView>
      {Object.entries(groupedItems).length > 0 && items.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.selectAllContainer}>
            <TouchableOpacity
              onPress={toggleSelectAll}
              style={styles.checkboxContainer}
            >
              <View
                style={[styles.checkbox, selectAll && styles.checkboxSelected]}
              >
                {selectAll && (
                  <Ionicons name="checkmark" size={16} color={Colors.white} />
                )}
              </View>
              <Text style={styles.selectAllText}>All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalAmount}>{calculateTotal()} Baht</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              !Object.values(selectedItems).some(Boolean) && {
                backgroundColor: Colors.brandGray,
              },
            ]}
            onPress={handleCheckout}
            disabled={!Object.values(selectedItems).some(Boolean)}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  editText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: "500",
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyCartText: {
    fontSize: 18,
    color: Colors.brandGray,
    marginTop: 16,
  },
  continueShopping: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: Colors.white,
    fontSize: 16,
  },
  brandSection: {
    marginBottom: 10,
  },
  brandHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brandGray,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.brandGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: Colors.errorColor,
    borderColor: Colors.errorColor,
  },
  brandName: {
    fontSize: 16,
    fontWeight: "500",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brandGray,
  },
  productImage: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productBrand: {
    fontSize: 14,
    color: Colors.brandGray,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    marginVertical: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },
  quantitySelector: {
    alignItems: "center",
  },
  quantityButton: {
    padding: 4,
  },
  quantityText: {
    fontSize: 14,
    marginTop: 4,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.brandGray,
    paddingBottom: 30,
  },
  selectAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    flex: 1,
  },
  selectAllText: {
    fontSize: 14,
  },
  totalContainer: {
    flex: 2,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  totalText: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  checkoutButton: {
    backgroundColor: "#094622",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EssentialCart;
