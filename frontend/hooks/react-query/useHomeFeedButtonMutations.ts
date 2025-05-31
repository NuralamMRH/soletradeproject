import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";

// Type definitions
export interface HomeFeedButton {
  id: string;
  name: string;
  design: string;
  link: string;
  image_url?: string;
}

export interface CreateOrUpdateButtonInput {
  name: string;
  design: string;
  link: string;
  buttonImage?: string; // React Native URI
}

export interface UpdateButtonParams {
  id: string;
  data: CreateOrUpdateButtonInput;
}

// Get all home feed buttons with optional design filter
export const useGetHomeFeedButtons = (design?: string) => {
  return useQuery<HomeFeedButton[], unknown>({
    queryKey: ["homeFeedButtons", design],
    queryFn: async (): Promise<HomeFeedButton[]> => {
      const response = await MainApi.get("/api/v1/home-feed-buttons", {
        params: {
          design,
        },
      });
      return response.data.data;
    },
  });
};

// Create a new home feed button
export const useCreateHomeFeedButton = () => {
  const queryClient = useQueryClient();

  return useMutation<HomeFeedButton, unknown, CreateOrUpdateButtonInput>({
    mutationFn: async (data: CreateOrUpdateButtonInput) => {
      const formData = new FormData();

      // Append image if exists
      if (data.buttonImage) {
        formData.append("image", {
          uri: data.buttonImage,
          type: "image/jpeg",
          name: "image.jpg",
        } as any);
      }

      // Append other data
      formData.append("name", data.name);
      formData.append("design", data.design);
      formData.append("link", data.link);

      const response = await MainApi.post(
        "/api/v1/home-feed-buttons",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeedButtons"] });
    },
  });
};

// Update a home feed button
export const useUpdateHomeFeedButton = () => {
  const queryClient = useQueryClient();

  return useMutation<HomeFeedButton, unknown, UpdateButtonParams>({
    mutationFn: async ({ id, data }: UpdateButtonParams) => {
      const formData = new FormData();

      // Append image if exists
      if (data.buttonImage) {
        formData.append("image", {
          uri: data.buttonImage,
          type: "image/jpeg",
          name: "image.jpg",
        } as any);
      }

      // Append other data
      formData.append("name", data.name);
      formData.append("design", data.design);
      formData.append("link", data.link);

      const response = await MainApi.put(
        `/api/v1/home-feed-buttons/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeedButtons"] });
    },
  });
};

// Delete a home feed button
export const useDeleteHomeFeedButton = () => {
  const queryClient = useQueryClient();

  return useMutation<string, unknown, string>({
    mutationFn: async (id: string) => {
      const response = await MainApi.delete(`/api/v1/home-feed-buttons/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeedButtons"] });
    },
  });
};
