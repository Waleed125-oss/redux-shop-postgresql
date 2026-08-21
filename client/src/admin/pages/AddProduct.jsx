import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../store/slices/categorySlice";
import { useNavigate } from "react-router-dom";

import { createProduct } from "../../store/slices/productSlice";
import { useEffect } from "react";


function AddProduct() {

  const dispatch = useDispatch();

  const { categories} = useSelector(
    (state) => state.categories
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  const navigate = useNavigate();


  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category_id, setCategoryId] = useState("");
  const [image, setImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [rating, setRating] = useState("");



  const handleSubmit = async (e) => {

    e.preventDefault();

   const formData = new FormData();

formData.append("title", title);
formData.append("price", price);
formData.append("description", description);
formData.append("category_id", category_id);
formData.append("rating", rating);

if (image) {
  formData.append("image", image);
}

galleryImages.forEach((file) => {
  formData.append("images", file);
});

    try {

      await dispatch(createProduct(formData)).unwrap();


      // clear form

      setTitle("");
      setPrice("");
      setDescription("");
      setCategoryId("");
      setImage(null);
      setRating("");
      setGalleryImages([]);


      // go back to products page

      navigate("/admin/products");


    } catch (error) {

      console.log("Failed to add product:", error);

    }


  };



  return (
    <div className="max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-8">
        Add Product
      </h1>


      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-6 space-y-5"
      >


        <div>
          <label className="block font-semibold mb-2">
            Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="Enter product title"
          />
        </div>



        <div>
          <label className="block font-semibold mb-2">
            Price
          </label>

          <input
            type="number"
            value={price}
            onChange={(e)=>setPrice(e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="Enter price"
          />
        </div>



        <div>
          <label className="block font-semibold mb-2">
            Description
          </label>

          <textarea
            rows="4"
            value={description}
            onChange={(e)=>setDescription(e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="Enter description"
          />

        </div>



       <div>
  <label className="block font-semibold mb-2">
    Category
  </label>

  <select
    value={category_id}
    onChange={(e) => setCategoryId(e.target.value)}
    className="w-full border rounded-lg p-3"
  >
    <option value="">
      Select Category
    </option>

    {categories.map((item) => (
      <option
        key={item.id}
        value={item.id}
      >
        {item.name}
      </option>
    ))}
  </select>
</div>



        <div>
          <label className="block font-semibold mb-2">
            Image URL
          </label>

          <input
             type="file"
             accept="image/*"
             onChange={(e) => setImage(e.target.files[0])}
             className="w-full border rounded-lg p-3"
          />

        </div>


        // Gallery input

        <div>
          <label className="block font-semibold mb-2">
             Gallery Images
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => 
              setGalleryImages(
                Array.from(e.target.files)
              )
            }
            className="w-full border rounded-lg p-3"
          />

          <p className="text-sm text-gray-500 mt-2">
             You can select multiple images for the product gallery.
          </p>
        </div>




        <div>
          <label className="block font-semibold mb-2">
            Rating
          </label>

          <input
            type="number"
            step="0.1"
            value={rating}
            onChange={(e)=>setRating(e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="Enter rating"
          />

        </div>



        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Add Product
        </button>



      </form>


    </div>
  );
}


export default AddProduct;