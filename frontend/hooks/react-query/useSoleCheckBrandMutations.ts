import { useMutation, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";
import Toast from "react-native-toast-message";
import { showNotification } from "../useLocalNotifications";
import { useAuth } from "../useAuth";

function isReactNativeFile(
  obj: any
): obj is { uri: string; name?: string; type?: string } {
  return obj && typeof obj === "object" && typeof obj.uri === "string";
}

// Helper to build FormData for brand/sub-brand
function buildFormData(data: any) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "image" && isReactNativeFile(value)) {
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
      } else if (
        key === "image" &&
        typeof File !== "undefined" &&
        value instanceof File
      ) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          formData.append(key, item);
        });
      } else if (typeof value !== "object") {
        formData.append(key, String(value));
      }
      // else: skip appending if value is an object (not a file/blob)
    }
  });
  return formData;
}

// SOLE CHECK BRAND MUTATIONS
export const useCreateSoleCheckBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const formData = buildFormData(data);
      const res = await MainApi.post("/api/v1/sole-check-brands", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showNotification({
        title: "Sole check brand created",
        body: "Sole check brand created successfully",
      });
      return res.data.soleCheckBrand;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sole-check-brands"] });
    },
  });
};

export const useUpdateSoleCheckBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      console.log("Data", data);
      const formData = buildFormData(data);
      const res = await MainApi.put(
        `/api/v1/sole-check-brands/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      showNotification({
        title: "Sole check brand updated",
        body: "Sole check brand updated successfully",
      });
      return res.data.brand;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sole-check-brands"] });
    },
    onError: (error: any) => {
      console.log("Error updating sole check brand", error);
      showNotification({
        title: "Error",
        body: error?.message || "Failed to update sole check brand",
      });
    },
  });
};

export const useDeleteSoleCheckBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await MainApi.delete(`/api/v1/sole-check-brands/${id}`);
      showNotification({
        title: "Sole check brand deleted",
        body: "Sole check brand deleted successfully",
      });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sole-check-brands"] });
    },
  });
};

// Delete many sole check brands
export const useDeleteManySoleCheckBrands = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.post(
          `/api/v1/sole-check-brands/delete-many`,
          {
            ids,
          }
        );

        return data;
      } catch (error: any) {
        showNotification({
          title: "Error",
          body:
            error.response?.data?.message ||
            "Failed to remove sole check brands",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sole-check-brands"] });
    },
  });
};
