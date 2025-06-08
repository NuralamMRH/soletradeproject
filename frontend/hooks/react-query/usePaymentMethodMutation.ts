import MainApi from "@/api/MainApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const getPaymentMethods = async (): Promise<any[]> => {
  const { data } = await MainApi.get("/api/v1/payment-methods");
  return data;
};
export const getMyPaymentMethods = async (): Promise<any[]> => {
  const { data } = await MainApi.get("/api/v1/payment-methods/me");
  return data.paymentMethods;
};

export const getPaymentMethodById = async (id: string): Promise<any> => {
  const { data } = await MainApi.get(`/api/v1/payment-methods/${id}`);
  return data;
};

export const createPaymentMethod = async (paymentMethod: any): Promise<any> => {
  try {
    const { data } = await MainApi.post(
      "/api/v1/payment-methods",
      paymentMethod
    );
    return data;
  } catch (error: any) {
    // Log everything about the error
    console.error("Payment Method API Error:", error);
    if (error.response) {
      // Backend responded with error
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      // Request was made but no response
      console.error("No response received:", error.request);
    } else {
      // Something else happened
      console.error("Error message:", error.message);
    }
    throw error; // rethrow so React Query can handle it too
  }
};

export const updatePaymentMethod = async ({
  id,
  ...paymentMethod
}: {
  id: string;
  [key: string]: any;
}): Promise<any> => {
  const payload = {
    ...paymentMethod,
  };
  const { data } = await MainApi.put(`/api/v1/payment-methods/${id}`, payload);
  return data;
};

export const deletePaymentMethod = async (id: string): Promise<any> => {
  const { data } = await MainApi.delete(`/api/v1/payment-methods/${id}`);
  return data;
};

export const setDefaultPaymentMethod = async (id: string): Promise<any> => {
  const { data } = await MainApi.put(`/api/v1/payment-methods/${id}/default`);
  return data;
};

export const useGetPaymentMethods = () => {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: getPaymentMethods,
  });
};
export const useGetMyPaymentMethods = () => {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: getMyPaymentMethods,
  });
};

export const useGetPaymentMethod = (id: string) => {
  return useQuery({
    queryKey: ["payment-method", id],
    queryFn: () => getPaymentMethodById(id),
    enabled: !!id,
  });
};

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
};

export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setDefaultPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
};
