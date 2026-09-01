import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminInvoicesAPI } from "../../services/api";

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount || 0));

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currency, setCurrency] = useState("all");
  const [issuedFrom, setIssuedFrom] = useState("");

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchAdminInvoicesAPI();
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

  const currencies = useMemo(
    () => [...new Set(invoices.map((invoice) => invoice.currency))],
    [invoices]
  );

  const filteredInvoices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const searchableText = [
        invoice.invoice_number,
        invoice.order_id,
        invoice.buyer_name,
        invoice.buyer_email,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesCurrency =
        currency === "all" || invoice.currency === currency;
      const matchesDate =
        !issuedFrom ||
        new Date(invoice.issued_at) >= new Date(`${issuedFrom}T00:00:00`);

      return matchesSearch && matchesCurrency && matchesDate;
    });
  }, [currency, invoices, issuedFrom, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Invoice Management
        </h1>
        <p className="mt-1 text-gray-500">
          Search, review, and download invoices across the store.
        </p>
      </div>

      <div className="grid gap-4 rounded-xl border bg-white p-5 shadow-sm md:grid-cols-[1fr_180px_190px_auto]">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search invoice, order, customer, or email"
          className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All currencies</option>
          {currencies.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={issuedFrom}
          onChange={(event) => setIssuedFrom(event.target.value)}
          aria-label="Issued from"
          className="rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setCurrency("all");
            setIssuedFrom("");
          }}
          className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear filters
        </button>
      </div>

      {!loading && !error && (
        <p className="text-sm text-gray-500">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </p>
      )}

      {loading && <p className="text-gray-500">Loading invoices...</p>}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Invoice</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Order</th>
                  <th className="px-6 py-4 font-semibold">Issued</th>
                  <th className="px-6 py-4 font-semibold">Items</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4" aria-label="View invoice" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{invoice.buyer_name}</p>
                      <p className="text-sm text-gray-500">{invoice.buyer_email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">#{invoice.order_id}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(invoice.issued_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{invoice.item_count}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatMoney(invoice.total_amount, invoice.currency)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/invoices/${invoice.id}`}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No invoices match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invoices;
