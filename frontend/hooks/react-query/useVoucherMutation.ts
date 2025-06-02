import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from "./voucherApi";

export const useGetVouchers = () => {
  return useQuery({ queryKey: ["vouchers"], queryFn: getVouchers });
};

export const useGetVoucher = (id: string) => {
  return useQuery({
    queryKey: ["voucher", id],
    queryFn: () => getVoucherById(id),
    enabled: !!id,
  });
};

export const useCreateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
};

export const useUpdateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
};

export const useDeleteVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
};
