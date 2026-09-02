const IMAGE_URL = import.meta.env.VITE_API_URL;

import { useDispatch } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";
import { Link } from "react-router-dom";
import { formatPrice } from "../services/currency";




function ProductCard({ product }) {

   
    console.log(product);
  const dispatch = useDispatch();
  
  


  return (
    <div className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/60">

   <img
  src={`${IMAGE_URL}${product.image}`}
  alt={product.title}
  className="h-52 w-full rounded-xl bg-slate-50 object-contain p-3 transition duration-300 group-hover:scale-[1.02]"
/>

 {/* <img
  src={`http://localhost:5000${product.image}`}
  alt={product.title}
  className="h-52 w-full object-contain"
  onError={(e) => {
    console.log("Image failed:", e.target.src);
  }}
/> */}

      <h2 className="mt-4 min-h-14 text-lg font-semibold leading-6 text-slate-800 line-clamp-2">
        {product.title}
      </h2>

      <div className="mt-3 flex items-center justify-between">

        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-600">
          ⭐ {Number(product.rating || 0).toFixed(1)}
        </span>

        <span className="text-xl font-bold text-blue-700">
          {formatPrice(product.price)}
        </span>

      </div>

      <div className="mt-auto flex gap-2 pt-5">

        <Link
          to={`/product/${product.id}`}
          className="flex-1 rounded-xl bg-slate-800 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-950 focus-visible:ring-slate-500"
        >
          View
        </Link>

        <button
          onClick={() => dispatch(addToCart(product.id))}
          className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-700 hover:shadow-md focus-visible:ring-blue-500"
        >
          Add
        </button>

      </div>

    </div>
  );
}

export default ProductCard;
