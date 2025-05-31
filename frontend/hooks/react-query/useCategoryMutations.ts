import { useMutation, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";
import Toast from "react-native-toast-message";

function isReactNativeFile(
  obj: any
): obj is { uri: string; name?: string; type?: string } {
  return obj && typeof obj === "object" && typeof obj.uri === "string";
}

// Helper to build FormData for category/sub-category
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
      } else if (typeof value !== "object") {
        formData.append(key, String(value));
      }
      // else: skip appending if value is an object (not a file/blob)
    }
  });
  return formData;
}

// CATEGORY MUTATIONS
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      console.log("Data", data);
      const formData = buildFormData(data);
      const res = await MainApi.post("/api/v1/categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Toast.show({ type: "success", text1: "Category created" });
      return res.data.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const formData = buildFormData(data);
      const res = await MainApi.put(`/api/v1/categories/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Toast.show({ type: "success", text1: "Category updated" });
      return res.data.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await MainApi.delete(`/api/v1/categories/${id}`);
      Toast.show({ type: "success", text1: "Category deleted" });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// SUB-CATEGORY MUTATIONS
export const useCreateSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const formData = buildFormData(data);
      const res = await MainApi.post("/api/v1/sub-categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Toast.show({ type: "success", text1: "Sub-category created" });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-categories"] });
    },
  });
};

export const useUpdateSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      console.log("Data", data);
      const formData = buildFormData(data);
      const res = await MainApi.put(`/api/v1/sub-categories/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Toast.show({ type: "success", text1: "Sub-category updated" });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-categories"] });
    },
  });
};

export const useDeleteSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await MainApi.delete(`/api/v1/sub-categories/${id}`);
      Toast.show({ type: "success", text1: "Sub-category deleted" });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-categories"] });
    },
  });
};
