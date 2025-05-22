import { useState } from "react";
import MainApi from "@/api/MainApi";
import { useAuth } from "./useAuth";

export function useUpdateUser() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await MainApi.put("/api/v1/users/me", data); // Adjust endpoint as needed
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Update failed");
      setLoading(false);
      throw err;
    }
  };

  return { updateUser, loading, error };
}
