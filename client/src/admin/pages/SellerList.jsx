import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  fetchApprovedSellers,
} from "../../store/slices/adminSellerSlice";

function SellerList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    sellers,
    loading,
    error,
  } = useSelector(
    (state) => state.adminSellers
  );

  useEffect(() => {
    dispatch(fetchApprovedSellers());
  }, [dispatch]);

  // ================= LOADING =================

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Sellers
        </h1>

        <p className="mt-4 text-gray-500">
          Loading approved sellers...
        </p>
      </div>
    );
  }

  // ================= ERROR =================

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Sellers
        </h1>

        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ================= HEADER ================= */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Sellers
        </h1>

        <p className="mt-2 text-gray-500">
          View all approved sellers and their
          products.
        </p>
      </div>

      {/* ================= EMPTY ================= */}

      {sellers.length === 0 && (
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <h2 className="text-xl font-semibold text-gray-700">
            No approved sellers
          </h2>

          <p className="mt-2 text-gray-500">
            There are currently no approved sellers.
          </p>
        </div>
      )}

      {/* ================= SELLERS ================= */}

      {sellers.length > 0 && (
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Seller
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Business
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Products
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {sellers.map((seller) => (
                  <tr
                    key={seller.id}
                    className="border-t hover:bg-gray-50"
                  >
                    {/* SELLER */}

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {seller.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          Seller ID: #{seller.id}
                        </p>
                      </div>
                    </td>

                    {/* BUSINESS */}

                    <td className="px-6 py-4 text-gray-700">
                      {seller.business_name ||
                        "-"}
                    </td>

                    {/* EMAIL */}

                    <td className="px-6 py-4 text-gray-700">
                      {seller.email}
                    </td>

                    {/* PRODUCTS */}

                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">
                        {seller.product_count}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                        Approved
                      </span>
                    </td>

                    <td>
  <button
    onClick={() =>
      navigate(`/admin/sellers/${seller.id}`)
    }
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  >
    View
  </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerList;