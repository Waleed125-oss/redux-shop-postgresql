const stripe = require("../config/stripe");
const pool = require("../config/db");

const getStripeStateSnapshot = async (stripeAccountId) => {
  if (!stripeAccountId) {
    return {
      status: "not_connected",
      connected: false,
      onboardingCompleted: false,
      stripeAccountId: null,
      detailsSubmitted: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      currentlyDue: [],
      eventuallyDue: [],
      pastDue: [],
    };
  }

  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);

    const currentlyDue = account.requirements?.currently_due || [];
    const eventuallyDue = account.requirements?.eventually_due || [];
    const pastDue = account.requirements?.past_due || [];
    const chargesEnabled = Boolean(account.charges_enabled);
    const payoutsEnabled = Boolean(account.payouts_enabled);
    const detailsSubmitted = Boolean(account.details_submitted);

    const connected =
      chargesEnabled && payoutsEnabled && detailsSubmitted;

    const onboardingCompleted =
      connected && currentlyDue.length === 0 && pastDue.length === 0;

    let status = "not_connected";

    if (onboardingCompleted) {
      status = "connected";
    } else if (pastDue.length > 0 || currentlyDue.length > 0) {
      status = "action_required";
    } else if (detailsSubmitted || chargesEnabled || payoutsEnabled) {
      status = "pending";
    }

    return {
      status,
      connected,
      onboardingCompleted,
      stripeAccountId: account.id,
      detailsSubmitted,
      chargesEnabled,
      payoutsEnabled,
      currentlyDue,
      eventuallyDue,
      pastDue,
    };
  } catch (error) {
    console.warn(
      "Stripe account snapshot unavailable:",
      error.message
    );

    return {
      status: "not_connected",
      connected: false,
      onboardingCompleted: false,
      stripeAccountId: stripeAccountId,
      detailsSubmitted: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      currentlyDue: [],
      eventuallyDue: [],
      pastDue: [],
    };
  }
};

const syncSellerStripeStatus = async (userId, stripeAccountId) => {
  const accountId = stripeAccountId || null;
  const snapshot = await getStripeStateSnapshot(accountId);

  const columnsResult = await pool.query(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name IN ('stripe_account_status', 'stripe_onboarding_complete')
    `
  );

  const availableColumns = new Set(
    columnsResult.rows.map((row) => row.column_name)
  );

  const updates = [];
  const values = [];

  if (availableColumns.has("stripe_account_status")) {
    updates.push(`stripe_account_status = $${updates.length + 1}`);
    values.push(snapshot.status);
  }

  if (availableColumns.has("stripe_onboarding_complete")) {
    updates.push(`stripe_onboarding_complete = $${updates.length + 1}`);
    values.push(snapshot.onboardingCompleted);
  }

  if (updates.length > 0) {
    await pool.query(
      `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $${updates.length + 1}
      `,
      [...values, userId]
    );
  }

  return snapshot;
};

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

    const statusSnapshot = await syncSellerStripeStatus(userId, account.id);

    // ==================================================
    // STEP 6: RESPONSE
    // ==================================================

    res.status(201).json({
      message: "Stripe connected account created successfully",
      stripeAccountId: account.id,
      status: statusSnapshot.status,
      onboardingCompleted: statusSnapshot.onboardingCompleted,
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

    const snapshot = await syncSellerStripeStatus(
      userId,
      seller.stripe_account_id
    );

    return res.json({
      status: snapshot.status === "connected" ? "complete" : snapshot.status,
      connected: snapshot.connected,
      onboardingCompleted: snapshot.onboardingCompleted,
      stripeAccountId: snapshot.stripeAccountId,
      detailsSubmitted: snapshot.detailsSubmitted,
      chargesEnabled: snapshot.chargesEnabled,
      payoutsEnabled: snapshot.payoutsEnabled,
      currentlyDue: snapshot.currentlyDue,
      eventuallyDue: snapshot.eventuallyDue,
      pastDue: snapshot.pastDue,
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