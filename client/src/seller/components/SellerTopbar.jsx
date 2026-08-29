import { useEffect, useRef, useState } from "react";
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

  return (
    <header
      className="
        bg-white
        border-b
        border-gray-200
        flex
        flex-col
        gap-3
        px-4
        py-3
        sm:flex-row
        sm:items-center
        sm:justify-between
        sm:px-6
      "
    >
      {/* ================= TITLE ================= */}

      <div className="min-w-0">
        <h2 className="text-xl font-semibold text-gray-800">
          Seller Dashboard
        </h2>

        <p className="text-sm text-gray-500">
          Manage your store
        </p>
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
            rounded-xl
            px-2
            py-2
            text-left
            transition
            hover:bg-gray-50
          "
        >
          <FaUserCircle
            size={38}
            className="text-blue-600"
          />

          <div>
            <p className="font-semibold text-gray-800">
              {user?.name || "Seller"}
            </p>

            <p className="text-sm text-gray-500 capitalize">
              {user?.role || "seller"}
            </p>
          </div>

          <FaChevronDown
            size={14}
            className={`text-gray-500 transition-transform ${
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
              w-56
              bg-white
              border
              border-gray-200
              rounded-xl
              shadow-lg
              z-50
              overflow-hidden
            "
          >
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <p className="font-semibold text-gray-800">
                {user?.name || "Seller"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
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
                justify-between
                gap-2
                px-4
                py-3
                text-sm
                text-gray-700
                hover:bg-gray-50
                transition
              "
            >
              <span className="flex items-center gap-2">
                <FaUser size={12} className="text-gray-400" />
                My Profile
              </span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="
                w-full
                flex
                items-center
                justify-between
                gap-2
                px-4
                py-3
                text-sm
                text-red-600
                hover:bg-red-50
                transition
              "
            >
              <span>Logout</span>
              <FaSignOutAlt size={12} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default SellerTopbar;