import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useAttributeOptions = (attributeId: string | null) => {
  const [attributeOptions, setAttributeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchAttributeOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      console.log("attributeId", attributeId);
      if (!attributeId || attributeId === "") {
        // Get all attribute options
        response = await MainApi.get("/api/v1/attribute-options");
        setAttributeOptions(response.data.attributeOptions || []);
      } else {
        // Get all attribute options and filter by attributeId
        response = await MainApi.get(
          `/api/v1/attribute-options/attribute/${attributeId}`
        );
        setAttributeOptions(response.data.attributeOptions || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch attribute options");
      setAttributeOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributeOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributeId]);

  return { attributeOptions, loading, error, refetch: fetchAttributeOptions };
};
