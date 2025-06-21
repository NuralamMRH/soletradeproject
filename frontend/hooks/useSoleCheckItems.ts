import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useSoleCheckItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await MainApi.get("/api/v1/sole-check-items");
      setItems(response.data?.soleCheckItems);
    } catch (err: any) {
      setError(err.message);
      console.error("Sole check items API call error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return { items, loading, error, refetch: fetchItems };
};

export const useSoleCheckItem = (id: string | null) => {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchSoleCheckItem = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;

      response = await MainApi.get(`/api/v1/sole-check-items/${id}`);

      setItem(response.data.soleCheckItem || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch sole check item");
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoleCheckItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { item, loading, error, refetch: fetchSoleCheckItem };
};
