import { useMutation, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";
import { showNotification } from "../useLocalNotifications";
import { useAuth } from "../useAuth";

// SOLE CHECK AUTH SERVICE MUTATIONS
export const useCreateSoleCheckAuthService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await MainApi.post("/api/v1/sole-check-auth-services", data);
      showNotification({
        title: "Sole check auth service created",
        body: "Sole check auth service created successfully",
      });
      return res.data.soleCheckLabel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sole-check-auth-services"] });
    },
  });
};

export const useUpdateSoleCheckAuthService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await MainApi.put(
        `/api/v1/sole-check-auth-services/${id}`,
        data
      );
      showNotification({
        title: "Sole check auth service updated",
        body: "Sole check auth service updated successfully",
      });
      return res.data.soleCheckLabel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sole-check-labels"] });
    },
  });
};

export const useDeleteSoleCheckAuthService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await MainApi.delete(`/api/v1/sole-check-auth-services/${id}`);
      showNotification({
        title: "Sole check auth service deleted",
        body: "Sole check auth service deleted successfully",
      });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sole-check-auth-services"] });
    },
  });
};

// Delete many sole check auth services
export const useDeleteManySoleCheckAuthServices = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.post(
          `/api/v1/sole-check-auth-services/delete-many`,
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
            "Failed to remove sole check auth services",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sole-check-auth-services"],
      });
    },
  });
};
