import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  fetchApprovedSellersAPI,
} from "../../services/api";

// ========================================
// GET APPROVED SELLERS
// ========================================

export const fetchApprovedSellers =
  createAsyncThunk(
    "adminSellers/fetchApproved",
    async (_, { rejectWithValue }) => {
      try {
        const result =
          await fetchApprovedSellersAPI();

        return result.sellers;
      } catch (error) {
        return rejectWithValue(
          error.message ||
            "Failed to fetch approved sellers"
        );
      }
    }
  );

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  sellers: [],
  loading: false,
  error: null,
};

// ========================================
// SLICE
// ========================================

const adminSellerSlice = createSlice({
  name: "adminSellers",

  initialState,

  reducers: {
    clearAdminSellerError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ================= FETCH =================

      .addCase(
        fetchApprovedSellers.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchApprovedSellers.fulfilled,
        (state, action) => {
          state.loading = false;
          state.sellers = action.payload;
        }
      )

      .addCase(
        fetchApprovedSellers.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const {
  clearAdminSellerError,
} = adminSellerSlice.actions;

export default adminSellerSlice.reducer;