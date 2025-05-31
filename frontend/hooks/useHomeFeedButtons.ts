import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useHomeFeedButtons = (design: string | null) => {
  const [homeFeedButtons, setHomeFeedButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchHomeFeedButtons = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      if (!design) {
        // Get all sub-categories
        response = await MainApi.get("/api/v1/home-feed-buttons");
        setHomeFeedButtons(response.data.data || []);
      } else {
        // Get all sub-brands and filter by parentBrand
        response = await MainApi.get("/api/v1/home-feed-buttons");
        const all = response.data.data || [];
        setHomeFeedButtons(
          all.filter(
            (sb: any) => sb.design === design || sb.design?._id === design
          )
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch sub-categories");
      setHomeFeedButtons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeFeedButtons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design]);

  return { homeFeedButtons, loading, error, refetch: fetchHomeFeedButtons };
};
