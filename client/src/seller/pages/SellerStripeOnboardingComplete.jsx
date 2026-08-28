import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStripeAccountStatusAPI } from "../../services/api";

function SellerStripeOnboardingComplete() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkStripeStatus = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getStripeAccountStatusAPI();

        setStatus(result);
      } catch (error) {
        console.error(
          "Stripe Status Error:",
          error
        );

        setError(
          error.message ||
            "Unable to check Stripe account status"
        );
      } finally {
        setLoading(false);
      }
    };

    checkStripeStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

          <h2 className="text-xl font-semibold text-slate-800">
            Checking your Stripe account...
          </h2>

          <p className="mt-2 text-slate-500">
            Please wait while we verify your account.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-white p-8 shadow-sm">
          <div className="mb-4 text-4xl">⚠️</div>

          <h1 className="text-2xl font-bold text-slate-800">
            Unable to verify Stripe account
          </h1>

          <p className="mt-3 text-red-600">
            {error}
          </p>

          <Link
            to="/seller/stripe-connect"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Stripe Account
          </Link>
        </div>
      </div>
    );
  }

  if (status?.status === "complete") {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-green-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">
            ✓
          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            Stripe Account Connected
          </h1>

          <p className="mt-3 text-slate-600">
            Your Stripe account has been successfully
            connected and is ready to receive payouts.
          </p>

          <div className="mt-6 rounded-lg bg-green-50 p-4 text-left">
            <p className="font-semibold text-green-800">
              Account status
            </p>

            <p className="mt-1 text-green-700">
              Connected and ready
            </p>
          </div>

          <Link
            to="/seller"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Go to Seller Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (status?.status === "action_required") {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-orange-200 bg-white p-8 shadow-sm">
          <div className="mb-4 text-5xl">
            ⚠️
          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            More information is required
          </h1>

          <p className="mt-3 text-slate-600">
            Stripe needs additional information before
            your account can receive payouts.
          </p>

          <div className="mt-6 rounded-lg bg-orange-50 p-4">
            <p className="font-semibold text-orange-800">
              Please complete the required information
              in Stripe.
            </p>
          </div>

          <Link
            to="/seller/stripe-connect"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Return to Stripe Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl rounded-xl border border-yellow-200 bg-white p-8 shadow-sm">
        <div className="mb-4 text-5xl">
          ⏳
        </div>

        <h1 className="text-3xl font-bold text-slate-800">
          Stripe Account Under Review
        </h1>

        <p className="mt-3 text-slate-600">
          Your Stripe information has been submitted.
          Stripe may still need to finish processing your
          account.
        </p>

        <div className="mt-6 rounded-lg bg-yellow-50 p-4">
          <p className="font-semibold text-yellow-800">
            Status: Pending
          </p>
        </div>

        <Link
          to="/seller"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Go to Seller Dashboard
        </Link>
      </div>
    </div>
  );
}

export default SellerStripeOnboardingComplete;