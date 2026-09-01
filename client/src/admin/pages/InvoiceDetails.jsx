import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import { fetchAdminInvoiceAPI } from "../../services/api";

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount || 0));

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const downloadAdminInvoicePdf = (invoice, items) => {
  const document = new jsPDF({ unit: "mm", format: "a4" });
  const left = 18;
  const right = 192;
  let y = 22;

  document.setFillColor(37, 99, 235);
  document.rect(0, 0, 210, 12, "F");
  document.setFontSize(22);
  document.setTextColor(17, 24, 39);
  document.text("ReduxShop", left, y);
  document.setFontSize(24);
  document.text("INVOICE", right, y, { align: "right" });
  y += 12;

  document.setFontSize(10);
  document.setTextColor(75, 85, 99);
  document.text(`Invoice: ${invoice.invoice_number}`, left, y);
  document.text(`Issued: ${formatDate(invoice.issued_at)}`, right, y, {
    align: "right",
  });
  y += 6;
  document.text(`Order: #${invoice.order_id}`, left, y);
  const buyerLines = document.splitTextToSize(
    `Bill to: ${invoice.buyer_name} <${invoice.buyer_email}>`,
    right - left
  );
  y += 6;
  document.text(buyerLines, left, y);
  y += buyerLines.length * 5 + 6;
  document.text(`Payment status: ${invoice.payment_status || "paid"}`, left, y);
  document.text(
    `Order date: ${formatDate(invoice.order_created_at || invoice.issued_at)}`,
    right,
    y,
    { align: "right" }
  );
  y += 8;

  document.setFillColor(243, 244, 246);
  document.rect(left, y, right - left, 8, "F");
  document.setFontSize(9);
  document.setTextColor(31, 41, 55);
  document.text("Item", left + 3, y + 5.2);
  document.text("Qty", 132, y + 5.2, { align: "right" });
  document.text("Unit price", 158, y + 5.2, { align: "right" });
  document.text("Total", right - 3, y + 5.2, { align: "right" });
  y += 8;

  items.forEach((item) => {
    const productLabel = item.seller_business_name
      ? `${item.product_title}\nSeller: ${item.seller_business_name}`
      : item.product_title;
    const productLines = document.splitTextToSize(productLabel, 102);
    const itemHeight = Math.max(9, productLines.length * 4.5 + 4);

    if (y + itemHeight > 272) {
      document.addPage();
      y = 24;
    }

    document.setDrawColor(229, 231, 235);
    document.line(left, y + itemHeight, right, y + itemHeight);
    document.setFontSize(9);
    document.setTextColor(17, 24, 39);
    document.text(productLines, left + 3, y + 5.2);
    document.text(String(item.quantity), 132, y + 5.2, { align: "right" });
    document.text(
      formatMoney(item.unit_price, invoice.currency),
      158,
      y + 5.2,
      { align: "right" }
    );
    document.text(
      formatMoney(item.line_total, invoice.currency),
      right - 3,
      y + 5.2,
      { align: "right" }
    );
    y += itemHeight;
  });

  if (y + 36 > 272) {
    document.addPage();
    y = 24;
  }

  y += 10;
  document.setFontSize(10);
  document.setTextColor(75, 85, 99);
  [
    ["Subtotal", invoice.subtotal_amount],
    ["Tax", invoice.tax_amount],
    ["Shipping", 0],
    ["Discount", `-${formatMoney(invoice.discount_amount, invoice.currency)}`],
  ].forEach(([label, value]) => {
    document.text(label, 158, y, { align: "right" });
    document.text(
      typeof value === "string" ? value : formatMoney(value, invoice.currency),
      right - 3,
      y,
      { align: "right" }
    );
    y += 6;
  });
  document.setFontSize(13);
  document.setTextColor(17, 24, 39);
  document.text("Total", 158, y + 2, { align: "right" });
  document.text(
    formatMoney(invoice.total_amount, invoice.currency),
    right - 3,
    y + 2,
    { align: "right" }
  );
  document.save(`${invoice.invoice_number}.pdf`);
};

function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchAdminInvoiceAPI(id);
        setInvoice(data.invoice);
        setItems(data.items || []);
      } catch (requestError) {
        setError(requestError.message || "Unable to load this invoice.");
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading invoice...</p>;

  if (error) {
    return (
      <div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
          {error}
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/invoices")}
          className="mt-4 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
        >
          Back to invoices
        </button>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Invoice Details</h1>
          <p className="mt-1 text-gray-500">
            {invoice.invoice_number} - issued {formatDate(invoice.issued_at)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/invoices")}
          className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
        >
          Back to invoices
        </button>
      </div>

      <section className="rounded-xl border bg-white p-7 shadow-sm">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-5 border-b pb-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Bill to
            </p>
            <p className="mt-1 font-semibold text-gray-900">{invoice.buyer_name}</p>
            <p className="text-sm text-gray-500">{invoice.buyer_email}</p>
            <p className="mt-3 text-sm text-gray-500">Order #{invoice.order_id}</p>
          </div>
          <button
            type="button"
            onClick={() => downloadAdminInvoicePdf(invoice, items)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            Download PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="border-b text-sm text-gray-500">
              <tr>
                <th className="pb-3 font-medium">Item</th>
                <th className="pb-3 font-medium">Seller</th>
                <th className="pb-3 text-right font-medium">Quantity</th>
                <th className="pb-3 text-right font-medium">Unit price</th>
                <th className="pb-3 text-right font-medium">Line total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 font-medium text-gray-900">{item.product_title}</td>
                  <td className="py-4 text-gray-600">
                    {item.seller_business_name || "ReduxShop"}
                  </td>
                  <td className="py-4 text-right text-gray-700">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-700">
                    {formatMoney(item.unit_price, invoice.currency)}
                  </td>
                  <td className="py-4 text-right font-medium text-gray-900">
                    {formatMoney(item.line_total, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto mt-8 max-w-xs space-y-3 border-t pt-5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatMoney(invoice.subtotal_amount, invoice.currency)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>{formatMoney(invoice.tax_amount, invoice.currency)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Discount</span>
            <span>-{formatMoney(invoice.discount_amount, invoice.currency)}</span>
          </div>
          <div className="flex justify-between border-t pt-3 text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>{formatMoney(invoice.total_amount, invoice.currency)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default InvoiceDetails;
