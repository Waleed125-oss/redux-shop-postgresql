import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/admin/dashboard";

export const fetchDashboard = createAsyncThunk(
  "adminDashboard/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.message ||
        "Failed to fetch dashboard data"
      );

    }
  }
);


const initialState = {
  statistics: {
    products: 0,
    customers: 0,
    orders: 0,
    revenue: 0,
  },

  recentOrders: [],

  loading: false,

  error: null,
};


const adminDashboardSlice = createSlice({

  name: "adminDashboard",

  initialState,

  reducers: {},

  extraReducers: (builder) => {

    builder

      .addCase(fetchDashboard.pending, (state) => {

        state.loading = true;
        state.error = null;

      })

      .addCase(fetchDashboard.fulfilled, (state, action) => {

        state.loading = false;

        state.statistics =
          action.payload.statistics;

        state.recentOrders =
          action.payload.recentOrders;

      })

      .addCase(fetchDashboard.rejected, (state, action) => {

        state.loading = false;

        state.error =
          action.payload;

      });

  },

});


export default adminDashboardSlice.reducer;