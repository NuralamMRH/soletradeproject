import { useState, useEffect } from "react";
import MainApi from "@/api/MainApi";

export const useProducts = ({ filter }: { filter: any | null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const safeFilter = filter && typeof filter === "object" ? filter : {};

  console.log("safeFilter", safeFilter);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching products...");
      const response = await MainApi.get("/api/v1/products", {
        params: safeFilter,
      });
      // const response = await MainApi.get("/api/v1/products");

      // console.log("Response", response.data);

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
