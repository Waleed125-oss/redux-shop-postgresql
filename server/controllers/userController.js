const pool = require("../config/db");

const getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
            id,
            name, email, role
            FROM users
            WHERE id = $1`,
            [req.user.id]
        );

        if ( result.rows.length === 0) {
            return res.status(404).json({
                message: "user not found",
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server Error",
        });
    }
};

const updateProfile = async (req, res) => {
  try {

    const { name, email } = req.body;

    const result = await pool.query(
      `
      UPDATE users
      SET
        name = $1,
        email = $2
      WHERE id = $3
      RETURNING
        id,
        name,
        email,
        role
      `,
      [
        name,
        email,
        req.user.id,
      ]
    );

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });

  }
};

// Get ALL CUSTOMERS - ADMIN

const getCustomers = async (req, res) => {
  try {

    // Make sure only admin can access this
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role
      FROM users
      WHERE role = 'customer'
      ORDER BY id DESC
      `
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to fetch customers",
    });

  }
};


module.exports = {
  getProfile,
  updateProfile,
  getCustomers,
};