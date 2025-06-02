import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PosterApi, Poster } from "./posterApi";
import Toast from "react-native-toast-message";

// Query hook for fetching all posters
export const usePosters = () => {
  return useQuery<{ data: Poster[] }, Error>({
    queryKey: ["posters"],
    queryFn: PosterApi.getPosters,
    select: (data) => data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Query hook for fetching a single poster
export const usePoster = (id: string) => {
  return useQuery<{ data: Poster }, Error>({
    queryKey: ["poster", id],
    queryFn: () => PosterApi.getPoster(id),
    enabled: !!id,
    select: (data) => data,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation hook for creating a new poster
export const useCreatePoster = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { image: string }>({
    mutationFn: PosterApi.createPoster,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posters"] });
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Poster created successfully",
      });
    },
    onError: (error: Error) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to create poster",
      });
    },
  });
};

// Mutation hook for updating a poster
export const useUpdatePoster = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; posterData: { image: string } }>(
    {
      mutationFn: ({ id, posterData }) =>
        PosterApi.updatePoster(id, posterData),
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["posters"] });
        queryClient.invalidateQueries({ queryKey: ["poster", variables.id] });
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Poster updated successfully",
        });
      },
      onError: (error: Error) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message || "Failed to update poster",
        });
      },
    }
  );
};

// Mutation hook for deleting a poster
export const useDeletePoster = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: PosterApi.deletePoster,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posters"] });
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Poster deleted successfully",
      });
    },
    onError: (error: Error) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to delete poster",
      });
    },
  });
};
