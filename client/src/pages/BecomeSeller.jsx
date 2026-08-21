import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  submitSellerApplicationAPI,
  fetchMySellerApplicationAPI,
} from "../services/api";

function BecomeSeller() {
  const navigate = useNavigate();

  // ================= FORM STATE =================

  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  // ================= UI STATE =================

  const [loading, setLoading] = useState(false);
  const [checkingApplication, setCheckingApplication] =
    useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= APPLICATION =================

  const [application, setApplication] = useState(null);

  // =================================================
  // CHECK EXISTING SELLER APPLICATION
  // =================================================

  useEffect(() => {
    const checkApplication = async () => {
      try {
        const result =
          await fetchMySellerApplicationAPI();

        console.log(
          "My seller application:",
          result
        );

        setApplication(result.application);

      } catch (error) {

        // User has never submitted an application
        if (
          error.message ===
          "No seller application found"
        ) {
          setApplication(null);
        } else {
          console.error(
            "Check seller application error:",
            error
          );

          setError(
            error.message ||
            "Failed to check seller application"
          );
        }

      } finally {
        setCheckingApplication(false);
      }
    };

    checkApplication();
  }, []);

  // =================================================
  // SUBMIT SELLER APPLICATION
  // =================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const result =
        await submitSellerApplicationAPI({
        businessName,
          phone,
          description,
        });

      console.log(
        "Seller application:",
        result
      );

      // Save returned application
      setApplication(result.application);

      setSuccess(
        "Your seller application has been submitted successfully."
      );

      // Clear form
      setBusinessName("");
      setPhone("");
      setDescription("");

    } catch (error) {

      console.error(
        "Seller application error:",
        error
      );

      setError(
        error.message ||
        "Failed to submit seller application"
      );

    } finally {
      setLoading(false);
    }
  };

  // =================================================
  // CHECKING APPLICATION
  // =================================================

  if (checkingApplication) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">

        <p className="text-gray-600 text-lg">
          Checking your seller application...
        </p>

      </div>
    );
  }

  // =================================================
  // PAGE
  // =================================================

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">

        {/* ================= TITLE ================= */}

        <h1 className="text-3xl font-bold text-gray-800">
          Become a Seller
        </h1>

        <p className="text-gray-500 mt-2 mb-8">
          Submit your application to start selling
          on ReduxShop.
        </p>


        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}


        {/* =================================================
            EXISTING APPLICATION
        ================================================= */}

        {application ? (

          <div className="space-y-6">

            {/* ================= PENDING ================= */}

            {application.status === "pending" && (

              <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">

                <h2 className="text-2xl font-bold text-yellow-700">
                  Application Pending
                </h2>

                <p className="mt-2 text-gray-600">
                  Your seller application is currently
                  waiting for admin approval.
                </p>

                <div className="mt-5 space-y-2">

                  <p>
                    <strong>
                      Business Name:
                    </strong>{" "}
                    {application.business_name}
                  </p>

                  <p>
                    <strong>
                      Phone:
                    </strong>{" "}
                    {application.phone}
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    <span className="capitalize">
                      {application.status}
                    </span>
                  </p>

                </div>

              </div>

            )}


            {/* ================= APPROVED ================= */}

            {application.status === "approved" && (

              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">

                <h2 className="text-2xl font-bold text-green-700">
                  Application Approved
                </h2>

                <p className="mt-2 text-gray-600">
                  Congratulations! Your seller
                  application has been approved.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="
                    mt-5
                    px-5
                    py-3
                    bg-green-600
                    text-white
                    rounded-lg
                    font-semibold
                    hover:bg-green-700
                  "
                >
                  Continue Shopping
                </button>

              </div>

            )}


            {/* ================= REJECTED ================= */}

            {application.status === "rejected" && (

              <div className="p-6 bg-red-50 border border-red-200 rounded-lg">

                <h2 className="text-2xl font-bold text-red-700">
                  Application Rejected
                </h2>

                <p className="mt-2 text-gray-600">
                  Your seller application was rejected.
                </p>

                {application.admin_note && (

                  <div className="mt-5">

                    <p className="font-semibold text-gray-700">
                      Admin Note:
                    </p>

                    <p className="mt-1 text-gray-600">
                      {application.admin_note}
                    </p>

                  </div>

                )}

              </div>

            )}

          </div>

        ) : (

          /* =================================================
             NO APPLICATION → SHOW FORM
          ================================================= */

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* ================= BUSINESS NAME ================= */}

            <div>

              <label className="block font-medium text-gray-700 mb-2">
                Business Name
              </label>

              <input
                type="text"
                value={businessName}
                onChange={(e) =>
                  setBusinessName(e.target.value)
                }
                placeholder="Enter your business name"
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-lg
                  px-4
                  py-3
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
                required
              />

            </div>


            {/* ================= PHONE ================= */}

            <div>

              <label className="block font-medium text-gray-700 mb-2">
                Phone
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="03001234567"
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-lg
                  px-4
                  py-3
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
                required
              />

            </div>


            {/* ================= DESCRIPTION ================= */}

            <div>

              <label className="block font-medium text-gray-700 mb-2">
                Business Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Tell us about the products you want to sell..."
                rows="5"
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-lg
                  px-4
                  py-3
                  outline-none
                  resize-none
                  focus:ring-2
                  focus:ring-blue-500
                "
                required
              />

            </div>


            {/* ================= SUBMIT ================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-blue-600
                text-white
                py-3
                rounded-lg
                font-semibold
                hover:bg-blue-700
                disabled:bg-blue-300
                disabled:cursor-not-allowed
                transition
              "
            >
              {loading
                ? "Submitting..."
                : "Submit Application"}
            </button>

          </form>

        )}

      </div>

    </div>
  );
}

export default BecomeSeller;