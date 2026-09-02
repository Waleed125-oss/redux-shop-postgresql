
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/60">

      <div className="flex min-h-screen flex-col lg:flex-row">

        {/* ================= SIDEBAR ================= */}

        <aside
          className="
            w-full
            shrink-0
            lg:w-64
            lg:sticky
            lg:top-0
            lg:h-screen
            overflow-y-auto
            bg-slate-950
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
            xl:p-10
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
