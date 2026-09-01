import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { fetchMyInvoicesAPI } from "../services/api";

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount || 0));

function MyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchMyInvoicesAPI();
        setInvoices(data.invoices || []);
      } catch (requestError) {
        setError(
          requestError.message || "Unable to load invoices."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto px-5 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Invoices</h1>
          <p className="mt-2 text-gray-500">
            View and download invoices for your completed purchases.
          </p>
        </div>

        {loading && <p className="text-gray-500">Loading invoices...</p>}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && invoices.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold">No invoices yet</h2>
            <p className="mt-2 text-gray-500">
              Invoices appear here after a payment is completed.
            </p>
          </div>
        )}

        {!loading && !error && invoices.length > 0 && (
          <div className="overflow-hidden rounded-xl bg-white shadow">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead className="bg-gray-50 text-sm text-gray-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Invoice</th>
                    <th className="px-6 py-4 font-semibold">Issued</th>
                    <th className="px-6 py-4 font-semibold">Order</th>
                    <th className="px-6 py-4 font-semibold">Items</th>
                    <th className="px-6 py-4 font-semibold">Total</th>
                    <th className="px-6 py-4" aria-label="View invoice" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(invoice.issued_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        #{invoice.order_id}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {invoice.item_count}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatMoney(
                          invoice.total_amount,
                          invoice.currency
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/my-invoices/${invoice.id}`}
                          className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          View invoice
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default MyInvoices;
