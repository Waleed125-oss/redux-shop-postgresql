import { useEffect, useState } from "react";
import {
  getSellerRefundRequestsAPI,
  approveSellerRefundAPI,
} from "../../services/api";
import { formatPrice } from "../../services/currency";

function RefundRequests() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [error, setError] = useState("");

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSellerRefundRequestsAPI();

      setRefunds(data.refundRequests || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleApprove = async (refundId) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this refund? The Stripe payment will be refunded."
    );

    if (!confirmed) return;

    try {
      setApproving(refundId);
      setError("");

      await approveSellerRefundAPI(refundId);

      await fetchRefunds();
    } catch (error) {
      setError(error.message);
    } finally {
      setApproving(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">
          Loading refund requests...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Refund Requests
        </h1>

        <p className="text-gray-500 mt-2">
          Refund requests for your products.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600">
          {error}
        </div>
      )}

      {refunds.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-500">
            No refund requests found.
          </p>
        </div>
      ) : (
        <div className="space-y-5">

          {refunds.map((refund) => (
            <div
              key={refund.id}
              className="bg-white rounded-xl shadow p-6"
            >

              <div className="flex justify-between items-start">

                <div>
                  <h2 className="text-xl font-bold">
                    Refund #{refund.id}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Order #{refund.order_id}
                  </p>
                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${
                    refund.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : refund.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {refund.status}
                </span>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

                <div>
                  <p className="text-sm text-gray-500">
                    Customer
                  </p>

                  <p className="font-medium">
                    {refund.customer_name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {refund.customer_email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Product
                  </p>

                  <p className="font-medium">
                    {refund.products}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Order Total
                  </p>

                  <p className="font-medium">
                    {formatPrice(refund.total_amount)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Payment Status
                  </p>

                  <p className="font-medium capitalize">
                    {refund.payment_status}
                  </p>
                </div>

              </div>

              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Refund Reason
                </p>

                <p className="mt-1">
                  {refund.reason}
                </p>
              </div>

              {refund.status === "pending" && (
                <div className="mt-6 flex justify-end">

                  <button
                    onClick={() => handleApprove(refund.id)}
                    disabled={approving === refund.id}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {approving === refund.id
                      ? "Processing..."
                      : "Approve Refund"}
                  </button>

                </div>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default RefundRequests;