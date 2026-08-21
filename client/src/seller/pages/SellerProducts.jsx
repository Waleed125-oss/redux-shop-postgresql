import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchSellerProducts,
  toggleSellerProductStatus,
} from "../../store/slices/sellerSlice";
import { formatPrice } from "../../services/currency";

function SellerProducts() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    products,
    productsLoading,
    productsError,
    deleteProductLoading,
    toggleProductLoading,
    // deleteProductError,
  } = useSelector(
    (state) => state.seller
  );


  useEffect(() => {

    dispatch(
      fetchSellerProducts({
        page: 1,
        limit: 10,
      })
    );

  }, [dispatch]);


  if (productsLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          My Products
        </h1>

        <p className="mt-4 text-gray-500">
          Loading products...
        </p>
      </div>
    );
  }


  if (productsError) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          My Products
        </h1>

        <p className="mt-4 text-red-600">
          {productsError}
        </p>
      </div>
    );
  }


  return (
    <div>

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            My Products
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your products
          </p>

        </div>

        <button

        onClick={() =>
          navigate("/seller/products/add")
        }
          className="
            px-5
            py-2
            bg-blue-600
            text-white
            rounded-lg
            hover:bg-blue-700
          "
        >
          Add Product
        </button>

      </div>


      {/* PRODUCTS */}

      <div className="mt-8 bg-white rounded-xl shadow overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-4 text-left">
                  Product
                </th>

                <th className="px-6 py-4 text-left">
                  Price
                </th>

                <th className="px-6 py-4 text-left">
                  Status
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

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      {product.image && (
                        <img
                          src={`http://localhost:5000${product.image}`}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}

                      <span className="font-medium">
                        {product.title}
                      </span>

                    </div>

                  </td>


                  <td className="px-6 py-4">
                    {formatPrice(product.price)}
                  </td>


                  <td className="px-6 py-4">

                    {product.is_active
                      ? "Active"
                      : "Inactive"}

                  </td>


                  <td className="px-6 py-4">

                    {product.approval_status}

                  </td>


                 <td className="px-6 py-4">

  <button
    onClick={() =>
      navigate(
        `/seller/products/edit/${product.id}`
      )
    }
    className="text-blue-600 mr-4"
  >
    Edit
  </button>

  {/* <button
    onClick={() => {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${product.title}"?`
      );

      if (confirmed) {
        dispatch(
          deleteSellerProduct(product.id)
        );
      }
    }}
    disabled={deleteProductLoading}
    className="
      text-red-600
      disabled:opacity-50
    "
  >
    Delete
  </button> */}

  <button
  onClick={() => {
    const action = product.is_active
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${product.title}"?`
    );

    if (confirmed) {
      dispatch(
        toggleSellerProductStatus({
          id: product.id,
          isActive: !product.is_active,
        })
      );
    }
  }}
  disabled={toggleProductLoading}
  className="
    text-red-600
    disabled:opacity-50
  "
>
  {product.is_active
    ? "Deactivate"
    : "Activate"}
</button>

</td>

                </tr>

              ))}


              {products.length === 0 && (

                <tr>

                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No products found.
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

export default SellerProducts;