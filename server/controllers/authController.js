const pool = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

const register = async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (!name || !email || !password) {

      return res.status(400).json({
        message: "All fields are required",
      });

    }

    // Check if email already exists

    const existingUser = await pool.query(

      `
      SELECT * FROM users
      WHERE email = $1
      `,

      [email]

    );

    if (existingUser.rows.length > 0) {

      return res.status(400).json({
        message: "Email already exists",
      });

    }

    // Hash password

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user

    const result = await pool.query(

      `
      INSERT INTO users
      (
        name,
        email,
        password,
        role
      )

      VALUES($1,$2,$3,$4)

      RETURNING
      id,
      name,
      email,
      role
      `,

      [
        name,
        email,
        hashedPassword,
        role || "customer",
      ]

    );

    const user = result.rows[0];

    const token = generateToken(user);

    res.status(201).json({

      message: "User registered successfully",

      token,

      user,

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      message: "Server Error",

    });

  }

};



//login function

const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {

      return res.status(400).json({
        message: "Email and password are required",
      });

    }

    // Find user
    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        message: "User not found",
      });

    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {

      return res.status(401).json({
        message: "Invalid password",
      });

    }

    // Generate token
    const token = generateToken(user);

    res.json({

      message: "Login successful",

      token,

      user: {

        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,

      },

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });

  }

};


// forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Find user
    const result = await pool.query(
      `
      SELECT id, name, email
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    /*
      We intentionally return the same message
      whether the email exists or not.
    */
    if (result.rows.length === 0) {
      return res.json({
        message:
          "If an account with this email exists, a password reset link has been sent.",
      });
    }

    const user = result.rows[0];

    // Generate secure random token
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Hash token before storing it in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires after 15 minutes
    const expires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    // Save hashed token and expiry
    await pool.query(
      `
      UPDATE users
      SET
        reset_password_token = $1,
        reset_password_expires = $2
      WHERE id = $3
      `,
      [
        hashedToken,
        expires,
        user.id,
      ]
    );

    // Create reset link
    const resetLink =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send reset email
    await sendEmail({
      to: user.email,
      subject: "ReduxShop - Reset Your Password",

      html: `
        <h2>Hello ${user.name},</h2>

        <p>
          We received a request to reset your ReduxShop password.
        </p>

        <p>
          Click the button below to create a new password:
        </p>

        <p>
          <a
            href="${resetLink}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#2563eb;
              color:white;
              text-decoration:none;
              border-radius:6px;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This link will expire in 15 minutes.
        </p>

        <p>
          If you did not request a password reset,
          you can safely ignore this email.
        </p>
      `,
    });

    return res.json({
      message:
        "If an account with this email exists, a password reset link has been sent.",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};



const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Hash token received from URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid, non-expired token
    const result = await pool.query(
      `
      SELECT id
      FROM users
      WHERE reset_password_token = $1
      AND reset_password_expires > NOW()
      `,
      [hashedToken]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    const user = result.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Update password and invalidate reset token
    await pool.query(
      `
      UPDATE users
      SET
        password = $1,
        reset_password_token = NULL,
        reset_password_expires = NULL
      WHERE id = $2
      `,
      [
        hashedPassword,
        user.id,
      ]
    );

    return res.json({
      message: "Password reset successful",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {

  register,
  login,
  forgotPassword,
  resetPassword,

};