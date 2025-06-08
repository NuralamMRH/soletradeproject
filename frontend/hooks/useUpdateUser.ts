import { useState } from "react";
import MainApi from "@/api/MainApi";
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
      } else if (typeof value !== "object") {
        formData.append(key, String(value));
      }
      // else: skip appending if value is an object (not a file/blob)
    }
  });
  return formData;
}

export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const formData = buildFormData(data);
      console.log("formData", formData);
      const res = await MainApi.put(
        "/api/v1/users/my-account/update",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      ); // Adjust endpoint as needed
      setLoading(false);
      console.log("res", res);
      return res.data;
    } catch (err: any) {
      console.log("err", err);
      setError(err.response?.data?.message || "Update failed");
      setLoading(false);
      throw err;
    }
  };

  return { updateUser, loading, error };
}
