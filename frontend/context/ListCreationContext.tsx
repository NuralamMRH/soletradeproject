import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the type for the context value
type ListCreationContextType = {
  columnProducts: { [colIdx: number]: any[] };
  setColumnProducts: (colIdx: number, products: any[]) => void;
  clearColumnProducts: () => void;
};

// Create the context with a default value of undefined
const ListCreationContext = createContext<ListCreationContextType | undefined>(
  undefined
);

// Provider component to wrap the part of the app that needs access to this context
export function ListCreationProvider({ children }: { children: ReactNode }) {
  const [columnProducts, setColumnProductsState] = useState<{
    [colIdx: number]: any[];
  }>({});

  const setColumnProducts = (colIdx: number, products: any[]) => {
    setColumnProductsState((prev) => ({ ...prev, [colIdx]: products }));
  };

  const clearColumnProducts = () => setColumnProductsState({});

  return (
    <ListCreationContext.Provider
      value={{
        columnProducts,
        setColumnProducts,
        clearColumnProducts,
      }}
    >
      {children}
    </ListCreationContext.Provider>
  );
}

// Custom hook to use the ListCreationContext
export function useListCreation() {
  const context = useContext(ListCreationContext);
  if (context === undefined) {
    throw new Error(
      "useListCreation must be used within a ListCreationProvider"
    );
  }
  return context;
}
