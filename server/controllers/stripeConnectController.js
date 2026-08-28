const stripe = require("../config/stripe");
const pool = require("../config/db");

// ======================================================
// CREATE STRIPE CONNECTED ACCOUNT
// ======================================================

const createConnectedAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // ==================================================
    // STEP 1: GET SELLER
    // ==================================================

    const sellerResult = await pool.query(
      `
      SELECT id, name, email, role, stripe_account_id
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (sellerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    const seller = sellerResult.rows[0];

    // ==================================================
    // STEP 2: CHECK SELLER ROLE
    // ==================================================

    if (seller.role !== "seller") {
      return res.status(403).json({
        message: "Only sellers can create a connected account",
      });
    }

    // ==================================================
    // STEP 3: CHECK EXISTING CONNECTED ACCOUNT
    // ==================================================

    if (seller.stripe_account_id) {
      return res.status(400).json({
        message: "Stripe connected account already exists",
        stripeAccountId: seller.stripe_account_id,
      });
    }

    // ==================================================
    // STEP 4: CREATE STRIPE EXPRESS ACCOUNT
    // ==================================================

    const account = await stripe.accounts.create({
      type: "express",
      email: seller.email,
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
    });

    // ==================================================
    // STEP 5: SAVE STRIPE ACCOUNT ID
    // ==================================================

    await pool.query(
      `
      UPDATE users
      SET stripe_account_id = $1
      WHERE id = $2
      `,
      [account.id, userId]
    );

    // ==================================================
    // STEP 6: RESPONSE
    // ==================================================

    res.status(201).json({
      message: "Stripe connected account created successfully",
      stripeAccountId: account.id,
    });

  } catch (error) {
    console.error(
      "Create Connected Account Error:",
      error
    );

    res.status(500).json({
      message: "Failed to create Stripe connected account",
    });
  }
};


// ======================================================
// CREATE STRIPE SELLER ONBOARDING LINK
// ======================================================
const createOnboardingLink = async (req, res) => {
  try {
    const userId = req.user.id;

    // ==================================================
    // STEP 1: GET SELLER STRIPE ACCOUNT
    // ==================================================
    const sellerResult = await pool.query(
      `
      SELECT id, name, email, role, stripe_account_id
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    // ==================================================
    // SELLER NOT FOUND
    // ==================================================
    if (sellerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    const seller = sellerResult.rows[0];

    // ==================================================
    // STEP 2: CHECK SELLER ROLE
    // ==================================================
    if (seller.role !== "seller") {
      return res.status(403).json({
        message: "Only sellers can access Stripe onboarding",
      });
    }

    // ==================================================
    // STEP 3: CHECK CONNECTED ACCOUNT
    // ==================================================
    if (!seller.stripe_account_id) {
      return res.status(400).json({
        message:
          "Stripe connected account does not exist. Create the account first.",
      });
    }

    // ==================================================
    // STEP 4: CREATE STRIPE ACCOUNT LINK
    // ==================================================
    const accountLink = await stripe.accountLinks.create({
      account: seller.stripe_account_id,

      refresh_url:
        `${process.env.CLIENT_URL}/seller/stripe/onboarding/refresh`,

      return_url:
        `${process.env.CLIENT_URL}/seller/stripe/onboarding/complete`,

      type: "account_onboarding",
    });

    // ==================================================
    // STEP 5: SEND ONBOARDING URL
    // ==================================================
    return res.json({
      message: "Stripe onboarding link created successfully",
      url: accountLink.url,
    });

  } catch (error) {
    console.error(
      "Create Stripe Onboarding Link Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to create Stripe onboarding link",
    });
  }
};


// ======================================================
// GET STRIPE CONNECT ACCOUNT STATUS
// ======================================================

const getStripeAccountStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get seller
    const sellerResult = await pool.query(
      `
      SELECT id, name, email, role, stripe_account_id
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (sellerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    const seller = sellerResult.rows[0];

    // Check seller role
    if (seller.role !== "seller") {
      return res.status(403).json({
        message: "Only sellers can access Stripe account status",
      });
    }

    // Check Stripe account
    if (!seller.stripe_account_id) {
      return res.status(400).json({
        message: "Stripe connected account does not exist",
      });
    }

    // Retrieve account from Stripe
    const account = await stripe.accounts.retrieve(
      seller.stripe_account_id
    );

    const currentlyDue =
      account.requirements?.currently_due || [];

    const eventuallyDue =
      account.requirements?.eventually_due || [];

    const pastDue =
      account.requirements?.past_due || [];

    const chargesEnabled =
      account.charges_enabled;

    const payoutsEnabled =
      account.payouts_enabled;

    const detailsSubmitted =
      account.details_submitted;

    // Determine overall status
    let status = "incomplete";

    if (
      chargesEnabled &&
      payoutsEnabled &&
      detailsSubmitted &&
      currentlyDue.length === 0
    ) {
      status = "complete";
    } else if (pastDue.length > 0) {
      status = "action_required";
    } else {
      status = "pending";
    }

    return res.json({
      status,
      stripeAccountId: account.id,
      detailsSubmitted,
      chargesEnabled,
      payoutsEnabled,
      currentlyDue,
      eventuallyDue,
      pastDue,
    });

  } catch (error) {
    console.error(
      "Get Stripe Account Status Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to retrieve Stripe account status",
    });
  }
};



module.exports = {
  createConnectedAccount,
  createOnboardingLink,
  getStripeAccountStatus,
};