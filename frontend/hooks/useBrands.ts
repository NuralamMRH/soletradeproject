import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await MainApi.get("/api/v1/brands");
        setBrands(response.data?.brands);
      } catch (err: any) {
        setError(err.message);
        console.error("Brands API call error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return { brands, loading, error };
};
