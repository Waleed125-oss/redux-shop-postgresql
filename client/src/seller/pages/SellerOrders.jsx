
import { useEffect } from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchSellerOrders,
} from "../../store/slices/sellerSlice";

function SellerOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    orders,
    ordersLoading,
    ordersError,
  } = useSelector(
    (state) => state.seller
  );

  useEffect(() => {
    dispatch(fetchSellerOrders());
  }, [dispatch]);

  // ================= LOADING =================

  if (ordersLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Orders
        </h1>

        <p className="mt-4 text-gray-500">
          Loading orders...
        </p>
      </div>
    );
  }

  // ================= ERROR =================

  if (ordersError) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Orders
        </h1>

        <div
          className="
            mt-6
            p-4
            bg-red-50
            text-red-600
            rounded-lg
          "
        >
          {ordersError}
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* ================= HEADER ================= */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Orders
        </h1>

        <p className="mt-2 text-gray-500">
          Manage orders containing your products.
        </p>
      </div>


      {/* ================= EMPTY ================= */}

      {orders.length === 0 && (
        <div
          className="
            bg-white
            rounded-xl
            shadow
            p-10
            text-center
          "
        >
          <h2 className="text-xl font-semibold text-gray-700">
            No orders found
          </h2>

          <p className="mt-2 text-gray-500">
            You don't have any orders yet.
          </p>
        </div>
      )}


      {/* ================= ORDERS ================= */}

      {orders.length > 0 && (
        <div
          className="
            bg-white
            rounded-xl
            shadow
            overflow-hidden
          "
        >

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="text-left px-6 py-4">
                  Order ID
                </th>

                <th className="text-left px-6 py-4">
                  Customer
                </th>

                <th className="text-left px-6 py-4">
                  Status
                </th>

                <th className="text-left px-6 py-4">
                  Date
                </th>

                <th className="text-left px-6 py-4">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {orders.map((order) => (

                <tr
                  key={order.order_id}
                  className="border-t"
                >

                  {/* ORDER ID */}

                  <td className="px-6 py-4 font-medium">
                    #{order.order_id}
                  </td>


                  {/* CUSTOMER */}

                  <td className="px-6 py-4">
                    {order.customer_name ||
                      order.user_name ||
                      "Customer"}
                  </td>


                  {/* STATUS */}

                  <td className="px-6 py-4">
                    {order.status}
                  </td>


                  {/* DATE */}

                  <td className="px-6 py-4">
                    {order.created_at
                      ? new Date(
                          order.created_at
                        ).toLocaleDateString()
                      : "-"}
                  </td>


                  {/* ACTION */}

                  <td className="px-6 py-4">

                    <button
                      onClick={() =>
                        navigate(
                          `/seller/orders/${order.order_id}`
                        )
                      }
                      className="
                        px-4
                        py-2
                        bg-blue-600
                        text-white
                        rounded-lg
                        hover:bg-blue-700
                      "
                    >
                      View
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

export default SellerOrders;
