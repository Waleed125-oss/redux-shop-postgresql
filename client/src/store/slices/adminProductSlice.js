import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  fetchPendingSellerProductsAPI,
  approveSellerProductAPI,
  rejectSellerProductAPI,
} from "../../services/api";

// ========================================
// GET PENDING PRODUCTS
// ========================================

export const fetchPendingSellerProducts =
  createAsyncThunk(
    "adminProducts/fetchPending",
    async (_, { rejectWithValue }) => {
      try {
        const result =
          await fetchPendingSellerProductsAPI();

        return result.products;

      } catch (error) {
        return rejectWithValue(
          error.message ||
          "Failed to fetch pending products"
        );
      }
    }
  );


// ========================================
// APPROVE PRODUCT
// ========================================

export const approveSellerProduct =
  createAsyncThunk(
    "adminProducts/approve",
    async (id, { rejectWithValue }) => {
      try {
        const result =
          await approveSellerProductAPI(id);

        return result.product;

      } catch (error) {
        return rejectWithValue(
          error.message ||
          "Failed to approve product"
        );
      }
    }
  );


// ========================================
// REJECT PRODUCT
// ========================================

export const rejectSellerProduct =
  createAsyncThunk(
    "adminProducts/reject",
    async (
      { id, reason },
      { rejectWithValue }
    ) => {
      try {
        const result =
          await rejectSellerProductAPI(
            id,
            reason
          );

        return result.product;

      } catch (error) {
        return rejectWithValue(
          error.message ||
          "Failed to reject product"
        );
      }
    }
  );


// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  products: [],

  loading: false,

  actionLoading: false,

  error: null,
};


// ========================================
// SLICE
// ========================================

const adminProductSlice = createSlice({
  name: "adminProducts",

  initialState,

  reducers: {
    clearAdminProductError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {

    // --------------------------------
    // FETCH
    // --------------------------------

    builder
      .addCase(
        fetchPendingSellerProducts.pending,
        (state) => {

          state.loading = true;
          state.error = null;

        }
      )

      .addCase(
        fetchPendingSellerProducts.fulfilled,
        (state, action) => {

          state.loading = false;

          state.products =
            action.payload;

        }
      )

      .addCase(
        fetchPendingSellerProducts.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;

        }
      );


    // --------------------------------
    // APPROVE
    // --------------------------------

    builder
      .addCase(
        approveSellerProduct.pending,
        (state) => {

          state.actionLoading = true;
          state.error = null;

        }
      )

      .addCase(
        approveSellerProduct.fulfilled,
        (state, action) => {

          state.actionLoading = false;

          state.products =
            state.products.filter(
              (product) =>
                product.id !==
                action.payload.id
            );

        }
      )

      .addCase(
        approveSellerProduct.rejected,
        (state, action) => {

          state.actionLoading = false;

          state.error =
            action.payload;

        }
      );


    // --------------------------------
    // REJECT
    // --------------------------------

    builder
      .addCase(
        rejectSellerProduct.pending,
        (state) => {

          state.actionLoading = true;
          state.error = null;

        }
      )

      .addCase(
        rejectSellerProduct.fulfilled,
        (state, action) => {

          state.actionLoading = false;

          state.products =
            state.products.filter(
              (product) =>
                product.id !==
                action.payload.id
            );

        }
      )

      .addCase(
        rejectSellerProduct.rejected,
        (state, action) => {

          state.actionLoading = false;

          state.error =
            action.payload;

        }
      );

  },
});

export const {
  clearAdminProductError,
} = adminProductSlice.actions;

export default adminProductSlice.reducer;