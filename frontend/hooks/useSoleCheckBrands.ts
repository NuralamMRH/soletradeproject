import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useSoleCheckBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await MainApi.get("/api/v1/sole-check-brands");
      setBrands(response.data?.soleCheckBrands);
    } catch (err: any) {
      setError(err.message);
      console.error("Sole check brands API call error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return { brands, loading, error, refetch: fetchBrands };
};

export const useSoleCheckBrand = (id: string | null) => {
  const [soleCheckBrand, setSoleCheckBrand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchSoleCheckBrand = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;

      response = await MainApi.get(`/api/v1/sole-check-brands/${id}`);

      setSoleCheckBrand(response.data.soleCheckBrand || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch sole check brand");
      setSoleCheckBrand(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoleCheckBrand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { soleCheckBrand, loading, error, refetch: fetchSoleCheckBrand };
};
