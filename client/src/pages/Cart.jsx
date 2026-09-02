const IMAGE_URL = import.meta.env.VITE_API_URL;

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import {
  fetchCart,
  updateQuantity,
  deleteItem,
  checkout,
  createStripeCheckout,
} from "../store/slices/cartSlice";

import Navbar from "../components/Navbar";
import { formatPrice } from "../services/currency";

function Cart() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const cartItems = useSelector((state) => state.cart.cartItems);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // const handleCheckout = async () => {
  //   try {
  //     const result = await dispatch(checkout()).unwrap();

  //     alert(result.message);

  //   } catch (error) {
  //     alert(error);
  //   }
  // };


  const handleCheckout = async () => {
  try {
    const result = await dispatch(
      createStripeCheckout()
    ).unwrap();

    if (result.url) {
      window.location.href = result.url;
    } else {
      alert("Stripe checkout URL not received.");
    }

  } catch (error) {
    console.error(error);
    alert(error);
  }
};

  return (
    <>
      <Navbar />

      <div className="page-container">

        <h1 className="section-title mb-8 sm:text-4xl">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Side - Cart Items */}
          <div className="lg:col-span-2">

            {cartItems.length === 0 ? (

              <div className="empty-state">Your cart is empty.</div>

            ) : (

              cartItems.map((item) => (

                <div
                  key={item.id}
                  className="mb-5 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                >

                  <img
                    src={`${IMAGE_URL}${item.image}`}
                    alt={item.title}
                    className="h-28 w-28 rounded-xl bg-slate-50 object-contain p-2"
                  />

                  <div className="flex-1">

                    <h2 className="text-lg font-bold text-slate-800">
                      {item.title}
                    </h2>

                    <p className="mt-2 font-semibold text-blue-700">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex items-center gap-3 mt-4">

                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              id: item.id,
                              quantity: item.quantity - 1,
                            })
                          )
                        }
                        className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        -
                      </button>

                      <span className="font-bold text-lg">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              id: item.id,
                              quantity: item.quantity + 1,
                            })
                          )
                        }
                        className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        +
                      </button>

                    </div>

                    <button
                      onClick={() =>
                        dispatch(deleteItem(item.id))
                      }
                      className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      Remove
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

          {/* Right Side */}
          <div className="surface-card h-fit p-6 lg:sticky lg:top-24">

            <h2 className="mb-6 text-2xl font-bold text-slate-800">
              Order Summary
            </h2>

            <div className="flex justify-between mb-4">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            <div className="flex justify-between mb-4">
              <span>Shipping</span>
              <span className="text-green-600">
                FREE
              </span>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-md"
            >
              Checkout
            </button>

          </div>

        </div>

      </div>
    </>
  );
}

export default Cart;
