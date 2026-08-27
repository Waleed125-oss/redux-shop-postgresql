import { useNavigate } from "react-router-dom";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Payment Cancelled</h1>

      <p>
        Your payment was cancelled. No payment was completed.
      </p>

      <button onClick={() => navigate("/cart")}>
        Return to Cart
      </button>

      <button onClick={() => navigate("/")}>
        Continue Shopping
      </button>
    </div>
  );
};

export default PaymentCancel;