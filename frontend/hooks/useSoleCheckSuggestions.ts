import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useSoleCheckSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await MainApi.get("/api/v1/sole-check-suggestions");
      setSuggestions(response.data?.soleCheckSuggestions);
    } catch (err: any) {
      setError(err.message);
      console.error("Sole check suggestions API call error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return { suggestions, loading, error, refetch: fetchSuggestions };
};
