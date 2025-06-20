import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";
import { useAuth } from "./useAuth";

export const usePortfolio = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [portfolioProducts, setPortfolioProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolioItems = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching portfolio items...");
      let response;
      if (isAuthenticated && isAdmin) {
        response = await MainApi.get("/api/v1/portfolio");
      } else {
        response = await MainApi.get("/api/v1/portfolio/me");
      }

      setPortfolioItems(response.data.portfolioItems);
      setPortfolioProducts(response.data.products);
    } catch (err) {
      console.error("Portfolio items fetch error:", err);
      setPortfolioItems([]);
      setPortfolioProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  return {
    portfolioItems,
    portfolioProducts,
    loading,
    error,
    refetch: fetchPortfolioItems,
  };
};

export const usePortfolioProduct = (id: string | null) => {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;

      response = await MainApi.get(`/api/v1/portfolio/${id}`);

      setPortfolio(response.data.portfolio || []);
      setProduct(response.data.product || null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch portfolio");
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { portfolio, product, loading, error, refetch: fetchPortfolio };
};
