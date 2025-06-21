import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useSoleCheckLabels = () => {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const response = await MainApi.get("/api/v1/sole-check-labels");
      setLabels(response.data?.soleCheckLabels);
    } catch (err: any) {
      setError(err.message);
      console.error("Sole check labels API call error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, []);

  return { labels, loading, error, refetch: fetchLabels };
};

export const useSoleCheckLabel = (id: string | null) => {
  const [label, setLabel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchSoleCheckLabel = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;

      response = await MainApi.get(`/api/v1/sole-check-labels/${id}`);

      setLabel(response.data.soleCheckLabel || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch sole check label");
      setLabel(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoleCheckLabel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { label, loading, error, refetch: fetchSoleCheckLabel };
};
