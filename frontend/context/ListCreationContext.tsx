import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the type for the context value
type ListCreationContextType = {
  columnProducts: { [colIdx: number]: any[] };
  setColumnProducts: (colIdx: number, products: any[]) => void;
  clearColumnProducts: () => void;
  images: string[];
  setImage: (index: number, uri: string) => void;
  selectedProducts: string[];
  setSelectedProducts: (products: string[]) => void;
  //filter
  isFilterActive: boolean;
  setIsFilterActive: (isFilterActive: boolean) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedSubCategory: string[];
  setSelectedSubCategory: (subCategory: string[]) => void;
  selectedBrand: string[];
  setSelectedBrand: (brand: string[]) => void;
  selectedSubBrand: string[];
  setSelectedSubBrand: (subBrand: string[]) => void;
  selectedYear: number[];
  setSelectedYear: (year: number[]) => void;
  selectedMonth: string[];
  setSelectedMonth: (month: string[]) => void;
  selectedDay: [number, number];
  setSelectedDay: (day: [number, number]) => void;
  selectedIndicators: string[];
  setSelectedIndicators: (indicators: string[]) => void;
  selectedAttributes: any;
  setSelectedAttributes: (attributes: any) => void;
  selectedServiceTypes: string[];
  setSelectedServiceTypes: (serviceTypes: string[]) => void;
  selectedAttribute: string | null;
  setSelectedAttribute: (attribute: string | null) => void;
  selectedVariations: string[];
  setSelectedVariations: (variations: string[]) => void;
  colors: string[];
  setColors: (colors: string[]) => void;
  price: [number, number];
  setPrice: (price: [number, number]) => void;
  clearAll: () => void;
  // list style view
  listStyleView: boolean;
  setListStyleView: (listStyleView: boolean) => void;
};

// Create the context with a default value of undefined
const ListCreationContext = createContext<ListCreationContextType | undefined>(
  undefined
);

const defaultImages = Array(9).fill(null);

// Provider component to wrap the part of the app that needs access to this context
export function ListCreationProvider({ children }: { children: ReactNode }) {
  // filters
  const [isFilterActive, setIsFilterActive] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string[]>([]);
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(
    null
  );
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
  const [selectedSubBrand, setSelectedSubBrand] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string[]>([]);
  const [price, setPrice] = useState<[number, number]>([0, 0]);
  const [selectedDay, setSelectedDay] = useState<[number, number]>([0, 0]);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<any>({});
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(
    []
  );

  const clearAll = () => {
    setIsFilterActive(false);
    setSelectedCategory(null);
    setSelectedSubCategory([]);
    setSelectedBrand([]);
    setSelectedSubBrand([]);
    setSelectedYear([]);
    setSelectedMonth([]);
    setSelectedDay([1, 31]);
    setSelectedIndicators([]);
    setSelectedAttributes({});
    setSelectedServiceTypes([]);
    setPrice([1, 1000000]);
    setColors([]);
  };

  // list style view
  const [listStyleView, setListStyleView] = useState<boolean>(false);

  // seller ask
  const [images, setImages] = useState(defaultImages);
  const [columnProducts, setColumnProductsState] = useState<{
    [colIdx: number]: any[];
  }>({});

  const setColumnProducts = (colIdx: number, products: any[]) => {
    setColumnProductsState((prev) => ({ ...prev, [colIdx]: products }));
  };
  const clearColumnProducts = () => setColumnProductsState({});

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
        columnProducts,
        setColumnProducts,
        clearColumnProducts,
        images,
        setImage,
        selectedProducts,
        setSelectedProducts,
        // filter
        isFilterActive,
        setIsFilterActive,
        selectedAttribute,
        setSelectedAttribute,
        selectedVariations,
        setSelectedVariations,
        selectedCategory,
        setSelectedCategory,
        selectedSubCategory,
        setSelectedSubCategory,
        selectedBrand,
        setSelectedBrand,
        selectedSubBrand,
        setSelectedSubBrand,
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
        selectedDay,
        setSelectedDay,
        selectedIndicators,
        setSelectedIndicators,
        selectedAttributes,
        setSelectedAttributes,
        selectedServiceTypes,
        setSelectedServiceTypes,
        price,
        setPrice,
        colors,
        setColors,
        clearAll,
        // list style view
        listStyleView,
        setListStyleView,
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
