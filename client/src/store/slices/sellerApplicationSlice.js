import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  fetchSellerApplicationsAPI,
  approveSellerAPI,
  rejectSellerAPI,
} from "../../services/api";


// ========================================
// GET SELLER APPLICATIONS
// ========================================

export const fetchSellerApplications =
  createAsyncThunk(
    "sellerApplications/fetch",
    async (_, { rejectWithValue }) => {
      try {
        const result =
          await fetchSellerApplicationsAPI();

        return result.applications;

      } catch (error) {
        return rejectWithValue(
          error.message ||
          "Failed to fetch seller applications"
        );
      }
    }
  );


// ========================================
// APPROVE SELLER
// ========================================

export const approveSeller =
  createAsyncThunk(
    "sellerApplications/approve",
    async (id, { rejectWithValue }) => {
      try {
        const result =
          await approveSellerAPI(id);

        return result.application;

      } catch (error) {
        return rejectWithValue(
          error.message ||
          "Failed to approve seller"
        );
      }
    }
  );


// ========================================
// REJECT SELLER
// ========================================

export const rejectSeller =
  createAsyncThunk(
    "sellerApplications/reject",
    async (
      { id, adminNote },
      { rejectWithValue }
    ) => {
      try {
        const result =
          await rejectSellerAPI(
            id,
            adminNote
          );

        return result.application;

      } catch (error) {
        return rejectWithValue(
          error.message ||
          "Failed to reject seller"
        );
      }
    }
  );


// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  applications: [],

  loading: false,

  actionLoading: false,

  error: null,
};


// ========================================
// SLICE
// ========================================

const sellerApplicationSlice =
  createSlice({

    name: "sellerApplications",

    initialState,

    reducers: {},

    extraReducers: (builder) => {

      // --------------------------------
      // FETCH APPLICATIONS
      // --------------------------------

      builder

        .addCase(
          fetchSellerApplications.pending,
          (state) => {

            state.loading = true;
            state.error = null;

          }
        )

        .addCase(
          fetchSellerApplications.fulfilled,
          (state, action) => {

            state.loading = false;

            state.applications =
              action.payload;

          }
        )

        .addCase(
          fetchSellerApplications.rejected,
          (state, action) => {

            state.loading = false;

            state.error =
              action.payload;

          }
        );


      // --------------------------------
      // APPROVE SELLER
      // --------------------------------

      builder

        .addCase(
          approveSeller.pending,
          (state) => {

            state.actionLoading = true;
            state.error = null;

          }
        )

        .addCase(
          approveSeller.fulfilled,
          (state, action) => {

            state.actionLoading = false;

            state.applications =
              state.applications.filter(
                (application) =>
                  application.id !==
                  action.payload.id
              );

          }
        )

        .addCase(
          approveSeller.rejected,
          (state, action) => {

            state.actionLoading = false;

            state.error =
              action.payload;

          }
        );


      // --------------------------------
      // REJECT SELLER
      // --------------------------------

      builder

        .addCase(
          rejectSeller.pending,
          (state) => {

            state.actionLoading = true;
            state.error = null;

          }
        )

        .addCase(
          rejectSeller.fulfilled,
          (state, action) => {

            state.actionLoading = false;

            state.applications =
              state.applications.filter(
                (application) =>
                  application.id !==
                  action.payload.id
              );

          }
        )

        .addCase(
          rejectSeller.rejected,
          (state, action) => {

            state.actionLoading = false;

            state.error =
              action.payload;

          }
        );

    },

  });


export default sellerApplicationSlice.reducer;