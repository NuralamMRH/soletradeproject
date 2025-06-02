import MainApi from "@/api/MainApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

// Define types for TierBenefit and payloads
export interface TierBenefit {
  _id: string;
  tier: string;
  name: string;
  description?: string;
  [key: string]: any;
}

export interface CreateTierBenefitPayload {
  tier: string;
  name: string;
  description?: string;
  [key: string]: any;
}

export interface UpdateTierBenefitPayload {
  id: string;
  [key: string]: any;
}

// Get tier benefits
export const useGetTierBenefits = (
  tierId: string | undefined
): UseQueryResult<TierBenefit[], Error> => {
  return useQuery<TierBenefit[], Error>({
    queryKey: ["tierBenefits", tierId],
    queryFn: async (): Promise<TierBenefit[]> => {
      if (!tierId) {
        throw new Error("Tier ID is required");
      }
      try {
        const { data } = await MainApi.get<{ data: TierBenefit[] }>(
          `/api/v1/tier-benefits/${tierId}`
        );
        return data.data || data;
      } catch (error) {
        console.error("Error fetching benefits:", error);
        throw error;
      }
    },
    enabled: !!tierId,
    retry: 1,
    onError: (error: Error) => {
      console.error("Error in useGetTierBenefits:", error);
    },
  });
};

// Create tier benefit
export const useCreateTierBenefit = (): UseMutationResult<
  any,
  Error,
  CreateTierBenefitPayload
> => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, CreateTierBenefitPayload>({
    mutationFn: async (benefitData: CreateTierBenefitPayload): Promise<any> => {
      const { data } = await MainApi.post("/api/v1/tier-benefits", benefitData);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tierBenefits", variables.tier],
      });
    },
  });
};

// Update tier benefit
export const useUpdateTierBenefit = (): UseMutationResult<
  any,
  Error,
  UpdateTierBenefitPayload
> => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UpdateTierBenefitPayload>({
    mutationFn: async ({
      id,
      ...updateData
    }: UpdateTierBenefitPayload): Promise<any> => {
      const { data } = await MainApi.put(
        `/api/v1/tier-benefits/${id}`,
        updateData
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tierBenefits", variables.tier],
      });
    },
  });
};

// Delete tier benefit
export const useDeleteTierBenefit = (): UseMutationResult<
  any,
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string): Promise<any> => {
      const { data } = await MainApi.delete(`/api/v1/tier-benefits/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tierBenefits"] });
    },
  });
};
