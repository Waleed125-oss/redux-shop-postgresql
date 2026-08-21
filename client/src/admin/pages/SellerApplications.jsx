import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchSellerApplications,
  approveSeller,
  rejectSeller,
} from "../../store/slices/sellerApplicationSlice";

function SellerApplications() {
  const dispatch = useDispatch();

  const {
    applications,
    loading,
    actionLoading,
    error,
  } = useSelector(
    (state) => state.sellerApplication
  );

  // ================= FETCH APPLICATIONS =================

  useEffect(() => {
    dispatch(fetchSellerApplications());
  }, [dispatch]);

  // ================= APPROVE =================

  const handleApprove = (id) => {
    dispatch(approveSeller(id));
  };

  // ================= REJECT =================

  const handleReject = (id) => {
    const adminNote = window.prompt(
      "Enter reason for rejection:"
    );

    if (adminNote === null) {
      return;
    }

    dispatch(
      rejectSeller({
        id,
        adminNote,
      })
    );
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">
          Seller Applications
        </h1>

        <p className="mt-4">
          Loading applications...
        </p>
      </div>
    );
  }

  return (
    <div>

      {/* ================= HEADER ================= */}

      <div className="mb-6">

        <h1 className="text-3xl font-bold text-gray-800">
          Seller Applications
        </h1>

        <p className="text-gray-500 mt-1">
          Review users who want to become sellers.
        </p>

      </div>


      {/* ================= ERROR ================= */}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}


      {/* ================= EMPTY ================= */}

      {applications.length === 0 ? (

        <div className="bg-white rounded-xl p-8 text-center shadow">

          <h2 className="text-xl font-semibold text-gray-700">
            No Pending Applications
          </h2>

          <p className="text-gray-500 mt-2">
            There are currently no seller applications
            waiting for approval.
          </p>

        </div>

      ) : (

        /* ================= APPLICATIONS ================= */

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="px-6 py-4 text-left">
                    Applicant
                  </th>

                  <th className="px-6 py-4 text-left">
                    Business
                  </th>

                  <th className="px-6 py-4 text-left">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-left">
                    Description
                  </th>

                  <th className="px-6 py-4 text-left">
                    Date
                  </th>

                  <th className="px-6 py-4 text-center">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {applications.map((application) => (

                  <tr
                    key={application.id}
                    className="border-t hover:bg-gray-50"
                  >

                    {/* Applicant */}

                    <td className="px-6 py-4">

                      <p className="font-semibold text-gray-800">
                        {application.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {application.email}
                      </p>

                    </td>


                    {/* Business */}

                    <td className="px-6 py-4">
                      {application.business_name}
                    </td>


                    {/* Phone */}

                    <td className="px-6 py-4">
                      {application.phone}
                    </td>


                    {/* Description */}

                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-gray-600">
                        {application.description}
                      </p>
                    </td>


                    {/* Date */}

                    <td className="px-6 py-4">

                      {new Date(
                        application.created_at
                      ).toLocaleDateString()}

                    </td>


                    {/* Actions */}

                    <td className="px-6 py-4">

                      <div className="flex justify-center gap-2">

                        <button
                          onClick={() =>
                            handleApprove(
                              application.id
                            )
                          }
                          disabled={actionLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>


                        <button
                          onClick={() =>
                            handleReject(
                              application.id
                            )
                          }
                          disabled={actionLoading}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>

                      </div>

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

export default SellerApplications;