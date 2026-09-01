const pool = require("../config/db");

// ========================================
// Apply to become a seller
// ========================================

const applyAsSeller = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      businessName,
      phone,
      description,
    } = req.body;

    // Check required field
    if (!businessName) {
      return res.status(400).json({
        message: "Business name is required",
      });
    }

    // Check user
    const userResult = await pool.query(
      `
      SELECT id, name, email, role
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // Already a seller
    if (user.role === "seller") {
      return res.status(400).json({
        message: "You are already a seller",
      });
    }

    // Admin cannot become seller
    if (user.role === "admin") {
      return res.status(400).json({
        message: "Admin cannot apply as seller",
      });
    }

    // Check existing pending application
    const existingApplication = await pool.query(
      `
      SELECT id
      FROM seller_applications
      WHERE user_id = $1
      AND status = 'pending'
      `,
      [userId]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({
        message: "You already have a pending seller application",
      });
    }

    // Create application
    const result = await pool.query(
      `
      INSERT INTO seller_applications
      (
        user_id,
        business_name,
        phone,
        description
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        userId,
        businessName,
        phone || null,
        description || null,
      ]
    );

    res.status(201).json({
      message: "Seller application submitted successfully",
      application: result.rows[0],
    });

  } catch (error) {
    console.log("Apply seller error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ========================================
// Get current user's seller application
// ========================================

const getMySellerApplication = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        sa.id,
        sa.user_id,
        sa.business_name,
        sa.phone,
        sa.description,
        sa.status,
        sa.admin_note,
        sa.created_at,
        sa.updated_at
      FROM seller_applications sa
      WHERE sa.user_id = $1
      ORDER BY sa.created_at DESC
      LIMIT 1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No seller application found",
      });
    }

    res.json({
      application: result.rows[0],
    });

  } catch (error) {
    console.log("Get seller application error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};



// ========================================
// Create Product as Seller
// ========================================

const createSellerProduct = async (req, res) => {
  try {
    // Seller ID comes from JWT
    // We NEVER take seller_id from req.body
    const sellerId = req.user.id;

    const {
      title,
      price,
      description,
      category_id,
      rating,
    } = req.body;

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

    if (
      rating !== undefined &&
      (Number(rating) < 0 || Number(rating) > 5)
    ) {
      return res.status(400).json({
        message: "Rating must be between 0 and 5",
      });
    }

    // ================= MAIN IMAGE =================

    const mainImageFile = req.files?.image?.[0];

    const mainImage = mainImageFile
      ? `/uploads/${mainImageFile.filename}`
      : null;

    if (!mainImage) {
      return res.status(400).json({
        message: "Main image is required",
      });
    }

    // ================= GALLERY IMAGES =================

    const galleryImages = req.files?.images || [];

    // ================= CREATE PRODUCT =================

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
        FALSE,
        $7,
        'pending'
      )

      RETURNING *
      `,
      [
        title.trim(),
        price,
        description.trim(),
        category_id,
        mainImage,
        rating || 0,
        sellerId,
      ]
    );

    const product = result.rows[0];

    // ================= GALLERY IMAGES =================

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

    // ================= GET GALLERY =================

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
        "Product submitted successfully and is waiting for admin approval.",

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

// ========================================
// Get My Products
// ========================================

const getMyProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // ================= PAGINATION =================

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    // ================= FILTERS =================

    const search = req.query.search || "";
    const approvalStatus = req.query.approval_status || "";

    // ================= PRODUCTS =================

    const productsResult = await pool.query(
      `
      SELECT
        p.*,
        c.name AS category

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.id

      WHERE
        p.seller_id = $1

      AND
        p.title ILIKE $2

      AND
        (
          $3 = ''
          OR p.approval_status = $3
        )

      ORDER BY
        p.created_at DESC,
        p.id DESC

      LIMIT $4
      OFFSET $5
      `,
      [
        sellerId,
        `%${search}%`,
        approvalStatus,
        limit,
        offset,
      ]
    );

    // ================= TOTAL COUNT =================

    const totalResult = await pool.query(
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
          $3 = ''
          OR p.approval_status = $3
        )
      `,
      [
        sellerId,
        `%${search}%`,
        approvalStatus,
      ]
    );

    const totalProducts = Number(
      totalResult.rows[0].count
    );

    // ================= RESPONSE =================

    res.json({
      products: productsResult.rows,

      currentPage: page,

      totalProducts,

      totalPages: Math.ceil(
        totalProducts / limit
      ),
    });

  } catch (error) {
    console.error(
      "Get my products error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ========================================
// Update Seller Product
// ========================================

const updateSellerProduct = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const productId = req.params.id;

    const {
      title,
      price,
      description,
      category_id,
    } = req.body;

    // Check product ownership
    const productResult = await pool.query(
      `
      SELECT *
      FROM products
      WHERE id = $1
      AND seller_id = $2
      `,
      [productId, sellerId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found or you do not own this product",
      });
    }

    const product = productResult.rows[0];

    // Keep old values when field is not provided
    const updatedTitle =
      title !== undefined ? title : product.title;

    const updatedPrice =
      price !== undefined ? price : product.price;

    const updatedDescription =
      description !== undefined
        ? description
        : product.description;

    const updatedCategory =
      category_id !== undefined
        ? category_id
        : product.category_id;

    // Optional new image
    let updatedImage = product.image;

    if (req.file) {
      updatedImage = `/uploads/${req.file.filename}`;
    }

    // Update product
 const result = await pool.query(
  `
  UPDATE products

  SET
    title = $1,
    price = $2,
    description = $3,
    category_id = $4,
    image = $5,
    approval_status = 'pending'

  WHERE id = $6
  AND seller_id = $7

  RETURNING *
  `,
  [
    updatedTitle,
    updatedPrice,
    updatedDescription,
    updatedCategory,
    updatedImage,
    productId,
    sellerId,
  ]
);

    res.json({
      message:
        "Product updated successfully and sent for admin approval",
      product: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Update seller product error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ========================================
// Delete Seller Product
// ========================================

// const deleteSellerProduct = async (req, res) => {
//   try {
//     const sellerId = req.user.id;
//     const productId = req.params.id;

//     const result = await pool.query(
//       `
//       DELETE FROM products
//       WHERE id = $1
//       AND seller_id = $2
//       RETURNING id, title
//       `,
//       [productId, sellerId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         message:
//           "Product not found or you do not own this product",
//       });
//     }

//     res.json({
//       message: "Product deleted successfully",
//       product: result.rows[0],
//     });

//   } catch (error) {
//     console.error(
//       "Delete seller product error:",
//       error
//     );

//     res.status(500).json({
//       message: "Server Error",
//     });
//   }
// };

const updateSellerProductStatus = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const productId = req.params.id;
    const { is_active } = req.body;

    // ================= VALIDATION =================

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        message: "is_active must be true or false",
      });
    }

    // ================= CHECK OWNERSHIP =================

    const productResult = await pool.query(
      `
      SELECT id, title, is_active
      FROM products
      WHERE id = $1
      AND seller_id = $2
      `,
      [productId, sellerId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        message:
          "Product not found or you do not own this product",
      });
    }

    // ================= UPDATE STATUS =================

    const result = await pool.query(
      `
      UPDATE products
      SET is_active = $1
      WHERE id = $2
      AND seller_id = $3
      RETURNING id, title, is_active
      `,
      [
        is_active,
        productId,
        sellerId,
      ]
    );

    res.status(200).json({
      message: is_active
        ? "Product activated successfully"
        : "Product deactivated successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update seller product status error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};
// ========================================
// Toggle Product Active Status
// ========================================
const toggleProductStatus = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const productId = req.params.id;

    const result = await pool.query(
      `
      UPDATE products

      SET
        is_active = NOT is_active

      WHERE id = $1
      AND seller_id = $2

      RETURNING
        id,
        title,
        is_active
      `,
      [productId, sellerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "Product not found or you do not own this product",
      });
    }

    res.json({
      message: "Product status updated successfully",
      product: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Toggle product status error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ========================================
// Get Seller Dashboard Statistics
// ========================================

const getSellerDashboardStats = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // ----------------------------------------
    // Product Statistics
    // ----------------------------------------

    const productStats = await pool.query(
      `
      SELECT
        COUNT(*) AS total_products,

        COUNT(*) FILTER (
          WHERE is_active = true
        ) AS active_products,

        COUNT(*) FILTER (
          WHERE is_active = false
        ) AS inactive_products,

        COUNT(*) FILTER (
          WHERE approval_status = 'pending'
        ) AS pending_products,

        COUNT(*) FILTER (
          WHERE approval_status = 'approved'
        ) AS approved_products,

        COUNT(*) FILTER (
          WHERE approval_status = 'rejected'
        ) AS rejected_products

      FROM products
      WHERE seller_id = $1
      `,
      [sellerId]
    );

    // ----------------------------------------
    // Order Statistics
    // ----------------------------------------

    const orderStats = await pool.query(
      `
      SELECT
        COUNT(DISTINCT oi.order_id) AS total_orders,

        COALESCE(
          SUM(oi.quantity),
          0
        ) AS total_items_sold,

        COALESCE(
          SUM(oi.quantity * oi.price),
          0
        ) AS total_revenue

      FROM order_items oi

      INNER JOIN products p
        ON oi.product_id = p.id

      WHERE p.seller_id = $1
      `,
      [sellerId]
    );

    // ----------------------------------------
    // Stripe Connect payout statistics
    // ----------------------------------------
    // `seller_amount` is the net amount transferred after the platform
    // commission. Restrict every query by seller_id so sellers can only see
    // their own payouts.
    const payoutStats = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(seller_amount) FILTER (
            WHERE transfer_status = 'completed'
          ),
          0
        ) AS received,

        COALESCE(
          SUM(seller_amount) FILTER (
            WHERE transfer_status = 'pending'
          ),
          0
        ) AS pending,

        COALESCE(
          SUM(commission_amount) FILTER (
            WHERE transfer_status = 'completed'
          ),
          0
        ) AS commission,

        COUNT(*) FILTER (
          WHERE transfer_status = 'completed'
        ) AS completed_count
      FROM order_transfers
      WHERE seller_id = $1
      `,
      [sellerId]
    );

    const recentPayouts = await pool.query(
      `
      SELECT
        ot.order_id,
        ot.gross_amount,
        ot.commission_amount,
        ot.seller_amount,
        ot.stripe_transfer_id,
        ot.transfer_status,
        ot.updated_at
      FROM order_transfers ot
      WHERE ot.seller_id = $1
      ORDER BY ot.updated_at DESC NULLS LAST, ot.id DESC
      LIMIT 5
      `,
      [sellerId]
    );

    // ----------------------------------------
    // Response
    // ----------------------------------------

    res.status(200).json({
      message: "Seller dashboard statistics fetched successfully",

      statistics: {
        products: {
          total: Number(productStats.rows[0].total_products),
          active: Number(productStats.rows[0].active_products),
          inactive: Number(productStats.rows[0].inactive_products),
          pending: Number(productStats.rows[0].pending_products),
          approved: Number(productStats.rows[0].approved_products),
          rejected: Number(productStats.rows[0].rejected_products),
        },

        orders: {
          total: Number(orderStats.rows[0].total_orders),
          itemsSold: Number(orderStats.rows[0].total_items_sold),
          revenue: Number(orderStats.rows[0].total_revenue),
        },

        payouts: {
          received: Number(payoutStats.rows[0].received),
          pending: Number(payoutStats.rows[0].pending),
          commission: Number(payoutStats.rows[0].commission),
          completedCount: Number(payoutStats.rows[0].completed_count),
          recent: recentPayouts.rows,
        },
      },
    });

  } catch (error) {
    console.log("Get seller dashboard stats error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ========================================
// Get Seller Products
// ========================================

const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const {
      search = "",
      category,
      approvalStatus,
      isActive,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const values = [sellerId];
    let paramIndex = 2;

    let whereClause = `
      WHERE p.seller_id = $1
    `;

    // Search by title
    if (search.trim() !== "") {
      whereClause += `
        AND p.title ILIKE $${paramIndex}
      `;

      values.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Category filter
    if (category) {
      whereClause += `
        AND p.category_id = $${paramIndex}
      `;

      values.push(category);
      paramIndex++;
    }

    // Approval status filter
    if (approvalStatus) {
      whereClause += `
        AND p.approval_status = $${paramIndex}
      `;

      values.push(approvalStatus);
      paramIndex++;
    }

    // Active/inactive filter
    if (isActive !== undefined) {
      whereClause += `
        AND p.is_active = $${paramIndex}
      `;

      values.push(isActive === "true");
      paramIndex++;
    }

    // Count total products
    const countResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM products p
      ${whereClause}
      `,
      values
    );

    const totalProducts = Number(countResult.rows[0].total);

    // Get products
    const productValues = [...values, Number(limit), offset];

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.title,
        p.price,
        p.description,
        p.image,
        p.rating,
        p.category_id,
        p.is_active,
        p.created_at,
        p.seller_id,
        p.approval_status
      FROM products p
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}
      `,
      productValues
    );

    res.status(200).json({
      message: "Seller products fetched successfully",

      products: result.rows,

      pagination: {
        currentPage: Number(page),
        limit: Number(limit),
        totalProducts,
        totalPages: Math.ceil(
          totalProducts / Number(limit)
        ),
      },
    });

  } catch (error) {
    console.log("Get seller products error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ========================================
// Get Seller Orders
// ========================================

const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const {
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const values = [sellerId];
    let paramIndex = 2;

    let statusFilter = "";

    if (status) {
      statusFilter = `
        AND o.status = $${paramIndex}
      `;

      values.push(status);
      paramIndex++;
    }

    // ----------------------------------------
    // Count seller orders
    // ----------------------------------------

    const countResult = await pool.query(
      `
      SELECT COUNT(DISTINCT o.id) AS total
      FROM orders o

      INNER JOIN order_items oi
        ON o.id = oi.order_id

      INNER JOIN products p
        ON oi.product_id = p.id

      WHERE p.seller_id = $1
      ${statusFilter}
      `,
      values
    );

    const totalOrders = Number(countResult.rows[0].total);

    // ----------------------------------------
    // Get seller orders
    // ----------------------------------------

    const orderValues = [
      ...values,
      limitNumber,
      offset,
    ];

    const result = await pool.query(
      `
      SELECT
        o.id AS order_id,
        o.status,
        o.created_at,

        COUNT(oi.id) AS total_items,

        COALESCE(
          SUM(oi.quantity),
          0
        ) AS total_quantity,

        COALESCE(
          SUM(oi.quantity * oi.price),
          0
        ) AS seller_total,

        json_agg(
          json_build_object(
            'order_item_id', oi.id,
            'product_id', p.id,
            'product_title', p.title,
            'image', p.image,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.quantity * oi.price
          )
        ) AS items

      FROM orders o

      INNER JOIN order_items oi
        ON o.id = oi.order_id

      INNER JOIN products p
        ON oi.product_id = p.id

      WHERE p.seller_id = $1
      ${statusFilter}

      GROUP BY
        o.id,
        o.status,
        o.created_at

      ORDER BY o.created_at DESC

      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}
      `,
      orderValues
    );

    res.status(200).json({
      message: "Seller orders fetched successfully",

      orders: result.rows,

      pagination: {
        currentPage: pageNumber,
        limit: limitNumber,
        totalOrders,
        totalPages: Math.ceil(
          totalOrders / limitNumber
        ),
      },
    });

  } catch (error) {
    console.log("Get seller orders error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


const getSellerProductById = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const productId = req.params.id;

    const productResult = await pool.query(
      `
      SELECT
        p.*,
        c.name AS category

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.id

      WHERE
        p.id = $1
        AND p.seller_id = $2
      `,
      [productId, sellerId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        message:
          "Product not found or you do not own this product",
      });
    }

    const product = productResult.rows[0];

    const imageResult = await pool.query(
      `
      SELECT
        id,
        image

      FROM product_image

      WHERE product_id = $1

      ORDER BY id ASC
      `,
      [productId]
    );

    product.images = imageResult.rows;

    res.status(200).json({
      message: "Seller product fetched successfully",
      product,
    });

  } catch (error) {

    console.error(
      "Get seller product by ID error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ========================================
// Update Seller Order Status
// ========================================

const updateSellerOrderStatus = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orderId = req.params.id;
    const { status } = req.body;

    // ================= VALIDATION =================

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    // ================= CHECK SELLER ORDER =================

    const orderCheck = await pool.query(
      `
      SELECT DISTINCT o.id
      FROM orders o

      INNER JOIN order_items oi
        ON o.id = oi.order_id

      INNER JOIN products p
        ON oi.product_id = p.id

      WHERE
        o.id = $1
        AND p.seller_id = $2
      `,
      [orderId, sellerId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        message:
          "Order not found or this order does not contain your products",
      });
    }

    // ================= UPDATE ORDER =================

    const result = await pool.query(
      `
      UPDATE orders

      SET status = $1

      WHERE id = $2

      RETURNING
        id,
        status,
        created_at
      `,
      [status, orderId]
    );

    res.status(200).json({
      message: "Order status updated successfully",
      order: result.rows[0],
    });

  } catch (error) {

    console.error(
      "Update seller order status error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ========================================
// Get Seller Profile
// ========================================

const getSellerProfile = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        sa.id AS application_id,
        sa.business_name,
        sa.phone,
        sa.description,
        sa.status AS application_status,
        sa.admin_note,
        sa.created_at AS application_created_at,
        sa.updated_at AS application_updated_at

      FROM users u

      LEFT JOIN seller_applications sa
        ON sa.user_id = u.id

      WHERE
        u.id = $1

      ORDER BY
        sa.created_at DESC

      LIMIT 1
      `,
      [sellerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    res.status(200).json({
      message: "Seller profile fetched successfully",
      profile: result.rows[0],
    });

  } catch (error) {

    console.error(
      "Get seller profile error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ========================================
// Update Seller Profile
// ========================================

const updateSellerProfile = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const {
      businessName,
      phone,
      description,
    } = req.body;

    // ================= VALIDATION =================

    if (!businessName || businessName.trim() === "") {
      return res.status(400).json({
        message: "Business name is required",
      });
    }

    // ================= CHECK SELLER =================

    const sellerCheck = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = $1
      AND role = 'seller'
      `,
      [sellerId]
    );

    if (sellerCheck.rows.length === 0) {
      return res.status(403).json({
        message: "Seller access required",
      });
    }

    // ================= UPDATE =================

    const result = await pool.query(
      `
      UPDATE seller_applications

      SET
        business_name = $1,
        phone = $2,
        description = $3,
        updated_at = CURRENT_TIMESTAMP

      WHERE user_id = $4

      RETURNING *
      `,
      [
        businessName.trim(),
        phone || null,
        description || null,
        sellerId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Seller application not found",
      });
    }

    res.status(200).json({
      message: "Seller profile updated successfully",
      profile: result.rows[0],
    });

  } catch (error) {

    console.error(
      "Update seller profile error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ========================================
// Get Seller Order Details
// ========================================
const getSellerOrderDetails = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orderId = req.params.id;

    const result = await pool.query(
      `
      SELECT
        o.id AS order_id,
        o.status,
        o.created_at,

        oi.id AS order_item_id,
        oi.product_id,
        oi.quantity,
        oi.price,

        p.title AS product_title,
        p.image AS product_image,

        (oi.quantity * oi.price) AS subtotal

      FROM orders o

      INNER JOIN order_items oi
        ON o.id = oi.order_id

      INNER JOIN products p
        ON oi.product_id = p.id

      WHERE
        o.id = $1
        AND p.seller_id = $2

      ORDER BY oi.id ASC
      `,
      [orderId, sellerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "Order not found or this order does not contain your products",
      });
    }

    const firstRow = result.rows[0];

    const items = result.rows.map((item) => ({
      orderItemId: item.order_item_id,
      productId: item.product_id,
      productTitle: item.product_title,
      productImage: item.product_image,
      quantity: Number(item.quantity),
      price: Number(item.price),
      subtotal: Number(item.subtotal),
    }));

    const total = items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    res.status(200).json({
      message: "Seller order details fetched successfully",

      order: {
        orderId: firstRow.order_id,
        status: firstRow.status,
        createdAt: firstRow.created_at,
        items,
        total,
      },
    });

  } catch (error) {
    console.error(
      "Get seller order details error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};


module.exports = {
  applyAsSeller,
  getMySellerApplication,
  createSellerProduct,
  getMyProducts,
  updateSellerProduct,
 
  toggleProductStatus,
  getSellerDashboardStats,
  getSellerProducts,
  getSellerOrders,
  getSellerProductById,
  updateSellerOrderStatus,
  
  getSellerProfile,
  updateSellerProfile,
  updateSellerProductStatus,

  getSellerOrderDetails,

};
