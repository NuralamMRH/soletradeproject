import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useSoleCheckAuthServices = () => {
  const [authServices, setAuthServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAuthServices = async () => {
    try {
      setLoading(true);
      const response = await MainApi.get("/api/v1/sole-check-auth-services");
      setAuthServices(response.data?.soleCheckAuthServices);
    } catch (err: any) {
      setError(err.message);
      console.error("Sole check auth services API call error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthServices();
  }, []);

  return { authServices, loading, error, refetch: fetchAuthServices };
};

export const useSoleCheckAuthService = (id: string | null) => {
  const [authService, setAuthService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchSoleCheckAuthService = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;

      response = await MainApi.get(`/api/v1/sole-check-auth-services/${id}`);

      setAuthService(response.data.soleCheckAuthService || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch sole check auth service");
      setAuthService(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoleCheckAuthService();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { authService, loading, error, refetch: fetchSoleCheckAuthService };
};
