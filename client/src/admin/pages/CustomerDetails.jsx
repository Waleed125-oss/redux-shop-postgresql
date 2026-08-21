import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaShoppingCart,
  FaDollarSign,
} from "react-icons/fa";

function CustomerDetails() {

  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalSpent: 0,
  });

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


  useEffect(() => {

    const fetchCustomer = async () => {

      try {

        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:5000/api/admin/customers/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCustomer(response.data.customer);

        setStatistics(response.data.statistics);

        setOrders(response.data.orders);

      } catch (error) {

        console.error(error);

        setError(
          error.response?.data?.message ||
          "Failed to load customer"
        );

      } finally {

        setLoading(false);

      }

    };

    fetchCustomer();

  }, [id]);


  if (loading) {

    return (
      <div className="p-8">

        <p className="text-gray-500">
          Loading customer...
        </p>

      </div>
    );

  }


  if (error) {

    return (
      <div className="p-8">

        <div className="bg-red-50 text-red-600 p-5 rounded-xl">
          {error}
        </div>

      </div>
    );

  }


  return (

    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <Link
            to="/admin/customers"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-3"
          >
            <FaArrowLeft />

            Back to Customers

          </Link>

          <h1 className="text-3xl font-bold text-gray-900">
            Customer Details
          </h1>

        </div>

      </div>


      {/* Customer Information */}

      <div className="bg-white rounded-2xl shadow-sm border p-7">

        <div className="flex items-center gap-5">

          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">

            <FaUser
              size={32}
              className="text-blue-600"
            />

          </div>


          <div>

            <h2 className="text-2xl font-bold text-gray-900">

              {customer.name}

            </h2>

            <p className="text-gray-500 mt-1">

              Customer #{customer.id}

            </p>

          </div>

        </div>


        <div className="grid md:grid-cols-3 gap-6 mt-8">

          <div>

            <p className="text-sm text-gray-500">
              Customer Name
            </p>

            <p className="font-semibold mt-1">
              {customer.name}
            </p>

          </div>


          <div>

            <p className="text-sm text-gray-500">
              Email
            </p>

            <div className="flex items-center gap-2 mt-1">

              <FaEnvelope className="text-gray-400" />

              <p className="font-semibold">
                {customer.email}
              </p>

            </div>

          </div>


          <div>

            <p className="text-sm text-gray-500">
              Account Type
            </p>

            <span className="inline-block mt-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">

              {customer.role}

            </span>

          </div>

        </div>

      </div>


      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl shadow-sm border p-6">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-gray-500">
                Total Orders
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {statistics.totalOrders}
              </h2>

            </div>

            <div className="bg-blue-100 text-blue-600 p-4 rounded-xl">

              <FaShoppingCart size={25} />

            </div>

          </div>

        </div>


        <div className="bg-white rounded-2xl shadow-sm border p-6">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-gray-500">
                Total Spent
              </p>

              <h2 className="text-3xl font-bold mt-2">

                $
                {Number(
                  statistics.totalSpent
                ).toLocaleString()}

              </h2>

            </div>

            <div className="bg-green-100 text-green-600 p-4 rounded-xl">

              <FaDollarSign size={25} />

            </div>

          </div>

        </div>

      </div>


      {/* Orders */}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        <div className="p-6 border-b">

          <h2 className="text-xl font-bold">
            Customer Orders
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Orders placed by this customer
          </p>

        </div>


        {orders.length === 0 ? (

          <div className="p-10 text-center text-gray-500">

            This customer has not placed any orders yet.

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr className="text-left text-gray-500 text-sm">

                  <th className="px-6 py-4">
                    Order ID
                  </th>

                  <th className="px-6 py-4">
                    Total
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Date
                  </th>

                  <th className="px-6 py-4">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {orders.map((order) => (

                  <tr
                    key={order.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="px-6 py-5 font-semibold">
                      #{order.id}
                    </td>


                    <td className="px-6 py-5 font-semibold">

                      $
                      {Number(
                        order.total_amount
                      ).toLocaleString()}

                    </td>


                    <td className="px-6 py-5">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >

                        {order.status}

                      </span>

                    </td>


                    <td className="px-6 py-5 text-gray-500">

                      {new Date(
                        order.created_at
                      ).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}

                    </td>


                    <td className="px-6 py-5">

                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        View Order
                      </Link>

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

export default CustomerDetails;