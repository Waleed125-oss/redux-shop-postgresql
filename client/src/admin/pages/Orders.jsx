
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaEye, FaClipboardList } from "react-icons/fa";

import { fetchOrders } from "../../store/slices/orderSlice";
import { formatPrice } from "../../services/currency";

function Orders() {
  const dispatch = useDispatch();

  const {
    orders,
    loading,
    error,
  } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p className="text-gray-500 text-lg">
          Loading orders...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-5">
        {error}
      </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "processing":
        return "bg-purple-100 text-purple-700";

      case "shipped":
        return "bg-blue-100 text-blue-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}

      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Manage Orders
        </h1>

        <p className="text-gray-500 mt-1">
          View and manage customer orders
        </p>
      </div>


      {/* ================= ORDER COUNT ================= */}

      <div className="bg-white rounded-xl shadow-sm border p-5">

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <FaClipboardList size={22} />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="text-2xl font-bold text-gray-800">
              {orders.length}
            </p>
          </div>

        </div>

      </div>


      {/* ================= TABLE ================= */}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        <div className="px-6 py-5 border-b">

          <h2 className="text-lg font-semibold text-gray-800">
            Orders
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            All orders placed by customers
          </p>

        </div>


        {/* IMPORTANT: Responsive horizontal scrolling */}

        <div className="w-full overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead className="bg-gray-50 border-b">

              <tr>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Order ID
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Total
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Date
                </th>

                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {orders.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No orders found.
                  </td>

                </tr>

              ) : (

                orders.map((order) => (

                  <tr
                    key={order.id}
                    className="border-b last:border-b-0 hover:bg-gray-50 transition"
                  >

                    {/* ORDER ID */}

                    <td className="px-6 py-5">

                      <span className="font-semibold text-gray-800">
                        #{order.id}
                      </span>

                    </td>


                    {/* TOTAL */}

                    <td className="px-6 py-5">

                      <span className="font-semibold text-gray-800">
                        {formatPrice(order.total_amount)}
                      </span>

                    </td>


                    {/* STATUS */}

                    <td className="px-6 py-5">

                      <span
                        className={`
                          inline-flex
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-semibold
                          ${getStatusStyle(order.status)}
                        `}
                      >
                        {order.status}
                      </span>

                    </td>


                    {/* DATE */}

                    <td className="px-6 py-5 text-gray-600">

                      {new Date(
                        order.created_at
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}

                    </td>


                    {/* ACTION */}

                    <td className="px-6 py-5 text-right whitespace-nowrap">

                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="
                          inline-flex
                          items-center
                          gap-2
                          bg-blue-600
                          hover:bg-blue-700
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          transition
                        "
                      >

                        <FaEye size={14} />

                        View

                      </Link>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Orders;