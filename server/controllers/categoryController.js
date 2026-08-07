const pool = require("../config/db");

// ================= GET =================

const getCategories = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT *
      FROM categories
      ORDER BY name
      `
    );

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });

  }

};

// ================= CREATE =================

const createCategory = async (req, res) => {

  try {

    const { name } = req.body;

    if (!name || name.trim() === "") {

      return res.status(400).json({
        message: "Category name is required",
      });

    }

    const exists = await pool.query(

      `
      SELECT *
      FROM categories
      WHERE LOWER(name)=LOWER($1)
      `,

      [name]

    );

    if (exists.rows.length > 0) {

      return res.status(400).json({
        message: "Category already exists",
      });

    }

    const result = await pool.query(

      `
      INSERT INTO categories(name)
      VALUES($1)
      RETURNING *
      `,

      [name]

    );

    res.status(201).json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });

  }

};

// ================= UPDATE CATEGORY =================

const updateCategory = async (req, res) => {

  try {

    const { id } = req.params;

    const { name } = req.body;

    if (!name || name.trim() === "") {

      return res.status(400).json({
        message: "Category name is required",
      });

    }

    const exists = await pool.query(

      `
      SELECT *
      FROM categories
      WHERE LOWER(name)=LOWER($1)
      AND id<>$2
      `,

      [name, id]

    );

    if (exists.rows.length > 0) {

      return res.status(400).json({
        message: "Category already exists",
      });

    }

    const result = await pool.query(

      `
      UPDATE categories

      SET name=$1

      WHERE id=$2

      RETURNING *
      `,

      [name, id]

    );

    if (result.rows.length === 0) {

      return res.status(404).json({

        message: "Category not found",

      });

    }

    res.json(result.rows[0]);

  }

  catch (error) {

    console.error(error);

    res.status(500).json({

      message: "Server Error",

    });

  }

};


// ================= DELETE CATEGORY =================

const deleteCategory = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(

      `
      DELETE FROM categories

      WHERE id=$1

      RETURNING *
      `,

      [id]

    );

    if (result.rows.length === 0) {

      return res.status(404).json({

        message: "Category not found",

      });

    }

    res.json({

      message: "Category deleted successfully",

      category: result.rows[0],

    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({

      message: "Server Error",

    });

  }

};
module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};