import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useSoleCheckTopUps = () => {
  const [topUps, setTopUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopUps = async () => {
    try {
      setLoading(true);
      const response = await MainApi.get("/api/v1/sole-check-top-ups");
      setTopUps(response.data?.soleCheckTopUps);
    } catch (err: any) {
      setError(err.message);
      console.error("Sole check top ups API call error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopUps();
  }, []);

  return { topUps, loading, error, refetch: fetchTopUps };
};

export const useSoleCheckTopUp = (id: string | null) => {
  const [topUp, setTopUp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchSoleCheckTopUp = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;

      response = await MainApi.get(`/api/v1/sole-check-top-ups/${id}`);

      setTopUp(response.data.soleCheckTopUp || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch sole check top up");
      setTopUp(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoleCheckTopUp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { topUp, loading, error, refetch: fetchSoleCheckTopUp };
};
