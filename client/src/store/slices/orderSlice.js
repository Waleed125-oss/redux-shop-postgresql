import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  fetchOrdersAPI,
  fetchSingleOrderAPI,
  updateOrderStatusAPI,
} from "../../services/api";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async () => {
    return await fetchOrdersAPI();
  }
);

export const fetchSingleOrder = createAsyncThunk(
  "orders/fetchSingleOrder",
  async (id) => {
    return await fetchSingleOrderAPI(id);
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, status }, { dispatch }) => {

    const result = await updateOrderStatusAPI(
      id,
      status
    );

    dispatch(fetchSingleOrder(id));
    dispatch(fetchOrders());

    return result;
  }
);

const initialState = {

  orders: [],

  selectedOrder: null,

  loading: false,

  error: null,

};

const orderSlice = createSlice({

  name: "orders",

  initialState,

  reducers: {},

  extraReducers: (builder) => {

    builder

      .addCase(fetchOrders.pending, (state) => {

        state.loading = true;

      })

      .addCase(fetchOrders.fulfilled, (state, action) => {

        state.loading = false;

        state.orders = action.payload;

      })

      .addCase(fetchOrders.rejected, (state, action) => {

        state.loading = false;

        state.error = action.error.message;

      })
      .addCase(fetchSingleOrder.pending, (state) => {
  state.loading = true;
})

.addCase(fetchSingleOrder.fulfilled, (state, action) => {
  state.loading = false;
  state.selectedOrder = action.payload;
})

.addCase(fetchSingleOrder.rejected, (state, action) => {
  state.loading = false;
  state.error = action.error.message;
})

.addCase(updateOrderStatus.pending, (state) => {
  state.loading = true;
})

.addCase(updateOrderStatus.fulfilled, (state) => {
  state.loading = false;
})

.addCase(updateOrderStatus.rejected, (state, action) => {
  state.loading = false;
  state.error = action.error.message;
});

  },

});

export default orderSlice.reducer;