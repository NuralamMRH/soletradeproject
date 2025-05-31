import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useHomeFeedSections = ({ filter }: { filter: any | null }) => {
  const [homeFeedSections, setHomeFeedSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const safeFilter = filter && typeof filter === "object" ? filter : {};

  const fetchHomeFeedSections = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching home feed sections...");
      const response = await MainApi.get("/api/v1/home-feed-sections", {
        params: safeFilter,
      });

      // Validate response data
      if (!response.data.homeFeedSections) {
        throw new Error("No data received from server");
      }

      // Ensure products is an array
      const homeFeedSectionsData = Array.isArray(response.data.homeFeedSections)
        ? response.data.homeFeedSections
        : [];
      setHomeFeedSections(homeFeedSectionsData);
    } catch (err) {
      console.error("Home feed sections fetch error:", err);
      setHomeFeedSections([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeFeedSections();
  }, [JSON.stringify(safeFilter)]);

  return { homeFeedSections, loading, error, refetch: fetchHomeFeedSections };
};
