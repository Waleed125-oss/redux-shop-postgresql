import debounce from "lodash/debounce";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  FaShoppingCart,
  FaUserCircle,
  FaChevronDown,
} from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { clearCart } from "../store/slices/cartSlice";
import { logout } from "../store/slices/authSlice";
import { setSearch } from "../store/slices/searchSlice";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const search = useSelector((state) => state.search.search);

  const [inputSearch, setInputSearch] = useState(search);

  const debouncedSearch = useMemo(
  () =>
    debounce((value) => {
      dispatch(setSearch(value));
    }, 500),
  [dispatch]
);

useEffect(() => {
  return () => {
    debouncedSearch.cancel();
  };
}, [debouncedSearch]);

  const cartItems = useSelector((state) => state.cart.cartItems);

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const handleLogout = () => {
    dispatch(clearCart());

    dispatch(logout());

    setOpen(false);

    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md px-10 py-4 flex justify-between items-center">

      {/* Logo */}

      <Link
        to="/"
        className="text-3xl font-bold text-blue-600"
      >
        ReduxShop
      </Link>

      {/* Search */}

      <input
        type="text"
        placeholder="Search products..."
        value={inputSearch}
        onChange={(e) => {
          const value = e.target.value;

          setInputSearch(value);
          debouncedSearch(value);
        }}
        className="w-96 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Navigation */}

      <div className="flex items-center gap-6">

        {/* Cart */}

        <Link
          to="/cart"
          className="flex items-center gap-2 hover:text-blue-600 font-medium"
        >
          <FaShoppingCart size={20} />

          Cart

          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
            {totalItems}
          </span>
        </Link>

        {/* Guest */}

        {!user && (
          <>
            <Link
              to="/login"
              className="font-medium hover:text-blue-600"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="font-medium hover:text-blue-600"
            >
              Signup
            </Link>
          </>
        )}

        {/* Admin */}

        {user?.role === "admin" && (
          <Link
            to="/admin"
            className="font-medium hover:text-blue-600"
          >
            Admin
          </Link>
        )}

        {/* Seller */}

{user?.role === "seller" && (
  <Link
    to="/seller"
    className="font-medium hover:text-blue-600"
  >
    Seller
  </Link>
)}

        {/* Profile */}

        {user && (
          <div
            className="relative"
            ref={dropdownRef}
          >

            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <FaUserCircle
                size={36}
                className="text-blue-600"
              />

              <div className="text-left">
                <p className="font-semibold">
                  {user.name}
                </p>

                <p className="text-xs text-gray-500 capitalize">
                  {user.role}
                </p>
              </div>

              <FaChevronDown size={14} />
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border overflow-hidden">

                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="block px-5 py-3 hover:bg-gray-100"
                >
                  👤 My Profile
                </Link>

                <Link
                  to="/my-orders"
                  onClick={() => setOpen(false)}
                  className="block px-5 py-3 hover:bg-gray-100"
                >
                  📦 My Orders
                </Link>

                {/* ================= BECOME A SELLER ================= */}

{user?.role === "customer" && (
  <Link
    to="/become-seller"
    onClick={() => setOpen(false)}
    className="block px-5 py-3 text-blue-600 hover:bg-blue-50"
  >
    🏪 Become a Seller
  </Link>
)}

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50"
                >
                  🚪 Logout
                </button>

              </div>
            )}

          </div>
        )}

      </div>

    </nav>
  );
}

export default Navbar;