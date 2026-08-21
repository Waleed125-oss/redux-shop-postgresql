import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  FaUserCircle,
  FaChevronDown,
} from "react-icons/fa";

import { logout } from "../../store/slices/authSlice";
import { clearCart } from "../../store/slices/cartSlice";

function SellerTopbar() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector(
    (state) => state.auth
  );

  const handleLogout = () => {

    dispatch(clearCart());

    dispatch(logout());

    navigate("/");
  };

  return (
    <header
      className="
        h-20
        bg-white
        border-b
        flex
        items-center
        justify-between
        px-6
      "
    >

      {/* ================= TITLE ================= */}

      <div>

        <h2 className="text-xl font-semibold text-gray-800">
          Seller Dashboard
        </h2>

        <p className="text-sm text-gray-500">
          Manage your store
        </p>

      </div>


      {/* ================= USER ================= */}

      <div className="flex items-center gap-3">

        <FaUserCircle
          size={38}
          className="text-blue-600"
        />

        <div>

          <p className="font-semibold text-gray-800">
            {user?.name}
          </p>

          <p className="text-sm text-gray-500 capitalize">
            {user?.role}
          </p>

        </div>

        <FaChevronDown
          size={14}
          className="text-gray-500"
        />

        <button
          onClick={handleLogout}
          className="
            ml-4
            px-4
            py-2
            text-sm
            text-red-600
            hover:bg-red-50
            rounded-lg
          "
        >
          Logout
        </button>

      </div>

    </header>
  );
}

export default SellerTopbar;