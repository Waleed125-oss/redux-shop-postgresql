const pool = require("../config/db");
const { deleteImage } = require("../services/cloudinaryService");

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

    await deleteImage(image.image);

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
