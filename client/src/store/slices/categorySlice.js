import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {

  fetchCategoriesAPI,

  createCategoryAPI,

  updateCategoryAPI,

  deleteCategoryAPI,

} from "../../services/api";


// ================= GET =================

export const fetchCategories = createAsyncThunk(

  "categories/fetchCategories",

  async () => {

    return await fetchCategoriesAPI();

  }

);


// ================= CREATE =================

export const createCategory = createAsyncThunk(

  "categories/createCategory",

  async (categoryData, { dispatch }) => {

    const result = await createCategoryAPI(categoryData);

    dispatch(fetchCategories());

    return result;

  }

);


// ================= UPDATE =================

export const updateCategory = createAsyncThunk(

  "categories/updateCategory",

  async ({ id, categoryData }, { dispatch }) => {

    const result = await updateCategoryAPI(

      id,

      categoryData

    );

    dispatch(fetchCategories());

    return result;

  }

);


// ================= DELETE =================

export const deleteCategory = createAsyncThunk(

  "categories/deleteCategory",

  async (id, { dispatch }) => {

    await deleteCategoryAPI(id);

    dispatch(fetchCategories());

  }

);


// ================= INITIAL STATE =================

const initialState = {

  categories: [],

  loading: false,

  error: null,

};


// ================= SLICE =================

const categorySlice = createSlice({

  name: "categories",

  initialState,

  reducers: {},

  extraReducers: (builder) => {

    builder

      .addCase(fetchCategories.pending, (state) => {

        state.loading = true;

      })

      .addCase(fetchCategories.fulfilled, (state, action) => {

        state.loading = false;

        state.categories = action.payload;

      })

      .addCase(fetchCategories.rejected, (state, action) => {

        state.loading = false;

        state.error = action.error.message;

      })


      .addCase(createCategory.pending, (state) => {

        state.loading = true;

      })

      .addCase(createCategory.fulfilled, (state) => {

        state.loading = false;

      })

      .addCase(createCategory.rejected, (state, action) => {

        state.loading = false;

        state.error = action.error.message;

      })


      .addCase(updateCategory.pending, (state) => {

        state.loading = true;

      })

      .addCase(updateCategory.fulfilled, (state) => {

        state.loading = false;

      })

      .addCase(updateCategory.rejected, (state, action) => {

        state.loading = false;

        state.error = action.error.message;

      })


      .addCase(deleteCategory.pending, (state) => {

        state.loading = true;

      })

      .addCase(deleteCategory.fulfilled, (state) => {

        state.loading = false;

      })

      .addCase(deleteCategory.rejected, (state, action) => {

        state.loading = false;

        state.error = action.error.message;

      });

  },

});

export default categorySlice.reducer;