// import { useEffect } from "react";

// import {
//   useDispatch,
//   useSelector,
// } from "react-redux";

// import {
//   useNavigate,
//   useParams,
// } from "react-router-dom";

// import {
//   fetchSellerOrderDetail,
// } from "../../store/slices/sellerSlice";
// import { formatPrice } from "../../services/currency";

// function SellerOrderDetails() {
//   const { id } = useParams();

//   const dispatch = useDispatch();

//   const navigate = useNavigate();

//   const {
//     selectedOrder,
//     orderDetailLoading,
//     orderDetailError,
//   } = useSelector(
//     (state) => state.seller
//   );

//   // ================= FETCH ORDER =================

//   useEffect(() => {
//     if (id) {
//       dispatch(
//         fetchSellerOrderDetail(id)
//       );
//     }
//   }, [dispatch, id]);

//   // ================= LOADING =================

//   if (orderDetailLoading) {
//     return (
//       <div>
//         <h1 className="text-3xl font-bold text-gray-800">
//           Order Details
//         </h1>

//         <p className="mt-4 text-gray-500">
//           Loading order details...
//         </p>
//       </div>
//     );
//   }

//   // ================= ERROR =================

//   if (orderDetailError) {
//     return (
//       <div>
//         <h1 className="text-3xl font-bold text-gray-800">
//           Order Details
//         </h1>

//         <div
//           className="
//             mt-6
//             p-4
//             bg-red-50
//             text-red-600
//             rounded-lg
//           "
//         >
//           {orderDetailError}
//         </div>

//         <button
//           onClick={() =>
//             navigate("/seller/orders")
//           }
//           className="
//             mt-4
//             px-5
//             py-2
//             bg-blue-600
//             text-white
//             rounded-lg
//             hover:bg-blue-700
//           "
//         >
//           Back to Orders
//         </button>
//       </div>
//     );
//   }

//   // ================= NO ORDER =================

//   if (!selectedOrder) {
//     return (
//       <div>
//         <h1 className="text-3xl font-bold text-gray-800">
//           Order Details
//         </h1>

//         <p className="mt-4 text-gray-500">
//           Order not found.
//         </p>

//         <button
//           onClick={() =>
//             navigate("/seller/orders")
//           }
//           className="
//             mt-4
//             px-5
//             py-2
//             bg-blue-600
//             text-white
//             rounded-lg
//             hover:bg-blue-700
//           "
//         >
//           Back to Orders
//         </button>
//       </div>
//     );
//   }

//   // ================= ORDER DATA =================

//   const order = selectedOrder;

//   const items = order.items || [];

//   // ================= PAGE =================

//   return (
//     <div>

//       {/* ================= HEADER ================= */}

//       <div
//         className="
//           flex
//           items-center
//           justify-between
//           mb-8
//         "
//       >
//         <div>

//           <h1 className="text-3xl font-bold text-gray-800">
//             Order Details
//           </h1>

//           <p className="mt-2 text-gray-500">
//             Order #{order.orderId}
//           </p>

//         </div>

//         <button
//           onClick={() =>
//             navigate("/seller/orders")
//           }
//           className="
//             px-5
//             py-2
//             bg-gray-200
//             text-gray-700
//             rounded-lg
//             hover:bg-gray-300
//           "
//         >
//           Back to Orders
//         </button>

//       </div>


//       {/* ================= ORDER INFORMATION ================= */}

//       <div
//         className="
//           bg-white
//           rounded-xl
//           shadow
//           p-6
//           mb-6
//         "
//       >

//         <h2
//           className="
//             text-xl
//             font-semibold
//             text-gray-800
//             mb-6
//           "
//         >
//           Order Information
//         </h2>

//         <div
//           className="
//             grid
//             grid-cols-1
//             md:grid-cols-3
//             gap-6
//           "
//         >

//           {/* ORDER ID */}

//           <div>

//             <p className="text-sm text-gray-500">
//               Order ID
//             </p>

//             <p className="mt-1 font-semibold text-gray-800">
//               #{order.orderId}
//             </p>

//           </div>


//           {/* STATUS */}

//           <div>

//             <p className="text-sm text-gray-500">
//               Status
//             </p>

//             <p className="mt-1 font-semibold text-gray-800">
//               {order.status || "-"}
//             </p>

//           </div>


//           {/* DATE */}

//           <div>

//             <p className="text-sm text-gray-500">
//               Order Date
//             </p>

//             <p className="mt-1 font-semibold text-gray-800">

//               {order.createdAt
//                 ? new Date(
//                     order.createdAt
//                   ).toLocaleDateString()
//                 : "-"}

//             </p>

//           </div>

//         </div>

//       </div>


//       {/* ================= PRODUCTS ================= */}

//       <div
//         className="
//           bg-white
//           rounded-xl
//           shadow
//           overflow-hidden
//           mb-6
//         "
//       >

//         <div className="p-6 border-b">

//           <h2
//             className="
//               text-xl
//               font-semibold
//               text-gray-800
//             "
//           >
//             Products
//           </h2>

//         </div>


//         <div className="overflow-x-auto">

//           <table className="w-full">

//             <thead className="bg-gray-50">

//               <tr>

//                 <th className="text-left px-6 py-4">
//                   Product
//                 </th>

//                 <th className="text-left px-6 py-4">
//                   Quantity
//                 </th>

//                 <th className="text-left px-6 py-4">
//                   Price
//                 </th>

//                 <th className="text-left px-6 py-4">
//                   Subtotal
//                 </th>

//               </tr>

//             </thead>


//             <tbody>

//               {items.map((item) => (

//                 <tr
//                   key={item.orderItemId}
//                   className="border-t"
//                 >

//                   {/* PRODUCT */}

//                   <td className="px-6 py-4">

//                     <div
//                       className="
//                         flex
//                         items-center
//                         gap-3
//                       "
//                     >

//                       {item.productImage && (

//                         <img
//                           src={
//                             item.productImage.startsWith(
//                               "http"
//                             )
//                               ? item.productImage
//                               : `http://localhost:5000${item.productImage}`
//                           }
//                           alt={
//                             item.productTitle
//                           }
//                           className="
//                             w-14
//                             h-14
//                             object-cover
//                             rounded-lg
//                           "
//                         />

//                       )}

//                       <p
//                         className="
//                           font-medium
//                           text-gray-800
//                         "
//                       >
//                         {item.productTitle}
//                       </p>

//                     </div>

//                   </td>


//                   {/* QUANTITY */}

//                   <td className="px-6 py-4">
//                     {item.quantity}
//                   </td>


//                   {/* PRICE */}

//                   <td className="px-6 py-4">
//                     {formatPrice(item.price)}
//                   </td>


//                   {/* SUBTOTAL */}

//                   <td
//                     className="
//                       px-6
//                       py-4
//                       font-medium
//                     "
//                   >
//                     {formatPrice(item.subtotal)}
//                   </td>

//                 </tr>

//               ))}


//               {items.length === 0 && (

//                 <tr>

//                   <td
//                     colSpan="4"
//                     className="
//                       px-6
//                       py-10
//                       text-center
//                       text-gray-500
//                     "
//                   >
//                     No products found for this order.
//                   </td>

//                 </tr>

//               )}

//             </tbody>

//           </table>

//         </div>

//       </div>


//       {/* ================= TOTAL ================= */}

//       <div
//         className="
//           bg-white
//           rounded-xl
//           shadow
//           p-6
//         "
//       >

//         <div className="flex justify-end">

//           <div className="w-full md:w-80">

//             <div
//               className="
//                 flex
//                 justify-between
//                 py-3
//                 text-lg
//                 font-semibold
//               "
//             >

//               <span>
//                 Your Products Total
//               </span>

//               <span>
//                 {formatPrice(order.total)}
//               </span>

//             </div>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }

// export default SellerOrderDetails;
































import { useEffect } from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  fetchSellerOrderDetail,
} from "../../store/slices/sellerSlice";

import { formatPrice } from "../../services/currency";

function SellerOrderDetails() {
  const { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    selectedOrder,
    orderDetailLoading,
    orderDetailError,
  } = useSelector(
    (state) => state.seller
  );

  // ================= FETCH ORDER =================

  useEffect(() => {
    if (id) {
      dispatch(
        fetchSellerOrderDetail(id)
      );
    }
  }, [dispatch, id]);

  // ================= LOADING =================

  if (orderDetailLoading) {
    return (
      <div className="w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Order Details
        </h1>

        <p className="mt-4 text-sm sm:text-base text-gray-500">
          Loading order details...
        </p>
      </div>
    );
  }

  // ================= ERROR =================

  if (orderDetailError) {
    return (
      <div className="w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Order Details
        </h1>

        <div
          className="
            mt-6
            p-4
            bg-red-50
            text-red-600
            rounded-lg
            text-sm
            sm:text-base
            break-words
          "
        >
          {orderDetailError}
        </div>

        <button
          onClick={() =>
            navigate("/seller/orders")
          }
          className="
            mt-4
            w-full
            sm:w-auto
            px-5
            py-2
            bg-blue-600
            text-white
            rounded-lg
            hover:bg-blue-700
          "
        >
          Back to Orders
        </button>
      </div>
    );
  }

  // ================= NO ORDER =================

  if (!selectedOrder) {
    return (
      <div className="w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Order Details
        </h1>

        <p className="mt-4 text-sm sm:text-base text-gray-500">
          Order not found.
        </p>

        <button
          onClick={() =>
            navigate("/seller/orders")
          }
          className="
            mt-4
            w-full
            sm:w-auto
            px-5
            py-2
            bg-blue-600
            text-white
            rounded-lg
            hover:bg-blue-700
          "
        >
          Back to Orders
        </button>
      </div>
    );
  }

  // ================= ORDER DATA =================

  const order = selectedOrder;

  const items = order.items || [];

  // ================= PAGE =================

  return (
    <div className="w-full min-w-0">

      {/* ================= HEADER ================= */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
          mb-6
          sm:mb-8
        "
      >
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Order Details
          </h1>

          <p className="mt-2 text-sm sm:text-base text-gray-500 break-words">
            Order #{order.orderId}
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/seller/orders")
          }
          className="
            w-full
            sm:w-auto
            shrink-0
            px-5
            py-2
            bg-gray-200
            text-gray-700
            rounded-lg
            hover:bg-gray-300
          "
        >
          Back to Orders
        </button>
      </div>


      {/* ================= ORDER INFORMATION ================= */}

      <div
        className="
          bg-white
          rounded-xl
          shadow
          p-4
          sm:p-6
          mb-6
          w-full
        "
      >
        <h2
          className="
            text-lg
            sm:text-xl
            font-semibold
            text-gray-800
            mb-5
            sm:mb-6
          "
        >
          Order Information
        </h2>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            gap-5
            sm:gap-6
          "
        >

          {/* ORDER ID */}

          <div className="min-w-0">
            <p className="text-sm text-gray-500">
              Order ID
            </p>

            <p className="mt-1 font-semibold text-gray-800 break-words">
              #{order.orderId}
            </p>
          </div>


          {/* STATUS */}

          <div className="min-w-0">
            <p className="text-sm text-gray-500">
              Status
            </p>

            <p className="mt-1 font-semibold text-gray-800 capitalize break-words">
              {order.status || "-"}
            </p>
          </div>


          {/* DATE */}

          <div className="min-w-0">
            <p className="text-sm text-gray-500">
              Order Date
            </p>

            <p className="mt-1 font-semibold text-gray-800">
              {order.createdAt
                ? new Date(
                    order.createdAt
                  ).toLocaleDateString()
                : "-"}
            </p>
          </div>

        </div>
      </div>


      {/* ================= PRODUCTS ================= */}

      <div
        className="
          bg-white
          rounded-xl
          shadow
          overflow-hidden
          mb-6
          w-full
        "
      >

        <div className="p-4 sm:p-6 border-b">
          <h2
            className="
              text-lg
              sm:text-xl
              font-semibold
              text-gray-800
            "
          >
            Products
          </h2>
        </div>


        {/* Horizontal scroll on small screens */}

        <div className="w-full overflow-x-auto">

          <table className="w-full min-w-[650px]">

            <thead className="bg-gray-50">

              <tr>

                <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base">
                  Product
                </th>

                <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base">
                  Quantity
                </th>

                <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base">
                  Price
                </th>

                <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base">
                  Subtotal
                </th>

              </tr>

            </thead>


            <tbody>

              {items.map((item) => (

                <tr
                  key={item.orderItemId}
                  className="border-t"
                >

                  {/* PRODUCT */}

                  <td className="px-4 sm:px-6 py-4">

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        min-w-0
                      "
                    >

                      {item.productImage && (

                        <img
                          src={
                            item.productImage.startsWith(
                              "http"
                            )
                              ? item.productImage
                              : `http://localhost:5000${item.productImage}`
                          }
                          alt={
                            item.productTitle
                          }
                          className="
                            w-12
                            h-12
                            sm:w-14
                            sm:h-14
                            object-cover
                            rounded-lg
                            shrink-0
                          "
                        />

                      )}

                      <p
                        className="
                          font-medium
                          text-gray-800
                          text-sm
                          sm:text-base
                          break-words
                        "
                      >
                        {item.productTitle}
                      </p>

                    </div>

                  </td>


                  {/* QUANTITY */}

                  <td className="px-4 sm:px-6 py-4 text-sm sm:text-base">
                    {item.quantity}
                  </td>


                  {/* PRICE */}

                  <td className="px-4 sm:px-6 py-4 text-sm sm:text-base whitespace-nowrap">
                    {formatPrice(item.price)}
                  </td>


                  {/* SUBTOTAL */}

                  <td
                    className="
                      px-4
                      sm:px-6
                      py-4
                      font-medium
                      text-sm
                      sm:text-base
                      whitespace-nowrap
                    "
                  >
                    {formatPrice(item.subtotal)}
                  </td>

                </tr>

              ))}


              {items.length === 0 && (

                <tr>

                  <td
                    colSpan="4"
                    className="
                      px-6
                      py-10
                      text-center
                      text-sm
                      sm:text-base
                      text-gray-500
                    "
                  >
                    No products found for this order.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>
      </div>


      {/* ================= TOTAL ================= */}

      <div
        className="
          bg-white
          rounded-xl
          shadow
          p-4
          sm:p-6
          w-full
        "
      >

        <div className="flex justify-end">

          <div className="w-full md:w-80">

            <div
              className="
                flex
                flex-col
                gap-2
                sm:flex-row
                sm:justify-between
                sm:items-center
                py-3
                text-base
                sm:text-lg
                font-semibold
              "
            >

              <span>
                Your Products Total
              </span>

              <span className="whitespace-nowrap">
                {formatPrice(order.total)}
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default SellerOrderDetails;
