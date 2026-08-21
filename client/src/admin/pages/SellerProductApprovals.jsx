
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchPendingSellerProducts,
  approveSellerProduct,
  rejectSellerProduct,
} from "../../store/slices/adminProductSlice";

function SellerProductApprovals() {
  const dispatch = useDispatch();

  const {
    products,
    loading,
    actionLoading,
    error,
  } = useSelector((state) => state.adminProducts);

  // ========================================
  // FETCH PENDING SELLER PRODUCTS
  // ========================================

  useEffect(() => {
    dispatch(fetchPendingSellerProducts());
  }, [dispatch]);

  // ========================================
  // APPROVE PRODUCT
  // ========================================

  const handleApprove = (id) => {
    dispatch(approveSellerProduct(id));
  };

  // ========================================
  // REJECT PRODUCT
  // ========================================

  const handleReject = (id) => {
    const reason = window.prompt(
      "Enter rejection reason:"
    );

    // Cancel pressed
    if (reason === null) {
      return;
    }

    // Empty reason
    if (reason.trim() === "") {
      alert("Please enter a rejection reason.");
      return;
    }

    dispatch(
      rejectSellerProduct({
        id,
        reason: reason.trim(),
      })
    );
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Seller Product Approvals
        </h1>

        <p className="mt-4 text-gray-500">
          Loading pending products...
        </p>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Seller Product Approvals
        </h1>

        <p className="mt-4 text-red-600">
          {error}
        </p>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div>

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Seller Product Approvals
        </h1>

        <p className="mt-2 text-gray-500">
          Review and approve products submitted by sellers.
        </p>
      </div>


      {/* PENDING COUNT */}

      <div className="mt-6">

        <div className="inline-block bg-yellow-50 border border-yellow-200 rounded-lg px-5 py-3">

          <span className="text-gray-600">
            Pending Products:
          </span>

          <span className="ml-2 font-bold text-yellow-700">
            {products.length}
          </span>

        </div>

      </div>


      {/* PRODUCTS TABLE */}

      <div className="mt-8 bg-white rounded-xl shadow overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-4 text-left">
                  Product
                </th>

                <th className="px-6 py-4 text-left">
                  Seller
                </th>

                <th className="px-6 py-4 text-left">
                  Category
                </th>

                <th className="px-6 py-4 text-left">
                  Price
                </th>

                <th className="px-6 py-4 text-left">
                  Approval
                </th>

                <th className="px-6 py-4 text-left">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {products.map((product) => (

                <tr
                  key={product.id}
                  className="border-t"
                >

                  {/* PRODUCT */}

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      {product.image ? (
                        <img
                          src={`http://localhost:5000${product.image}`}
                          alt={product.title}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}

                      <div>

                        <p className="font-medium text-gray-800">
                          {product.title}
                        </p>

                      </div>

                    </div>

                  </td>


                  {/* SELLER */}

                  <td className="px-6 py-4">

                    <div>

                      <p className="font-medium text-gray-800">
                        {product.seller_name || "Unknown Seller"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {product.seller_email || ""}
                      </p>

                    </div>

                  </td>


                  {/* CATEGORY */}

                  <td className="px-6 py-4">

                    {product.category || "Uncategorized"}

                  </td>


                  {/* PRICE */}

                  <td className="px-6 py-4">

                    Rs.{" "}
                    {Number(
                      product.price
                    ).toLocaleString()}

                  </td>


                  {/* APPROVAL STATUS */}

                  <td className="px-6 py-4">

                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                      {product.approval_status}
                    </span>

                  </td>


                  {/* ACTIONS */}

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      {/* APPROVE */}

                      <button
                        onClick={() =>
                          handleApprove(product.id)
                        }
                        disabled={actionLoading}
                        className="
                          px-4
                          py-2
                          bg-green-600
                          text-white
                          rounded-lg
                          hover:bg-green-700
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      >
                        Approve
                      </button>


                      {/* REJECT */}

                      <button
                        onClick={() =>
                          handleReject(product.id)
                        }
                        disabled={actionLoading}
                        className="
                          px-4
                          py-2
                          bg-red-600
                          text-white
                          rounded-lg
                          hover:bg-red-700
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      >
                        Reject
                      </button>

                    </div>

                  </td>

                </tr>

              ))}


              {/* NO PRODUCTS */}

              {products.length === 0 && (

                <tr>

                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center"
                  >

                    <p className="text-gray-500 text-lg">
                      No pending seller products.
                    </p>

                    <p className="text-gray-400 text-sm mt-1">
                      New seller products will appear here
                      after they are submitted.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default SellerProductApprovals;
