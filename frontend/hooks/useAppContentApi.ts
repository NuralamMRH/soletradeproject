import MainApi from "@/api/MainApi";
import { useAppContent } from "@/context/AppContentContext";
import { useCallback } from "react";

// GET (already in context, but you can use this for refetch)
export function useGetAppContent() {
  const { fetchAppContent, appContent, loading } = useAppContent();
  return { fetchAppContent, appContent, loading };
}

// DELETE gallery image
export function useDeleteGalleryImage() {
  const { fetchAppContent } = useAppContent();
  return useCallback(
    async (imageId: string) => {
      await MainApi.delete(`/api/v1/app-content/gallery/${imageId}`);
      await fetchAppContent();
    },
    [fetchAppContent]
  );
}

// UPDATE app content
export function useUpdateAppContent() {
  const { fetchAppContent } = useAppContent();
  return useCallback(
    async (data: any) => {
      await MainApi.put("/api/v1/app-content", data);
      await fetchAppContent();
    },
    [fetchAppContent]
  );
}

// UPLOAD logo
export function useUploadLogo() {
  const { fetchAppContent } = useAppContent();
  return useCallback(
    async (formData: FormData) => {
      await MainApi.post("/api/v1/app-content/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchAppContent();
    },
    [fetchAppContent]
  );
}

// UPLOAD slider
export function useUploadSlider() {
  const { fetchAppContent } = useAppContent();
  return useCallback(
    async (formData: FormData) => {
      await MainApi.post("/api/v1/app-content/slider", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchAppContent();
    },
    [fetchAppContent]
  );
}

// UPLOAD sole check slider
export function useUploadSoleCheckSlider() {
  const { fetchAppContent } = useAppContent();
  return useCallback(
    async (formData: FormData) => {
      await MainApi.post("/api/v1/app-content/sole-check-slider", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchAppContent();
    },
    [fetchAppContent]
  );
}

// SUBMIT SMS provider
export function useSubmitSmsProvider() {
  const { fetchAppContent } = useAppContent();
  return useCallback(
    async (data: any) => {
      await MainApi.post("/api/v1/app-content/sms-provider", data);
      await fetchAppContent();
    },
    [fetchAppContent]
  );
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
