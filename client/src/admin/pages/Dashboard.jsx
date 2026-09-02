import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaBoxOpen,
  FaUsers,
  FaArrowUp,
  FaClock,
} from "react-icons/fa";

import { fetchDashboard } from "../../store/slices/adminDashboardSlice";
import { formatPrice } from "../../services/currency";

function Dashboard() {
  const dispatch = useDispatch();

  const {
    statistics,
    recentOrders,
    loading,
    error,
  } = useSelector((state) => state.adminDashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  // -----------------------------
  // Loading
  // -----------------------------

  if (loading) {
    return (
      <div className="space-y-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Loading your store statistics...
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl shadow-sm p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          ))}

        </div>

      </div>
    );
  }

  // -----------------------------
  // Error
  // -----------------------------

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">

        <h2 className="text-lg font-semibold text-red-700">
          Failed to load dashboard
        </h2>

        <p className="text-red-600 mt-2">
          {error}
        </p>

        <button
          onClick={() => dispatch(fetchDashboard())}
          className="mt-4 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>

      </div>
    );
  }

  // -----------------------------
  // Dashboard Cards
  // -----------------------------

  const stats = [
    {
      title: "Total Revenue",
      value: formatPrice(statistics.revenue),
      icon: <FaMoneyBillWave size={22} />,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },

    {
      title: "Total Orders",
      value: Number(statistics.orders).toLocaleString(),
      icon: <FaShoppingCart size={22} />,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },

    {
      title: "Total Products",
      value: Number(statistics.products).toLocaleString(),
      icon: <FaBoxOpen size={22} />,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },

    {
      title: "Total Customers",
      value: Number(statistics.customers).toLocaleString(),
      icon: <FaUsers size={22} />,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  // -----------------------------
  // Status Badge
  // -----------------------------

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";

      case "shipped":
        return "bg-blue-100 text-blue-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // -----------------------------
  // Date Formatting
  // -----------------------------

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Overview of your store performance
          </p>

        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">

          <FaClock />

          <span>
            Updated just now
          </span>

        </div>

      </div>


      {/* ================= STATISTICS ================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        {stats.map((item) => (

          <div
            key={item.title}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md"
          >

            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0 flex-1">

                <p className="text-sm font-medium text-gray-500">
                  {item.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-gray-800">
                  {item.value}
                </h2>

                <div className="mt-3 flex items-center gap-1 text-sm text-green-600">

                  <FaArrowUp size={11} />

                  <span>
                    Current total
                  </span>

                </div>

              </div>

              <div
                className={`${item.iconBg} ${item.iconColor} flex h-14 w-14 items-center justify-center rounded-xl shrink-0`}
              >
                {item.icon}
              </div>

            </div>

          </div>

        ))}

      </div>


      {/* ================= RECENT ORDERS ================= */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

        {/* Header */}

        <div className="flex items-center justify-between px-6 py-5 border-b">

          <div>

            <h2 className="text-xl font-semibold text-gray-800">
              Recent Orders
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Latest orders placed by customers
            </p>

          </div>

          <span className="text-sm text-gray-500">
            Latest {recentOrders.length}
          </span>

        </div>


        {/* Desktop Table */}

        <div className="hidden md:block overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="text-left text-sm text-gray-500 bg-gray-50">

                <th className="px-6 py-4 font-medium">
                  Order ID
                </th>

                <th className="px-6 py-4 font-medium">
                  Customer
                </th>

                <th className="px-6 py-4 font-medium">
                  Email
                </th>

                <th className="px-6 py-4 font-medium">
                  Total
                </th>

                <th className="px-6 py-4 font-medium">
                  Status
                </th>

                <th className="px-6 py-4 font-medium">
                  Date
                </th>

              </tr>

            </thead>


            <tbody>

              {recentOrders.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="text-center py-10 text-gray-500"
                  >
                    No orders found.
                  </td>

                </tr>

              ) : (

                recentOrders.map((order) => (

                  <tr
                    key={order.id}
                    className="border-t hover:bg-gray-50 transition"
                  >

                    <td className="px-6 py-5 font-semibold text-gray-800">
                      #{order.id}
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {order.customer_name}
                    </td>

                    <td className="px-6 py-5 text-gray-500">
                      {order.customer_email}
                    </td>

                    <td className="px-6 py-5 font-semibold text-gray-800">
                      {formatPrice(order.total_amount)}
                    </td>

                    <td className="px-6 py-5">

                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>

                    </td>

                    <td className="px-6 py-5 text-gray-500">
                      {formatDate(order.created_at)}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>


        {/* Mobile Cards */}

        <div className="md:hidden divide-y">

          {recentOrders.length === 0 ? (

            <div className="text-center py-10 text-gray-500">
              No orders found.
            </div>

          ) : (

            recentOrders.map((order) => (

              <div
                key={order.id}
                className="p-5 space-y-3"
              >

                <div className="flex justify-between">

                  <span className="font-semibold">
                    Order #{order.id}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>

                </div>

                <p className="text-gray-700">
                  {order.customer_name}
                </p>

                <p className="text-sm text-gray-500">
                  {order.customer_email}
                </p>

                <div className="flex justify-between text-sm">

                  <span className="font-semibold">
                    {formatPrice(order.total_amount)}
                  </span>

                  <span className="text-gray-500">
                    {formatDate(order.created_at)}
                  </span>

                </div>

              </div>

            ))

          )}

        </div>

      </div>


      {/* ================= PERFORMANCE SUMMARY ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-xl font-semibold text-gray-800">
                Store Performance
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Current database statistics
              </p>

            </div>

          </div>

          <div className="grid grid-cols-3 gap-4">

            <div className="bg-gray-50 rounded-xl p-5">

              <p className="text-sm text-gray-500">
                Products
              </p>

              <p className="text-2xl font-bold mt-2">
                {statistics.products}
              </p>

            </div>

            <div className="bg-gray-50 rounded-xl p-5">

              <p className="text-sm text-gray-500">
                Customers
              </p>

              <p className="text-2xl font-bold mt-2">
                {statistics.customers}
              </p>

            </div>

            <div className="bg-gray-50 rounded-xl p-5">

              <p className="text-sm text-gray-500">
                Orders
              </p>

              <p className="text-2xl font-bold mt-2">
                {statistics.orders}
              </p>

            </div>

          </div>

        </div>


        {/* Revenue Summary */}

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl shadow-sm p-6">

          <p className="text-blue-100">
            Total Revenue
          </p>

          <h2 className="text-4xl font-bold mt-3">
            $
            {Number(statistics.revenue).toLocaleString()}
          </h2>

          <p className="text-blue-100 text-sm mt-4">
            Calculated from completed store orders.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
