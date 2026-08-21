
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  fetchProductsAPI,
  deleteProductAPI,
  permanentlyDeleteProductAPI,
  createProductAPI,
  fetchSingleProductAPI,
  updateProductAPI,
  toggleProductStatusAPI,
  fetchHomeSectionsAPI,
} from "../../services/api";


// ================= FETCH PRODUCTS =================



export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",

  async ({
    page = 1,
    limit = 10,
    search = "",
    category_id = "",
    sort = "",
    admin = false,
    min_price = "",
    max_price = "",
    rating = "",
  } = {}) => {

    return await fetchProductsAPI(
      page,
      limit,
      search,
      category_id,
      sort,
      admin,
      min_price,
      max_price,
      rating
    );
  }
);


export const fetchHomeSections = createAsyncThunk(
  "products/fetchHomeSections",

  async (_, { rejectWithValue }) => {

    try {

      const data =
        await fetchHomeSectionsAPI();

      return data;

    } catch (error) {

      return rejectWithValue(
        error.message ||
        "Failed to fetch home product sections"
      );

    }

  }
);

// ================= DELETE / DEACTIVATE PRODUCT =================

// ================= DELETE PRODUCT =================

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",

  async (id, { dispatch }) => {

    const result = await deleteProductAPI(id);

    // Refresh products after deletion/deactivation
    dispatch(
      fetchProducts({
        page: 1,
        search: "",
      })
    );

    return result;
  }
);


// ================= PERMANENT DELETE PRODUCT =================

export const permanentlyDeleteProduct = createAsyncThunk(
  "products/permanentlyDeleteProduct",

  async (id, { dispatch, rejectWithValue }) => {
    try {
      const result = await permanentlyDeleteProductAPI(id);

      dispatch(
        fetchProducts({
          page: 1,
          search: "",
          admin: true,
        })
      );

      return result;

    } catch (error) {

      return rejectWithValue(
        error.message || "Cannot delete this product"
      );

    }
  }
);



// ================= TOGGLE STATUS =================

export const toggleProductStatus = createAsyncThunk(
  "products/toggleProductStatus",

  async (id, { dispatch }) => {

    const result = await toggleProductStatusAPI(id);

    dispatch(
      fetchProducts({
        page: 1,
        search: "",
        admin: true,
      })
    );

    return result;
  }
);


// ================= CREATE PRODUCT =================

export const createProduct = createAsyncThunk(
  "products/createProduct",

  async (productData, { dispatch }) => {

    const result = await createProductAPI(productData);

    dispatch(
      fetchProducts({
        page: 1,
        search: "",
        admin: true,
      })
    );

    return result;
  }
);


// ================= FETCH SINGLE PRODUCT =================

export const fetchSingleProduct = createAsyncThunk(
  "products/fetchSingleProduct",

  async (id) => {

    return await fetchSingleProductAPI(id, true);
  }
);


// ================= UPDATE PRODUCT =================

export const updateProduct = createAsyncThunk(
  "products/updateProduct",

  async ({ id, productData, page = 1 }, { dispatch }) => {

    const result = await updateProductAPI(
      id,
      productData
    );

    dispatch(
      fetchProducts({
        page,
        search: "",
        admin: true,
      })
    );

    return result;
  }
);


// ================= INITIAL STATE =================

const initialState = {

  products: [],

  selectedProduct: null,

  currentPage: 1,

  totalPages: 1,

  totalProducts: 0,

  loading: false,

  error: null,

  // Home sections
  bestSellers: [],
  topRated: [],
  newArrivals: [],

  homeSectionsError: false,
  homeSectionsLoading: null,

};


// ================= SLICE =================

const productSlice = createSlice({

  name: "products",

  initialState,

  reducers: {},

  extraReducers: (builder) => {

    builder

      // ================= FETCH =================

      .addCase(fetchProducts.pending, (state) => {

        state.loading = true;
        state.error = null;

      })

      .addCase(fetchProducts.fulfilled, (state, action) => {

        state.loading = false;

        state.products =
          action.payload.products;

        state.currentPage =
          action.payload.currentPage;

        state.totalPages =
          action.payload.totalPages;

        state.totalProducts =
          action.payload.totalProducts;

      })

      .addCase(fetchProducts.rejected, (state, action) => {

        state.loading = false;

        state.error =
          action.error.message;

      })


      // ================= DELETE =================

      .addCase(deleteProduct.pending, (state) => {

        state.loading = true;

      })
      

      // PERMANENT DELETE PRODUCT

.addCase(
  permanentlyDeleteProduct.pending,
  (state) => {
    state.loading = true;
    state.error = null;
  }
)

.addCase(
  permanentlyDeleteProduct.fulfilled,
  (state) => {
    state.loading = false;
  }
)

.addCase(
  permanentlyDeleteProduct.rejected,
  (state, action) => {
    state.loading = false;
    state.error = action.error.message;
  }
)
      // .addCase(deleteProduct.fulfilled, (state) => {

      //   state.loading = false;

      // })

      .addCase(deleteProduct.fulfilled, (state, action) => {

  state.loading = false;

  console.log(
    "Delete result:",
    action.payload
  );

})

      .addCase(deleteProduct.rejected, (state, action) => {

        state.loading = false;

        state.error =
          action.error.message;

      })


      // ================= TOGGLE STATUS =================

      .addCase(toggleProductStatus.pending, (state) => {

        state.loading = true;

      })

      .addCase(toggleProductStatus.fulfilled, (state) => {

        state.loading = false;

      })

      .addCase(toggleProductStatus.rejected, (state, action) => {

        state.loading = false;

        state.error =
          action.error.message;

      })


      // ================= CREATE =================

      .addCase(createProduct.pending, (state) => {

        state.loading = true;

      })

      .addCase(createProduct.fulfilled, (state) => {

        state.loading = false;

      })

      .addCase(createProduct.rejected, (state, action) => {

        state.loading = false;

        state.error =
          action.error.message;

      })


      // ================= SINGLE PRODUCT =================

      .addCase(
        fetchSingleProduct.fulfilled,
        (state, action) => {

          state.selectedProduct =
            action.payload;

        }
      )


      // ================= UPDATE =================

      .addCase(updateProduct.pending, (state) => {

        state.loading = true;

      })

      .addCase(updateProduct.fulfilled, (state) => {

        state.loading = false;

      })

      .addCase(updateProduct.rejected, (state, action) => {

        state.loading = false;

        state.error =
          action.error.message;

      });


      // ================= HOME PRODUCT SECTIONS =================

builder.addCase(
  fetchHomeSections.pending,
  (state) => {

    state.homeSectionsLoading = true;
    state.homeSectionsError = null;

  }
);


builder.addCase(
  fetchHomeSections.fulfilled,
  (state, action) => {

    state.homeSectionsLoading = false;

    state.bestSellers =
      action.payload.bestSellers || [];

    state.topRated =
      action.payload.topRated || [];

    state.newArrivals =
      action.payload.newArrivals || [];

  }
);


builder.addCase(
  fetchHomeSections.rejected,
  (state, action) => {

    state.homeSectionsLoading = false;

    state.homeSectionsError =
      action.payload ||
      "Failed to load home sections";

  }
);

  },

});


export default productSlice.reducer;