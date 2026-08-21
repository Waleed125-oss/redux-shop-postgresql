import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchSingleOrder } from "../store/slices/orderSlice";
import Navbar from "../components/Navbar";

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


  // ================= FETCH ORDER =================

  useEffect(() => {

    dispatch(fetchSingleOrder(id));

  }, [dispatch, id]);


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

                      ${Number(item.price).toLocaleString()}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>


          {/* ================= TOTAL ================= */}

          <div className="flex justify-end mt-8">

            <div className="text-xl font-bold">

              Total: $
              {Number(
                selectedOrder.order.total_amount
              ).toLocaleString()}

            </div>

          </div>

        </div>

      </div>
    </>
  );
}

export default MyOrderDetails;