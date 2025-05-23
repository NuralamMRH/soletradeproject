import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useSections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching sections...");
      const response = await MainApi.get("/api/v1/home-feed-sections");
      // console.log("Sections response:", response.data.homeFeedSections);

      // Validate response data
      if (!response.data.homeFeedSections) {
        throw new Error("No data received from server");
      }

      // Ensure sections is an array
      const sectionsData = Array.isArray(response.data.homeFeedSections)
        ? response.data.homeFeedSections
        : [];
      setSections(sectionsData);
    } catch (err) {
      console.error("Sections fetch error:", err);
      setSections([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  return { sections, loading, error, refetch: fetchSections };
};
