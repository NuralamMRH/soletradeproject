import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Product {
  _id?: string;
  name: string;
}

interface Column {
  name: string;
  products: Product[];
}

interface ColumnConfigProps {
  columns: Column[];
  onColumnNameChange: (
    sectionIdx: number,
    colIdx: number,
    name: string
  ) => void;
  onColumnProductsChange: (
    sectionIdx: number,
    colIdx: number,
    products: Product[]
  ) => void;
  onAddProduct: (sectionIdx: number, colIdx: number) => void;
  sectionIdx: number;
  displayMode?: string;
}

const ColumnConfig: React.FC<ColumnConfigProps> = ({
  columns,
  onColumnNameChange,
  onColumnProductsChange,
  onAddProduct,
  sectionIdx,
  displayMode,
}) => {
  return (
    <>
      {columns.map((col, colIdx) => (
        <View key={colIdx} style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
            Column {colIdx + 1} name
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
              fontSize: 16,
              backgroundColor: "#fff",
              marginBottom: 10,
            }}
            value={col.name}
            onChangeText={(text) =>
              onColumnNameChange(sectionIdx, colIdx, text)
            }
            placeholder="Type name"
          />
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
            List of Products
          </Text>
          {col.products.length > 0 ? (
            col.products.map((product, pIdx) => (
              <View
                key={product._id || pIdx}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Text>{product.name}</Text>
                {/* Add remove button if needed */}
              </View>
            ))
          ) : (
            <Text>No products selected</Text>
          )}
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
            onPress={() => onAddProduct(sectionIdx, colIdx)}
          >
            <Text
              style={{ color: "#8B0000", fontWeight: "bold", fontSize: 18 }}
            >
              ADD
            </Text>
            <Ionicons name="add" size={20} color="#8B0000" />
          </TouchableOpacity>
        </View>
      ))}
    </>
  );
};

export default ColumnConfig;
