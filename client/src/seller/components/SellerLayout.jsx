import { Outlet } from "react-router-dom";
import SellerSidebar from './SellerSidebar';
import SellerTopbar from "./SellerTopbar";

function SellerLayout() {
  return (
    <div className="min-h-screen bg-gray-100">

      <div className="flex">

        {/* ================= SIDEBAR ================= */}

        <aside
          className="
            w-64
            shrink-0
            sticky
            top-0
            h-screen
            overflow-y-auto
            bg-slate-900
          "
        >
          <SellerSidebar />
        </aside>


        {/* ================= MAIN AREA ================= */}

        <div className="flex-1 min-w-0">

          {/* Topbar */}

          <div className="sticky top-0 z-40">
            <SellerTopbar />
          </div>


          {/* Page Content */}

          <main
            className="
              p-4
              sm:p-6
              lg:p-8
              min-h-[calc(100vh-64px)]
            "
          >
            <Outlet />
          </main>

        </div>

      </div>

    </div>
  );
}

export default SellerLayout;