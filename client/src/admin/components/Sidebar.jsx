
import { useState } from "react";
import {
  FaBoxOpen,
  FaChartBar,
  FaClipboardList,
  FaTags,
  FaUsers,
  FaStore,
  FaCheckCircle,
  FaArrowLeft,
  FaUndo,
  FaFileInvoiceDollar,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

function Sidebar() {
  const [sellerOpen, setSellerOpen] = useState(false);

  const menu = [
    {
      name: "Dashboard",
      icon: <FaChartBar />,
      path: "/admin",
    },
    {
      name: "Products",
      icon: <FaBoxOpen />,
      path: "/admin/products",
    },
    {
      name: "Categories",
      icon: <FaTags />,
      path: "/admin/categories",
    },
    {
      name: "Orders",
      icon: <FaClipboardList />,
      path: "/admin/orders",
    },
    {
      name: "Invoices",
      icon: <FaFileInvoiceDollar />,
      path: "/admin/invoices",
    },
    {
      name: "Customers",
      icon: <FaUsers />,
      path: "/admin/customers",
    },
    {
      name: "Sellers",
      icon: <FaStore />,
    },
    {
  name: "Refund Requests",
  icon: <FaUndo />,
  path: "/admin/refunds",
},
  ];

  const sellerMenu = [
    {
      name: "Seller Applications",
      icon: <FaStore />,
      path: "/admin/seller-applications",
    },
    {
      name: "Seller Products",
      icon: <FaCheckCircle />,
      path: "/admin/seller-products",
    },
    {
      name: "Sellers",
      icon: <FaUsers />,
      path: "/admin/sellers",
    },
  ];

  return (
    <aside className="relative w-full min-h-0 overflow-hidden bg-slate-900 text-white lg:w-64 lg:min-h-screen">

      {/* ================================================= */}
      {/* MAIN SIDEBAR */}
      {/* ================================================= */}

      <div
        className={`w-full min-h-0 transition-transform duration-300 ease-in-out lg:w-64 lg:min-h-screen ${
          sellerOpen ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="hidden border-b border-slate-700 py-8 text-center text-3xl font-bold lg:block">
          ReduxShop
        </div>

        {/* Main Navigation */}
        <nav className="flex overflow-x-auto py-2 lg:mt-8 lg:block lg:overflow-visible lg:py-0">
          {menu.map((item) => {
            // Sellers button
            if (item.name === "Sellers") {
              return (
                <button
                  key={item.name}
                  onClick={() => setSellerOpen(true)}
                  className="flex shrink-0 items-center gap-3 px-4 py-3 transition hover:bg-slate-800 lg:w-full lg:gap-4 lg:px-8 lg:py-4"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              );
            }

            // Normal navigation item
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-3 px-4 py-3 transition lg:w-full lg:gap-4 lg:px-8 lg:py-4 ${
                    isActive
                      ? "bg-blue-600"
                      : "hover:bg-slate-800"
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* ================================================= */}
      {/* SELLER SIDEBAR */}
      {/* ================================================= */}

      <div
        className={`absolute top-0 left-0 w-full min-h-0 bg-slate-900 transition-transform duration-300 ease-in-out lg:w-64 lg:min-h-screen ${
          sellerOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* Seller Header */}
        <div className="flex items-center gap-3 border-b border-slate-700 px-4 py-3 lg:gap-4 lg:px-6 lg:py-8">

          <button
            onClick={() => setSellerOpen(false)}
            className="text-xl hover:text-blue-400 transition"
          >
            <FaArrowLeft />
          </button>

          <div className="text-xl font-bold lg:text-2xl">
            Sellers
          </div>
        </div>

        {/* Seller Navigation */}
        <nav className="flex overflow-x-auto py-2 lg:mt-8 lg:block lg:overflow-visible lg:py-0">

          {sellerMenu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 px-4 py-3 transition lg:w-full lg:gap-4 lg:px-8 lg:py-4 ${
                  isActive
                    ? "bg-blue-600"
                    : "hover:bg-slate-800"
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}

        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;















