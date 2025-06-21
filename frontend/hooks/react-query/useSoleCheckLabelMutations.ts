import { useMutation, useQueryClient } from "@tanstack/react-query";
import MainApi from "@/api/MainApi";
import { showNotification } from "../useLocalNotifications";
import { useAuth } from "../useAuth";

function isReactNativeFile(
  obj: any
): obj is { uri: string; name?: string; type?: string } {
  return obj && typeof obj === "object" && typeof obj.uri === "string";
}

// Helper to build FormData for sole check model
function buildFormData(data: any) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "image" && isReactNativeFile(value)) {
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
      } else if (
        key === "image" &&
        typeof File !== "undefined" &&
        value instanceof File
      ) {
        formData.append(key, value);
      } else if (typeof value !== "object") {
        formData.append(key, String(value));
      }
      // else: skip appending if value is an object (not a file/blob)
    }
  });
  return formData;
}

// SOLE CHECK LABEL MUTATIONS
export const useCreateSoleCheckLabel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const formData = buildFormData(data);
      const res = await MainApi.post("/api/v1/sole-check-labels", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showNotification({
        title: "Sole check label created",
        body: "Sole check label created successfully",
      });
      return res.data.soleCheckLabel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sole-check-labels"] });
    },
  });
};

export const useUpdateSoleCheckLabel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      // console.log("Data", data);
      const formData = buildFormData(data);
      const res = await MainApi.put(
        `/api/v1/sole-check-labels/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      showNotification({
        title: "Sole check label updated",
        body: "Sole check label updated successfully",
      });
      return res.data.soleCheckLabel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sole-check-labels"] });
    },
  });
};

export const useDeleteSoleCheckLabel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await MainApi.delete(`/api/v1/sole-check-labels/${id}`);

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sole-check-labels"] });
      showNotification({
        title: "Sole check label deleted",
        body: "Sole check label deleted successfully",
      });
    },
    onError: (error: any) => {
      showNotification({
        title: "Error",
        body:
          error.response?.data?.message || "Failed to delete sole check label",
      });
    },
  });
};

// Delete many sole check labels
export const useDeleteManySoleCheckLabels = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }
      try {
        const { data } = await MainApi.post(
          `/api/v1/sole-check-labels/delete-many`,
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
            "Failed to remove sole check labels",
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sole-check-labels"] });
    },
  });
};
