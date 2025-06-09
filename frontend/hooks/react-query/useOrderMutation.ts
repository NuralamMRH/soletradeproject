import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";
import Toast from "react-native-toast-message";
import { useAuth } from "../useAuth";

// Get all orders for current user
export const useGetOrders = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!isAuthenticated) {
        return [];
      }
      try {
        const { data } = await MainApi.get("/api/v1/orders");
        return data.orders || [];
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to fetch orders",
        });
        return [];
      }
    },
    enabled: isAuthenticated,
  });
};


// Get order by ID
export const useOrderById = (orderId: string) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!isAuthenticated) {
        return null;
      }
      try {
        const { data } = await MainApi.get(`/api/v1/orders/${orderId}`);
        return data.order;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to fetch order",
        });
        return null;
      }
    },
    enabled: !!orderId && isAuthenticated,
  });
};

// Create order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (orderData: object) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.post("/api/v1/orders", orderData);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Order created successfully",
        });
        return data.order;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to create order",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// Update order
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (orderId: object) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.put(`/api/v1/orders/${orderId}`);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Order updated successfully",
        });
        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to update order",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// Delete order
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (orderId: object) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.delete(`/api/v1/orders/${orderId}`);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Order deleted successfully",
        });
        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to delete order",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
