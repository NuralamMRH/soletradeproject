import { useMutation, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";
import Toast from "react-native-toast-message";

function isReactNativeFile(
  obj: any
): obj is { uri: string; name?: string; type?: string } {
  return obj && typeof obj === "object" && typeof obj.uri === "string";
}

// Helper to build FormData for product
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
    cleaned.variations = cleaned.variations.filter((v) => v && v !== "");
  }
  return cleaned;
}

// PRODUCT MUTATIONS
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const formData = buildFormData(cleanProductData(data));
      const res = await MainApi.post("/api/v1/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Toast.show({ type: "success", text1: "Product created" });
      return res.data.product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.log("Error", error);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...rest } = payload;
      // If rest has a 'data' key, use rest.data, else use rest
      const productData = rest.data ? rest.data : rest;
      const formData = buildFormData(cleanProductData(productData));
      console.log("Form Data", formData);
      const res = await MainApi.put(`/api/v1/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Toast.show({ type: "success", text1: "Product updated" });
      return res.data.product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.log("Error", error);
    },
  });
};

export const useIncrementProductViews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await MainApi.get(`/api/v1/products/viewed/${id}`);
      console.log("Res", res);
      return res.data.product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
    onError: (error) => {
      console.log("Error", error);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await MainApi.delete(`/api/v1/products/${id}`);
      Toast.show({ type: "success", text1: "Product deleted" });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// PRODUCT ATTRIBUTE MUTATIONS
export const useCreateProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await MainApi.post("/api/v1/product-attributes", data);
      Toast.show({ type: "success", text1: "Product attribute created" });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attributes"] });
    },
  });
};

export const useUpdateProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      console.log("Data", data);
      const formData = buildFormData(data);
      const res = await MainApi.put(`/api/v1/product-attributes/${id}`, data);
      Toast.show({ type: "success", text1: "Product attribute updated" });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attributes"] });
    },
  });
};

export const useDeleteProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await MainApi.delete(`/api/v1/product-attributes/${id}`);
      Toast.show({ type: "success", text1: "Product attribute deleted" });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attributes"] });
    },
  });
};
