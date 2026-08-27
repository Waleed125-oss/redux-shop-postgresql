import { NavLink } from "react-router-dom";

import {
  FaChartBar,
  FaBox,
  FaClipboardList,
  FaCog,
  FaUndo,
} from "react-icons/fa";

function SellerSidebar() {

  const links = [
    {
      name: "Dashboard",
      path: "/seller",
      icon: <FaChartBar />,
    },
    {
      name: "My Products",
      path: "/seller/products",
      icon: <FaBox />,
    },
    {
      name: "Orders",
      path: "/seller/orders",
      icon: <FaClipboardList />,
    },
      {
  name: "Refund Requests",
  icon: <FaUndo />,
  path: "/seller/refunds",
},
    {
      name: "Settings",
      path: "/seller/settings",
      icon: <FaCog />,
    },
  ];

  return (
    <div className="min-h-screen text-white">

      {/* ================= LOGO ================= */}

      <div className="px-6 py-7 border-b border-slate-700">

        <h1 className="text-2xl font-bold">
          ReduxShop
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Seller Panel
        </p>

      </div>


      {/* ================= NAVIGATION ================= */}

      <nav className="mt-6">

        {links.map((link) => (

          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/seller"}
            className={({ isActive }) =>
              `
                flex
                items-center
                gap-4
                px-6
                py-4
                transition
                ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }
              `
            }
          >

            <span className="text-lg">
              {link.icon}
            </span>

            <span>
              {link.name}
            </span>

          </NavLink>

        ))}

      </nav>

    </div>
  );
}

export default SellerSidebar;