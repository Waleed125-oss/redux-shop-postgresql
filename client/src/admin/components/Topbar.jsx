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
import { setSearch } from "../../store/slices/searchSlice";

function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const search = useSelector(
    (state) => state.search.search
  );

  const [inputSearch, setInputSearch] =
  useState(search);

  const debouncedSearch = useMemo(
    () => 
      debounce((value) => {
        dispatch(setSearch(value));
      }, 500),
      [dispatch]
  );

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

  // ================= SEARCH =================

  const handleSearch = (e) => {
  const value = e.target.value;

  setInputSearch(value);

  debouncedSearch(value);
};

useEffect(() => {
  return () => {
    debouncedSearch.cancel();
  };
}, [debouncedSearch]);

  return (
    <header
      className="
        h-20
        bg-white
        border-b
        border-gray-200
        flex
        items-center
        justify-between
        px-8
        shadow-sm
      "
    >

      {/* ================= SEARCH ================= */}

      <div className="relative w-96">

        <FaSearch
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-gray-400
          "
        />

        <input
          type="text"
          placeholder="Search..."
          value={inputSearch}
          onChange={handleSearch}
          className="
            w-full
            pl-12
            pr-4
            py-3
            rounded-xl
            border
            border-gray-300
            text-gray-700
            placeholder-gray-400
            outline-none
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-100
            transition
          "
        />

      </div>


      {/* ================= RIGHT SECTION ================= */}

      <div className="flex items-center gap-6">


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
              p-2
              rounded-full
              hover:bg-gray-100
              transition
            "
          >

            <FaBell
              size={22}
              className="text-gray-600"
            />

            {/* Notification Count */}

            <span
              className="
                absolute
                -top-1
                -right-1
                bg-red-500
                text-white
                text-xs
                font-semibold
                rounded-full
                w-5
                h-5
                flex
                items-center
                justify-center
              "
            >
              3
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
                rounded-xl
                shadow-xl
                border
                border-gray-200
                overflow-hidden
                z-50
              "
            >

              <div
                className="
                  px-5
                  py-4
                  border-b
                  border-gray-200
                  flex
                  items-center
                  justify-between
                "
              >

                <h3 className="font-semibold text-gray-800">
                  Notifications
                </h3>

                <span
                  className="
                    text-xs
                    bg-red-50
                    text-red-600
                    px-2
                    py-1
                    rounded-full
                    font-medium
                  "
                >
                  3 new
                </span>

              </div>


              <div className="divide-y">

                <div className="px-5 py-4 hover:bg-gray-50 cursor-pointer">

                  <p className="font-medium text-gray-800 text-sm">
                    New order received
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    A new customer order has been placed.
                  </p>

                </div>


                <div className="px-5 py-4 hover:bg-gray-50 cursor-pointer">

                  <p className="font-medium text-gray-800 text-sm">
                    Product updated
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    A product was recently updated.
                  </p>

                </div>


                <div className="px-5 py-4 hover:bg-gray-50 cursor-pointer">

                  <p className="font-medium text-gray-800 text-sm">
                    Low stock alert
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Some products may need restocking.
                  </p>

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
              rounded-xl
              px-2
              py-1
              hover:bg-gray-50
              transition
            "
          >

            <FaUserCircle
              size={42}
              className="text-blue-600"
            />

            <div className="text-left">

              <p className="font-semibold text-gray-800">
                {user?.name || "Admin"}
              </p>

              <p
                className="
                  text-sm
                  text-gray-500
                  capitalize
                "
              >
                {user?.role || "Admin"}
              </p>

            </div>

            <FaChevronDown
              size={13}
              className={`
                text-gray-400
                transition-transform
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
                w-56
                bg-white
                rounded-xl
                shadow-xl
                border
                border-gray-200
                overflow-hidden
                z-50
              "
            >

              {/* User Header */}

              <div
                className="
                  px-5
                  py-4
                  bg-gray-50
                  border-b
                  border-gray-200
                "
              >

                <p className="font-semibold text-gray-800">
                  {user?.name || "Admin"}
                </p>

                <p className="text-xs text-gray-500 mt-1">
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
                  hover:bg-gray-50
                  transition
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
                  hover:bg-gray-50
                  transition
                "
              >

                <FaCog className="text-gray-400" />

                Settings

              </button>


              {/* Logout */}

              <div className="border-t border-gray-200">

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
                    text-red-600
                    hover:bg-red-50
                    transition
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