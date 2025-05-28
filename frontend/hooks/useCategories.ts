import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching categories...");
      const response = await MainApi.get("/api/v1/categories");
      // console.log("Categories response:", response.data.categories);

      // Validate response data
      if (!response.data.categories) {
        throw new Error("No data received from server");
      }

      // Ensure categories is an array
      const categoriesData = Array.isArray(response.data.categories)
        ? response.data.categories
        : [];
      setCategories(categoriesData);
    } catch (err) {
      console.error("Categories fetch error:", err);
      setCategories([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, refetch: fetchCategories };
};
