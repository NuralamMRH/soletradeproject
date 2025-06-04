import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SearchHistoryContextType {
  history: string[];
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clearHistory: () => void;
  suggest: (input: string) => string[];
}

const SearchHistoryContext = createContext<
  SearchHistoryContextType | undefined
>(undefined);

const STORAGE_KEY = "@search_history";

export const SearchHistoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addSearch = (query: string) => {
    setHistory((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== query.toLowerCase()
      );
      return [query, ...filtered].slice(0, 10); // keep max 10
    });
  };

  const removeSearch = (query: string) => {
    setHistory((prev) => prev.filter((item) => item !== query));
  };

  const clearHistory = () => setHistory([]);

  const suggest = (input: string) => {
    if (!input) return history;
    return history.filter((item) =>
      item.toLowerCase().includes(input.toLowerCase())
    );
  };

  return (
    <SearchHistoryContext.Provider
      value={{ history, addSearch, removeSearch, clearHistory, suggest }}
    >
      {children}
    </SearchHistoryContext.Provider>
  );
};

export const useSearchHistory = () => {
  const ctx = useContext(SearchHistoryContext);
  if (!ctx)
    throw new Error(
      "useSearchHistory must be used within SearchHistoryProvider"
    );
  return ctx;
};
