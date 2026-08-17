const pool = require("../config/db");

// ================= GET CATEGORIES =================

const getCategories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.parent_id,
        p.name AS parent_name
      FROM categories c
      LEFT JOIN categories p
        ON c.parent_id = p.id
      ORDER BY c.name
    `);

    res.json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
// ================= CREATE CATEGORY =================

const createCategory = async (req, res) => {
  try {
    const { name, parent_id } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const exists = await pool.query(
      `
      SELECT *
      FROM categories
      WHERE LOWER(name) = LOWER($1)
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
      INSERT INTO categories
      (
        name,
        parent_id
      )

      VALUES
      ($1, $2)

      RETURNING *
      `,
      [
        name,
        parent_id || null,
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


// ================= UPDATE CATEGORY =================

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      parent_id,
    } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    // Prevent category from being its own parent
    if (
      parent_id &&
      Number(parent_id) === Number(id)
    ) {
      return res.status(400).json({
        message: "A category cannot be its own parent",
      });
    }

    const exists = await pool.query(
      `
      SELECT *
      FROM categories
      WHERE LOWER(name) = LOWER($1)
      AND id <> $2
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

      SET
        name = $1,
        parent_id = $2

      WHERE id = $3

      RETURNING *
      `,
      [
        name,
        parent_id || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Category not found",
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


// ================= DELETE CATEGORY =================

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;


    // ================= CHECK CATEGORY =================

    const category = await pool.query(
      `
      SELECT *
      FROM categories
      WHERE id = $1
      `,
      [id]
    );


    if (category.rows.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }


    // ================= CHECK CHILDREN =================

    const children = await pool.query(
      `
      SELECT id
      FROM categories
      WHERE parent_id = $1
      LIMIT 1
      `,
      [id]
    );


    if (children.rows.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete this category because it has subcategories. Delete or move its subcategories first.",
      });
    }


    // ================= DELETE =================

    const result = await pool.query(
      `
      DELETE FROM categories

      WHERE id = $1

      RETURNING *
      `,
      [id]
    );


    res.json({
      message: "Category deleted successfully",
      category: result.rows[0],
    });

  } catch (error) {
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