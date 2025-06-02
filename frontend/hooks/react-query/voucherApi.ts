import MainApi from "@/api/MainApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Toast from "react-native-toast-message";

function isReactNativeFile(
  obj: any
): obj is { uri: string; name?: string; type?: string } {
  return obj && typeof obj === "object" && typeof obj.uri === "string";
}

// Helper to build FormData for brand/sub-brand
function buildFormData(data: any) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
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

export const getVouchers = async (): Promise<any[]> => {
  const { data } = await MainApi.get("/api/v1/vouchers");
  return data;
};

export const getVoucherById = async (id: string): Promise<any> => {
  const { data } = await MainApi.get(`/api/v1/vouchers/${id}`);
  return data;
};

export const createVoucher = async (voucher: any): Promise<any> => {
  try {
    const formData = buildFormData(voucher);
    const { data } = await MainApi.post("/api/v1/vouchers", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error: any) {
    // Log everything about the error
    console.error("Voucher API Error:", error);
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

export const updateVoucher = async ({
  id,
  ...voucher
}: {
  id: string;
  [key: string]: any;
}): Promise<any> => {
  const payload = {
    ...voucher,
    discountAmount: voucher.discountAmount
      ? Number(voucher.discountAmount)
      : undefined,
    maxDiscount: voucher.maxDiscount ? Number(voucher.maxDiscount) : undefined,
    minSpend: voucher.minSpend ? Number(voucher.minSpend) : undefined,
    totalIssued: voucher.totalIssued ? Number(voucher.totalIssued) : undefined,
    limitPerCustomer: voucher.limitPerCustomer
      ? Number(voucher.limitPerCustomer)
      : undefined,
    startDate: voucher.startDate || undefined,
    endDate: voucher.endDate || undefined,
  };
  console.log("payload image", payload.image);
  const formData = payload;
  const { data } = await MainApi.put(`/api/v1/vouchers/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteVoucher = async (id: string): Promise<any> => {
  const { data } = await MainApi.delete(`/api/v1/vouchers/${id}`);
  return data;
};

export function useVoucherSectionsQuery() {
  return useQuery({
    queryKey: ["voucher-sections"],
    queryFn: async () => {
      const { data } = await MainApi.get("/api/v1/voucher-sections");
      return data;
    },
  });
}

export function useCreateVoucherSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; voucherIds: string[] }) => {
      console.log("payload", payload);
      const { data } = await MainApi.post("/api/v1/voucher-sections", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voucher-sections"] });
    },
  });
}

export function useUpdateVoucherSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      name: string;
      voucherIds: string[];
    }) => {
      const { data } = await MainApi.put(
        `/api/v1/voucher-sections/${id}`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voucher-sections"] });
    },
  });
}

export function useDeleteVoucherSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await MainApi.delete(`/api/v1/voucher-sections/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voucher-sections"] });
    },
  });
}

export const useGetDiscountOfTheWeekSection = () => {
  return useQuery({
    queryKey: ["discountOfTheWeekSection"],
    queryFn: async () => {
      const { data } = await MainApi.get(
        "/api/v1/voucher-sections/discount-of-the-week"
      );
      return data;
    },
  });
};

export const useCreateDiscountOfTheWeekSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axios.post(
        "/api/v1/voucher-sections/discount-of-the-week",
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discountOfTheWeekSection"] });
    },
  });
};

export const useUpdateDiscountOfTheWeekSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axios.put(
        "/api/v1/voucher-sections/discount-of-the-week",
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discountOfTheWeekSection"] });
    },
  });
};
