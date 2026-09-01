import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSellerInvoicesAPI } from "../../services/api";

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount || 0));

function SellerInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchSellerInvoicesAPI();
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
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Invoices
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-500">
          Invoices containing your products and your share of each sale.
        </p>
      </div>

      {loading && <p className="text-gray-500">Loading invoices...</p>}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && invoices.length === 0 && (
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <h2 className="text-xl font-semibold text-gray-700">
            No invoices found
          </h2>
          <p className="mt-2 text-gray-500">
            Invoices will appear after customers complete payment for your products.
          </p>
        </div>
      )}

      {!loading && !error && invoices.length > 0 && (
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-gray-50 text-left text-sm text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Invoice</th>
                  <th className="px-6 py-4 font-semibold">Issued</th>
                  <th className="px-6 py-4 font-semibold">Order</th>
                  <th className="px-6 py-4 font-semibold">Your items</th>
                  <th className="px-6 py-4 font-semibold">Your net total</th>
                  <th className="px-6 py-4" aria-label="View invoice" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">
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
                    <td className="px-6 py-4 font-medium">
                      {formatMoney(invoice.seller_net_amount, invoice.currency)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/seller/invoices/${invoice.id}`)
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        View invoice
                      </button>
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

export default SellerInvoices;
