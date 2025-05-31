import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useAttributes = () => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const response = await MainApi.get("/api/v1/attributes");
      setAttributes(response.data?.attributes);
    } catch (err: any) {
      setError(err.message);
      console.error("Attributes API call error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  return { attributes, loading, error, refetch: fetchAttributes };
};
