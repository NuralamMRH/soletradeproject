import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";
import { useAuth } from "./useAuth";

// Utility to remove empty, null, or undefined values from an object
const cleanParams = (obj: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) => v !== null && v !== undefined && v !== ""
    )
  );
};

export const useProducts = ({ filter }: { filter: any | null }) => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const safeFilter = filter && typeof filter === "object" ? filter : {};

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching products...");

      const cleanedFilter = cleanParams(safeFilter);

      console.log("cleanedFilter", cleanedFilter);
      let response;
      if (isAuthenticated) {
        response = await MainApi.get("/api/v1/products/auth", {
          params: cleanedFilter,
        });
      } else {
        response = await MainApi.get("/api/v1/products", {
          params: cleanedFilter,
        });
      }

      // Validate response data
      if (!response.data.products) {
        throw new Error("No data received from server");
      }

      // Ensure products is an array
      const productsData = Array.isArray(response.data.products)
        ? response.data.products
        : [];
      setProducts(productsData);
    } catch (err) {
      console.error("Products fetch error:", err);
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(safeFilter)]);

  return { products, loading, error, refetch: fetchProducts };
};
