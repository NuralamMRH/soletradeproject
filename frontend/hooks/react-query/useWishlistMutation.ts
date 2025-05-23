import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";
import Toast from "react-native-toast-message";
import { useAuth } from "../useAuth";

// Get all wishlists for current user
export const useWishlists = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["wishlists"],
    queryFn: async () => {
      if (!isAuthenticated) {
        return [];
      }
      try {
        const { data } = await MainApi.get("/api/v1/wishlist");
        return data.wishlists || [];
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to fetch wishlist",
        });
        return [];
      }
    },
    enabled: isAuthenticated,
  });
};

// Get wishlist by product ID
export const useWishlistByProduct = (productId: object) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["wishlist", productId],
    queryFn: async () => {
      if (!isAuthenticated) {
        return null;
      }
      try {
        const { data } = await MainApi.get(
          `/api/v1/wishlist/product/${productId}`
        );
        return data.wishlist;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to fetch wishlist",
        });
        return null;
      }
    },
    enabled: !!productId && isAuthenticated,
  });
};

// Add to wishlist
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (productId) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.post("/api/v1/wishlist", {
          product: productId,
        });
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Product added to wishlist",
        });
        return data.wishlist;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to add to wishlist",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
  });
};

// Remove from wishlist
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (wishlistId) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.delete(`/api/v1/wishlist/${wishlistId}`);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Product removed from wishlist",
        });
        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to remove from wishlist",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
  });
};

// Toggle wishlist status
export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (productId) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.post("/api/v1/wishlist/toggle", {
          productId,
        });
        Toast.show({
          type: "success",
          text1: "Success",
          text2:
            data.action === "added"
              ? "Product added to wishlist"
              : "Product removed from wishlist",
        });
        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to toggle wishlist",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
  });
};
