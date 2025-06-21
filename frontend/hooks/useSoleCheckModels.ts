import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useSoleCheckModels = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await MainApi.get("/api/v1/sole-check-models");
      setModels(response.data?.soleCheckModels);
    } catch (err: any) {
      setError(err.message);
      console.error("Sole check models API call error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return { models, loading, error, refetch: fetchModels };
};

export const useSoleCheckModel = (id: string | null) => {
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchSoleCheckModel = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;

      response = await MainApi.get(`/api/v1/sole-check-models/${id}`);

      setModel(response.data.soleCheckModel || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch sole check model");
      setModel(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoleCheckModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { model, loading, error, refetch: fetchSoleCheckModel };
};
