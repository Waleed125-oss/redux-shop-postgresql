import { configureStore } from "@reduxjs/toolkit";
import searchReducer from './slices/searchSlice';
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import orderReducer from "./slices/orderSlice";
import categoryReducer from "./slices/categorySlice";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import adminDashboardReducer from "./slices/adminDashboardSlice";
import sellerApplicationReducer from "./slices/sellerApplicationSlice";
import customerReducer from "./slices/customerSlice";
import sellerReducer from "./slices/sellerSlice";
import adminProductReducer from "./slices/adminProductSlice";
export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    search: searchReducer,
    orders: orderReducer,
    categories: categoryReducer,
    auth: authReducer,
    user: userReducer,
    adminDashboard: adminDashboardReducer,
    sellerApplication: sellerApplicationReducer,
    customers: customerReducer,
    seller: sellerReducer,
    adminProducts: adminProductReducer,
  },
});