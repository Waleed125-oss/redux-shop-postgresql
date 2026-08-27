
import axios from "axios";
const BASE_URL = "http://localhost:5000/api";


const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});


const getJsonAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});





// ================= PRODUCTS =================

// GET PRODUCTS

export const fetchProductsAPI = async (
  page = 1,
  limit = 12,
  search = "",
  category = "",
  sort = "",
  admin = false,
  min_price = "",
  max_price = "",
  rating = ""
) => {

  const params = new URLSearchParams();

  params.append("page", page);
  params.append("limit", limit);
  params.append("search", search);
  params.append("category", category);
  params.append("sort", sort);
  params.append("admin", admin);

  // Add price filters only when selected
  if (min_price !== "") {
    params.append("min_price", min_price);
  }

  if (max_price !== "") {
    params.append("max_price", max_price);
  }

  // Add rating filter only when selected
  if (rating !== "") {
    params.append("rating", rating);
  }

  const response = await fetch(
    `${BASE_URL}/products?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
};

// CREATE PRODUCT

export const createProductAPI = async (formData) => {

  const response = await fetch(
    `${BASE_URL}/products`,
    {
      method: "POST",

      headers: getAuthHeaders(),

      body: formData,
    }
  );

  if (!response.ok) {

    const error =
      await response.json().catch(() => null);

    throw new Error(
      error?.message ||
      "Failed to create product"
    );
  }

  return response.json();
};


// DELETE / DEACTIVATE PRODUCT

export const deleteProductAPI = async (id) => {

  const response = await fetch(
    `${BASE_URL}/products/${id}`,
    {
      method: "DELETE",

      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {

    const error =
      await response.json().catch(() => null);

    throw new Error(
      error?.message ||
      "Failed to deactivate product"
    );
  }

  return response.json();
};


// PERMANENT DELETE PRODUCT

export const permanentlyDeleteProductAPI = async (id) => {

  const response = await fetch(
    `${BASE_URL}/products/${id}/permanent`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {

    throw new Error(
      data.message || "Cannot delete this product"
    );

  }

  return data;
};

// TOGGLE PRODUCT STATUS

export const toggleProductStatusAPI = async (id) => {

  const response = await fetch(
    `${BASE_URL}/products/${id}/status`,
    {
      method: "PATCH",

      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {

    const error =
      await response.json().catch(() => null);

    throw new Error(
      error?.message ||
      "Failed to update product status"
    );
  }

  return response.json();
};


// GET SINGLE PRODUCT

export const fetchSingleProductAPI = async (
  id,
  admin = false
) => {

  const response = await fetch(
    `${BASE_URL}/products/${id}?admin=${admin}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {

    const error =
      await response.json().catch(() => null);

    throw new Error(
      error?.message ||
      "Failed to fetch product"
    );
  }

  return response.json();
};


// UPDATE PRODUCT

export const updateProductAPI = async (
  id,
  formData
) => {

  const response = await fetch(
    `${BASE_URL}/products/${id}`,
    {
      method: "PUT",

      headers: getAuthHeaders(),

      body: formData,
    }
  );

  if (!response.ok) {

    const error =
      await response.json().catch(() => null);

    throw new Error(
      error?.message ||
      "Failed to update product"
    );
  }

  return response.json();
};


// Delete Gallery image

export const deleteProductImageAPI = async (imageId) => {

  const response = await fetch(
     `${BASE_URL}/product-images/${imageId}`,
     {
      method: "DELETE",
      headers: getAuthHeaders(),
     }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to delete gallery image"
    );
  }
  return data;
};

// ================= CART =================

export const fetchCartAPI = async () => {

  const response = await fetch(
    `${BASE_URL}/cart`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch cart");
  }

  return response.json();
};


export const addToCartAPI = async (
  product_id
) => {

  const response = await fetch(
    `${BASE_URL}/cart`,
    {
      method: "POST",

      headers: getJsonAuthHeaders(),

      body: JSON.stringify({
        product_id,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add product");
  }

  return response.json();
};


export const updateCartAPI = async (
  id,
  quantity
) => {

  const response = await fetch(
    `${BASE_URL}/cart/${id}`,
    {
      method: "PUT",

      headers: getJsonAuthHeaders(),

      body: JSON.stringify({
        quantity,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update cart");
  }

  return response.json();
};


export const deleteCartAPI = async (id) => {

  const response = await fetch(
    `${BASE_URL}/cart/${id}`,
    {
      method: "DELETE",

      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete cart item");
  }

  return response.json();
};


// ================= CHECKOUT =================

export const checkoutAPI = async () => {

  const response = await fetch(
    `${BASE_URL}/orders/checkout`,
    {
      method: "POST",

      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Checkout failed");
  }

  return response.json();
};


// ================= ADMIN ORDERS =================

export const fetchOrdersAPI = async () => {

  const response = await fetch(
    `${BASE_URL}/orders`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
};


export const fetchSingleOrderAPI = async (
  id
) => {

  const response = await fetch(
    `${BASE_URL}/orders/${id}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch order");
  }

  return response.json();
};


export const updateOrderStatusAPI = async (
  id,
  status
) => {

  const response = await fetch(
    `${BASE_URL}/orders/${id}`,
    {
      method: "PUT",

      headers: getJsonAuthHeaders(),

      body: JSON.stringify({
        status,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update status");
  }

  return response.json();
};


// ================= CATEGORIES =================

export const fetchCategoriesAPI = async () => {

  const response = await fetch(
    `${BASE_URL}/categories`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
};


export const createCategoryAPI = async (
  categoryData
) => {

  const response = await fetch(
    `${BASE_URL}/categories`,
    {
      method: "POST",

      headers: getJsonAuthHeaders(),

      body: JSON.stringify(categoryData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create category");
  }

  return response.json();
};


export const updateCategoryAPI = async (
  id,
  categoryData
) => {

  const response = await fetch(
    `${BASE_URL}/categories/${id}`,
    {
      method: "PUT",

      headers: getJsonAuthHeaders(),

      body: JSON.stringify(categoryData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update category");
  }

  return response.json();
};


export const deleteCategoryAPI = async (
  id
) => {

  const response = await fetch(
    `${BASE_URL}/categories/${id}`,
    {
      method: "DELETE",

      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete category");
  }

  return response.json();
};



// ================= HOME PRODUCT SECTIONS =================

export const fetchHomeSectionsAPI = async () => {

  const response = await fetch(
    `${BASE_URL}/products/home/sections`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch home product sections"
    );
  }

  return response.json();
};




// ================= SELLER APPLICATION =================

export const submitSellerApplicationAPI = async (
  applicationData
) => {
  const response = await fetch(
    `${BASE_URL}/seller/apply`,
    {
      method: "POST",

      headers: getJsonAuthHeaders(),

      body: JSON.stringify(applicationData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to submit seller application"
    );
  }

  return data;
};
// GET SELLER APPLICATIONS

export const fetchSellerApplicationsAPI = async () => {
  const response = await fetch(
    `${BASE_URL}/admin/seller-applications`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.message ||
      "Failed to fetch seller applications"
    );
  }

  return response.json();
};

// GET MY SELLER APPLICATION

export const fetchMySellerApplicationAPI = async () => {
  const response = await fetch(
    `${BASE_URL}/seller/application`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to fetch seller application"
    );
  }

  return data;
};

// APPROVE SELLER

export const approveSellerAPI = async (id) => {
  const response = await fetch(
    `${BASE_URL}/admin/seller-applications/${id}/approve`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.message ||
      "Failed to approve seller"
    );
  }

  return response.json();
};


// REJECT SELLER

export const rejectSellerAPI = async (
  id,
  adminNote = ""
) => {
  const response = await fetch(
    `${BASE_URL}/admin/seller-applications/${id}/reject`,
    {
      method: "PUT",

      headers: getJsonAuthHeaders(),

      body: JSON.stringify({
        adminNote,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.message ||
      "Failed to reject seller"
    );
  }

  return response.json();
};

// ================= SELLER DASHBOARD =================

// GET SELLER DASHBOARD STATISTICS

export const fetchSellerDashboardStatsAPI = async () => {
  const response = await fetch(
    `${BASE_URL}/seller/dashboard/stats`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to fetch seller dashboard statistics"
    );
  }

  return data;
};

// ================= SELLER PRODUCTS =================

// GET SELLER PRODUCTS

export const fetchSellerProductsAPI = async (
  page = 1,
  limit = 10,
  search = "",
  category = "",
  approvalStatus = "",
  isActive = ""
) => {
  const params = new URLSearchParams();

  params.append("page", page);
  params.append("limit", limit);

  if (search !== "") {
    params.append("search", search);
  }

  if (category !== "") {
    params.append("category", category);
  }

  if (approvalStatus !== "") {
    params.append("approvalStatus", approvalStatus);
  }

  if (isActive !== "") {
    params.append("isActive", isActive);
  }

  const response = await fetch(
    `${BASE_URL}/seller/products?${params.toString()}`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to fetch seller products"
    );
  }

  return data;
};

// ================= SELLER PRODUCT =================

// CREATE SELLER PRODUCT

export const createSellerProductAPI = async (formData) => {
  const response = await fetch(
    `${BASE_URL}/seller/products`,
    {
      method: "POST",

      headers: getAuthHeaders(),

      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to create seller product"
    );
  }

  return data;
};


// ================= SELLER ORDERS =================

// GET SELLER ORDERS

export const fetchSellerOrdersAPI = async (
  page = 1,
  limit = 10
) => {
  const params = new URLSearchParams();

  params.append("page", page);
  params.append("limit", limit);

  const response = await fetch(
    `${BASE_URL}/seller/orders?${params.toString()}`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to fetch seller orders"
    );
  }

  return data;
};


// GET SINGLE SELLER ORDER

export const fetchSellerOrderDetailAPI = async (id) => {
  const response = await fetch(
    `${BASE_URL}/seller/orders/${id}`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to fetch seller order"
    );
  }

  return data;
};

// ================= ADMIN SELLER PRODUCTS =================

// GET PENDING SELLER PRODUCTS
export const fetchPendingSellerProductsAPI = async () => {
  const response = await fetch(
    `${BASE_URL}/products/admin/pending`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to fetch pending products"
    );
  }

  return data;
};


// APPROVE SELLER PRODUCT
export const approveSellerProductAPI = async (id) => {
  const response = await fetch(
    `${BASE_URL}/products/admin/${id}/approve`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to approve product"
    );
  }

  return data;
};


// REJECT SELLER PRODUCT
export const rejectSellerProductAPI = async (
  id,
  reason = ""
) => {
  const response = await fetch(
    `${BASE_URL}/products/admin/${id}/reject`,
    {
      method: "PATCH",
      headers: getJsonAuthHeaders(),

      body: JSON.stringify({
        reason,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to reject product"
    );
  }

  return data;
};

export const updateSellerProductAPI = async (
  id,
  formData
) => {
  const response = await fetch(
    `${BASE_URL}/seller/products/${id}`,
    {
      method: "PUT",

      headers: getAuthHeaders(),

      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update seller product"
    );
  }

  return data;
};

// UPDATE SELLER PRODUCT STATUS

export const updateSellerProductStatusAPI = async (
  id,
  isActive
) => {
  const response = await fetch(
    `${BASE_URL}/seller/products/${id}/status`,
    {
      method: "PATCH",

      headers: getJsonAuthHeaders(),

      body: JSON.stringify({
        is_active: isActive,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update product status"
    );
  }

  return data;
};


// ================= ADMIN SELLERS =================

// GET APPROVED SELLERS
// ================= ADMIN SELLERS =================

// GET APPROVED SELLERS
export const fetchApprovedSellersAPI = async () => {
  const response = await fetch(
    `${BASE_URL}/admin/sellers`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch approved sellers"
    );
  }

  return data;
};

// ================= ADMIN SELLER DETAILS =================

// GET SELLER DETAILS

export const fetchSellerDetailsAPI = async (id) => {
  const response = await fetch(
    `${BASE_URL}/admin/sellers/${id}`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch seller details"
    );
  }

  return data;
};


// ================= SHOP BY SELLER =================

// GET ALL PUBLIC SELLERS

// ================= SHOP BY SELLER =================

// GET ALL PUBLIC SELLERS
export const fetchAllSellersAPI = async () => {
  const response = await fetch(
    `${BASE_URL}/shop/sellers`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch sellers"
    );
  }

  return data;
};


// GET SINGLE SELLER STORE
export const fetchSellerStoreAPI = async (
  sellerId
) => {
  const response = await fetch(
    `${BASE_URL}/shop/sellers/${sellerId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch seller store"
    );
  }

  return data;
};


// ================= STRIPE CHECKOUT =================

export const createStripeCheckoutAPI = async () => {
  const response = await fetch(
    `${BASE_URL}/payment/create-checkout-session`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create Stripe checkout session"
    );
  }

  return data;
};

// ================= REFUNDS =================

// CUSTOMER REQUEST REFUND

export const requestRefundAPI = async (orderId, reason) => {
  const response = await fetch(
    `${BASE_URL}/refunds/request/${orderId}`,
    {
      method: "POST",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({
        reason,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to submit refund request"
    );
  }

  return data;
};

export const getCustomerRefundRequestsAPI = async () => {
  const response = await fetch(
    `${BASE_URL}/refunds/mine`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch your refund requests"
    );
  }

  return data;
};


// ======================================================
// GET ADMIN REFUND REQUESTS
// ======================================================

export const getAdminRefundRequestsAPI = async () => {
  const response = await fetch(
    `${BASE_URL}/refunds/admin`,
    {
      method: "GET",
      headers: getJsonAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch refund requests"
    );
  }

  return data;
};


// ======================================================
// APPROVE ADMIN REFUND
// ======================================================

export const approveAdminRefundAPI = async (refundId) => {
  const response = await fetch(
    `${BASE_URL}/refunds/admin/${refundId}/approve`,
    {
      method: "PUT",
      headers: getJsonAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to approve refund"
    );
  }

  return data;
};


// ======================================================
// GET SELLER REFUND REQUESTS
// ======================================================

export const getSellerRefundRequestsAPI = async () => {
  const response = await fetch(
    `${BASE_URL}/refunds/seller`,
    {
      method: "GET",
      headers: getJsonAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch refund requests"
    );
  }

  return data;
};


// ======================================================
// APPROVE SELLER REFUND
// ======================================================

export const approveSellerRefundAPI = async (refundId) => {
  const response = await fetch(
    `${BASE_URL}/refunds/seller/${refundId}/approve`,
    {
      method: "PUT",
      headers: getJsonAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to approve refund"
    );
  }

  return data;
};