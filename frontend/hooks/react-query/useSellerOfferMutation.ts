import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";
import Toast from "react-native-toast-message";
import { useAuth } from "../useAuth";

// Get all selling offers
export const useSellingOffers = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["sellingItems"],
    queryFn: async () => {
      if (!isAuthenticated) {
        return [];
      }
      try {
        const { data } = await MainApi.get("/api/v1/selling");
        return data.sellingItems || [];
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to fetch selling offers",
        });
        return [];
      }
    },
    enabled: isAuthenticated,
  });
};
// Get all bidding offers for current user
export const useMySellingOffers = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["sellingItems"],
    queryFn: async () => {
      if (!isAuthenticated) {
        return [];
      }
      try {
        const { data } = await MainApi.get("/api/v1/selling/user");
        return data.sellingItems || [];
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to fetch selling offers",
        });
        return [];
      }
    },
    enabled: isAuthenticated,
  });
};

export const useSellingOfferById = (id: string) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["sellingOffer", id],
    queryFn: async () => {
      if (!isAuthenticated) {
        return null;
      }
      try {
        const { data } = await MainApi.get(`/api/v1/selling/${id}`);
        console.log("data", data);
        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to fetch selling offers",
        });
        return null;
      }
    },
    enabled: !!id && isAuthenticated,
  });
};

// Get selling offer by product ID
export const useSellingOfferByProduct = (productId: object) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["sellingOffer", productId],
    queryFn: async () => {
      if (!isAuthenticated) {
        return null;
      }
      try {
        const { data } = await MainApi.get(
          `/api/v1/selling/offers/${productId}`
        );
        return data.sellingOffer;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to fetch selling offers",
        });
        return null;
      }
    },
    enabled: !!productId && isAuthenticated,
  });
};

function isReactNativeFile(
  obj: any
): obj is { uri: string; name?: string; type?: string } {
  return obj && typeof obj === "object" && typeof obj.uri === "string";
}

// Helper to build FormData for selling offer
function buildFormData(data: any) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Handle multiple images
      if (key === "images" && Array.isArray(value)) {
        value.forEach((file) => {
          if (file && typeof file === "object" && file.uri) {
            let fileType = file.type;
            let fileName = file.name;
            if (!fileType) {
              const uriParts = file.uri.split(".");
              const ext = uriParts[uriParts.length - 1];
              fileType = `image/${ext}`;
            }
            if (!fileName) {
              const uriParts = file.uri.split("/");
              fileName =
                uriParts[uriParts.length - 1] ||
                `image.${fileType?.split("/")[1] || "jpg"}`;
            }
            formData.append("images", {
              uri: file.uri,
              name: fileName,
              type: fileType,
            } as any);
          }
        });
      } else if (Array.isArray(value)) {
        // Handle generic arrays (e.g., variations)
        value.forEach((v) => {
          formData.append(key, v);
        });
      } else if (key === "image" && isReactNativeFile(value)) {
        // Single image fallback
        let fileType = value.type;
        let fileName = value.name;
        if (!fileType) {
          const uriParts = value.uri.split(".");
          const ext = uriParts[uriParts.length - 1];
          fileType = `image/${ext}`;
        }
        if (!fileName) {
          const uriParts = value.uri.split("/");
          fileName =
            uriParts[uriParts.length - 1] ||
            `image.${fileType?.split("/")[1] || "jpg"}`;
        }
        formData.append(key, {
          uri: value.uri,
          name: fileName,
          type: fileType,
        } as any);
      } else if (typeof value !== "object") {
        formData.append(key, String(value));
      }
    }
  });
  return formData;
}

function cleanProductData(data: any) {
  const cleaned = { ...data };
  [
    "subBrandId",
    "subCategoryId",
    "brandId",
    "categoryId",
    "attributeId",
  ].forEach((field) => {
    if (cleaned[field] === "") delete cleaned[field];
  });
  if (Array.isArray(cleaned.variations)) {
    cleaned.variations = cleaned.variations.filter((v: any) => v && v !== "");
  }
  return cleaned;
}

// SELLING OFFER MUTATIONS
export const useCreateSellingOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const formData = buildFormData(data);
      const res = await MainApi.post("/api/v1/selling", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Toast.show({ type: "success", text1: "Selling offer created" });

      return res.data.sellingItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellingOffers"] });
    },
    onError: (error: any) => {
      console.log("Error", error);
      alert(error?.message || "Ask failed. Please try again.");
    },
  });
};

export const useUpdateSellingOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...rest } = payload;
      // If rest has a 'data' key, use rest.data, else use rest
      const sellingOfferData = rest.data ? rest.data : rest;
      const formData = buildFormData(sellingOfferData);
      console.log("Form Data", formData);
      const res = await MainApi.put(`/api/v1/selling/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Toast.show({ type: "success", text1: "Selling offer updated" });
      console.log("Res", res);
      return res.data.sellingItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.log("Error", error);
    },
  });
};

export const useDeleteSellingOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await MainApi.delete(`/api/v1/selling/${id}`);
      return res.data.sellingItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellingOffers"] });
    },
    onError: (error) => {
      console.log("Error", error);
    },
  });
};
