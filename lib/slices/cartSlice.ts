import { createSlice } from "@reduxjs/toolkit"

interface CartState {
  count: number
}

const initialState: CartState = {
  count: 0,
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state) => {
      state.count += 1
    },
    removeFromCart: (state) => {
      if (state.count > 0) {
        state.count -= 1
      }
    },
  },
})

export const { addToCart, removeFromCart } = cartSlice.actions
export default cartSlice.reducer
