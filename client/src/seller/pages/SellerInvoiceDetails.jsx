import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import { fetchSellerInvoiceAPI } from "../../services/api";

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

const downloadSellerInvoicePdf = (invoice, items) => {
  const document = new jsPDF({ unit: "mm", format: "a4" });
  const left = 18;
  const right = 192;
  let y = 22;

  document.setFillColor(37, 99, 235);
  document.rect(0, 0, 210, 12, "F");
  document.setFontSize(22);
  document.setTextColor(17, 24, 39);
  document.text("ReduxShop", left, y);
  document.setFontSize(22);
  document.text("SELLER INVOICE", right, y, { align: "right" });
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
  y += 12;

  const sellerName =
    items.find((item) => item.seller_business_name)?.seller_business_name ||
    "ReduxShop Seller";
  document.text(`Seller: ${sellerName}`, left, y);
  y += 8;

  document.setFillColor(243, 244, 246);
  document.rect(left, y, right - left, 8, "F");
  document.setFontSize(9);
  document.setTextColor(31, 41, 55);
  document.text("Your product", left + 3, y + 5.2);
  document.text("Qty", 132, y + 5.2, { align: "right" });
  document.text("Unit price", 158, y + 5.2, { align: "right" });
  document.text("Total", right - 3, y + 5.2, { align: "right" });
  y += 8;

  items.forEach((item) => {
    const productLines = document.splitTextToSize(
      item.product_sku
        ? `${item.product_title}\nSKU: ${item.product_sku}`
        : item.product_title,
      102
    );
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

  if (y + 40 > 272) {
    document.addPage();
    y = 24;
  }

  y += 10;
  document.setFontSize(10);
  document.setTextColor(17, 24, 39);
  document.text("Gross amount", 158, y, { align: "right" });
  document.text(
    formatMoney(invoice.gross_amount, invoice.currency),
    right - 3,
    y,
    { align: "right" }
  );
  y += 7;
  document.text(
    `Admin commission (${invoice.admin_commission_percentage}%)`,
    158,
    y,
    { align: "right" }
  );
  document.text(
    `-${formatMoney(invoice.admin_commission_amount, invoice.currency)}`,
    right - 3,
    y,
    { align: "right" }
  );
  y += 7;
  document.setFontSize(13);
  document.text("Seller net amount", 158, y, { align: "right" });
  document.text(
    formatMoney(invoice.seller_net_amount, invoice.currency),
    right - 3,
    y,
    { align: "right" }
  );
  y += 7;
  document.setFontSize(8);
  document.setTextColor(107, 114, 128);
  document.text("Shipping is charged to the order and is not included in seller totals.", left, y);
  document.text("This document includes only your products.", left, 285);
  document.save(`${invoice.invoice_number}-seller.pdf`);
};

function SellerInvoiceDetails() {
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
        const data = await fetchSellerInvoiceAPI(id);
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

  if (loading) {
    return <p className="text-gray-500">Loading invoice...</p>;
  }

  if (error) {
    return (
      <div>
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
        <button
          type="button"
          onClick={() => navigate("/seller/invoices")}
          className="mt-4 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
        >
          Back to invoices
        </button>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Invoice details
          </h1>
          <p className="mt-2 text-gray-500">
            {invoice.invoice_number} - issued {formatDate(invoice.issued_at)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/seller/invoices")}
          className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
        >
          Back to invoices
        </button>
      </div>

      <section className="rounded-xl bg-white p-5 shadow sm:p-7">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b pb-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Invoice number
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {invoice.invoice_number}
            </p>
            <p className="mt-2 text-sm text-gray-500">Order #{invoice.order_id}</p>
            <p className="mt-2 text-sm text-gray-500">
              Seller: {invoice.seller_business_name || "Your business"}
            </p>
            <p className="mt-1 break-all text-sm text-gray-500">
              Stripe Customer ID: {invoice.stripe_customer_id || "N/A"}
            </p>
            <p className="mt-1 break-all text-sm text-gray-500">
              Stripe Payment Intent ID: {invoice.stripe_payment_intent_id || "N/A"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => downloadSellerInvoicePdf(invoice, items)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            Download PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead className="border-b text-sm text-gray-500">
              <tr>
                <th className="pb-3 font-medium">Your product</th>
                <th className="pb-3 text-right font-medium">Quantity</th>
                <th className="pb-3 text-right font-medium">Unit price</th>
                <th className="pb-3 text-right font-medium">Line total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 font-medium text-gray-900">
                    {item.product_title}
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
          <div className="flex justify-between gap-6 text-gray-600">
            <span>Products Total / Gross Amount</span>
            <span>{formatMoney(invoice.gross_amount, invoice.currency)}</span>
          </div>
          <div className="flex justify-between gap-6 text-gray-600">
            <span>Admin Commission ({invoice.admin_commission_percentage}%)</span>
            <span>-{formatMoney(invoice.admin_commission_amount, invoice.currency)}</span>
          </div>
          <div className="flex justify-between gap-6 border-t pt-3 text-lg font-bold text-gray-900">
            <span>Seller Total / Net Amount</span>
            <span>{formatMoney(invoice.seller_net_amount, invoice.currency)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SellerInvoiceDetails;
