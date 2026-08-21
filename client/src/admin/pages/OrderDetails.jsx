import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchSingleOrder,
  updateOrderStatus,
} from "../../store/slices/orderSlice";

function OrderDetails() {

  const { id } = useParams();

  const dispatch = useDispatch();

  const {
    selectedOrder,
    loading,
  } = useSelector((state) => state.orders);

  const [status, setStatus] = useState("");

  useEffect(() => {

    dispatch(fetchSingleOrder(id));

  }, [dispatch, id]);

  useEffect(() => {

    if (selectedOrder) {
      setStatus(selectedOrder.order.status);
    }

  }, [selectedOrder]);

  if (loading || !selectedOrder) {
    return <h2>Loading...</h2>;
  }

  return (

    <div>

      <h1 className="text-3xl font-bold mb-6">
        Order #{selectedOrder.order.id}
      </h1>

      <div className="bg-white rounded-xl shadow p-6">

        <table className="w-full mb-8">

          <thead className="bg-gray-200">

            <tr>

              <th className="p-3 text-left">
                Image
              </th>

              <th className="p-3 text-left">
                Product
              </th>

              <th className="p-3 text-left">
                Quantity
              </th>

              <th className="p-3 text-left">
                Price
              </th>

            </tr>

          </thead>

          <tbody>

            {selectedOrder.items.map((item) => (

              <tr
                key={item.id}
                className="border-b"
              >

                <td className="p-3">

                  
                 <img
  src={
    item.image.startsWith("http")
      ? item.image
      : `${import.meta.env.VITE_API_URL}${item.image}`
  }
  alt={item.title}
  className="w-16 h-16 object-contain"
/> 

                </td>

                <td className="p-3">

                  {item.title}

                </td>

                <td className="p-3">

                  {item.quantity}

                </td>

                <td className="p-3">

                  ${item.price}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        <h2 className="text-xl font-bold mb-4">
          Total: $
          {selectedOrder.order.total_amount}
        </h2>

        <div className="flex gap-4 items-center">

          <select

            value={status}

            onChange={(e) =>
              setStatus(e.target.value)
            }

            className="border p-3 rounded-lg"
          >

            <option>
              Pending
            </option>

            <option>
              Processing
            </option>

            <option>
              Shipped
            </option>

            <option>
              Delivered
            </option>

          </select>

          <button

            onClick={() =>
              dispatch(
                updateOrderStatus({
                  id,
                  status,
                })
              )
            }

            className="bg-blue-600 text-white px-5 py-3 rounded-lg"

          >

            Update Status

          </button>

        </div>

      </div>

    </div>

  );

}

export default OrderDetails;