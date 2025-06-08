 import { createSlice, PayloadAction } from "@reduxjs/toolkit";

 interface CartItem {
   id: string;
   name: string;
   brand: string;
   price: number;
   quantity: number;
   image: any;
 }

 interface CheckoutState {
   items: CartItem[];
   totalItems: number;
   total: number;
 }

 interface ProductState {
   checkout: CheckoutState;
 }

 const initialState: ProductState = {
   checkout: {
     items: [],
     totalItems: 0,
     total: 0,
   },
 };

 const productSlice = createSlice({
   name: "product",
   initialState,
   reducers: {
     addToCart: (state, action: PayloadAction<CartItem>) => {
       const newItem = action.payload;
       const existingItemIndex = state.checkout.items.findIndex(
         (item) => item.id === newItem.id
       );
       if (existingItemIndex !== -1) {
         state.checkout.items[existingItemIndex].quantity += newItem.quantity;
       } else {
         state.checkout.items.push(newItem);
       }
       state.checkout.totalItems = state.checkout.items.reduce(
         (total, item) => total + item.quantity,
         0
       );
       state.checkout.total = state.checkout.items.reduce(
         (total, item) => total + item.price * item.quantity,
         0
       );
     },
     removeFromCart: (state, action: PayloadAction<string>) => {
       const itemId = action.payload;
       state.checkout.items = state.checkout.items.filter(
         (item) => item.id !== itemId
       );
       state.checkout.totalItems = state.checkout.items.reduce(
         (total, item) => total + item.quantity,
         0
       );
       state.checkout.total = state.checkout.items.reduce(
         (total, item) => total + item.price * item.quantity,
         0
       );
     },
     updateCartItemQuantity: (
       state,
       action: PayloadAction<{ id: string; quantity: number }>
     ) => {
       const { id, quantity } = action.payload;
       const itemIndex = state.checkout.items.findIndex(
         (item) => item.id === id
       );
       if (itemIndex !== -1) {
         state.checkout.items[itemIndex].quantity = quantity;
         state.checkout.totalItems = state.checkout.items.reduce(
           (total, item) => total + item.quantity,
           0
         );
         state.checkout.total = state.checkout.items.reduce(
           (total, item) => total + item.price * item.quantity,
           0
         );
       }
     },
     clearCart: (state) => {
       state.checkout.items = [];
       state.checkout.totalItems = 0;
       state.checkout.total = 0;
     },
   },
 });

 export const { addToCart, removeFromCart, updateCartItemQuantity, clearCart } =
   productSlice.actions;
 export default productSlice.reducer;
