import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useProduct = (id: string | null) => {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      response = await MainApi.get(`/api/v1/products/${id}`);

      setProduct(response.data.product || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch product");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { product, loading, error, refetch: fetchProduct };
};
