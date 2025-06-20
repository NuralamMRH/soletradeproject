import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";

// Type definitions
export interface HomeFeedSection {
  id: string;
  name: string;
  // Add other fields as needed
}

export interface CreateOrUpdateSectionInput {
  name: string;
  // Add other fields as needed
}

export interface UpdateSectionParams {
  id: string;
  sectionData: CreateOrUpdateSectionInput;
}

export interface UpdateSectionOrderParams {
  sections: {
    _id: string;
    order: number;
  }[];
}
// Get all home feed sections
export const useGetHomeFeedSections = () => {
  return useQuery<HomeFeedSection[], unknown>({
    queryKey: ["homeFeedSections"],
    queryFn: async (): Promise<HomeFeedSection[]> => {
      const { data } = await MainApi.get("/api/v1/home-feed-sections");
      return data;
    },
  });
};

// Get single home feed section
export const useGetHomeFeedSection = (id?: string) => {
  return useQuery<HomeFeedSection, unknown>({
    queryKey: ["homeFeedSection", id],
    queryFn: async (): Promise<HomeFeedSection> => {
      const { data } = await MainApi.get(`/api/v1/home-feed-sections/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Create home feed section
export const useCreateHomeFeedSection = () => {
  const queryClient = useQueryClient();
  return useMutation<HomeFeedSection, unknown, CreateOrUpdateSectionInput>({
    mutationFn: async (sectionData: CreateOrUpdateSectionInput) => {
      const { data } = await MainApi.post(
        "/api/v1/home-feed-sections",
        sectionData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeedSections"] });
    },
  });
};

// Update home feed section
export const useUpdateHomeFeedSection = () => {
  const queryClient = useQueryClient();
  return useMutation<HomeFeedSection, unknown, UpdateSectionParams>({
    mutationFn: async ({ id, sectionData }: UpdateSectionParams) => {
      const { data } = await MainApi.put(
        `/api/v1/home-feed-sections/${id}`,
        sectionData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeedSections"] });
    },
  });
};

// Delete home feed section
export const useDeleteHomeFeedSection = () => {
  const queryClient = useQueryClient();
  return useMutation<string, unknown, string>({
    mutationFn: async (id: string) => {
      const { data } = await MainApi.delete(`/api/v1/home-feed-sections/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeedSections"] });
    },
  });
};

// Auto-populate section
export const useAutoPopulateSection = () => {
  const queryClient = useQueryClient();
  return useMutation<HomeFeedSection, unknown, string>({
    mutationFn: async (id: string) => {
      const { data } = await MainApi.post(
        `/api/v1/home-feed-sections/${id}/auto-populate`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeedSections"] });
    },
  });
};

export const useUpdateHomeFeedSectionOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<HomeFeedSection, unknown, UpdateSectionOrderParams>({
    mutationFn: async ({ sections }: UpdateSectionOrderParams) => {
      const { data } = await MainApi.post(
        `/api/v1/home-feed-sections/update-order`,
        { sections }
      );
      console.log("data", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeedSections"] });
    },
  });
};
