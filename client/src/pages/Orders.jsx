import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../store/slices/orderSlice";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { formatPrice } from "../services/currency";

function Orders() {
  const dispatch = useDispatch();

  const { orders, loading } = useSelector(
    (state) => state.orders
  );

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto py-10 px-5">

        <h1 className="text-3xl font-bold mb-8">
          My Orders
        </h1>

        {loading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white shadow rounded-xl p-10 text-center">
            <h2 className="text-xl font-semibold">
              No Orders Yet
            </h2>

            <p className="text-gray-500 mt-2">
              Start shopping to place your first order.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {orders.map((order) => (

              <div
                key={order.id}
                className="bg-white rounded-xl shadow p-6 flex justify-between items-center"
              >

                <div>

                  <h2 className="font-bold text-lg">
                    Order #{order.id}
                  </h2>

                  <p className="text-gray-500">
                    Total: {formatPrice(order.total_amount)}
                  </p>

                  <p className="text-gray-500">
                    Status:
                    <span className="ml-2 font-semibold text-blue-600">
                      {order.status}
                    </span>
                  </p>

                </div>
<Link
    to={`/my-orders/${order.id}`}
    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
>
    View Details
</Link>

              </div>

            ))}

          </div>
        )}

      </div>
      <Footer />
    </>
  );
}

export default Orders;