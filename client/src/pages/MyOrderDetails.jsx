import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchSingleOrder } from "../store/slices/orderSlice";
import Navbar from "../components/Navbar";
import { formatPrice } from "../services/currency";
import { requestRefundAPI } from "../services/api";

function MyOrderDetails() {

  

  const { id } = useParams();

  const dispatch = useDispatch();

  const {
    selectedOrder,
    loading,
    error,
  } = useSelector(
    (state) => state.orders
  );

  const [refundReason, setRefundReason] = useState("");
const [showRefundForm, setShowRefundForm] = useState(false);
const [refundLoading, setRefundLoading] = useState(false);
const [refundError, setRefundError] = useState("");
const [refundSuccess, setRefundSuccess] = useState("");


  // ================= FETCH ORDER =================

  useEffect(() => {

    dispatch(fetchSingleOrder(id));

  }, [dispatch, id]);


  const handleRefundSubmit = async (e) => {
  e.preventDefault();

  if (!refundReason.trim()) {
    setRefundError("Please provide a reason for the refund.");
    return;
  }

  try {
    setRefundLoading(true);
    setRefundError("");
    setRefundSuccess("");

    const data = await requestRefundAPI(
      selectedOrder.order.id,
      refundReason
    );

    setRefundSuccess(
      data.message || "Refund request submitted successfully."
    );

    setShowRefundForm(false);
    setRefundReason("");
  } catch (error) {
    setRefundError(
      error.message || "Failed to submit refund request."
    );
  } finally {
    setRefundLoading(false);
  }
};

  // ================= LOADING =================

  if (loading || !selectedOrder) {

    return (
      <>
        <Navbar />

        <div className="max-w-7xl mx-auto p-8">

          <p className="text-gray-500">
            Loading order...
          </p>

        </div>
      </>
    );

  }


  // ================= ERROR =================

  if (error) {

    return (
      <>
        <Navbar />

        <div className="max-w-7xl mx-auto p-8">

          <p className="text-red-600">
            {error}
          </p>

        </div>
      </>
    );

  }


  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto py-10 px-5">

        {/* ================= HEADER ================= */}

        <div className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-3xl font-bold">
              Order #{selectedOrder.order.id}
            </h1>

            <p className="text-gray-500 mt-2">
              Order details
            </p>

          </div>

          <Link
            to="/my-orders"
            className="
              bg-gray-800
              text-white
              px-5
              py-2
              rounded-lg
              hover:bg-gray-900
            "
          >
            Back to Orders
          </Link>

        </div>


        {/* ================= ORDER CARD ================= */}

        <div className="bg-white rounded-xl shadow p-6">

          {/* ================= STATUS ================= */}

          <div className="mb-8">

            <p className="text-gray-500 mb-2">
              Order Status
            </p>

            <span
              className="
                inline-flex
                px-4
                py-2
                rounded-full
                bg-blue-50
                text-blue-600
                font-semibold
                capitalize
              "
            >
              {selectedOrder.order.status}
            </span>

            {/* ================= REFUND ================= */}

<div className="mt-6">

  {selectedOrder.order.payment_status === "paid" && (
    <button
      type="button"
      onClick={() => {
        setShowRefundForm(true);
        setRefundError("");
        setRefundSuccess("");
      }}
      className="
        bg-red-600
        text-white
        px-5
        py-2
        rounded-lg
        hover:bg-red-700
        transition
      "
    >
      Request Refund
    </button>

    
  )}
  {/* ================= REFUND FORM ================= */}

{showRefundForm && (
  <div className="mt-5 border rounded-lg p-5 bg-gray-50">

    <h3 className="text-lg font-semibold mb-4">
      Request Refund
    </h3>

    <form onSubmit={handleRefundSubmit}>

      <label className="block text-gray-700 font-medium mb-2">
        Reason for refund
      </label>

      <textarea
        value={refundReason}
        onChange={(e) => setRefundReason(e.target.value)}
        placeholder="Please explain why you want a refund..."
        rows="4"
        className="
          w-full
          border
          rounded-lg
          p-3
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />

      {refundError && (
        <p className="text-red-600 mt-2">
          {refundError}
        </p>
      )}

      <div className="flex gap-3 mt-4">

        <button
          type="submit"
          disabled={refundLoading}
          className="
            bg-blue-600
            text-white
            px-5
            py-2
            rounded-lg
            hover:bg-blue-700
            disabled:opacity-50
          "
        >
          {refundLoading
            ? "Submitting..."
            : "Submit Refund Request"}
        </button>

        <button
          type="button"
          onClick={() => {
            setShowRefundForm(false);
            setRefundReason("");
            setRefundError("");
          }}
          className="
            bg-gray-300
            text-gray-800
            px-5
            py-2
            rounded-lg
            hover:bg-gray-400
          "
        >
          Cancel
        </button>

      </div>

    </form>
  </div>
)}
{refundSuccess && (
  <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-lg">
    <p className="text-green-700 font-medium">
      {refundSuccess}
    </p>
  </div>
)}



</div>

          </div>


          {/* ================= PRODUCTS ================= */}

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="bg-gray-100">

                  <th className="p-4 text-left">
                    Image
                  </th>

                  <th className="p-4 text-left">
                    Product
                  </th>

                  <th className="p-4 text-left">
                    Quantity
                  </th>

                  <th className="p-4 text-left">
                    Price
                  </th>

                </tr>

              </thead>


              <tbody>

                {selectedOrder.items.map((item) => (

                  <tr
                    key={item.id}
                    className="border-b"
                  >

                    {/* IMAGE */}

                    <td className="p-4">

                      <img
                        src={
                          item.image &&
                          item.image.startsWith("http")
                            ? item.image
                            : `${import.meta.env.VITE_API_URL}${item.image}`
                        }
                        alt={item.title}
                        className="
                          w-16
                          h-16
                          object-contain
                          rounded
                        "
                      />

                    </td>


                    {/* PRODUCT */}

                    <td className="p-4 font-medium">

                      {item.title}

                    </td>


                    {/* QUANTITY */}

                    <td className="p-4">

                      {item.quantity}

                    </td>


                    {/* PRICE */}

                    <td className="p-4">

                      {formatPrice(item.price)}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>


          {/* ================= TOTAL ================= */}

          <div className="flex justify-end mt-8">

            <div className="text-xl font-bold">

              Total: {formatPrice(selectedOrder.order.total_amount)}

            </div>

          </div>

        </div>

      </div>
    </>
  );
}

export default MyOrderDetails;