import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaSearch,
  FaUser,
  FaEnvelope,
  FaEye,
} from "react-icons/fa";

import { fetchCustomers } from "../../store/slices/customerSlice";

function Customers() {
  const dispatch = useDispatch();

  const {
    customers,
    loading,
    error,
  } = useSelector((state) => state.customers);

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const filteredCustomers = customers.filter((customer) => {
    const searchValue = search.toLowerCase();

    return (
      customer.name?.toLowerCase().includes(searchValue) ||
      customer.email?.toLowerCase().includes(searchValue)
    );
  });

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Customers
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your registered customers
          </p>

        </div>

        <div className="bg-white px-5 py-3 rounded-xl shadow-sm border">

          <span className="text-gray-500 text-sm">
            Total Customers
          </span>

          <p className="text-2xl font-bold text-gray-800">
            {customers.length}
          </p>

        </div>

      </div>


      {/* ================= SEARCH ================= */}

      <div className="bg-white rounded-xl shadow-sm border p-4">

        <div className="relative max-w-md">

          <FaSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              pl-11
              pr-4
              py-3
              border
              border-gray-200
              rounded-lg
              outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

        </div>

      </div>


      {/* ================= ERROR ================= */}

      {error && (

        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">

          {error}

        </div>

      )}


      {/* ================= TABLE ================= */}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        <div className="px-6 py-5 border-b">

          <h2 className="text-lg font-semibold text-gray-800">
            Customer List
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Registered customers from the database
          </p>

        </div>


        {loading ? (

          <div className="p-10 text-center">

            <p className="text-gray-500">
              Loading customers...
            </p>

          </div>

        ) : filteredCustomers.length === 0 ? (

          <div className="p-10 text-center">

            <FaUser
              className="mx-auto text-gray-300 mb-3"
              size={40}
            />

            <p className="text-gray-500">
              No customers found
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="bg-gray-50 border-b">

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    ID
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Customer
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Email
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Role
                  </th>

                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredCustomers.map((customer) => (

                  <tr
                    key={customer.id}
                    className="
                      border-b
                      last:border-b-0
                      hover:bg-gray-50
                      transition
                    "
                  >

                    {/* ID */}

                    <td className="px-6 py-5">

                      <span className="font-semibold text-gray-700">
                        #{customer.id}
                      </span>

                    </td>


                    {/* CUSTOMER */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="
                          w-10
                          h-10
                          rounded-full
                          bg-blue-100
                          text-blue-600
                          flex
                          items-center
                          justify-center
                          font-semibold
                        ">

                          {customer.name
                            ?.charAt(0)
                            .toUpperCase()}

                        </div>


                        <div>

                          <p className="font-semibold text-gray-800">
                            {customer.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            Customer ID #{customer.id}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* EMAIL */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2 text-gray-600">

                        <FaEnvelope
                          className="text-gray-400"
                          size={14}
                        />

                        {customer.email}

                      </div>

                    </td>


                    {/* ROLE */}

                    <td className="px-6 py-5">

                      <span className="
                        inline-flex
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-semibold
                        bg-green-100
                        text-green-700
                      ">

                        {customer.role}

                      </span>

                    </td>


                    {/* ACTION */}

                    <td className="px-6 py-5 text-right">

                      {/* <button
                        className="
                          inline-flex
                          items-center
                          gap-2
                          px-4
                          py-2
                          rounded-lg
                          border
                          border-gray-200
                          text-gray-600
                          hover:bg-gray-100
                          transition
                        "
                      >

                        <FaEye size={14} />

                        View

                      </button> */}

                      <Link
  to={`/admin/customers/${customer.id}`}
  className="
    inline-flex
    items-center
    gap-2
    px-4
    py-2
    rounded-lg
    border
    border-gray-200
    text-gray-600
    hover:bg-gray-100
    transition
  "
>
  <FaEye size={14} />
  View
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

export default Customers;