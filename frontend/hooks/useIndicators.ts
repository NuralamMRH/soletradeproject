import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useIndicators = () => {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching indicators...");
      const response = await MainApi.get("/api/v1/indicators");
      // console.log("indicators response:", response.data.indicators);

      // Validate response data
      if (!response.data.indicators) {
        throw new Error("No data received from server");
      }

      // Ensure categories is an array
      const indicatorsData = Array.isArray(response.data.indicators)
        ? response.data.indicators
        : [];
      setIndicators(indicatorsData);
    } catch (err) {
      console.error("Indicators fetch error:", err);
      setIndicators([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, []);

  return { indicators, loading, error, refetch: fetchIndicators };
};
