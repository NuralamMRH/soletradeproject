import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useRecentViews = () => {
  const [recentViews, setRecentViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecentViews = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching recent views...");
      const response = await MainApi.get("/api/v1/recent-views");

      // Validate response data
      if (!response.data.products) {
        throw new Error("No data received from server");
      }

      // Ensure products is an array
      const productsData = Array.isArray(response.data.products)
        ? response.data.products
        : [];
      setRecentViews(productsData);
    } catch (err) {
      console.error("Recent views fetch error:", err);
      setRecentViews([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentViews();
  }, []);

  return { recentViews, loading, error, refetch: fetchRecentViews };
};
