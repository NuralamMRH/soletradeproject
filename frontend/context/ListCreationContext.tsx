import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the type for the context value
type ListCreationContextType = {
  images: string[];
  setImage: (index: number, uri: string) => void;
};

// Create the context with a default value of undefined
const ListCreationContext = createContext<ListCreationContextType | undefined>(
  undefined
);

const defaultImages = Array(9).fill(null);

// Provider component to wrap the part of the app that needs access to this context
export function ListCreationProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState(defaultImages);

  const setImage = (index: number, uri: string) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index] = uri;
      return updated;
    });
  };

  return (
    <ListCreationContext.Provider
      value={{
        images,
        setImage,
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
