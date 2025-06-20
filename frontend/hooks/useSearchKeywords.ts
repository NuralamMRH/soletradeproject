import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useSearchKeywords = () => {
  const [topSearches, setTopSearches] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [keywordStats, setKeywordStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSearchKeywords = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching search keywords...");
      const response = await MainApi.get("/api/v1/search-keywords");

      setTopSearches(response.data.topSearches);
      setRecentSearches(response.data.recentSearches);
      setKeywordStats(response.data.keywordStats);
    } catch (err) {
      console.error("Search keywords fetch error:", err);
      setTopSearches([]);
      setRecentSearches([]);
      setKeywordStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchKeywords();
  }, []);

  return {
    topSearches,
    recentSearches,
    keywordStats,
    loading,
    error,
    refetch: fetchSearchKeywords,
  };
};
