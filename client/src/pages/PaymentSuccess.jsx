import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchCart } from "../store/slices/cartSlice";


const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState(null);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("Payment session not found.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5000/api/payment/verify-session/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to verify payment"
          );
        }

        setOrder(data.order);

        // Refresh Redux cart after successful payment
        dispatch(fetchCart());

        setStatus("success");
        setMessage("Your payment was successful!");
      } catch (error) {
        console.error("Payment verification error:", error);

        setStatus("error");
        setMessage(error.message);
      }
    };

    verifyPayment();
  }, [sessionId, dispatch]);

  // ==============================
  // VERIFYING
  // ==============================

  if (status === "verifying") {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "80px auto",
          textAlign: "center",
          padding: "40px",
        }}
      >
        <h2>Verifying Payment...</h2>

        <p>
          Please wait while we verify your payment.
        </p>
      </div>
    );
  }

  // ==============================
  // ERROR
  // ==============================

  if (status === "error") {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "80px auto",
          textAlign: "center",
          padding: "40px",
        }}
      >
        <h2>Payment Verification Failed</h2>

        <p>{message}</p>

        <button
          onClick={() => navigate("/cart")}
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            cursor: "pointer",
          }}
        >
          Back to Cart
        </button>
      </div>
    );
  }

  // ==============================
  // SUCCESS
  // ==============================

  return (
    <div
      style={{
        maxWidth: "650px",
        margin: "60px auto",
        padding: "40px",
        textAlign: "center",
        border: "1px solid #ddd",
        borderRadius: "12px",
        backgroundColor: "#fff",
      }}
    >
      {/* Success Icon */}
      <div
        style={{
          width: "70px",
          height: "70px",
          margin: "0 auto 20px",
          borderRadius: "50%",
          backgroundColor: "#22c55e",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "40px",
        }}
      >
        ✓
      </div>

      <h1>Payment Successful!</h1>

      <p style={{ fontSize: "18px" }}>
        {message}
      </p>

      <p>
        Thank you for your purchase. Your order has
        been placed successfully.
      </p>

      {/* Order Information */}

      {order && (
        <div
          style={{
            marginTop: "30px",
            padding: "25px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            textAlign: "left",
          }}
        >
          <h3>Order Details</h3>

          <p>
            <strong>Order ID:</strong> #{order.id}
          </p>

          <p>
            <strong>Total:</strong> $
            {Number(order.total_amount).toFixed(2)}
          </p>

          <p>
            <strong>Payment:</strong>{" "}
            <span style={{ color: "#16a34a" }}>
              {order.payment_status}
            </span>
          </p>

          <p>
            <strong>Order Status:</strong>{" "}
            {order.status}
          </p>
        </div>
      )}

      {/* Buttons */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          marginTop: "30px",
        }}
      >
        <button
          onClick={() => navigate("/my-orders")}
          style={{
            padding: "12px 24px",
            cursor: "pointer",
          }}
        >
          View My Orders
        </button>

        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 24px",
            cursor: "pointer",
          }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;