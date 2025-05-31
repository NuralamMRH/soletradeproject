import MainApi from "@/api/MainApi";
import { useAppContent } from "@/context/AppContentContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import Toast from "react-native-toast-message";

function isReactNativeFile(
  obj: any
): obj is { uri: string; name?: string; type?: string } {
  return obj && typeof obj === "object" && typeof obj.uri === "string";
}

// Helper to build FormData for app content
function buildFormData(data: any) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Handle appLogo as a file
      if (key === "appLogo" && value.uri) {
        formData.append("appLogo", {
          uri: value.uri,
          name: value.name,
          type: value.type,
        } as any);
      }
      if (key === "launchScreenFile" && value.uri) {
        formData.append("launchScreenFile", {
          uri: value.uri,
          name: value.name,
          type: value.type,
        } as any);
      }
      // Handle homeSlider as array of files
      else if (key === "homeSlider" && Array.isArray(value)) {
        value.forEach((file) => {
          if (file && file.uri) {
            formData.append("homeSlider", {
              uri: file.uri,
              name: file.name,
              type: file.type,
            } as any);
          }
        });
      }
      // Handle multiple images
      else if (key === "images" && Array.isArray(value)) {
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

function cleanAppContentData(data: any) {
  const cleaned = { ...data };
  [
    "appLogo",
    "homeSlider",
    "soleCheckSlider",
    "appLaunchScreen",
    "appLaunchScreenDescription",
    "appLaunchScreenButtonText",
    "appLaunchScreenButtonLink",
    "animationDuration",
    "animationType",
    "otpVerificationIsActive",
    "otpVerificationType",
    "smsOtpApiKey",
    "emailOtpApiKey",
    "otpApiSecretKey",
  ].forEach((field) => {
    if (cleaned[field] === "") delete cleaned[field];
  });
  if (Array.isArray(cleaned.variations)) {
    cleaned.variations = cleaned.variations.filter((v: any) => v && v !== "");
  }
  return cleaned;
}

// GET (already in context, but you can use this for refetch)
export function useGetAppContent() {
  const { fetchAppContent, appContent, loading } = useAppContent();
  return { fetchAppContent, appContent, loading };
}

// DELETE gallery/slider image

export function useDeleteGalleryImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        console.log("data", data);
        const res = await MainApi.put(`/api/v1/app-content/file`, { data });
        return res.data;
      } catch (error: any) {
        let message =
          error?.response?.data?.message ||
          error.message ||
          "Failed to delete image";
        let stack = error?.stack || "";
        Toast.show({ type: "error", text1: message, text2: stack });
        throw error;
      }
    },
    onSuccess: (data) => {
      Toast.show({ type: "success", text1: "Image deleted" });
      queryClient.invalidateQueries({ queryKey: ["appContent"] });
    },
    onError: (error: any) => {
      let message =
        error?.response?.data?.message ||
        error.message ||
        "Failed to delete image";
      let stack = error?.stack || "";
      Toast.show({ type: "error", text1: message, text2: stack });
    },
  });
}

// UPDATE app content (now as mutation)
export function useUpdateAppContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        const formData = buildFormData(cleanAppContentData(data));
        const res = await MainApi.post("/api/v1/app-content", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
      } catch (error: any) {
        let message =
          error?.response?.data?.message ||
          error.message ||
          "Failed to update app content";
        let stack = error?.stack || "";
        Toast.show({ type: "error", text1: message, text2: stack });
        throw error;
      }
    },
    onSuccess: (data) => {
      Toast.show({ type: "success", text1: "App content updated" });
      queryClient.invalidateQueries({ queryKey: ["appContent"] });
    },
    onError: (error: any) => {
      let message =
        error?.response?.data?.message ||
        error.message ||
        "Failed to update app content";
      let stack = error?.stack || "";
      Toast.show({ type: "error", text1: message, text2: stack });
    },
  });
}

// UPLOAD logo
export function useUploadLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const formData = buildFormData(cleanAppContentData(data));
      const res = await MainApi.put(`/api/v1/app-content`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Toast.show({ type: "success", text1: "App Logo updated" });
      return res.data.brand;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appContent"] });
    },
  });
}

// UPLOAD slider
export function useUploadSlider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const formData = buildFormData(cleanAppContentData(data));
      const res = await MainApi.put(`/api/v1/app-content`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Toast.show({ type: "success", text1: "Slider updated" });
      return res.data.brand;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appContent"] });
    },
  });
}

// UPLOAD sole check slider
export function useUploadSoleCheckSlider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const formData = buildFormData(cleanAppContentData(data));
      const res = await MainApi.put(
        `/api/v1/app-content/sole-check-slider`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      Toast.show({ type: "success", text1: "Sole Check Slider updated" });
      return res.data.brand;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appContent"] });
    },
  });
}

// SUBMIT SMS provider
export function useSubmitSmsProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const formData = buildFormData(cleanAppContentData(data));
      await MainApi.post("/api/v1/app-content/sms-provider", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Toast.show({ type: "success", text1: "SMS Provider updated" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appContent"] });
    },
  });
}

// 4. Usage Example
// import {
//   useAppContent,
//   useDeleteGalleryImage,
//   useUploadLogo,
// } from "@/hooks/useAppContentApi";

// const { appContent, loading } = useAppContent();
// const deleteGalleryImage = useDeleteGalleryImage();
// const uploadLogo = useUploadLogo();

// const handleDelete = async (id: string) => {
//   await deleteGalleryImage(id);
// };

// const handleLogoUpload = async (formData: FormData) => {
//   await uploadLogo(formData);
// };
