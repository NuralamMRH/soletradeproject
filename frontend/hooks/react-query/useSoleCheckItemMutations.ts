import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";
import Toast from "react-native-toast-message";
import { useAuth } from "../useAuth";
import { showNotification } from "../useLocalNotifications";

// Get all SOLE CHECK ITEMS
export const useSoleCheckItems = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["soleCheckItems"],
    queryFn: async () => {
      if (!isAuthenticated) {
        return [];
      }
      try {
        const { data } = await MainApi.get("/api/v1/sole-check-items");
        return data.soleCheckItems || [];
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
// Get all SOLE CHECK ITEMS for current user
export const useMySoleCheckItems = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["sellingItems"],
    queryFn: async () => {
      if (!isAuthenticated) {
        return [];
      }
      try {
        const { data } = await MainApi.get("/api/v1/sole-check-items/user");
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

export const useSoleCheckItemById = (id: string) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["soleCheckItem", id],
    queryFn: async () => {
      if (!isAuthenticated) {
        return null;
      }
      try {
        const { data } = await MainApi.get(`/api/v1/sole-check-items/${id}`);
        return data;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response?.data?.message || "Failed to fetch sole check items",
        });
        return null;
      }
    },
    enabled: !!id && isAuthenticated,
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

// SOLE CHECK ITEM MUTATIONS
export const useCreateSoleCheckItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const formData = buildFormData(data);
      const res = await MainApi.post("/api/v1/sole-check-items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showNotification({
        title: "Sole check item created",
        body: "Sole check item created successfully",
      });

      return res.data.soleCheckItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soleCheckItems"] });
    },
    onError: (error: any) => {
      console.log("Error", error);
      alert(error?.message || "Ask failed. Please try again.");
    },
  });
};

export const useUpdateSoleCheckItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...rest } = payload;
      // If rest has a 'data' key, use rest.data, else use rest
      const soleCheckItemData = rest.data ? rest.data : rest;
      const formData = buildFormData(soleCheckItemData);
      console.log("Form Data", formData);
      const res = await MainApi.put(
        `/api/v1/sole-check-items/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      showNotification({
        title: "Sole check item updated",
        body: "Sole check item updated successfully",
      });
      console.log("Res", res);
      return res.data.soleCheckItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soleCheckItems"] });
    },
    onError: (error) => {
      console.log("Error", error);
    },
  });
};

export const useUpdateSoleCheckItemStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { id } = payload;
      const res = await MainApi.put(
        `/api/v1/sole-check-items/status/${id}`,
        payload
      );
      showNotification({
        title: "Sole check item status updated",
        body: "Sole check item status updated successfully",
      });
      return res.data.soleCheckItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soleCheckItems"] });
    },
    onError: (error) => {
      console.log("Error", error);
    },
  });
};

export const useDeleteSoleCheckItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await MainApi.delete(`/api/v1/sole-check-items/${id}`);
      return res.data.soleCheckItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellingOffers"] });
    },
    onError: (error) => {
      console.log("Error", error);
    },
  });
};
