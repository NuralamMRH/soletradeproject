import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useSubCategories = (parentCategoryId: string | null) => {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      if (!parentCategoryId) {
        // Get all sub-categories
        response = await MainApi.get("/api/v1/sub-categories");
        setSubCategories(response.data.data || []);
      } else {
        // Get all sub-categories and filter by parentCategory
        response = await MainApi.get("/api/v1/sub-categories");
        const all = response.data.data || [];
        setSubCategories(
          all.filter(
            (sc: any) =>
              sc.parentCategory === parentCategoryId ||
              sc.parentCategory?._id === parentCategoryId
          )
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch sub-categories");
      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentCategoryId]);

  return { subCategories, loading, error, refetch: fetchSubCategories };
};
