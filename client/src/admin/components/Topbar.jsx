
import { useEffect, useRef, useState, useMemo } from "react";
import debounce from "lodash/debounce";
import {
  FaBell,
  FaSearch,
  FaUserCircle,
  FaChevronDown,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../../store/slices/authSlice";
import { clearCart } from "../../store/slices/cartSlice";

function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // ================= CLICK OUTSIDE =================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ================= LOGOUT =================

  const handleLogout = () => {
    dispatch(clearCart());
    dispatch(logout());

    setProfileOpen(false);

    navigate("/");
  };

  // ================= HELPERS =================

  const initials = useMemo(() => {
    const name = user?.name || "Admin";
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
        bg-gradient-to-r
        from-indigo-50/70
        via-white/90
        to-fuchsia-50/70
        backdrop-blur-xl
        border-b
        border-gray-200/70
        flex
        items-center
        justify-between
        px-4
        py-3
        shadow-[0_1px_12px_rgba(15,23,42,0.06)]
        sticky
        top-0
        z-40
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

      {/* ================= LEFT SECTION / TITLE ================= */}

      <div className="hidden sm:flex items-center gap-3">

        <span
          className="
            h-8
            w-1.5
            rounded-full
            bg-gradient-to-b
            from-indigo-500
            to-fuchsia-500
          "
        />

        <div>
          <h1
            className="
              text-xl
              font-bold
              text-slate-900
              tracking-tight
              leading-tight
            "
          >
            Admin Dashboard
          </h1>

          <p className="text-sm text-gray-500 leading-tight">
            Manage your store
          </p>
        </div>

      </div>


      {/* ================= RIGHT SECTION ================= */}

      <div className="flex items-center justify-between gap-3 sm:justify-end sm:w-auto w-full sm:gap-5">


        {/* ================= NOTIFICATIONS ================= */}

        <div
          className="relative"
          ref={notificationRef}
        >

          <button
            onClick={() => {
              setNotificationOpen(
                !notificationOpen
              );

              setProfileOpen(false);
            }}
            className="
              relative
              p-2.5
              rounded-full
              text-gray-500
              hover:text-indigo-600
              hover:bg-indigo-50
              active:scale-95
              transition-all
              duration-200
            "
          >

            <FaBell size={20} />

            {/* Notification Count */}

            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
              <span
                className="
                  animate-ping
                  absolute
                  inline-flex
                  h-full
                  w-full
                  rounded-full
                  bg-rose-400
                  opacity-60
                "
              />
              <span
                className="
                  relative
                  inline-flex
                  items-center
                  justify-center
                  h-4
                  w-4
                  rounded-full
                  bg-gradient-to-br
                  from-rose-500
                  to-orange-500
                  text-white
                  text-[10px]
                  font-bold
                  shadow-sm
                "
              >
                3
              </span>
            </span>

          </button>


          {/* Notification Dropdown */}

          {notificationOpen && (

            <div
              className="
                absolute
                right-0
                mt-3
                w-80
                bg-white
                rounded-2xl
                shadow-2xl
                shadow-slate-900/10
                border
                border-gray-100
                overflow-hidden
                z-50
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
                  to-white
                  border-b
                  border-gray-100
                  flex
                  items-center
                  justify-between
                "
              >

                <h3 className="font-semibold text-gray-800 tracking-tight">
                  Notifications
                </h3>

                <span
                  className="
                    text-xs
                    bg-rose-100
                    text-rose-600
                    px-2.5
                    py-1
                    rounded-full
                    font-semibold
                  "
                >
                  3 new
                </span>

              </div>


              <div className="divide-y divide-gray-50">

                <div className="px-5 py-4 hover:bg-indigo-50/50 cursor-pointer transition-colors flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      New order received
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      A new customer order has been placed.
                    </p>
                  </div>
                </div>


                <div className="px-5 py-4 hover:bg-indigo-50/50 cursor-pointer transition-colors flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      Product updated
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      A product was recently updated.
                    </p>
                  </div>
                </div>


                <div className="px-5 py-4 hover:bg-indigo-50/50 cursor-pointer transition-colors flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      Low stock alert
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Some products may need restocking.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          )}

        </div>


        {/* ================= PROFILE ================= */}

        <div
          className="relative"
          ref={profileRef}
        >

          <button
            onClick={() => {
              setProfileOpen(!profileOpen);

              setNotificationOpen(false);
            }}
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              px-2
              py-1.5
              hover:bg-gray-50
              active:scale-[0.98]
              transition-all
              duration-200
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
              {initials || <FaUserCircle size={24} />}
            </div>

            <div className="text-left hidden sm:block">

              <p className="font-semibold text-gray-800 text-sm leading-tight">
                {user?.name || "Admin"}
              </p>

              <p
                className="
                  text-xs
                  text-gray-500
                  capitalize
                  leading-tight
                "
              >
                {user?.role || "Admin"}
              </p>

            </div>

            <FaChevronDown
              size={12}
              className={`
                text-gray-400
                transition-transform
                duration-200
                hidden
                sm:block
                ${profileOpen ? "rotate-180" : ""}
              `}
            />

          </button>


          {/* Profile Dropdown */}

          {profileOpen && (

            <div
              className="
                absolute
                right-0
                mt-3
                w-60
                bg-white
                rounded-2xl
                shadow-2xl
                shadow-slate-900/10
                border
                border-gray-100
                overflow-hidden
                z-50
                animate-in
                fade-in
                slide-in-from-top-2
                duration-150
              "
            >

              {/* User Header */}

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
                  {user?.name || "Admin"}
                </p>

                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {user?.role || "Admin"}
                </p>

              </div>


              {/* Profile */}

              <button
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


              {/* Settings */}

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/admin/settings");
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

                <FaCog className="text-gray-400" />

                Settings

              </button>


              {/* Logout */}

              <div className="border-t border-gray-100">

                <button
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

      </div>

    </header>
  );
}

export default Topbar;
