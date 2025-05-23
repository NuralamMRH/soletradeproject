import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";

// -----------------------
// Type Definitions
// -----------------------

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
  buttonImage?: string; // For React Native URI or Web file upload
}

export interface UpdateButtonParams {
  id: string;
  data: CreateOrUpdateButtonInput;
}

// -----------------------
// GET: Home Feed Buttons
// -----------------------

export const useGetHomeFeedButtons = (design: string) => {
  return useQuery<HomeFeedButton[]>({
    queryKey: ["homeFeedButtons", design],
    queryFn: async () => {
      const response = await MainApi.get("/api/v1/home-feed-buttons", {
        params: { design },
      });
      return response.data.data;
    },
  });
};

// -----------------------
// POST: Create Button
// -----------------------

export const useCreateHomeFeedButton = () => {
  const queryClient = useQueryClient();

  return useMutation<HomeFeedButton, unknown, CreateOrUpdateButtonInput>({
    mutationFn: async (data) => {
      const formData = new FormData();

      if (data.buttonImage) {
        formData.append(
          "image",
          {
            uri: data.buttonImage,
            type: "image/jpeg",
            name: "image.jpg",
          } as unknown as Blob // For React Native workaround
        );
      }

      formData.append("name", data.name);
      formData.append("design", data.design);
      formData.append("link", data.link);

      const response = await MainApi.post(
        "/api/v1/home-feed-buttons",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeedButtons"] });
    },
  });
};

// -----------------------
// PUT: Update Button
// -----------------------

export const useUpdateHomeFeedButton = () => {
  const queryClient = useQueryClient();

  return useMutation<HomeFeedButton, unknown, UpdateButtonParams>({
    mutationFn: async ({ id, data }) => {
      const formData = new FormData();

      if (data.buttonImage) {
        formData.append("image", {
          uri: data.buttonImage,
          type: "image/jpeg",
          name: "image.jpg",
        } as unknown as Blob);
      }

      formData.append("name", data.name);
      formData.append("design", data.design);
      formData.append("link", data.link);

      const response = await MainApi.put(
        `/api/v1/home-feed-buttons/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeedButtons"] });
    },
  });
};

// -----------------------
// DELETE: Delete Button
// -----------------------

export const useDeleteHomeFeedButton = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, string>({
    mutationFn: async (id) => {
      const response = await MainApi.delete(`/api/v1/home-feed-buttons/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeedButtons"] });
    },
  });
};
