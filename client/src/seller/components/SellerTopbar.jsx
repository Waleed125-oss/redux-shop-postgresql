
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  FaUserCircle,
  FaChevronDown,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";

import { logout } from "../../store/slices/authSlice";
import { clearCart } from "../../store/slices/cartSlice";

function SellerTopbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(clearCart());
    dispatch(logout());
    setProfileOpen(false);
    navigate("/");
  };

  // ================= HELPERS =================

  const initials = useMemo(() => {
    const name = user?.name || "Seller";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user?.name]);

  return (
    <header
      className="
        relative
        border-b
        border-gray-200/70
        bg-gradient-to-r
        from-indigo-50/70
        via-white/90
        to-fuchsia-50/70
        backdrop-blur-xl
        shadow-[0_1px_12px_rgba(15,23,42,0.06)]
        sticky
        top-0
        z-40
        flex
        flex-col
        gap-3
        px-4
        py-3
        sm:flex-row
        sm:items-center
        sm:justify-between
        sm:px-8
        before:content-['']
        before:absolute
        before:inset-x-0
        before:top-0
        before:h-[3px]
        before:bg-gradient-to-r
        before:from-indigo-500
        before:via-violet-500
        before:to-fuchsia-500
      "
    >
      {/* ================= TITLE ================= */}

      <div className="flex items-center gap-3 min-w-0">

        <span
          className="
            h-8
            w-1.5
            rounded-full
            bg-gradient-to-b
            from-indigo-500
            to-fuchsia-500
            hidden
            sm:block
          "
        />

        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
            Seller Dashboard
          </h2>

          <p className="text-sm text-gray-500 leading-tight">
            Manage your store
          </p>
        </div>

      </div>

      {/* ================= USER ================= */}

      <div className="relative self-start sm:self-auto" ref={profileRef}>
        <button
          type="button"
          onClick={() => setProfileOpen((open) => !open)}
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            px-2
            py-1.5
            text-left
            transition-all
            duration-200
            hover:bg-gray-50
            active:scale-[0.98]
          "
        >
          <div
            className="
              h-10
              w-10
              shrink-0
              rounded-full
              bg-gradient-to-br
              from-indigo-500
              via-violet-500
              to-fuchsia-500
              text-white
              flex
              items-center
              justify-center
              font-semibold
              text-sm
              shadow-md
              ring-2
              ring-white
            "
          >
            {initials || <FaUserCircle size={22} />}
          </div>

          <div className="hidden sm:block">
            <p className="font-semibold text-gray-800 text-sm leading-tight">
              {user?.name || "Seller"}
            </p>

            <p className="text-xs text-gray-500 capitalize leading-tight">
              {user?.role || "seller"}
            </p>
          </div>

          <FaChevronDown
            size={12}
            className={`text-gray-400 transition-transform duration-200 hidden sm:block ${
              profileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {profileOpen && (
          <div
            className="
              absolute
              right-0
              top-[calc(100%+10px)]
              w-60
              bg-white
              border
              border-gray-100
              rounded-2xl
              shadow-2xl
              shadow-slate-900/10
              z-50
              overflow-hidden
              animate-in
              fade-in
              slide-in-from-top-2
              duration-150
            "
          >
            <div
              className="
                px-5
                py-4
                bg-gradient-to-r
                from-indigo-50
                to-fuchsia-50
                border-b
                border-gray-100
              "
            >
              <p className="font-semibold text-gray-800 tracking-tight">
                {user?.name || "Seller"}
              </p>
              <p className="text-xs text-gray-500 mt-1 capitalize">
                {user?.role || "seller"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                navigate("/profile");
              }}
              className="
                w-full
                flex
                items-center
                gap-3
                px-5
                py-3
                text-sm
                text-gray-700
                hover:bg-indigo-50
                hover:text-indigo-700
                transition-colors
                duration-150
              "
            >
              <FaUser className="text-gray-400" />
              My Profile
            </button>

            <div className="border-t border-gray-100">
              <button
                type="button"
                onClick={handleLogout}
                className="
                  w-full
                  flex
                  items-center
                  gap-3
                  px-5
                  py-3
                  text-sm
                  text-rose-600
                  hover:bg-rose-50
                  transition-colors
                  duration-150
                "
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default SellerTopbar;
