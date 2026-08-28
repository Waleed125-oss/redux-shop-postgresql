import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  fetchSellerDetailsAPI,
} from "../../services/api";

function SellerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);

  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    rejectedProducts: 0,
  });

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // FETCH SELLER DETAILS
  // ========================================

  useEffect(() => {
    const loadSellerDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchSellerDetailsAPI(id);

        setSeller(data.seller);
        setStatistics(data.statistics);
        setProducts(data.products);
      } catch (error) {
        console.error(
          "Seller details error:",
          error
        );

        setError(
          error.message ||
            "Failed to fetch seller details"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSellerDetails();
  }, [id]);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">
          Loading seller details...
        </p>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">
            {error}
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/admin/sellers")
          }
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          ← Back to Sellers
        </button>
      </div>
    );
  }

  // ========================================
  // SELLER NOT FOUND
  // ========================================

  if (!seller) {
    return (
      <div className="p-8">
        <p className="text-gray-600">
          Seller not found.
        </p>

        <button
          onClick={() =>
            navigate("/admin/sellers")
          }
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          ← Back to Sellers
        </button>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="space-y-8">

      {/* ========================================
          BACK BUTTON
      ======================================== */}

      <button
        onClick={() =>
          navigate("/admin/sellers")
        }
        className="text-blue-600 hover:underline"
      >
        ← Back to Sellers
      </button>


      {/* ========================================
          SELLER HEADER
      ======================================== */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {seller.name}
        </h1>

        <p className="text-gray-500 mt-2">
          Seller ID: #{seller.id}
        </p>
      </div>


      {/* ========================================
          SELLER INFORMATION
      ======================================== */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-semibold mb-6">
          Seller Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* SELLER NAME */}

          <div>
            <p className="text-sm text-gray-500">
              Seller Name
            </p>

            <p className="font-medium mt-1">
              {seller.name}
            </p>
          </div>


          {/* EMAIL */}

          <div>
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="font-medium mt-1">
              {seller.email}
            </p>
          </div>


          {/* BUSINESS */}

          <div>
            <p className="text-sm text-gray-500">
              Business
            </p>

            <p className="font-medium mt-1">
              {seller.business_name || "N/A"}
            </p>
          </div>


          {/* PHONE */}

          <div>
            <p className="text-sm text-gray-500">
              Phone
            </p>

            <p className="font-medium mt-1">
              {seller.phone || "N/A"}
            </p>
          </div>


          {/* STATUS */}

          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>

            <span className="inline-block mt-1 px-3 py-1 rounded-full bg-green-100 text-green-700">
              Approved
            </span>
          </div>


          {/* ========================================
              STRIPE CONNECT
          ======================================== */}

          <div>
            <p className="text-sm text-gray-500">
              Stripe Connect
            </p>

            {seller.stripe_account_id ? (
              <div className="mt-1">

                <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700">
                  ✓ Connected
                </span>

                <p className="text-xs text-gray-500 mt-2 break-all">
                  Account ID: {seller.stripe_account_id}
                </p>

              </div>
            ) : (
              <span className="inline-block mt-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                Not Connected
              </span>
            )}
          </div>


          {/* DESCRIPTION */}

          <div>
            <p className="text-sm text-gray-500">
              Description
            </p>

            <p className="font-medium mt-1">
              {seller.description || "N/A"}
            </p>
          </div>

        </div>
      </div>


      {/* ========================================
          PRODUCT STATISTICS
      ======================================== */}

      <div>

        <h2 className="text-xl font-semibold mb-4">
          Product Statistics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* TOTAL */}

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Total Products
            </p>

            <p className="text-3xl font-bold mt-2">
              {statistics.totalProducts}
            </p>
          </div>


          {/* APPROVED */}

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Approved
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {statistics.approvedProducts}
            </p>
          </div>


          {/* PENDING */}

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Pending
            </p>

            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {statistics.pendingProducts}
            </p>
          </div>


          {/* REJECTED */}

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Rejected
            </p>

            <p className="text-3xl font-bold text-red-600 mt-2">
              {statistics.rejectedProducts}
            </p>
          </div>

        </div>
      </div>


      {/* ========================================
          SELLER PRODUCTS
      ======================================== */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="p-6 border-b">

          <h2 className="text-xl font-semibold">
            Seller Products
          </h2>

          <p className="text-gray-500 mt-1">
            Products belonging to this seller.
          </p>

        </div>


        {products.length === 0 ? (

          <div className="p-8 text-center text-gray-500">
            This seller has no products yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-4">
                    Product
                  </th>

                  <th className="text-left px-6 py-4">
                    Price
                  </th>

                  <th className="text-left px-6 py-4">
                    Category
                  </th>

                  <th className="text-left px-6 py-4">
                    Status
                  </th>

                  <th className="text-left px-6 py-4">
                    Created
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

                      <div className="flex items-center gap-4">

                        {product.image && (
                          <img
                            src={`http://localhost:5000${product.image}`}
                            alt={product.title}
                            className="w-14 h-14 object-cover rounded-lg"
                          />
                        )}

                        <div>

                          <p className="font-semibold">
                            {product.title}
                          </p>

                          <p className="text-sm text-gray-500">
                            Product ID: #{product.id}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* PRICE */}

                    <td className="px-6 py-4">
                      Rs. {product.price}
                    </td>


                    {/* CATEGORY */}

                    <td className="px-6 py-4">
                      {product.category_name || "N/A"}
                    </td>


                    {/* STATUS */}

                    <td className="px-6 py-4">

                      {product.approval_status ===
                      "approved" ? (

                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
                          Approved
                        </span>

                      ) : product.approval_status ===
                        "pending" ? (

                        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                          Pending
                        </span>

                      ) : (

                        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700">
                          Rejected
                        </span>

                      )}

                    </td>


                    {/* CREATED */}

                    <td className="px-6 py-4 text-gray-500">

                      {new Date(
                        product.created_at
                      ).toLocaleDateString()}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default SellerDetails;