// import { useState } from "react";
// import {
//   createStripeConnectedAccountAPI,
//   createStripeOnboardingLinkAPI,
// } from "../../services/api";

// function SellerStripeConnect() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleStripeConnect = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       // ============================================
//       // STEP 1: CREATE ACCOUNT
//       // ============================================

//       try {
//         await createStripeConnectedAccountAPI();
//       } catch (error) {
//         // Account may already exist.
//         // That is okay because we can continue
//         // directly to onboarding.
//         if (
//           !error.message?.toLowerCase().includes("already exists")
//         ) {
//           throw error;
//         }
//       }

//       // ============================================
//       // STEP 2: CREATE ONBOARDING LINK
//       // ============================================

//       const result =
//         await createStripeOnboardingLinkAPI();

//       // ============================================
//       // STEP 3: REDIRECT TO STRIPE
//       // ============================================

//       if (result?.url) {
//         window.location.href = result.url;
//         return;
//       }

//       throw new Error(
//         "Stripe onboarding URL was not returned"
//       );
//     } catch (error) {
//       console.error(
//         "Stripe Connect Error:",
//         error
//       );

//       setError(
//         error.message ||
//           "Unable to connect your Stripe account"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6">

//       {/* ================= HEADER ================= */}

//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-slate-800">
//           Stripe Connect
//         </h1>

//         <p className="mt-2 text-slate-500">
//           Connect your Stripe account to receive
//           payments and payouts from your sales.
//         </p>
//       </div>

//       {/* ================= MAIN CARD ================= */}

//       <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

//         <div className="mb-6">

//           <h2 className="text-xl font-semibold text-slate-800">
//             Connect your Stripe account
//           </h2>

//           <p className="mt-2 text-slate-600">
//             Stripe will securely collect your business,
//             identity, and payout information.
//           </p>

//         </div>

//         {/* ================= ERROR ================= */}

//         {error && (
//           <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
//             {error}
//           </div>
//         )}

//         {/* ================= INFORMATION ================= */}

//         <div className="mb-6 rounded-lg bg-slate-50 p-5">

//           <h3 className="font-semibold text-slate-800">
//             What happens next?
//           </h3>

//           <ul className="mt-3 space-y-2 text-sm text-slate-600">
//             <li>
//               • Your Stripe Express account will be created.
//             </li>

//             <li>
//               • You will be redirected to Stripe.
//             </li>

//             <li>
//               • Stripe will ask for the required account
//               information.
//             </li>

//             <li>
//               • After completing onboarding, you can
//               receive seller payouts.
//             </li>
//           </ul>

//         </div>

//         {/* ================= BUTTON ================= */}

//         <button
//           type="button"
//           onClick={handleStripeConnect}
//           disabled={loading}
//           className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           {loading
//             ? "Connecting to Stripe..."
//             : "Connect with Stripe"}
//         </button>

//       </div>

//     </div>
//   );
// }

// export default SellerStripeConnect;














import { useEffect, useState } from "react";
import {
  createStripeConnectedAccountAPI,
  createStripeOnboardingLinkAPI,
  getStripeAccountStatusAPI,
} from "../../services/api";

function SellerStripeConnect() {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  // ======================================================
  // CHECK STRIPE ACCOUNT STATUS
  // ======================================================

  const checkStripeStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getStripeAccountStatusAPI();

      setStatus(result);
    } catch (error) {
      console.error("Stripe Status Error:", error);

      /*
        If account does not exist yet, backend returns 400.
        That is not really an error for our UI.
        It simply means the seller needs to connect Stripe.
      */

      if (
        error.message
          ?.toLowerCase()
          .includes("does not exist")
      ) {
        setStatus(null);
      } else {
        setError(
          error.message ||
            "Unable to check Stripe account status"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // CHECK STATUS WHEN PAGE OPENS
  // ======================================================

  useEffect(() => {
    checkStripeStatus();
  }, []);

  // ======================================================
  // CONNECT / CONTINUE STRIPE
  // ======================================================

  const handleStripeConnect = async () => {
    try {
      setConnecting(true);
      setError("");

      // ==================================================
      // STEP 1
      // CREATE ACCOUNT IF NEEDED
      // ==================================================

      try {
        await createStripeConnectedAccountAPI();
      } catch (error) {
        // Account already exists -> continue
        if (
          !error.message
            ?.toLowerCase()
            .includes("already exists")
        ) {
          throw error;
        }
      }

      // ==================================================
      // STEP 2
      // CREATE ONBOARDING LINK
      // ==================================================

      const result =
        await createStripeOnboardingLinkAPI();

      // ==================================================
      // STEP 3
      // REDIRECT TO STRIPE
      // ==================================================

      if (result?.url) {
        window.location.href = result.url;
        return;
      }

      throw new Error(
        "Stripe onboarding URL was not returned"
      );
    } catch (error) {
      console.error(
        "Stripe Connect Error:",
        error
      );

      setError(
        error.message ||
          "Unable to connect your Stripe account"
      );
    } finally {
      setConnecting(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

              <p className="text-slate-600">
                Checking Stripe account...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">
            Stripe Connect
          </h1>

          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>

          <button
            onClick={checkStripeStatus}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ======================================================
  // CONNECTED ACCOUNT
  // ======================================================

  if (status?.status === "complete") {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-green-200 bg-white p-8 shadow-sm">

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800">
              Stripe Connect
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your Stripe payment account.
            </p>
          </div>

          {/* SUCCESS */}

          <div className="rounded-xl border border-green-200 bg-green-50 p-6">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white">
                ✓
              </div>

              <div>
                <h2 className="text-xl font-semibold text-green-800">
                  Stripe Account Connected
                </h2>

                <p className="text-sm text-green-700">
                  Your Stripe account is connected successfully.
                </p>
              </div>
            </div>

          </div>

          {/* ACCOUNT STATUS */}

          <div className="mt-6 rounded-lg bg-slate-50 p-5">

            <h3 className="font-semibold text-slate-800">
              Account Status
            </h3>

            <div className="mt-4 space-y-3">

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Account
                </span>

                <span className="font-semibold text-green-600">
                  Connected ✓
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Details Submitted
                </span>

                <span className="font-semibold text-green-600">
                  Yes ✓
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Charges
                </span>

                <span className="font-semibold text-green-600">
                  Enabled ✓
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Payouts
                </span>

                <span className="font-semibold text-green-600">
                  Enabled ✓
                </span>
              </div>

            </div>
          </div>

          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              Your Stripe account is ready to receive
              seller payouts.
            </p>
          </div>

        </div>
      </div>
    );
  }

  // ======================================================
  // PENDING / ACTION REQUIRED
  // ======================================================

  if (
    status?.status === "pending" ||
    status?.status === "action_required"
  ) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-yellow-200 bg-white p-8 shadow-sm">

          <h1 className="text-3xl font-bold text-slate-800">
            Stripe Connect
          </h1>

          <p className="mt-2 text-slate-500">
            Your Stripe account setup is not complete yet.
          </p>

          <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-6">

            <h2 className="text-xl font-semibold text-yellow-800">
              Additional information required
            </h2>

            <p className="mt-2 text-sm text-yellow-700">
              Stripe needs some additional information
              before your account can receive payouts.
            </p>

          </div>

          <button
            onClick={handleStripeConnect}
            disabled={connecting}
            className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {connecting
              ? "Opening Stripe..."
              : "Continue Stripe Setup"}
          </button>

        </div>
      </div>
    );
  }

  // ======================================================
  // NO STRIPE ACCOUNT
  // ======================================================

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Stripe Connect
          </h1>

          <p className="mt-2 text-slate-500">
            Connect your Stripe account to receive
            payments and payouts from your sales.
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-5">

          <h2 className="text-xl font-semibold text-slate-800">
            Connect your Stripe account
          </h2>

          <p className="mt-2 text-slate-600">
            Stripe will securely collect your business,
            identity, and payout information.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>• A Stripe Express account will be created.</li>
            <li>• You will be redirected to Stripe.</li>
            <li>• Stripe will collect the required information.</li>
            <li>• After completion, you can receive payouts.</li>
          </ul>

        </div>

        <button
          type="button"
          onClick={handleStripeConnect}
          disabled={connecting}
          className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {connecting
            ? "Connecting to Stripe..."
            : "Connect with Stripe"}
        </button>

      </div>
    </div>
  );
}

export default SellerStripeConnect;