import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";
import Toast from "react-native-toast-message";
import { useAuth } from "../useAuth";

// Get all transactions
export const useTransactions = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!isAuthenticated) {
        return [];
      }
      try {
        const { data } = await MainApi.get("/api/v1/transactions");
        return data.transactions || [];
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to fetch transactions",
        });
        return [];
      }
    },
    enabled: isAuthenticated,
  });
};
// Get all transactions for current user
export const useMyTransactions = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!isAuthenticated) {
        return [];
      }
      try {
        const { data } = await MainApi.get("/api/v1/transactions/me");
        return data.transactions || [];
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to fetch transactions",
        });
        return [];
      }
    },
    enabled: isAuthenticated,
  });
};

// Get transaction by ID
export const useTransactionById = (transactionId: object) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: async () => {
      if (!isAuthenticated) {
        return null;
      }
      try {
        const { data } = await MainApi.get(
          `/api/v1/transactions/${transactionId}`
        );
        return data.transaction;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to fetch transaction",
        });
        return null;
      }
    },
    enabled: !!transactionId && isAuthenticated,
  });
};

// Create transaction
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (transactionData: any) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.post("/api/v1/transactions", {
          ...transactionData,
        });
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Transaction created",
        });
        return data.biddingOffer;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to create transaction",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

// Update transaction
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (transactionData: any) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.put(
          `/api/v1/transactions/${transactionId}`,
          {
            ...transactionData,
          }
        );
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Transaction updated",
        });
        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to update transaction",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

// Toggle bidding offer status
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.delete(
          `/api/v1/transactions/${transactionId}`
        );
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Transaction deleted",
        });
        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to delete transaction",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};
