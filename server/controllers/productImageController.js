const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

const deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find gallery image
    const result = await pool.query(
      `
      SELECT *
      FROM product_image
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Gallery image not found",
      });
    }

    const image = result.rows[0];

    // Delete image file from uploads folder
    if (image.image) {
      const imagePath = path.join(
        __dirname,
        "..",
        image.image
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete image from database
    await pool.query(
      `
      DELETE FROM product_image
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      message: "Gallery image deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  deleteProductImage,
};