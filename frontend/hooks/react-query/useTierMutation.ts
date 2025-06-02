import MainApi from "@/api/MainApi";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";

// Define types for Tier and payloads
export interface Tier {
  _id: string;
  name: string;
  type?: string;
  [key: string]: any;
}

export interface CreateTierPayload {
  name: string;
  type?: string;
  [key: string]: any;
}

export interface UpdateTierPayload {
  id: string;
  tierData: Partial<Tier>;
}

// Get all tiers
export const useTiers = (type?: string): UseQueryResult<Tier[], Error> => {
  return useQuery<Tier[], Error>({
    queryKey: ["tiers", type],
    queryFn: async (): Promise<Tier[]> => {
      const response = await MainApi.get<{ tiers: Tier[] }>(
        type ? `/api/v1/tiers/type/${type}` : "/api/v1/tiers"
      );
      return response.data.tiers;
    },
  });
};

// Get single tier
export const useTier = (id: string): UseQueryResult<Tier, Error> => {
  return useQuery<Tier, Error>({
    queryKey: ["tier", id],
    queryFn: async (): Promise<Tier> => {
      const response = await MainApi.get<{ data: Tier }>(`/api/v1/tiers/${id}`);
      return response.data.data;
    },
  });
};

// Create tier
export const useCreateTier = (): UseMutationResult<
  any,
  Error,
  CreateTierPayload
> => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, CreateTierPayload>({
    mutationFn: async (tierData: CreateTierPayload): Promise<any> => {
      const response = await MainApi.post("/api/v1/tiers", tierData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiers"] });
    },
  });
};

// Update tier
export const useUpdateTier = (): UseMutationResult<
  any,
  Error,
  UpdateTierPayload
> => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UpdateTierPayload>({
    mutationFn: async ({ id, tierData }: UpdateTierPayload): Promise<any> => {
      const response = await MainApi.put(`/api/v1/tiers/${id}`, tierData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiers"] });
    },
  });
};

// Delete tier
export const useDeleteTier = (): UseMutationResult<any, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string): Promise<any> => {
      const response = await MainApi.delete(`/api/v1/tiers/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiers"] });
    },
  });
};
