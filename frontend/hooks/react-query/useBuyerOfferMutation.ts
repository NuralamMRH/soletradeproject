import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";
import Toast from "react-native-toast-message";
import { useAuth } from "../useAuth";

// Get all bidding offers
export const useBiddingOffers = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["biddingOffers"],
    queryFn: async () => {
      if (!isAuthenticated) {
        return [];
      }
      try {
        const { data } = await MainApi.get("/api/v1/bidding");
        return data.biddingOffers || [];
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to fetch bidding offers",
        });
        return [];
      }
    },
    enabled: isAuthenticated,
  });
};

export const useBiddingOfferById = (biddingOfferId: string) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["biddingOffer", biddingOfferId],
    queryFn: async () => {
      if (!isAuthenticated) {
        return null;
      }
      try {
        const { data } = await MainApi.get(`/api/v1/bidding/${biddingOfferId}`);
        return data.biddingOffer;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to fetch bidding offer",
        });
        return null;
      }
    },
    enabled: !!biddingOfferId && isAuthenticated,
  });
};
// Get all bidding offers for current user
export const useMyBiddingOffers = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["biddingOffers"],
    queryFn: async () => {
      if (!isAuthenticated) {
        return [];
      }
      try {
        const { data } = await MainApi.get("/api/v1/bidding/get/user-offer");
        return data.biddingOffers || [];
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to fetch bidding offers",
        });
        return [];
      }
    },
    enabled: isAuthenticated,
  });
};

// Get bidding offer by product ID
export const useBiddingOfferByProduct = (productId: object) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["biddingOffer", productId],
    queryFn: async () => {
      if (!isAuthenticated) {
        return null;
      }
      try {
        const { data } = await MainApi.get(
          `/api/v1/bidding/get/product/${productId}`
        );
        return data.biddingOffer;
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

// Add to bidding offer
export const useAddToBiddingOffer = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (orderData: object) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.post("/api/v1/bidding", orderData);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Bidding offer created successfully",
        });
        return data.biddingOffer;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to create bidding offer",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biddingOffers"] });
    },
  });
};

export const useUpdateBiddingOffer = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async ({
      biddingOfferId,
      orderData,
    }: {
      biddingOfferId: string;
      orderData: object;
    }) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.put(
          `/api/v1/bidding/${biddingOfferId}`,
          orderData
        );
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Bidding offer updated successfully",
        });
        return data.biddingOffer;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to update bidding offer",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biddingOffers"] });
    },
  });
};

// Remove from bidding offer
export const useRemoveFromBiddingOffer = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (biddingOfferId) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.delete(
          `/api/v1/bidding/${biddingOfferId}`
        );
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Product removed",
        });
        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message ||
            "Failed to remove from bidding offer",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biddingOffers"] });
    },
  });
};

// Toggle bidding offer status
export const useToggleBiddingOffer = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (biddingOfferId) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.post("/api/v1/bidding/toggle", {
          biddingOfferId,
        });
        Toast.show({
          type: "success",
          text1: "Success",
          text2:
            data.action === "added"
              ? "Product added to bidding offer"
              : "Product removed from bidding offer",
        });
        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to toggle bidding offer",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biddingOffers"] });
    },
  });
};
