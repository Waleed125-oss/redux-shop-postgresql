
const pool = require("../config/db");



const getProducts = async (req, res) => {
  try {

    // ================= PAGINATION =================

    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 12;

    const offset =
      (page - 1) * limit;


    // ================= FILTERS =================

    const search =
      req.query.search || "";

    const category_id =
      req.query.category || "";

    const sort =
      req.query.sort || "";

    const min_price =
      req.query.min_price || "";

    const max_price =
      req.query.max_price || "";

    const rating =
      req.query.rating || "";


    // ================= ADMIN =================

    // Admin can see active + inactive products.
    // Normal users can only see active products.

    const admin =
      req.query.admin === "true";


    // ================= SORTING =================

    let orderBy =
      "ORDER BY p.id DESC";


    if (sort === "price_asc") {

      orderBy =
        "ORDER BY p.price ASC";

    } else if (sort === "price_desc") {

      orderBy =
        "ORDER BY p.price DESC";

    } else if (sort === "title_asc") {

      orderBy =
        "ORDER BY p.title ASC";

    } else if (sort === "title_desc") {

      orderBy =
        "ORDER BY p.title DESC";

    } else if (sort === "rating_desc") {

      orderBy =
        "ORDER BY p.rating DESC, p.id DESC";

    } else if (sort === "newest") {

      orderBy =
        "ORDER BY p.created_at DESC, p.id DESC";

    }


    // ================= PRODUCTS =================

    const products = await pool.query(
      `
      SELECT
        p.*,
        c.name AS category

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.id

      WHERE

        -- SEARCH
        p.title ILIKE $1

      AND

        -- CATEGORY
        (
          $2::int IS NULL
          OR p.category_id = $2
        )

      AND

        -- MIN PRICE
        (
          $3::numeric IS NULL
          OR p.price >= $3
        )

      AND

        -- MAX PRICE
        (
          $4::numeric IS NULL
          OR p.price <= $4
        )

      AND

        -- RATING
        (
          $5::numeric IS NULL
          OR p.rating >= $5
        )

      AND
(
  $6 = TRUE
  OR (
    p.is_active = TRUE
    AND p.approval_status = 'approved'
  )
)
      ${orderBy}

      LIMIT $7
      OFFSET $8
      `,
      [

        // $1 search
        `%${search}%`,

        // $2 category
        category_id === ""
          ? null
          : Number(category_id),

        // $3 minimum price
        min_price === ""
          ? null
          : Number(min_price),

        // $4 maximum price
        max_price === ""
          ? null
          : Number(max_price),

        // $5 rating
        rating === ""
          ? null
          : Number(rating),

        // $6 admin
        admin,

        // $7 limit
        limit,

        // $8 offset
        offset,

      ]
    );


    // ================= TOTAL COUNT =================

    // IMPORTANT:
    //
    // This query uses the SAME filters
    // as the products query.
    //
    // Otherwise pagination would be incorrect.

    const total = await pool.query(
      `
      SELECT
        COUNT(*)

      FROM products p

      WHERE

        -- SEARCH
        p.title ILIKE $1

      AND

        -- CATEGORY
        (
          $2::int IS NULL
          OR p.category_id = $2
        )

      AND

        -- MIN PRICE
        (
          $3::numeric IS NULL
          OR p.price >= $3
        )

      AND

        -- MAX PRICE
        (
          $4::numeric IS NULL
          OR p.price <= $4
        )

      AND

        -- RATING
        (
          $5::numeric IS NULL
          OR p.rating >= $5
        )

      AND
(
  $6 = TRUE
  OR (
    p.is_active = TRUE
    AND p.approval_status = 'approved'
  )
)
      `,
      [

        // $1 search
        `%${search}%`,

        // $2 category
        category_id === ""
          ? null
          : Number(category_id),

        // $3 minimum price
        min_price === ""
          ? null
          : Number(min_price),

        // $4 maximum price
        max_price === ""
          ? null
          : Number(max_price),

        // $5 rating
        rating === ""
          ? null
          : Number(rating),

        // $6 admin
        admin,

      ]
    );


    // ================= TOTAL PRODUCTS =================

    const totalProducts =
      Number(
        total.rows[0].count
      );


    // ================= RESPONSE =================

    res.json({

      products:
        products.rows,

      currentPage:
        page,

      totalProducts,

      totalPages:
        Math.ceil(
          totalProducts / limit
        ),

    });


  } catch (error) {

    console.error(
      "Get products error:",
      error
    );

    res.status(500).json({

      message:
        "Server Error",

    });

  }
};

// Home Product Sections

// ================= HOME PRODUCT SECTIONS =================

const getHomeProductSections = async (req, res) => {
  try {

    // ================= BEST SELLERS =================
    // Based on actual orders

    const bestSellerResult = await pool.query(`
      SELECT
        p.*,
        c.name AS category,
        COALESCE(SUM(oi.quantity), 0) AS total_sold

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.id

      INNER JOIN order_items oi
        ON p.id = oi.product_id

      WHERE p.is_active = TRUE

      GROUP BY p.id, c.name

      ORDER BY total_sold DESC, p.id DESC

      LIMIT 8
    `);


    // ================= TOP RATED =================
    // Based on actual product rating

    const topRatedResult = await pool.query(`
      SELECT
        p.*,
        c.name AS category

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.id

      WHERE
        p.is_active = TRUE

      ORDER BY
        p.rating DESC,
        p.id DESC

      LIMIT 8
    `);


    // ================= NEW ARRIVALS =================
    // Based on actual created_at

    const newArrivalResult = await pool.query(`
      SELECT
        p.*,
        c.name AS category

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.id

      WHERE
        p.is_active = TRUE

      ORDER BY
        p.created_at DESC,
        p.id DESC

      LIMIT 8
    `);


    // ================= RESPONSE =================

    res.json({

      bestSellers:
        bestSellerResult.rows,

      topRated:
        topRatedResult.rows,

      newArrivals:
        newArrivalResult.rows,

    });


  } catch (error) {

    console.error(
      "Home product sections error:",
      error
    );

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

    // ================= GET PRODUCT =================

    // const result = await pool.query(
    //   `
    //   SELECT
    //     p.*,
    //     c.name AS category

    //   FROM products p

    //   LEFT JOIN categories c
    //   ON p.category_id = c.id

    //   WHERE
    //     p.id = $1

    //   AND
    //     ($2 = TRUE OR p.is_active = TRUE)
    //   `,
    //   [id, admin]
    // );

    const result = await pool.query(
  `
  SELECT
    p.*,
    c.name AS category,

    CASE
      WHEN u.id IS NOT NULL THEN
        json_build_object(
          'id', u.id,
          'name', u.name
         
        )
      ELSE NULL
    END AS seller

  FROM products p

  LEFT JOIN categories c
    ON p.category_id = c.id

  LEFT JOIN users u
    ON p.seller_id = u.id

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


    const product = result.rows[0];


    // ================= GET GALLERY IMAGES =================

    const imageResult = await pool.query(
      `
      SELECT
        id,
        image

      FROM product_image

      WHERE product_id = $1

      ORDER BY id ASC
      `,
      [id]
    );


    // ================= ADD GALLERY TO PRODUCT =================

    product.images = imageResult.rows;


    // ================= RESPONSE =================

    res.json(product);


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


    // ================= MAIN IMAGE =================

    const mainImageFile = req.files?.image?.[0];

    const mainImage = mainImageFile
      ? `/uploads/${mainImageFile.filename}`
      : null;


    // ================= GALLERY IMAGES =================

    const galleryImages = req.files?.images || [];


    // ================= VALIDATION =================

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


    if (!mainImage) {
      return res.status(400).json({
        message: "Main image is required",
      });
    }


    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 0 and 5",
      });
    }


    // ================= INSERT PRODUCT =================

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
        mainImage,
        rating,
      ]
    );


    const product = result.rows[0];


    // ================= INSERT GALLERY IMAGES =================

    for (const file of galleryImages) {

      await pool.query(
        `
        INSERT INTO product_image
        (
          product_id,
          image
        )

        VALUES
        ($1,$2)
        `,
        [
          product.id,
          `/uploads/${file.filename}`,
        ]
      );

    }


    // ================= RESPONSE =================

    res.status(201).json({
      ...product,
      images: galleryImages.map(
        (file) =>
          `/uploads/${file.filename}`
      ),
    });


  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });

  }
};

// ================= CREATE SELLER PRODUCT =================

const createSellerProduct = async (req, res) => {
  try {
    // ================= SELLER =================

    // sellerMiddleware already verified that
    // this user is a seller.
    const sellerId = req.user.id;

    // ================= PRODUCT DATA =================

    const {
      title,
      price,
      description,
      category_id,
      rating,
    } = req.body;

    // ================= MAIN IMAGE =================

    const mainImageFile = req.files?.image?.[0];

    const mainImage = mainImageFile
      ? `/uploads/${mainImageFile.filename}`
      : null;

    // ================= GALLERY IMAGES =================

    const galleryImages = req.files?.images || [];

    // ================= VALIDATION =================

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    if (!price || Number(price) <= 0) {
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

    if (!mainImage) {
      return res.status(400).json({
        message: "Main image is required",
      });
    }

    if (
      rating === undefined ||
      rating === null ||
      Number(rating) < 0 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 0 and 5",
      });
    }

    // ================= INSERT PRODUCT =================

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
        is_active,
        seller_id,
        approval_status
      )

      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        TRUE,
        $7,
        'pending'
      )

      RETURNING *
      `,
      [
        title.trim(),
        Number(price),
        description.trim(),
        Number(category_id),
        mainImage,
        Number(rating),
        sellerId,
      ]
    );

    const product = result.rows[0];

    // ================= INSERT GALLERY IMAGES =================

    for (const file of galleryImages) {
      await pool.query(
        `
        INSERT INTO product_image
        (
          product_id,
          image
        )

        VALUES
        ($1, $2)
        `,
        [
          product.id,
          `/uploads/${file.filename}`,
        ]
      );
    }

    // ================= GET GALLERY IMAGES =================

    const imageResult = await pool.query(
      `
      SELECT
        id,
        image

      FROM product_image

      WHERE product_id = $1

      ORDER BY id ASC
      `,
      [product.id]
    );

    // ================= RESPONSE =================

    res.status(201).json({
      message:
        "Product created successfully and is waiting for admin approval.",

      product: {
        ...product,
        images: imageResult.rows,
      },
    });

  } catch (error) {
    console.error(
      "Create seller product error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ================= GET SELLER PRODUCTS =================

const getSellerProducts = async (req, res) => {
  try {
    // ================= SELLER =================

    const sellerId = req.user.id;

    // ================= PAGINATION =================

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 12;

    const offset = (page - 1) * limit;

    // ================= FILTERS =================

    const search = req.query.search || "";

    const category_id = req.query.category || "";

    const sort = req.query.sort || "";

    const approval_status =
      req.query.approval_status || "";

    // ================= SORTING =================

    let orderBy = "ORDER BY p.id DESC";

    if (sort === "price_asc") {
      orderBy = "ORDER BY p.price ASC";
    }

    else if (sort === "price_desc") {
      orderBy = "ORDER BY p.price DESC";
    }

    else if (sort === "title_asc") {
      orderBy = "ORDER BY p.title ASC";
    }

    else if (sort === "title_desc") {
      orderBy = "ORDER BY p.title DESC";
    }

    else if (sort === "newest") {
      orderBy =
        "ORDER BY p.created_at DESC, p.id DESC";
    }

    // ================= GET PRODUCTS =================

    const products = await pool.query(
      `
      SELECT
        p.*,
        c.name AS category

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.id

      WHERE

        -- IMPORTANT:
        -- Only logged-in seller's products

        p.seller_id = $1

      AND

        -- SEARCH

        p.title ILIKE $2

      AND

        -- CATEGORY

        (
          $3::int IS NULL
          OR p.category_id = $3
        )

      AND

        -- APPROVAL STATUS

        (
          $4 = ''
          OR p.approval_status = $4
        )

      ${orderBy}

      LIMIT $5
      OFFSET $6
      `,
      [
        sellerId,

        `%${search}%`,

        category_id === ""
          ? null
          : Number(category_id),

        approval_status,

        limit,

        offset,
      ]
    );

    // ================= TOTAL COUNT =================

    const total = await pool.query(
      `
      SELECT
        COUNT(*)

      FROM products p

      WHERE

        p.seller_id = $1

      AND

        p.title ILIKE $2

      AND

        (
          $3::int IS NULL
          OR p.category_id = $3
        )

      AND

        (
          $4 = ''
          OR p.approval_status = $4
        )
      `,
      [
        sellerId,

        `%${search}%`,

        category_id === ""
          ? null
          : Number(category_id),

        approval_status,
      ]
    );

    // ================= TOTAL =================

    const totalProducts =
      Number(total.rows[0].count);

    // ================= RESPONSE =================

    res.json({
      products: products.rows,

      currentPage: page,

      totalProducts,

      totalPages:
        Math.ceil(
          totalProducts / limit
        ),
    });

  } catch (error) {

    console.error(
      "Get seller products error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};




// ========================================
// GET PENDING SELLER PRODUCTS
// ========================================

const getPendingSellerProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,
        c.name AS category,
        u.name AS seller_name,
        u.email AS seller_email

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.id

      LEFT JOIN users u
        ON p.seller_id = u.id

      WHERE p.approval_status = 'pending'

      ORDER BY p.created_at DESC
    `);

    res.json({
      products: result.rows,
    });

  } catch (error) {
    console.error(
      "Get pending seller products error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};



// ========================================
// APPROVE SELLER PRODUCT
// ========================================

const approveSellerProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE products

      SET
        approval_status = 'approved',
        is_active = TRUE

      WHERE id = $1
      AND approval_status = 'pending'

      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "Pending product not found",
      });
    }

    res.json({
      message:
        "Product approved successfully",

      product:
        result.rows[0],
    });

  } catch (error) {
    console.error(
      "Approve seller product error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};




// ========================================
// REJECT SELLER PRODUCT
// ========================================

const rejectSellerProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      reason,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE products

      SET
        approval_status = 'rejected',
        is_active = FALSE

      WHERE id = $1
      AND approval_status = 'pending'

      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "Pending product not found",
      });
    }

    res.json({
      message:
        "Product rejected successfully",

      reason:
        reason || null,

      product:
        result.rows[0],
    });

  } catch (error) {
    console.error(
      "Reject seller product error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};
// ================= UPDATE PRODUCT =================

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

    // ================= MAIN IMAGE =================

    const mainImageFile = req.files?.image?.[0];

    const imagePath = mainImageFile
      ? `/uploads/${mainImageFile.filename}`
      : null;


    // ================= GALLERY IMAGES =================

    const galleryImages = req.files?.images || [];


    // ================= VALIDATION =================

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


    // ================= UPDATE PRODUCT =================

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


    const product = result.rows[0];


    // ================= ADD NEW GALLERY IMAGES =================

    for (const file of galleryImages) {

      await pool.query(
        `
        INSERT INTO product_image
        (
          product_id,
          image
        )

        VALUES
        ($1, $2)
        `,
        [
          product.id,
          `/uploads/${file.filename}`,
        ]
      );

    }


    // ================= GET UPDATED GALLERY =================

    const imageResult = await pool.query(
      `
      SELECT
        id,
        image

      FROM product_image

      WHERE product_id = $1

      ORDER BY id ASC
      `,
      [id]
    );


    // ================= RESPONSE =================

    res.json({
      ...product,
      images: imageResult.rows,
    });


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
  getHomeProductSections,
  getSingleProduct,
  createProduct,
  createSellerProduct,
  getSellerProducts,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  permanentlyDeleteProduct,

  getPendingSellerProducts,
  approveSellerProduct,
  rejectSellerProduct,
};
