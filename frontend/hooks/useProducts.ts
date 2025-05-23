import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching products...");
      const response = await MainApi.get("/api/v1/products");

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
  }, []);

  return { products, loading, error, refetch: fetchProducts };
};
