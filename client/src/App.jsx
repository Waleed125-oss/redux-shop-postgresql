import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { fetchCart } from "./store/slices/cartSlice";

// Customer Pages
// Customer Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import CustomerOrders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import BecomeSeller from "./pages/BecomeSeller";
import ShopBySeller from "./pages/ShopBySeller";
import SellerStore from "./pages/SellerStore";
import PaymentSuccess from "./pages/PaymentSuccess";
import MyInvoices from "./pages/MyInvoices";
import MyInvoiceDetails from "./pages/MyInvoiceDetails";


// Admin Pages
import AdminLayout from "./admin/components/AdminLayout";
import SellerApplications from "./admin/pages/SellerApplications";
import Dashboard from "./admin/pages/Dashboard";
import Products from "./admin/pages/Products";
import AddProduct from "./admin/pages/AddProduct";
import EditProduct from "./admin/pages/EditProduct";
import AdminOrders from "./admin/pages/Orders";
import OrderDetails from "./admin/pages/OrderDetails";
import Categories from "./admin/pages/Categories";
import Customers from "./admin/pages/Customers";
import CustomerDetails from "./admin/pages/CustomerDetails";
import AdminRefundRequests from "./admin/pages/RefundRequests";
import AdminAiProduct from "./admin/pages/AdminAiProduct";
import AdminInvoices from "./admin/pages/Invoices";
import AdminInvoiceDetails from "./admin/pages/InvoiceDetails";

import MyOrderDetails from "./pages/MyOrderDetails";



// Route Protection
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import SellerRoute from "./components/SellerRoute";

import SellerLayout from "./seller/components/SellerLayout";
import SellerDashboard from "./seller/pages/Dashboard";
import SellerProducts from "./seller/pages/SellerProducts";
import SellerAddProduct from "./seller/pages/SellerAddProduct";
import SellerOrders from "./seller/pages/SellerOrders";
import SellerOrderDetails from "./seller/pages/SellerOrderDetails";
import SellerProductApprovals from "./admin/pages/SellerProductApprovals";
import SellerEditProduct from "./seller/pages/SellerEditProduct";
import SellerRefundRequests from "./seller/pages/RefundRequests";
import SellerList from "./admin/pages/SellerList";
import SellerDetails from "./admin/pages/SellerDetails";
import SellerStripeConnect from "./seller/pages/SellerStripeConnect";
import SellerStripeOnboardingComplete from "./seller/pages/SellerStripeOnboardingComplete";
import SellerAiProduct from "./seller/pages/SellerAIProduct";
import SellerInvoices from "./seller/pages/SellerInvoices";
import SellerInvoiceDetails from "./seller/pages/SellerInvoiceDetails";


function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      dispatch(fetchCart());
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>

        {/* ================= CUSTOMER ROUTES ================= */}
       
{/* 
       <Route
  path="/my-orders/:id"
  element={
    <PrivateRoute>
      <OrderDetails />
    </PrivateRoute>
  }
/> */}

<Route
  path="/my-orders/:id"
  element={
    <PrivateRoute>
      <MyOrderDetails />
    </PrivateRoute>
  }
/>


        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

     <Route
  path="/reset-password/:token"
  element={<ResetPassword />}
/>

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
  path="/shop/sellers"
  element={<ShopBySeller />}
/>

<Route
  path="/shop/sellers/:sellerId"
  element={<SellerStore />}
/>

        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />

        <Route
  path="/inventory"
  element={<Inventory />}
/>

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
  path="/become-seller"
  element={
    <PrivateRoute>
      <BecomeSeller />
    </PrivateRoute>
  }
/>
    <Route
  path="/payment-success"
  element={
    <PrivateRoute>
      <PaymentSuccess />
    </PrivateRoute>
  }
/>

        <Route
  path="/my-orders"
  element={
    <PrivateRoute>
      <CustomerOrders />
    </PrivateRoute>
  }
/>

        <Route
          path="/my-invoices"
          element={
            <PrivateRoute>
              <MyInvoices />
            </PrivateRoute>
          }
        />

        <Route
          path="/my-invoices/:id"
          element={
            <PrivateRoute>
              <MyInvoiceDetails />
            </PrivateRoute>
          }
        />

        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >

          <Route
  path="refunds"
  element={<AdminRefundRequests />}
/>



          <Route
  path="sellers"
  element={<SellerList />}
/>

<Route
  path="sellers/:id"
  element={<SellerDetails />}
/>

          <Route
            index
            element={<Dashboard />}
          />


          <Route
            path="products"
            element={<Products />}
          />
          
          <Route
            path="customers/:id"
            element={<CustomerDetails />}
          />
          <Route
  path="seller-products"
  element={<SellerProductApprovals />}
/>
          
          <Route
  path="customers"
  element={<Customers />}
/>

          <Route
            path="products/add"
            element={<AddProduct />}
          />

          <Route
  path="products/ai"
  element={<AdminAiProduct />}
/>

          <Route
            path="products/edit/:id"
            element={<EditProduct />}
          />

          <Route
  path="orders"
  element={<AdminOrders />}
/>

          <Route
  path="orders/:id"
  element={<OrderDetails />}
  />

          <Route
            path="invoices"
            element={<AdminInvoices />}
          />

          <Route
            path="invoices/:id"
            element={<AdminInvoiceDetails />}
          />

          <Route
            path="categories"
            element={<Categories />}
          />


          <Route
  path="seller-applications"
  element={<SellerApplications />}
/>
        </Route>


        {/* ================= SELLER ROUTES ================= */}

       {/* ================= SELLER ROUTES ================= */}
{/* ================= SELLER ROUTES ================= */}

<Route
  path="/seller"
  element={
    <SellerRoute>
      <SellerLayout />
    </SellerRoute>
  }
>
  {/* Seller Dashboard */}
  <Route
    index
    element={<SellerDashboard />}
  />

  {/* Seller Products */}
  <Route
    path="products"
    element={<SellerProducts />}
  />

  <Route
  path="stripe-connect"
  element={<SellerStripeConnect />}
/>

<Route
  path="stripe/onboarding/complete"
  element={<SellerStripeOnboardingComplete />}
/>

  <Route
  path="refunds"
  element={<SellerRefundRequests />}
/>

  {/* Add Product */}
  <Route
    path="products/add"
    element={<SellerAddProduct />}
  />

   {/* AI Add Product */}
<Route
  path="products/add-ai"
  element={<SellerAiProduct />}
/>

  <Route
  path="products/edit/:id"
  element={<SellerEditProduct />}
/>

  {/* Seller Orders */}
  <Route
    path="orders"
    element={<SellerOrders />}
  />

  {/* Seller Order Details */}
  <Route
  path="orders/:id"
  element={<SellerOrderDetails />}
  />

  <Route
    path="invoices"
    element={<SellerInvoices />}
  />

  <Route
    path="invoices/:id"
    element={<SellerInvoiceDetails />}
  />



  {/* Seller Settings */}
  <Route
    path="settings"
    element={
      <div>
        Seller Settings
      </div>
    }
  />
</Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
