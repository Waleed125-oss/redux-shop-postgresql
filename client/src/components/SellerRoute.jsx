import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function SellerRoute({ children }) {
  const { user } = useSelector(
    (state) => state.auth
  );

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not seller
  if (user.role !== "seller") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default SellerRoute;