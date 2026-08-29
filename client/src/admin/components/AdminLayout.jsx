
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">

      <div className="flex flex-col sm:flex-row">

        {/* ================= SIDEBAR ================= */}

        <aside
          className="
            w-full
            shrink-0
            sm:w-64
            sm:sticky
            sm:top-0
            sm:h-screen
            overflow-y-auto
            bg-slate-900
          "
        >
          <Sidebar />
        </aside>


        {/* ================= MAIN AREA ================= */}

        <div className="flex-1 min-w-0 w-full">

          {/* Topbar */}

          <div className="sticky top-0 z-40">
            <Topbar />
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

export default AdminLayout;