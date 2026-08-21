import { createSlice,
   createAsyncThunk,
 } from "@reduxjs/toolkit";

import { fetchCartAPI, addToCartAPI, updateCartAPI, deleteCartAPI, checkoutAPI } from "../../services/api"; 

const initialState = {
  cartItems: [],
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async () => {
    return await fetchCartAPI();
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (productId, { dispatch }) => {
    await addToCartAPI(productId);
    dispatch(fetchCart());
  }
);

export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ id, quantity }, { dispatch }) => {
    await updateCartAPI(id, quantity);
    dispatch(fetchCart());
  }
);

export const deleteItem = createAsyncThunk(
  "cart/deleteItem",
  async (id, { dispatch }) => {
    await deleteCartAPI(id);
    dispatch(fetchCart());
  }
);

export const checkout = createAsyncThunk(
  "cart/checkout",
  async (_, {dispatch}) => {
    const result = await checkoutAPI();
    dispatch(fetchCart());
    return result;
  }
);



const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    clearCart: (state) => {
      state.cartItems = [];
    },
   },
  extraReducers: (builder) => {

  builder

    .addCase(fetchCart.pending, (state) => {
      state.loading = true;
    })

    .addCase(fetchCart.fulfilled, (state, action) => {
      state.loading = false;
      state.cartItems = action.payload;
    })

    .addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })

    .addCase(addToCart.pending, (state) => {
      state.loading = true;
    })

    .addCase(addToCart.fulfilled, (state) => {
      state.loading = false;
    })

    .addCase(addToCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })

    .addCase(updateQuantity.pending, (state) => {
      state.loading = true;
    })

    .addCase(updateQuantity.fulfilled, (state) => {
      state.loading = false;
    })

    .addCase(updateQuantity.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })

    .addCase(deleteItem.pending, (state) => {
      state.loading = true;
    })

    .addCase(deleteItem.fulfilled, (state) => {
      state.loading = false;
    })
    .addCase(deleteItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    .addCase(checkout.pending, (state) => {
      state.loading = true;
    })

    .addCase(checkout.fulfilled, (state) => {
      state.loading = false;
      state.cartItems = [];
    })

    .addCase(checkout.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    

},

});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;