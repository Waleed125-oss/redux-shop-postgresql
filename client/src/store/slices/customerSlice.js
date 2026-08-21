import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


const API_URL = "http://localhost:5000/api/users/customers";


export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",

  async (_, { rejectWithValue }) => {

    try {

      const token = localStorage.getItem("token");

      const response = await axios.get(
        API_URL,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.message ||
        "Failed to fetch customers"
      );

    }

  }
);


const initialState = {

  customers: [],

  loading: false,

  error: null,

};


const customerSlice = createSlice({

  name: "customers",

  initialState,

  reducers: {},

  extraReducers: (builder) => {

    builder

      .addCase(
        fetchCustomers.pending,
        (state) => {

          state.loading = true;

          state.error = null;

        }
      )

      .addCase(
        fetchCustomers.fulfilled,
        (state, action) => {

          state.loading = false;

          state.customers = action.payload;

        }
      )

      .addCase(
        fetchCustomers.rejected,
        (state, action) => {

          state.loading = false;

          state.error = action.payload;

        }
      );

  },

});


export default customerSlice.reducer;