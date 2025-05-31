import { useMutation, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";
import Toast from "react-native-toast-message";

function isReactNativeFile(
  obj: any
): obj is { uri: string; name?: string; type?: string } {
  return obj && typeof obj === "object" && typeof obj.uri === "string";
}

// Helper to build FormData for attribute/sub-attribute
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

// ATTRIBUTE MUTATIONS
export const useCreateAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      console.log("Data", data);
      const formData = buildFormData(data);
      const res = await MainApi.post("/api/v1/attributes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Toast.show({ type: "success", text1: "Attribute created" });
      return res.data.attribute;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
    },
  });
};

export const useUpdateAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const formData = buildFormData(data);
      const res = await MainApi.put(`/api/v1/attributes/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Toast.show({ type: "success", text1: "Attribute updated" });
      return res.data.attribute;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
    },
  });
};

export const useDeleteAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await MainApi.delete(`/api/v1/attributes/${id}`);
      Toast.show({ type: "success", text1: "Attribute deleted" });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
    },
  });
};

// SUB-ATTRIBUTE MUTATIONS
export const useCreateAttributeOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await MainApi.post("/api/v1/attribute-options", data);
      Toast.show({ type: "success", text1: "Attribute option created" });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-options"] });
    },
  });
};

export const useUpdateAttributeOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      console.log("Data", data);
      const formData = buildFormData(data);
      const res = await MainApi.put(`/api/v1/attribute-options/${id}`, data);
      Toast.show({ type: "success", text1: "Attribute option updated" });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-options"] });
    },
  });
};

export const useDeleteAttributeOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await MainApi.delete(`/api/v1/attribute-options/${id}`);
      Toast.show({ type: "success", text1: "Attribute option deleted" });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-options"] });
    },
  });
};
