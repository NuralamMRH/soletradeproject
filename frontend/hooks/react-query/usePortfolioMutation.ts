import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";
import Toast from "react-native-toast-message";
import { useAuth } from "../useAuth";
import { showNotification } from "../useLocalNotifications";

// Get all wishlists for current user
export const usePortfolio = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["portfolio"],
    queryFn: async () => {
      if (!isAuthenticated) {
        return [];
      }
      try {
        const { data } = await MainApi.get("/api/v1/portfolio");
        return data.portfolioItems || [];
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to fetch portfolio",
        });
        return [];
      }
    },
    enabled: isAuthenticated,
  });
};

// Add to wishlist
export const useUpdatePortfolio = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data: response } = await MainApi.put(
          `/api/v1/portfolio/${id}`,
          data
        );
        showNotification({
          title: "Portfolio updated",
          body: "You have successfully updated the portfolio",
        });
        return response;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to update portfolio",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });
};

export const useAddToPortfolio = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data: response } = await MainApi.post(
          "/api/v1/portfolio",
          data
        );
        showNotification({
          title: "Product added to portfolio",
          body: "You have successfully added the product to your portfolio",
        });
        return response;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to add to portfolio",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });
};

// Remove from portfolio
export const useRemoveFromPortfolio = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (portfolioItemId) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.delete(
          `/api/v1/portfolio/${portfolioItemId}`
        );
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Product removed from portfolio",
        });
        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to remove from portfolio",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });
};

// Remove from portfolio
export const useRemoveManyFromPortfolio = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.post(`/api/v1/portfolio/remove-many`, {
          ids,
        });

        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to remove portfolio items",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });
};
