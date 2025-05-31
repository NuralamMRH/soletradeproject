import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useSubBrands = (parentBrandId: string | null) => {
  const [subBrands, setSubBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchSubBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      if (!parentBrandId) {
        // Get all sub-categories
        response = await MainApi.get("/api/v1/sub-brands");
        setSubBrands(response.data.data || []);
      } else {
        // Get all sub-brands and filter by parentBrand
        response = await MainApi.get("/api/v1/sub-brands");
        const all = response.data.data || [];
        setSubBrands(
          all.filter(
            (sb: any) =>
              sb.parentBrand === parentBrandId ||
              sb.parentBrand?._id === parentBrandId
          )
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch sub-categories");
      setSubBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentBrandId]);

  return { subBrands, loading, error, refetch: fetchSubBrands };
};
