
import { useState } from "react";
import {
  FaBoxOpen,
  FaChartBar,
  FaClipboardList,
  FaTags,
  FaUsers,
  FaCog,
  FaStore,
  FaCheckCircle,
  FaArrowLeft,
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
      name: "Customers",
      icon: <FaUsers />,
      path: "/admin/customers",
    },
    {
      name: "Sellers",
      icon: <FaStore />,
    },
    {
      name: "Settings",
      icon: <FaCog />,
      path: "/admin/settings",
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
    <aside className="relative w-64 bg-slate-900 text-white min-h-screen overflow-hidden">

      {/* ================================================= */}
      {/* MAIN SIDEBAR */}
      {/* ================================================= */}

      <div
        className={`w-64 min-h-screen transition-transform duration-300 ease-in-out ${
          sellerOpen ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="text-3xl font-bold text-center py-8 border-b border-slate-700">
          ReduxShop
        </div>

        {/* Main Navigation */}
        <nav className="mt-8">
          {menu.map((item) => {
            // Sellers button
            if (item.name === "Sellers") {
              return (
                <button
                  key={item.name}
                  onClick={() => setSellerOpen(true)}
                  className="w-full flex items-center gap-4 px-8 py-4 transition hover:bg-slate-800"
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
                  `flex items-center gap-4 px-8 py-4 transition ${
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
        className={`absolute top-0 left-0 w-64 min-h-screen bg-slate-900 transition-transform duration-300 ease-in-out ${
          sellerOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* Seller Header */}
        <div className="flex items-center gap-4 px-6 py-8 border-b border-slate-700">

          <button
            onClick={() => setSellerOpen(false)}
            className="text-xl hover:text-blue-400 transition"
          >
            <FaArrowLeft />
          </button>

          <div className="text-2xl font-bold">
            Sellers
          </div>
        </div>

        {/* Seller Navigation */}
        <nav className="mt-8">

          {sellerMenu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-8 py-4 transition ${
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















