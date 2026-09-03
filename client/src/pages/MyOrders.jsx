// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchOrders } from "../store/slices/orderSlice";
// import { formatPrice } from "../services/currency";

// function MyOrders() {
//   const dispatch = useDispatch();

//   const { orders, loading } = useSelector(
//     (state) => state.orders
//   );

//   useEffect(() => {
//     dispatch(fetchOrders());
//   }, [dispatch]);

//   if (loading) return <h2>Loading...</h2>;

//   return (
//     <div className="max-w-6xl mx-auto mt-10">
//       <h1 className="text-3xl font-bold mb-8">
//         My Orders
//       </h1>

//       {orders.map((order) => (
//         <div
//           key={order.id}
//           className="border rounded-lg p-5 mb-5 shadow"
//         >
//           <h2>Order #{order.id}</h2>
//           <p>Status: {order.status}</p>
//           <p>Total: {formatPrice(order.total_amount)}</p>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default MyOrders;

















import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../store/slices/orderSlice";
import { formatPrice } from "../services/currency";
import {
  requestRefundAPI,
  getCustomerRefundRequestsAPI,
} from "../services/api";
import Footer from "../components/Footer";

function MyOrders() {
  const dispatch = useDispatch();

  const { orders, loading } = useSelector(
    (state) => state.orders
  );

  const [refundOrder, setRefundOrder] = useState(null);
  const [reason, setReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState("");
  const [refundSuccess, setRefundSuccess] = useState("");
  const [refunds, setRefunds] = useState([]);

  useEffect(() => {
    dispatch(fetchOrders());

    getCustomerRefundRequestsAPI()
      .then((data) => setRefunds(data.refundRequests || []))
      .catch(() => setRefunds([]));
  }, [dispatch]);

  const openRefundModal = (order) => {
    setRefundOrder(order);
    setReason("");
    setRefundError("");
    setRefundSuccess("");
  };

  const closeRefundModal = () => {
    if (refundLoading) return;

    setRefundOrder(null);
    setReason("");
    setRefundError("");
  };

  const handleRefundSubmit = async () => {
    if (!reason.trim()) {
      setRefundError("Refund reason is required");
      return;
    }

    try {
      setRefundLoading(true);
      setRefundError("");

      await requestRefundAPI(
        refundOrder.id,
        reason.trim()
      );

      setRefundSuccess(
        "Refund request submitted successfully"
      );

      setRefundOrder(null);
      setReason("");

      // Refresh orders
      dispatch(fetchOrders());
      const data = await getCustomerRefundRequestsAPI();
      setRefunds(data.refundRequests || []);

    } catch (error) {
      setRefundError(
        error.message || "Failed to submit refund request"
      );
    } finally {
      setRefundLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <>
      <div className="max-w-6xl mx-auto mt-10 px-4">

        <h1 className="text-3xl font-bold mb-8">
          My Orders
        </h1>

        {/* SUCCESS MESSAGE */}

        {refundSuccess && (
          <div className="mb-5 p-4 rounded bg-green-100 text-green-700">
            {refundSuccess}
          </div>
        )}

        {/* ORDERS */}

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order) => {

            const canRequestRefund =
              order.payment_status === "paid";

            return (
              <div
                key={order.id}
                className="border rounded-lg p-5 mb-5 shadow"
              >

                <h2 className="text-xl font-semibold">
                  Order #{order.id}
                </h2>

                <p className="mt-2">
                  Status: {order.status}
                </p>

                <p>
                  Total: {formatPrice(order.total_amount)}
                </p>

                {refunds
                  .filter((refund) => Number(refund.order_id) === Number(order.id))
                  .map((refund) => (
                    <div
                      key={refund.id}
                      className={`mt-3 p-3 rounded ${
                        refund.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      Refund request: <strong className="capitalize">
                        {refund.status}
                      </strong>
                      {refund.status === "approved" && (
                        <span> - Payment refunded</span>
                      )}
                    </div>
                  ))}

                {/* REFUND BUTTON */}

                {canRequestRefund && (
                  <button
                    onClick={() => openRefundModal(order)}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Request Refund
                  </button>
                )}

              </div>
            );
          })
        )}

        {/* REFUND MODAL */}

        {refundOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="bg-white rounded-lg p-6 w-full max-w-md">

              <h2 className="text-xl font-bold mb-4">
                Request Refund
              </h2>

              <p className="mb-4 text-gray-600">
                Order #{refundOrder.id}
              </p>

              <label className="block mb-2 font-medium">
                Refund Reason
              </label>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter the reason for requesting a refund..."
                rows={4}
                className="w-full border rounded-lg p-3 outline-none focus:ring-2"
              />

              {/* ERROR */}

              {refundError && (
                <p className="text-red-600 mt-2">
                  {refundError}
                </p>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 mt-5">

              <button
                onClick={closeRefundModal}
                disabled={refundLoading}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleRefundSubmit}
                disabled={refundLoading}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                {refundLoading
                  ? "Submitting..."
                  : "Submit Refund"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default MyOrders;