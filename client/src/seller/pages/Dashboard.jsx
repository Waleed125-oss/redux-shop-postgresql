import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchSellerDashboardStats,
} from "../../store/slices/sellerSlice";
import { formatPrice } from "../../services/currency";

function SellerDashboard() {
  const dispatch = useDispatch();

  const {
    statistics,
    loading,
    error,
  } = useSelector((state) => state.seller);

  // ========================================
  // FETCH DASHBOARD STATS
  // ========================================

  useEffect(() => {
    dispatch(fetchSellerDashboardStats());
  }, [dispatch]);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Seller Dashboard
        </h1>

        <p className="mt-4 text-gray-500">
          Loading dashboard statistics...
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
          Seller Dashboard
        </h1>

        <p className="mt-4 text-red-600">
          {error}
        </p>
      </div>
    );
  }

  // ========================================
  // VALUES
  // ========================================

  const totalProducts =
    statistics?.products?.total ?? 0;

  const totalOrders =
    statistics?.orders?.total ?? 0;

  const totalRevenue =
    statistics?.orders?.revenue ?? 0;

  const payouts = statistics?.payouts ?? {};
  const recentPayouts = payouts.recent ?? [];

  const formatPayoutDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  const payoutStatusClass = (status) => {
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "pending") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div>

      {/* ================= HEADER ================= */}

      <h1 className="text-3xl font-bold text-gray-800">
        Seller Dashboard
      </h1>

      <p className="mt-2 text-gray-500">
        Welcome to your seller dashboard.
      </p>


      {/* ================= STATISTICS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

        {/* PRODUCTS */}

        <div className="bg-white p-6 rounded-xl shadow">

          <p className="text-gray-500">
            Products
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {totalProducts}
          </h2>

        </div>


        {/* ORDERS */}

        <div className="bg-white p-6 rounded-xl shadow">

          <p className="text-gray-500">
            Orders
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {totalOrders}
          </h2>

        </div>


        {/* SALES */}

        <div className="bg-white p-6 rounded-xl shadow">

          <p className="text-gray-500">
            Sales
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {formatPrice(totalRevenue)}
          </h2>

        </div>

      </div>

      {/* ================= STRIPE PAYOUTS ================= */}

      <section className="mt-8 rounded-xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Stripe Payouts
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Net amounts the platform has transferred to your Stripe account.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {payouts.completedCount ?? 0} received
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-700">Received from admin</p>
            <p className="mt-2 text-2xl font-bold text-green-800">
              {formatPrice(payouts.received)}
            </p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4">
            <p className="text-sm text-amber-700">Pending payout</p>
            <p className="mt-2 text-2xl font-bold text-amber-800">
              {formatPrice(payouts.pending)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Platform commission</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">
              {formatPrice(payouts.commission)}
            </p>
          </div>
        </div>

        <div className="mt-7 overflow-x-auto">
          <h3 className="mb-3 font-semibold text-gray-800">Recent payout activity</h3>
          {recentPayouts.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
              No Stripe payouts have been created yet.
            </p>
          ) : (
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b text-gray-500">
                <tr>
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 text-right font-medium">Gross</th>
                  <th className="pb-3 text-right font-medium">Commission</th>
                  <th className="pb-3 text-right font-medium">Net payout</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Transferred</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPayouts.map((payout) => (
                  <tr key={`${payout.order_id}-${payout.stripe_transfer_id || payout.transfer_status}`}>
                    <td className="py-3 font-medium text-gray-800">#{payout.order_id}</td>
                    <td className="py-3 text-right text-gray-600">
                      {formatPrice(payout.gross_amount)}
                    </td>
                    <td className="py-3 text-right text-gray-600">
                      -{formatPrice(payout.commission_amount)}
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-800">
                      {formatPrice(payout.seller_amount)}
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${payoutStatusClass(payout.transfer_status)}`}>
                        {payout.transfer_status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">
                      {payout.transfer_status === "completed"
                        ? formatPayoutDate(payout.updated_at)
                        : "Not transferred"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

    </div>
  );
}

export default SellerDashboard;
