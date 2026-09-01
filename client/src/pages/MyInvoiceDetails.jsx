import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import Navbar from "../components/Navbar";
import { fetchMyInvoiceAPI } from "../services/api";

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

const addPdfPageIfNeeded = (document, y, requiredHeight) => {
  if (y + requiredHeight <= 272) {
    return y;
  }

  document.addPage();
  return 24;
};

const downloadInvoicePdf = (invoice, items) => {
  const document = new jsPDF({ unit: "mm", format: "a4" });
  const left = 18;
  const right = 192;
  let y = 22;

  document.setFillColor(37, 99, 235);
  document.rect(0, 0, 210, 12, "F");
  document.setFontSize(22);
  document.setTextColor(17, 24, 39);
  document.text("ReduxShop", left, y);
  document.setFontSize(28);
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
  document.text(`Currency: ${invoice.currency}`, right, y, {
    align: "right",
  });
  y += 6;
  document.text(`Stripe customer: ${invoice.stripe_customer_id || "N/A"}`, left, y);
  document.text(
    `Payment intent: ${invoice.stripe_payment_intent_id || "N/A"}`,
    right,
    y,
    { align: "right" }
  );
  y += 6;
  document.text(`Payment status: ${invoice.payment_status || "paid"}`, left, y);
  document.text(
    `Order date: ${formatDate(invoice.order_created_at || invoice.issued_at)}`,
    right,
    y,
    { align: "right" }
  );
  y += 6;
  const buyerLines = document.splitTextToSize(
    `Bill to: ${invoice.buyer_name || "Customer"} <${invoice.buyer_email || ""}>`,
    right - left
  );
  document.text(buyerLines, left, y);
  y += buyerLines.length * 5;
  y += 12;

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
    const productLines = document.splitTextToSize(
      productLabel,
      102
    );
    const itemHeight = Math.max(9, productLines.length * 4.5 + 4);
    y = addPdfPageIfNeeded(document, y, itemHeight);

    document.setDrawColor(229, 231, 235);
    document.line(left, y + itemHeight, right, y + itemHeight);
    document.setFontSize(9);
    document.setTextColor(17, 24, 39);
    document.text(productLines, left + 3, y + 5.2);
    document.text(String(item.quantity), 132, y + 5.2, {
      align: "right",
    });
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

  y = addPdfPageIfNeeded(document, y, 36);
  y += 10;
  document.setFontSize(10);
  document.setTextColor(75, 85, 99);
  document.text("Subtotal", 158, y, { align: "right" });
  document.text(
    formatMoney(invoice.subtotal_amount, invoice.currency),
    right - 3,
    y,
    { align: "right" }
  );
  y += 6;
  document.text("Tax", 158, y, { align: "right" });
  document.text(
    formatMoney(invoice.tax_amount, invoice.currency),
    right - 3,
    y,
    { align: "right" }
  );
  y += 6;
  document.text("Shipping", 158, y, { align: "right" });
  document.text(formatMoney(0, invoice.currency), right - 3, y, {
    align: "right",
  });
  y += 6;
  document.text("Discount", 158, y, { align: "right" });
  document.text(
    `-${formatMoney(invoice.discount_amount, invoice.currency)}`,
    right - 3,
    y,
    { align: "right" }
  );
  y += 8;
  document.setFontSize(13);
  document.setTextColor(17, 24, 39);
  document.text("Total", 158, y, { align: "right" });
  document.text(
    formatMoney(invoice.total_amount, invoice.currency),
    right - 3,
    y,
    { align: "right" }
  );

  document.setFontSize(8);
  document.setTextColor(107, 114, 128);
  document.text(
    "Thank you for shopping with ReduxShop.",
    left,
    285
  );
  document.save(`${invoice.invoice_number}.pdf`);
};

function MyInvoiceDetails() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchMyInvoiceAPI(id);
        setInvoice(data.invoice);
        setItems(data.items || []);
      } catch (requestError) {
        setError(
          requestError.message || "Unable to load this invoice."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id]);

  return (
    <>
      <Navbar />

      <main className="max-w-5xl mx-auto px-5 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Invoice</h1>
            {invoice && (
              <p className="mt-2 text-gray-500">
                {invoice.invoice_number} - issued {formatDate(invoice.issued_at)}
              </p>
            )}
          </div>
          <Link
            to="/my-invoices"
            className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to invoices
          </Link>
        </div>

        {loading && <p className="text-gray-500">Loading invoice...</p>}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && invoice && (
          <section className="rounded-xl bg-white p-6 shadow sm:p-8">
            <div className="mb-8 flex flex-wrap items-start justify-between gap-5 border-b pb-6">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Invoice number
                </p>
                <p className="mt-1 text-xl font-bold">{invoice.invoice_number}</p>
                <p className="mt-2 text-sm text-gray-500">
                  Order #{invoice.order_id}
                </p>
                <p className="mt-2 break-all text-sm text-gray-500">
                  Stripe Customer ID: {invoice.stripe_customer_id || "N/A"}
                </p>
                <p className="mt-1 break-all text-sm text-gray-500">
                  Stripe Payment Intent ID: {invoice.stripe_payment_intent_id || "N/A"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => downloadInvoicePdf(invoice, items)}
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
              >
                Download PDF
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead className="border-b text-sm text-gray-500">
                  <tr>
                    <th className="pb-3 font-medium">Item</th>
                    <th className="pb-3 text-right font-medium">Quantity</th>
                    <th className="pb-3 text-right font-medium">Unit price</th>
                    <th className="pb-3 text-right font-medium">Line total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4">
                        <p className="font-medium text-gray-900">
                          {item.product_title}
                        </p>
                        {item.seller_business_name && (
                          <p className="mt-1 text-sm text-gray-500">
                            Sold by {item.seller_business_name}
                          </p>
                        )}
                      </td>
                      <td className="py-4 text-right text-gray-700">
                        {item.quantity}
                      </td>
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
        )}
      </main>
    </>
  );
}

export default MyInvoiceDetails;
