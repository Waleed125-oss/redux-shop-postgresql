import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchSellerDashboardStats,
} from "../../store/slices/sellerSlice";

function SellerDashboard() {
  const dispatch = useDispatch();

  const {
    statistics,
    loading,
    error,
  } = useSelector((state) => state.seller);

  // ========================================
  // FETCH DASHBOARD STATS
  // ========================================

  useEffect(() => {
    dispatch(fetchSellerDashboardStats());
  }, [dispatch]);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Seller Dashboard
        </h1>

        <p className="mt-4 text-gray-500">
          Loading dashboard statistics...
        </p>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Seller Dashboard
        </h1>

        <p className="mt-4 text-red-600">
          {error}
        </p>
      </div>
    );
  }

  // ========================================
  // VALUES
  // ========================================

  const totalProducts =
    statistics?.products?.total ?? 0;

  const totalOrders =
    statistics?.orders?.total ?? 0;

  const totalRevenue =
    statistics?.orders?.revenue ?? 0;

  return (
    <div>

      {/* ================= HEADER ================= */}

      <h1 className="text-3xl font-bold text-gray-800">
        Seller Dashboard
      </h1>

      <p className="mt-2 text-gray-500">
        Welcome to your seller dashboard.
      </p>


      {/* ================= STATISTICS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

        {/* PRODUCTS */}

        <div className="bg-white p-6 rounded-xl shadow">

          <p className="text-gray-500">
            Products
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {totalProducts}
          </h2>

        </div>


        {/* ORDERS */}

        <div className="bg-white p-6 rounded-xl shadow">

          <p className="text-gray-500">
            Orders
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {totalOrders}
          </h2>

        </div>


        {/* SALES */}

        <div className="bg-white p-6 rounded-xl shadow">

          <p className="text-gray-500">
            Sales
          </p>

          <h2 className="text-3xl font-bold mt-2">
            Rs. {Number(totalRevenue).toLocaleString()}
          </h2>

        </div>

      </div>

    </div>
  );
}

export default SellerDashboard;