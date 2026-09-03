import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-blue-500/20">
                R
              </div>
              <div>
                <div className="text-lg font-bold text-white">ReduxShop</div>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-6 text-slate-400">
              Smart essentials, trusted brands, and a better way to shop online.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link to="/" className="transition hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop/sellers" className="transition hover:text-white">
                  Shop by Seller
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="transition hover:text-white">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="transition hover:text-white">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
              Customer Care
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link to="/my-invoices" className="transition hover:text-white">
                  Invoices
                </Link>
              </li>
              <li>
                <Link to="/cart" className="transition hover:text-white">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/become-seller" className="transition hover:text-white">
                  Sell with Us
                </Link>
              </li>
              <li>
                <a href="mailto:reduxshop9@gmail.com" className="transition hover:text-white">
                  {/* support@reduxshop.com */}
                  reduxshop9@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
              Stay Updated
            </h3>
            <p className="mb-4 text-sm leading-6 text-slate-400">
              Get the latest deals, releases, and store updates.
            </p>
            <div className="flex items-center overflow-hidden rounded-full border border-slate-700 bg-slate-900">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                aria-label="Email address"
              />
              <button
                type="button"
                className="whitespace-nowrap bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ReduxShop. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span>Secure Checkout</span>
            <span>Fast Shipping</span>
            <span>Easy Returns</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
