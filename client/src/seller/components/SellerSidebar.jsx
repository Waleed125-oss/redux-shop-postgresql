// import { NavLink } from "react-router-dom";

// import {
//   FaChartBar,
//   FaBox,
//   FaClipboardList,
//   FaUndo,
// } from "react-icons/fa";

// function SellerSidebar() {

//   const links = [
//     {
//       name: "Dashboard",
//       path: "/seller",
//       icon: <FaChartBar />,
//     },
//     {
//       name: "My Products",
//       path: "/seller/products",
//       icon: <FaBox />,
//     },
//     {
//       name: "Orders",
//       path: "/seller/orders",
//       icon: <FaClipboardList />,
//     },
//       {
//   name: "Refund Requests",
//   icon: <FaUndo />,
//   path: "/seller/refunds",
// },
//   ];

//   return (
//     <div className="min-h-screen text-white">

//       {/* ================= LOGO ================= */}

//       <div className="px-6 py-7 border-b border-slate-700">

//         <h1 className="text-2xl font-bold">
//           ReduxShop
//         </h1>

//         <p className="text-sm text-slate-400 mt-1">
//           Seller Panel
//         </p>

//       </div>


//       {/* ================= NAVIGATION ================= */}

//       <nav className="mt-6">

//         {links.map((link) => (

//           <NavLink
//             key={link.path}
//             to={link.path}
//             end={link.path === "/seller"}
//             className={({ isActive }) =>
//               `
//                 flex
//                 items-center
//                 gap-4
//                 px-6
//                 py-4
//                 transition
//                 ${
//                   isActive
//                     ? "bg-blue-600 text-white"
//                     : "text-slate-300 hover:bg-slate-800 hover:text-white"
//                 }
//               `
//             }
//           >

//             <span className="text-lg">
//               {link.icon}
//             </span>

//             <span>
//               {link.name}
//             </span>

//           </NavLink>

//         ))}

//       </nav>

//     </div>
//   );
// }

// export default SellerSidebar;






































import { NavLink } from "react-router-dom";

import {
  FaChartBar,
  FaBox,
  FaClipboardList,
  FaUndo,
  FaCreditCard,
  FaFileInvoiceDollar,
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
      name: "Invoices",
      path: "/seller/invoices",
      icon: <FaFileInvoiceDollar />,
    },
    {
      name: "Refund Requests",
      icon: <FaUndo />,
      path: "/seller/refunds",
    },
    {
      name: "Stripe Account",
      path: "/seller/stripe-connect",
      icon: <FaCreditCard />,
    },
  ];

  return (
    <div className="min-h-0 text-white lg:min-h-screen">

      {/* ================= LOGO ================= */}

      <div className="hidden border-b border-slate-700 px-6 py-7 lg:block">

        <h1 className="text-2xl font-bold">
          ReduxShop
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Seller Panel
        </p>

      </div>

      {/* ================= NAVIGATION ================= */}

      <nav className="flex overflow-x-auto py-2 lg:mt-6 lg:block lg:overflow-visible lg:py-0">

        {links.map((link) => (

          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/seller"}
            className={({ isActive }) =>
              `
                flex
                shrink-0
                items-center
                gap-3
                px-4
                py-3
                transition
                lg:w-full
                lg:gap-4
                lg:px-6
                lg:py-4
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
