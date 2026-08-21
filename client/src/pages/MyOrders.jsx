import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../store/slices/orderSlice";
import { formatPrice } from "../services/currency";

function MyOrders() {
  const dispatch = useDispatch();

  const { orders, loading } = useSelector(
    (state) => state.orders
  );

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-8">
        My Orders
      </h1>

      {orders.map((order) => (
        <div
          key={order.id}
          className="border rounded-lg p-5 mb-5 shadow"
        >
          <h2>Order #{order.id}</h2>
          <p>Status: {order.status}</p>
          <p>Total: {formatPrice(order.total_amount)}</p>
        </div>
      ))}
    </div>
  );
}

export default MyOrders;