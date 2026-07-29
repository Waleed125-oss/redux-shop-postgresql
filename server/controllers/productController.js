const pool = require("../config/db");

// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// GET SINGLE PRODUCT
const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      category,
      image,
      rating,
    } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        message: "price must be greater than 0"
      });
    }

    if (!description || description.trim() === " ") {
      return res.status(400).json({
        message: "Description is required",
      });
    }

    if (!category || category.trim() === "") {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    if (!image || image.trim() === "") {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be betweem 0 and 5",
      });
    }


    const result = await pool.query(
      `INSERT INTO products
      (title, price, description, category, image, rating)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [title, price, description, category, image, rating]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      price,
      description,
      category,
      image,
      rating,
    } = req.body;

    // TITLE
if (!title || title.trim() === "") {
  return res.status(400).json({
    message: "Title is required",
  });
}

// PRICE
if (price <= 0) {
  return res.status(400).json({
    message: "Price must be greater than 0",
  });
}

// DESCRIPTION
if (!description || description.trim() === "") {
  return res.status(400).json({
    message: "Description is required",
  });
}

// CATEGORY
if (!category || category.trim() === "") {
  return res.status(400).json({
    message: "Category is required",
  });
}

// IMAGE
if (!image || image.trim() === "") {
  return res.status(400).json({
    message: "Image is required",
  });
}

// RATING
if (rating < 0 || rating > 5) {
  return res.status(400).json({
    message: "Rating must be between 0 and 5",
  });
}

    const result = await pool.query(
      `UPDATE products
       SET title=$1,
           price=$2,
           description=$3,
           category=$4,
           image=$5,
           rating=$6
       WHERE id=$7
       RETURNING *`,
      [
        title,
        price,
        description,
        category,
        image,
        rating,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM products
       WHERE id=$1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};