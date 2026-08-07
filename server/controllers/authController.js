const pool = require("../config/db");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

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

module.exports = {

  register,
  login,

};