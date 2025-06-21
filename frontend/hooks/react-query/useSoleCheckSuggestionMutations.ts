import { useMutation, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";
import { showNotification } from "../useLocalNotifications";
import { useAuth } from "../useAuth";



// SOLE CHECK SUGGESTION MUTATIONS
export const useCreateSoleCheckSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await MainApi.post("/api/v1/sole-check-suggestions", data);
      showNotification({
        title: "Sole check suggestion created",
        body: "Sole check suggestion created successfully",
      });
      return res.data.soleCheckSuggestion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sole-check-suggestions"] });
    },
  });
};

export const useUpdateSoleCheckSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await MainApi.put(
        `/api/v1/sole-check-suggestions/${id}`,
        data
      );
      showNotification({
        title: "Sole check suggestion updated",
        body: "Sole check suggestion updated successfully",
      });
      return res.data.soleCheckSuggestion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sole-check-suggestions"] });
    },
  });
};

export const useDeleteSoleCheckSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await MainApi.delete(`/api/v1/sole-check-suggestions/${id}`);
      showNotification({
        title: "Sole check suggestion deleted",
        body: "Sole check suggestion deleted successfully",
      });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sole-check-suggestions"] });
    },
  });
};

// Delete many sole check suggestions
export const useDeleteManySoleCheckSuggestions = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.post(
          `/api/v1/sole-check-suggestions/delete-many`,
          {
            ids,
          }
        );

        return data;
      } catch (error: any) {
        showNotification({
          title: "Error",
          body:
            error.response?.data?.message ||
            "Failed to remove sole check suggestions",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sole-check-suggestions"],
      });
    },
  });
};
