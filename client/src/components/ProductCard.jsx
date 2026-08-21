const IMAGE_URL = import.meta.env.VITE_API_URL;

import { useDispatch } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";
import { Link } from "react-router-dom";
import { formatPrice } from "../services/currency";




function ProductCard({ product }) {

   
    console.log(product);
  const dispatch = useDispatch();
  
  


  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 p-4">

   <img
  src={`${IMAGE_URL}${product.image}`}
  alt={product.title}
  className="h-52 w-full object-contain"
/>

 {/* <img
  src={`http://localhost:5000${product.image}`}
  alt={product.title}
  className="h-52 w-full object-contain"
  onError={(e) => {
    console.log("Image failed:", e.target.src);
  }}
/> */}

      <h2 className="font-semibold text-lg mt-4 line-clamp-2">
        {product.title}
      </h2>

      <div className="flex justify-between items-center mt-3">

        <span className="text-yellow-500 font-semibold">
          ⭐ {Number(product.rating || 0).toFixed(1)}
        </span>

        <span className="text-blue-600 font-bold text-xl">
          {formatPrice(product.price)}
        </span>

      </div>

      <div className="mt-5 flex gap-2">

        <Link
          to={`/product/${product.id}`}
          className="flex-1 bg-gray-800 text-white text-center py-2 rounded-lg hover:bg-black transition"
        >
          View
        </Link>

        <button
          onClick={() => dispatch(addToCart(product.id))}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add
        </button>

      </div>

    </div>
  );
}

export default ProductCard;