import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Product {
  id: string
  name: string
  price: number
  category: string
}

interface ProductState {
  items: Product[]
  nextId: number
}

const initialState: ProductState = {
  items: [
    { id: "1", name: "Laptop", price: 999.99, category: "Electronics" },
    { id: "2", name: "Coffee Maker", price: 79.99, category: "Appliances" },
    { id: "3", name: "Desk Chair", price: 199.99, category: "Furniture" },
  ],
  nextId: 4,
}

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Omit<Product, "id">>) => {
      const newProduct: Product = {
        ...action.payload,
        id: String(state.nextId),
      }
      state.items.push(newProduct)
      state.nextId += 1
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload)
    },
  },
})

export const { addProduct, updateProduct, deleteProduct } = productSlice.actions
export default productSlice.reducer
