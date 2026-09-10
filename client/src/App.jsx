import { lazy, Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { fetchCart } from "./store/slices/cartSlice";
import ShoppingAssistant from "./components/ShoppingAssistant";

// Customer Pages
// Customer Pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Profile = lazy(() => import("./pages/Profile"));
const CustomerOrders = lazy(() => import("./pages/Orders"));
const Inventory = lazy(() => import("./pages/Inventory"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const BecomeSeller = lazy(() => import("./pages/BecomeSeller"));
const ShopBySeller = lazy(() => import("./pages/ShopBySeller"));
const SellerStore = lazy(() => import("./pages/SellerStore"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const MyInvoices = lazy(() => import("./pages/MyInvoices"));
const MyInvoiceDetails = lazy(() => import("./pages/MyInvoiceDetails"));


// Admin Pages
const AdminLayout = lazy(() => import("./admin/components/AdminLayout"));
const SellerApplications = lazy(() => import("./admin/pages/SellerApplications"));
const Dashboard = lazy(() => import("./admin/pages/Dashboard"));
const Products = lazy(() => import("./admin/pages/Products"));
const AddProduct = lazy(() => import("./admin/pages/AddProduct"));
const EditProduct = lazy(() => import("./admin/pages/EditProduct"));
const AdminOrders = lazy(() => import("./admin/pages/Orders"));
const OrderDetails = lazy(() => import("./admin/pages/OrderDetails"));
const Categories = lazy(() => import("./admin/pages/Categories"));
const Customers = lazy(() => import("./admin/pages/Customers"));
const CustomerDetails = lazy(() => import("./admin/pages/CustomerDetails"));
const AdminRefundRequests = lazy(() => import("./admin/pages/RefundRequests"));
const AdminAiProduct = lazy(() => import("./admin/pages/AdminAiProduct"));
const AdminInvoices = lazy(() => import("./admin/pages/Invoices"));
const AdminInvoiceDetails = lazy(() => import("./admin/pages/InvoiceDetails"));
const MyOrderDetails = lazy(() => import("./pages/MyOrderDetails"));



// Route Protection
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import SellerRoute from "./components/SellerRoute";

const SellerLayout = lazy(() => import("./seller/components/SellerLayout"));
const SellerDashboard = lazy(() => import("./seller/pages/Dashboard"));
const SellerProducts = lazy(() => import("./seller/pages/SellerProducts"));
const SellerAddProduct = lazy(() => import("./seller/pages/SellerAddProduct"));
const SellerOrders = lazy(() => import("./seller/pages/SellerOrders"));
const SellerOrderDetails = lazy(() => import("./seller/pages/SellerOrderDetails"));
const SellerProductApprovals = lazy(() => import("./admin/pages/SellerProductApprovals"));
const SellerEditProduct = lazy(() => import("./seller/pages/SellerEditProduct"));
const SellerRefundRequests = lazy(() => import("./seller/pages/RefundRequests"));
const SellerList = lazy(() => import("./admin/pages/SellerList"));
const SellerDetails = lazy(() => import("./admin/pages/SellerDetails"));
const SellerStripeConnect = lazy(() => import("./seller/pages/SellerStripeConnect"));
const SellerStripeOnboardingComplete = lazy(() => import("./seller/pages/SellerStripeOnboardingComplete"));
const SellerAiProduct = lazy(() => import("./seller/pages/SellerAIProduct"));
const SellerInvoices = lazy(() => import("./seller/pages/SellerInvoices"));
const SellerInvoiceDetails = lazy(() => import("./seller/pages/SellerInvoiceDetails"));


function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      dispatch(fetchCart());
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ShoppingAssistant />
      <Suspense
        fallback={
          <main className="grid min-h-[50vh] place-items-center bg-slate-50 px-4 text-slate-600">
            <p className="text-sm font-medium">Loading ReduxShop…</p>
          </main>
        }
      >
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

</Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
