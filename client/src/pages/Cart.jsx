const IMAGE_URL = import.meta.env.VITE_API_URL;

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import {
  fetchCart,
  updateQuantity,
  deleteItem,
  checkout,
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

  const handleCheckout = async () => {
    try {
      const result = await dispatch(checkout()).unwrap();

      alert(result.message);

    } catch (error) {
      alert(error);
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">

        <h1 className="text-4xl font-bold mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Side - Cart Items */}
          <div className="lg:col-span-2">

            {cartItems.length === 0 ? (

              <h2 className="text-xl text-gray-500">
                Your cart is empty.
              </h2>

            ) : (

              cartItems.map((item) => (

                <div
                  key={item.id}
                  className="flex items-center gap-6 bg-white p-4 rounded-xl shadow-md mb-5"
                >

                  <img
                    src={`${IMAGE_URL}${item.image}`}
                    alt={item.title}
                    className="w-28 h-28 object-contain"
                  />

                  <div className="flex-1">

                    <h2 className="font-bold text-lg">
                      {item.title}
                    </h2>

                    <p className="text-blue-600 font-semibold mt-2">
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
                        className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
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
                        className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                      >
                        +
                      </button>

                    </div>

                    <button
                      onClick={() =>
                        dispatch(deleteItem(item.id))
                      }
                      className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Remove
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

          {/* Right Side */}
          <div className="bg-white shadow-lg rounded-xl p-6 h-fit">

            <h2 className="text-2xl font-bold mb-6">
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
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
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