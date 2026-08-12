// const pool = require("../config/db");

// // ================= GET PRODUCTS =================
// const getProducts = async (req, res) => {
//   try {
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;

//     const search = req.query.search || "";
//     const category_id = req.query.category || "";
//     const sort = req.query.sort || "";

//     const offset = (page - 1) * limit;

//     let orderBy = "ORDER BY p.id";

//     if (sort === "price_asc") {
//       orderBy = "ORDER BY p.price ASC";
//     } else if (sort === "price_desc") {
//       orderBy = "ORDER BY p.price DESC";
//     } else if (sort === "title_asc") {
//       orderBy = "ORDER BY p.title ASC";
//     } else if (sort === "title_desc") {
//       orderBy = "ORDER BY p.title DESC";
//     }

//     const products = await pool.query(
//       `
//       SELECT
//         p.*,
//         c.name AS category

//       FROM products p

//       LEFT JOIN categories c
//       ON p.category_id = c.id

//       WHERE
//         p.title ILIKE $1

//       AND
//         ($2::int IS NULL OR p.category_id = $2)

//       ${orderBy}

//       LIMIT $3 OFFSET $4
//       `,
//       [
//         `%${search}%`,
//         category_id === "" ? null : Number(category_id),
//         limit,
//         offset,
//       ]
//     );

//     const total = await pool.query(
//       `
//       SELECT COUNT(*)

//       FROM products p

//       WHERE
//         p.title ILIKE $1

//       AND
//         ($2::int IS NULL OR p.category_id = $2)
//       `,
//       [
//         `%${search}%`,
//         category_id === "" ? null : Number(category_id),
//       ]
//     );

//     res.json({
//       products: products.rows,
//       currentPage: page,
//       totalProducts: Number(total.rows[0].count),
//       totalPages: Math.ceil(Number(total.rows[0].count) / limit),
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Server Error",
//     });
//   }
// };

// // ================= GET SINGLE PRODUCT =================
// const getSingleProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await pool.query(
//       `
//       SELECT
//         p.*,
//         c.name AS category

//       FROM products p

//       LEFT JOIN categories c
//       ON p.category_id = c.id

//       WHERE p.id = $1
//       `,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         message: "Product not found",
//       });
//     }

//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Server Error",
//     });
//   }
// };

// // ================= CREATE PRODUCT =================
// const createProduct = async (req, res) => {
//   try {
//     const {
//       title,
//       price,
//       description,
//       category_id,
//       rating,
//     } = req.body;

//     const image = req.file
//       ? `/uploads/${req.file.filename}`
//       : null;

//     console.log(req.file);
//     console.log(req.body);  

//     if (!title || title.trim() === "") {
//       return res.status(400).json({
//         message: "Title is required",
//       });
//     }

//     if (price <= 0) {
//       return res.status(400).json({
//         message: "Price must be greater than 0",
//       });
//     }

//     if (!description || description.trim() === "") {
//       return res.status(400).json({
//         message: "Description is required",
//       });
//     }

//     if (!category_id) {
//       return res.status(400).json({
//         message: "Category is required",
//       });
//     }

//     if (!image) {
//       return res.status(400).json({
//         message: "Image is required",
//       });
//     }

//     if (rating < 0 || rating > 5) {
//       return res.status(400).json({
//         message: "Rating must be between 0 and 5",
//       });
//     }

//     const result = await pool.query(
//       `
//       INSERT INTO products
//       (
//         title,
//         price,
//         description,
//         category_id,
//         image,
//         rating
//       )

//       VALUES
//       ($1,$2,$3,$4,$5,$6)

//       RETURNING *
//       `,
//       [
//         title,
//         price,
//         description,
//         category_id,
//         image,
//         rating,
//       ]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Server Error",
//     });
//   }
// };

// // ================= UPDATE PRODUCT =================
// const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const {
//       title,
//       price,
//       description,
//       category_id,
//       rating,
//     } = req.body;

//     let imagePath = null;

//     if (req.file) {
//       imagePath = `/uploads/${req.file.filename}`;
//     }

//     if (!title || title.trim() === "") {
//       return res.status(400).json({
//         message: "Title is required",
//       });
//     }

//     if (price <= 0) {
//       return res.status(400).json({
//         message: "Price must be greater than 0",
//       });
//     }

//     if (!description || description.trim() === "") {
//       return res.status(400).json({
//         message: "Description is required",
//       });
//     }

//     if (!category_id) {
//       return res.status(400).json({
//         message: "Category is required",
//       });
//     }

//     if (rating < 0 || rating > 5) {
//       return res.status(400).json({
//         message: "Rating must be between 0 and 5",
//       });
//     }

//     const result = await pool.query(
//       `
//       UPDATE products

//       SET
//         title = $1,
//         price = $2,
//         description = $3,
//         category_id = $4,
//         image = COALESCE($5, image),
//         rating = $6

//       WHERE id = $7

//       RETURNING *
//       `,
//       [
//         title,
//         price,
//         description,
//         category_id,
//         imagePath,
//         rating,
//         id,
//       ]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         message: "Product not found",
//       });
//     }

//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Server Error",
//     });
//   }
// };

// // ================= DELETE PRODUCT =================
// const deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await pool.query(
//       `
//       DELETE FROM products

//       WHERE id = $1

//       RETURNING *
//       `,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         message: "Product not found",
//       });
//     }

//     res.json({
//       message: "Product deleted successfully",
//       product: result.rows[0],
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Server Error",
//     });
//   }
// };

// module.exports = {
//   getProducts,
//   getSingleProduct,
//   createProduct,
//   updateProduct,
//   deleteProduct,
// };








































const pool = require("../config/db");

// ================= GET PRODUCTS =================

const getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search = req.query.search || "";
    const category_id = req.query.category || "";
    const sort = req.query.sort || "";

    // Admin can see active + inactive products
    // Normal users only see active products
    const admin = req.query.admin === "true";

    const offset = (page - 1) * limit;

    let orderBy = "ORDER BY p.id";

    if (sort === "price_asc") {
      orderBy = "ORDER BY p.price ASC";
    } else if (sort === "price_desc") {
      orderBy = "ORDER BY p.price DESC";
    } else if (sort === "title_asc") {
      orderBy = "ORDER BY p.title ASC";
    } else if (sort === "title_desc") {
      orderBy = "ORDER BY p.title DESC";
    }

    const products = await pool.query(
      `
      SELECT
        p.*,
        c.name AS category

      FROM products p

      LEFT JOIN categories c
      ON p.category_id = c.id

      WHERE
        p.title ILIKE $1

      AND
        ($2::int IS NULL OR p.category_id = $2)

      AND
        ($3 = TRUE OR p.is_active = TRUE)

      ${orderBy}

      LIMIT $4 OFFSET $5
      `,
      [
        `%${search}%`,
        category_id === "" ? null : Number(category_id),
        admin,
        limit,
        offset,
      ]
    );

    const total = await pool.query(
      `
      SELECT COUNT(*)

      FROM products p

      WHERE
        p.title ILIKE $1

      AND
        ($2::int IS NULL OR p.category_id = $2)

      AND
        ($3 = TRUE OR p.is_active = TRUE)
      `,
      [
        `%${search}%`,
        category_id === "" ? null : Number(category_id),
        admin,
      ]
    );

    res.json({
      products: products.rows,
      currentPage: page,
      totalProducts: Number(total.rows[0].count),
      totalPages: Math.ceil(
        Number(total.rows[0].count) / limit
      ),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ================= GET SINGLE PRODUCT =================

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = req.query.admin === "true";

    const result = await pool.query(
      `
      SELECT
        p.*,
        c.name AS category

      FROM products p

      LEFT JOIN categories c
      ON p.category_id = c.id

      WHERE
        p.id = $1

      AND
        ($2 = TRUE OR p.is_active = TRUE)
      `,
      [id, admin]
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


// ================= CREATE PRODUCT =================

const createProduct = async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      category_id,
      rating,
    } = req.body;

    const image = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    if (!description || description.trim() === "") {
      return res.status(400).json({
        message: "Description is required",
      });
    }

    if (!category_id) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    if (!image) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 0 and 5",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO products
      (
        title,
        price,
        description,
        category_id,
        image,
        rating,
        is_active
      )

      VALUES
      ($1,$2,$3,$4,$5,$6,TRUE)

      RETURNING *
      `,
      [
        title,
        price,
        description,
        category_id,
        image,
        rating,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ================= UPDATE PRODUCT =================

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      price,
      description,
      category_id,
      rating,
    } = req.body;

    let imagePath = null;

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    if (!description || description.trim() === "") {
      return res.status(400).json({
        message: "Description is required",
      });
    }

    if (!category_id) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 0 and 5",
      });
    }

    const result = await pool.query(
      `
      UPDATE products

      SET
        title = $1,
        price = $2,
        description = $3,
        category_id = $4,
        image = COALESCE($5, image),
        rating = $6

      WHERE id = $7

      RETURNING *
      `,
      [
        title,
        price,
        description,
        category_id,
        imagePath,
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


// ================= TOGGLE PRODUCT STATUS =================

const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE products

      SET is_active = NOT is_active

      WHERE id = $1

      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const product = result.rows[0];

    res.json({
      message: product.is_active
        ? "Product activated successfully"
        : "Product deactivated successfully",

      product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ================= DELETE PRODUCT =================
// Soft delete instead of hard delete

// const deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await pool.query(
//       `
//       UPDATE products

//       SET is_active = FALSE

//       WHERE id = $1

//       RETURNING *
//       `,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         message: "Product not found",
//       });
//     }

//     res.json({
//       message: "Product deactivated successfully",
//       product: result.rows[0],
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Server Error",
//     });
//   }
// };




// ================= DELETE PRODUCT =================

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check whether this product has ever been ordered
    const orderCheck = await pool.query(
      `
      SELECT id
      FROM order_items
      WHERE product_id = $1
      LIMIT 1
      `,
      [id]
    );




    // ================= PRODUCT HAS ORDERS =================

    if (orderCheck.rows.length > 0) {

      // Product is referenced by an order.
      // We cannot permanently delete it.
      const result = await pool.query(
        `
        UPDATE products

        SET is_active = FALSE

        WHERE id = $1

        RETURNING *
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      return res.json({
        action: "deactivated",
        message:
          "Product has existing orders, so it was deactivated instead of permanently deleted.",
        product: result.rows[0],
      });
    }


    
    // ================= PRODUCT HAS NO ORDERS =================

    const result = await pool.query(
      `
      DELETE FROM products

      WHERE id = $1

      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.json({
      action: "deleted",
      message: "Product permanently deleted successfully.",
      product: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ================= PERMANENT DELETE PRODUCT =================

const permanentlyDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await pool.query(
      `
      SELECT *
      FROM products
      WHERE id = $1
      `,
      [id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Check whether product has ever been ordered
    const orderCheck = await pool.query(
      `
      SELECT id
      FROM order_items
      WHERE product_id = $1
      LIMIT 1
      `,
      [id]
    );

    // Product exists in order history
    if (orderCheck.rows.length > 0) {
      return res.status(400).json({
        message:
          "This product cannot be permanently deleted because it exists in order history. Deactivate it instead.",
      });
    }

    // Permanently delete product
    const result = await pool.query(
      `
      DELETE FROM products
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    res.json({
      message: "Product permanently deleted successfully",
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
  toggleProductStatus,
  deleteProduct,
  permanentlyDeleteProduct,
};
