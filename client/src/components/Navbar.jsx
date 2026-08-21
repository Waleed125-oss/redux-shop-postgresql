
import debounce from "lodash/debounce";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  FaShoppingCart,
  FaUserCircle,
  FaChevronDown,
  FaBars,
  FaTimes,
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

  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // =====================================================
  // DEBOUNCED SEARCH
  // =====================================================

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

  // =====================================================
  // CART
  // =====================================================

  const cartItems = useSelector(
    (state) => state.cart.cartItems
  );

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // =====================================================
  // CLOSE PROFILE DROPDOWN WHEN CLICKING OUTSIDE
  // =====================================================

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

  // =====================================================
  // CLOSE MOBILE MENU WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target)
      ) {
        setMobileMenuOpen(false);
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [mobileMenuOpen]);

  // =====================================================
  // CLOSE MOBILE MENU WHEN USER LOGS OUT
  // =====================================================

  useEffect(() => {
    if (!user) {
      setMobileMenuOpen(false);
      setOpen(false);
    }
  }, [user]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    dispatch(clearCart());
    dispatch(logout());

    setOpen(false);
    setMobileMenuOpen(false);

    navigate("/");
  };

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // =====================================================
  // SEARCH HANDLER
  // =====================================================

  const handleSearchChange = (e) => {
    const value = e.target.value;

    setInputSearch(value);
    debouncedSearch(value);
  };

  // =====================================================
  // CART NAVIGATION
  // =====================================================

  const handleCartClick = () => {
    closeMobileMenu();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      {/* =================================================
          MAIN NAVBAR
      ================================================= */}

      <div className="px-4 sm:px-6 lg:px-10 py-3 lg:py-4">
        <div className="max-w-7xl mx-auto">

          {/* =================================================
              TOP ROW
          ================================================= */}

          <div className="flex items-center justify-between gap-4">

            {/* LOGO */}

            <Link
              to="/"
              onClick={closeMobileMenu}
              className="
                text-2xl
                sm:text-3xl
                font-bold
                text-blue-600
                shrink-0
              "
            >
              ReduxShop
            </Link>

            {/* =================================================
                DESKTOP SEARCH
            ================================================= */}

            <div className="hidden lg:block flex-1 max-w-md mx-6">
              <input
                type="text"
                placeholder="Search products..."
                value={inputSearch}
                onChange={handleSearchChange}
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-lg
                  px-4
                  py-2
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  transition
                "
              />
            </div>

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================= */}

            <div className="hidden lg:flex items-center gap-5 xl:gap-6">

              {/* CART */}

              <Link
                to="/cart"
                className="
                  flex
                  items-center
                  gap-2
                  hover:text-blue-600
                  font-medium
                  whitespace-nowrap
                  transition
                "
              >
                <FaShoppingCart size={20} />

                Cart

                <span
                  className="
                    bg-red-500
                    text-white
                    text-xs
                    rounded-full
                    px-2
                    py-1
                    min-w-[24px]
                    text-center
                  "
                >
                  {totalItems}
                </span>
              </Link>

              {/* =================================================
                  GUEST
              ================================================= */}

              {!user && (
                <>
                  <Link
                    to="/login"
                    className="
                      font-medium
                      hover:text-blue-600
                      whitespace-nowrap
                    "
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="
                      font-medium
                      hover:text-blue-600
                      whitespace-nowrap
                    "
                  >
                    Signup
                  </Link>
                </>
              )}

              {/* =================================================
                  ADMIN
              ================================================= */}

              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="
                    font-medium
                    hover:text-blue-600
                    whitespace-nowrap
                  "
                >
                  Admin
                </Link>
              )}

              {/* =================================================
                  SELLER
              ================================================= */}

              {user?.role === "seller" && (
                <Link
                  to="/seller"
                  className="
                    font-medium
                    hover:text-blue-600
                    whitespace-nowrap
                  "
                >
                  Seller
                </Link>
              )}

              {/* =================================================
                  PROFILE
              ================================================= */}

              {user && (
                <div
                  className="relative"
                  ref={dropdownRef}
                >
                  <button
                    onClick={() => setOpen(!open)}
                    className="
                      flex
                      items-center
                      gap-2
                      hover:text-blue-600
                      transition
                    "
                  >
                    <FaUserCircle
                      size={36}
                      className="text-blue-600"
                    />

                    <div className="text-left hidden xl:block">
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
                        overflow-hidden
                        z-[60]
                      "
                    >
                      <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="
                          block
                          px-5
                          py-3
                          hover:bg-gray-100
                        "
                      >
                        👤 My Profile
                      </Link>

                      <Link
                        to="/my-orders"
                        onClick={() => setOpen(false)}
                        className="
                          block
                          px-5
                          py-3
                          hover:bg-gray-100
                        "
                      >
                        📦 My Orders
                      </Link>

                      {/* BECOME A SELLER */}

                      {user?.role === "customer" && (
                        <Link
                          to="/become-seller"
                          onClick={() => setOpen(false)}
                          className="
                            block
                            px-5
                            py-3
                            text-blue-600
                            hover:bg-blue-50
                          "
                        >
                          🏪 Become a Seller
                        </Link>
                      )}

                      {/* LOGOUT */}

                      <button
                        onClick={handleLogout}
                        className="
                          w-full
                          text-left
                          px-5
                          py-3
                          text-red-600
                          hover:bg-red-50
                        "
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* =================================================
                MOBILE ACTIONS
            ================================================= */}

            <div className="flex lg:hidden items-center gap-3">

              {/* MOBILE CART */}

              <Link
                to="/cart"
                onClick={handleCartClick}
                className="
                  relative
                  flex
                  items-center
                  justify-center
                  w-10
                  h-10
                  rounded-full
                  hover:bg-gray-100
                  transition
                "
              >
                <FaShoppingCart
                  size={20}
                  className="text-gray-700"
                />

                <span
                  className="
                    absolute
                    -top-1
                    -right-1
                    bg-red-500
                    text-white
                    text-[10px]
                    rounded-full
                    min-w-[18px]
                    h-[18px]
                    px-1
                    flex
                    items-center
                    justify-center
                  "
                >
                  {totalItems}
                </span>
              </Link>

              {/* HAMBURGER */}

              <button
                onClick={() =>
                  setMobileMenuOpen(!mobileMenuOpen)
                }
                className="
                  w-10
                  h-10
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  hover:bg-gray-100
                  transition
                "
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <FaTimes size={22} />
                ) : (
                  <FaBars size={22} />
                )}
              </button>
            </div>
          </div>

          {/* =================================================
              MOBILE SEARCH
          ================================================= */}

          <div className="lg:hidden mt-3">
            <input
              type="text"
              placeholder="Search products..."
              value={inputSearch}
              onChange={handleSearchChange}
              className="
                w-full
                border
                border-gray-300
                rounded-lg
                px-4
                py-2.5
                text-sm
                outline-none
                focus:ring-2
                focus:ring-blue-500
                transition
              "
            />
          </div>
        </div>
      </div>

      {/* =================================================
          MOBILE MENU
      ================================================= */}

      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="
            lg:hidden
            border-t
            border-gray-200
            bg-white
            shadow-lg
          "
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

            {/* =================================================
                GUEST MOBILE LINKS
            ================================================= */}

            {!user && (
              <div className="grid grid-cols-2 gap-3">

                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="
                    text-center
                    font-medium
                    px-4
                    py-3
                    rounded-lg
                    bg-gray-100
                    hover:bg-blue-50
                    hover:text-blue-600
                    transition
                  "
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  onClick={closeMobileMenu}
                  className="
                    text-center
                    font-medium
                    px-4
                    py-3
                    rounded-lg
                    bg-blue-600
                    text-white
                    hover:bg-blue-700
                    transition
                  "
                >
                  Signup
                </Link>
              </div>
            )}

            {/* =================================================
                USER MOBILE MENU
            ================================================= */}

            {user && (
              <div className="space-y-2">

                {/* USER INFORMATION */}

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    mb-2
                    bg-gray-50
                    rounded-xl
                  "
                >
                  <FaUserCircle
                    size={42}
                    className="text-blue-600 shrink-0"
                  />

                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {user.name}
                    </p>

                    <p className="text-sm text-gray-500 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                {/* PROFILE */}

                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="
                    block
                    px-4
                    py-3
                    rounded-lg
                    hover:bg-gray-100
                    transition
                  "
                >
                  👤 My Profile
                </Link>

                {/* ORDERS */}

                <Link
                  to="/my-orders"
                  onClick={closeMobileMenu}
                  className="
                    block
                    px-4
                    py-3
                    rounded-lg
                    hover:bg-gray-100
                    transition
                  "
                >
                  📦 My Orders
                </Link>

                {/* ADMIN */}

                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className="
                      block
                      px-4
                      py-3
                      rounded-lg
                      text-blue-600
                      hover:bg-blue-50
                      transition
                    "
                  >
                    🛠️ Admin Dashboard
                  </Link>
                )}

                {/* SELLER */}

                {user?.role === "seller" && (
                  <Link
                    to="/seller"
                    onClick={closeMobileMenu}
                    className="
                      block
                      px-4
                      py-3
                      rounded-lg
                      text-blue-600
                      hover:bg-blue-50
                      transition
                    "
                  >
                    🏪 Seller Dashboard
                  </Link>
                )}

                {/* BECOME SELLER */}

                {user?.role === "customer" && (
                  <Link
                    to="/become-seller"
                    onClick={closeMobileMenu}
                    className="
                      block
                      px-4
                      py-3
                      rounded-lg
                      text-blue-600
                      hover:bg-blue-50
                      transition
                    "
                  >
                    🏪 Become a Seller
                  </Link>
                )}

                {/* LOGOUT */}

                <button
                  onClick={handleLogout}
                  className="
                    w-full
                    text-left
                    px-4
                    py-3
                    rounded-lg
                    text-red-600
                    hover:bg-red-50
                    transition
                  "
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
