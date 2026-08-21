import {
  FaBoxOpen,
  FaChartBar,
  FaClipboardList,
  FaTags,
  FaUsers,
  FaCog,
  FaStore,
  FaCheckCircle,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

function Sidebar() {
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
  name: "Seller Products",
  icon: <FaCheckCircle />,
  path: "/admin/seller-products",
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
  name: "Seller Applications",
  icon: <FaStore />,
  path: "/admin/seller-applications",
},

{
      name: "Settings",
      icon: <FaCog />,
      path: "/admin/settings",
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen">

      <div className="text-3xl font-bold text-center py-8 border-b border-slate-700">
        ReduxShop
      </div>

      <nav className="mt-8">

        {menu.map((item) => (

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

        ))}

      </nav>

    </aside>
  );
}

export default Sidebar;