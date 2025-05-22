import { useState } from "react";
import MainApi from "@/api/MainApi";

export function useShippingAddress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addShippingAddress = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await MainApi.post("/api/v1/shippings", data);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Add failed");
      setLoading(false);
      throw err;
    }
  };

  const updateShippingAddress = async (id: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await MainApi.put(`/api/v1/shippings/${id}`, data);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Update failed");
      setLoading(false);
      throw err;
    }
  };

  const deleteShippingAddress = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await MainApi.delete(`/api/v1/shippings/${id}`);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Delete failed");
      setLoading(false);
      throw err;
    }
  };

  const getShippingAddress = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await MainApi.get("/api/v1/shippings");
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Fetch failed");
      setLoading(false);
      throw err;
    }
  };

  return {
    addShippingAddress,
    updateShippingAddress,
    deleteShippingAddress,
    getShippingAddress,
    loading,
    error,
  };
}
