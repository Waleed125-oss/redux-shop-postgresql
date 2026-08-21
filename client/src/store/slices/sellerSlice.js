import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  fetchSellerDashboardStatsAPI,
  fetchSellerProductsAPI,
  createSellerProductAPI,
  fetchSellerOrdersAPI,
  fetchSellerOrderDetailAPI,
  // deleteProductAPI,
  fetchSingleProductAPI,
  updateSellerProductAPI,
  updateSellerProductStatusAPI,
} from "../../services/api";

// ========================================
// GET SELLER PRODUCTS
// ========================================

export const fetchSellerProducts = createAsyncThunk(
  "seller/fetchProducts",
  async (
    {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      approvalStatus = "",
      isActive = "",
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const result = await fetchSellerProductsAPI(
        page,
        limit,
        search,
        category,
        approvalStatus,
        isActive
      );

      return result;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch seller products"
      );
    }
  }
);

// ========================================
// CREATE SELLER PRODUCT
// ========================================

export const createSellerProduct = createAsyncThunk(
  "seller/createProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const result =
        await createSellerProductAPI(formData);

      return result;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to create product"
      );
    }
  }
);

// ========================================
// GET SELLER ORDERS
// ========================================

export const fetchSellerOrders = createAsyncThunk(
  "seller/fetchOrders",
  async (
    {
      page = 1,
      limit = 10,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const result = await fetchSellerOrdersAPI(
        page,
        limit
      );

      return result;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch seller orders"
      );
    }
  }
);

// ========================================
// GET SELLER ORDER DETAIL
// ========================================

export const fetchSellerOrderDetail =
  createAsyncThunk(
    "seller/fetchOrderDetail",
    async (id, { rejectWithValue }) => {
      try {
        const result =
          await fetchSellerOrderDetailAPI(id);

        return result;
      } catch (error) {
        return rejectWithValue(
          error.message ||
            "Failed to fetch seller order"
        );
      }
    }
  );

// ========================================
// GET SELLER DASHBOARD STATS
// ========================================

export const fetchSellerDashboardStats =
  createAsyncThunk(
    "seller/fetchDashboardStats",
    async (_, { rejectWithValue }) => {
      try {
        const result =
          await fetchSellerDashboardStatsAPI();

        return result.statistics;
      } catch (error) {
        return rejectWithValue(
          error.message ||
            "Failed to fetch dashboard statistics"
        );
      }
    }
  );

// ========================================
// UPDATE SELLER PRODUCT
// ========================================

export const updateSellerProduct =
  createAsyncThunk(
    "seller/updateProduct",
    async (
      { id, formData },
      { rejectWithValue }
    ) => {
      try {
        const result = await updateSellerProductAPI(
          id,
          formData
        );

        return result;
      } catch (error) {
        return rejectWithValue(
          error.message ||
            "Failed to update seller product"
        );
      }
    }
  );

  // ========================================
// UPDATE SELLER PRODUCT STATUS
// ========================================

export const toggleSellerProductStatus =
  createAsyncThunk(
    "seller/toggleProductStatus",
    async (
      { id, isActive },
      { rejectWithValue }
    ) => {
      try {
        const result =
          await updateSellerProductStatusAPI(
            id,
            isActive
          );

        return result;
      } catch (error) {
        return rejectWithValue(
          error.message ||
            "Failed to update product status"
        );
      }
    }
  );

// ========================================
// DELETE SELLER PRODUCT
// ========================================

// export const deleteSellerProduct =
//   createAsyncThunk(
//     "seller/deleteProduct",
//     async (id, { rejectWithValue }) => {
//       try {
//         const result =
//           await deleteProductAPI(id);

//         return {
//           id,
//           result,
//         };
//       } catch (error) {
//         return rejectWithValue(
//           error.message ||
//             "Failed to delete seller product"
//         );
//       }
//     }
//   );

// ========================================
// FETCH SINGLE PRODUCT
// ========================================

export const fetchSingleSellerProduct =
  createAsyncThunk(
    "seller/fetchSingleProduct",
    async (id, { rejectWithValue }) => {
      try {
        const result =
          await fetchSingleProductAPI(id);

        return result;
      } catch (error) {
        return rejectWithValue(
          error.message ||
            "Failed to fetch product"
        );
      }
    }
  );

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  // ================= DASHBOARD =================

  statistics: null,

  loading: false,

  error: null,

  // ================= PRODUCTS =================

  products: [],

  productsPagination: null,

  productsLoading: false,

  createProductLoading: false,

  createProductError: null,

  updateProductLoading: false,

  updateProductError: null,

  toggleProductLoading: false,

  toggleProductError: null,

  productsError: null,

  // ================= SINGLE PRODUCT =================

  selectedProduct: null,

  singleProductLoading: false,

  singleProductError: null,

  // ================= ORDERS =================

  orders: [],

  ordersPagination: null,

  ordersLoading: false,

  ordersError: null,

  // ================= ORDER DETAIL =================

  selectedOrder: null,

  orderDetailLoading: false,

  orderDetailError: null,
};

// ========================================
// SELLER SLICE
// ========================================

const sellerSlice = createSlice({
  name: "seller",

  initialState,

  reducers: {
    clearSellerData: (state) => {
      state.statistics = null;
      state.loading = false;
      state.error = null;
    },
  },

  // ========================================
  // EXTRA REDUCERS
  // ========================================

  extraReducers: (builder) => {
    builder

      // ========================================
      // DASHBOARD STATS
      // ========================================

      .addCase(
        fetchSellerDashboardStats.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchSellerDashboardStats.fulfilled,
        (state, action) => {
          state.loading = false;
          state.statistics = action.payload;
        }
      )

      .addCase(
        fetchSellerDashboardStats.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      // ========================================
      // GET SELLER PRODUCTS
      // ========================================

      .addCase(
        fetchSellerProducts.pending,
        (state) => {
          state.productsLoading = true;
          state.productsError = null;
        }
      )

      .addCase(
        fetchSellerProducts.fulfilled,
        (state, action) => {
          state.productsLoading = false;

          state.products =
            action.payload.products || [];

          state.productsPagination =
            action.payload.pagination || null;
        }
      )

      .addCase(
        fetchSellerProducts.rejected,
        (state, action) => {
          state.productsLoading = false;
          state.productsError = action.payload;
        }
      )

      // ========================================
      // CREATE SELLER PRODUCT
      // ========================================

      .addCase(
        createSellerProduct.pending,
        (state) => {
          state.createProductLoading = true;
          state.createProductError = null;
        }
      )

      .addCase(
        createSellerProduct.fulfilled,
        (state, action) => {
          state.createProductLoading = false;

          if (action.payload?.product) {
            state.products.unshift(
              action.payload.product
            );
          }
        }
      )

      .addCase(
        createSellerProduct.rejected,
        (state, action) => {
          state.createProductLoading = false;
          state.createProductError =
            action.payload;
        }
      )

      // ========================================
      // GET SELLER ORDERS
      // ========================================

      .addCase(
        fetchSellerOrders.pending,
        (state) => {
          state.ordersLoading = true;
          state.ordersError = null;
        }
      )

      .addCase(
        fetchSellerOrders.fulfilled,
        (state, action) => {
          state.ordersLoading = false;

          state.orders =
            action.payload?.orders || [];

          state.ordersPagination =
            action.payload?.pagination || null;
        }
      )

      .addCase(
        fetchSellerOrders.rejected,
        (state, action) => {
          state.ordersLoading = false;
          state.ordersError = action.payload;
        }
      )

      // ========================================
      // SELLER ORDER DETAIL
      // ========================================

      .addCase(
        fetchSellerOrderDetail.pending,
        (state) => {
          state.orderDetailLoading = true;
          state.orderDetailError = null;
          state.selectedOrder = null;
        }
      )

      .addCase(
        fetchSellerOrderDetail.fulfilled,
        (state, action) => {
          state.orderDetailLoading = false;

          state.selectedOrder =
            action.payload?.order || null;
        }
      )

      .addCase(
        fetchSellerOrderDetail.rejected,
        (state, action) => {
          state.orderDetailLoading = false;
          state.orderDetailError =
            action.payload;
        }
      )

      // ========================================
      // UPDATE SELLER PRODUCT
      // ========================================

      .addCase(
        updateSellerProduct.pending,
        (state) => {
          state.updateProductLoading = true;
          state.updateProductError = null;
        }
      )

      .addCase(
        updateSellerProduct.fulfilled,
        (state, action) => {
          state.updateProductLoading = false;

          const updatedProduct =
            action.payload?.product;

          if (updatedProduct) {
            const index =
              state.products.findIndex(
                (product) =>
                  product.id ===
                  updatedProduct.id
              );

            if (index !== -1) {
              state.products[index] =
                updatedProduct;
            }
          }
        }
      )

      .addCase(
        updateSellerProduct.rejected,
        (state, action) => {
          state.updateProductLoading = false;
          state.updateProductError =
            action.payload;
        }
      )

      // ========================================
// TOGGLE SELLER PRODUCT STATUS
// ========================================

.addCase(
  toggleSellerProductStatus.pending,
  (state) => {
    state.toggleProductLoading = true;
    state.toggleProductError = null;
  }
)

.addCase(
  toggleSellerProductStatus.fulfilled,
  (state, action) => {
    state.toggleProductLoading = false;

    const updatedProduct =
      action.payload?.product;

    if (updatedProduct) {
      const index =
        state.products.findIndex(
          (product) =>
            product.id === updatedProduct.id
        );

      if (index !== -1) {
        state.products[index] =
          updatedProduct;
      }
    }
  }
)

.addCase(
  toggleSellerProductStatus.rejected,
  (state, action) => {
    state.toggleProductLoading = false;

    state.toggleProductError =
      action.payload;
  }
)

      // ========================================
      // DELETE SELLER PRODUCT
      // ========================================
        
      // .addCase(
      //   deleteSellerProduct.pending,
      //   (state) => {
      //     state.deleteProductLoading = true;
      //     state.deleteProductError = null;
      //   }
      // )

      // .addCase(
      //   deleteSellerProduct.fulfilled,
      //   (state, action) => {
      //     state.deleteProductLoading = false;

      //     state.products =
      //       state.products.filter(
      //         (product) =>
      //           product.id !==
      //           action.payload.id
      //       );
      //   }
      // )

      // .addCase(
      //   deleteSellerProduct.rejected,
      //   (state, action) => {
      //     state.deleteProductLoading = false;
      //     state.deleteProductError =
      //       action.payload;
      //   }
      // )

      // ========================================
      // FETCH SINGLE SELLER PRODUCT
      // ========================================

      .addCase(
        fetchSingleSellerProduct.pending,
        (state) => {
          state.singleProductLoading = true;
          state.singleProductError = null;
          state.selectedProduct = null;
        }
      )

      .addCase(
        fetchSingleSellerProduct.fulfilled,
        (state, action) => {
          state.singleProductLoading = false;

          state.selectedProduct =
            action.payload?.product ||
            action.payload ||
            null;
        }
      )

      .addCase(
        fetchSingleSellerProduct.rejected,
        (state, action) => {
          state.singleProductLoading = false;
          state.singleProductError =
            action.payload;
        }
      );
  },
});

// ========================================
// EXPORT ACTIONS
// ========================================

export const {
  clearSellerData,
} = sellerSlice.actions;

// ========================================
// EXPORT REDUCER
// ========================================

export default sellerSlice.reducer;