require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("../config/db");
const { uploadLocalFile } = require("../services/cloudinaryService");

const migrateTable = async (table, idColumn = "id") => {
  const { rows } = await pool.query(
    `SELECT ${idColumn}, image FROM ${table} WHERE image LIKE '/uploads/%'`
  );

  for (const row of rows) {
    const localPath = path.join(__dirname, "..", row.image.slice(1));

    if (!fs.existsSync(localPath)) {
      console.warn(`Skipping missing file: ${row.image}`);
      continue;
    }

    const imageUrl = await uploadLocalFile(localPath);
    await pool.query(
      `UPDATE ${table} SET image = $1 WHERE ${idColumn} = $2`,
      [imageUrl, row[idColumn]]
    );
    console.log(`Migrated ${table} record ${row[idColumn]}`);
  }
};

const run = async () => {
  try {
    await migrateTable("products");
    await migrateTable("product_image");
    console.log("Cloudinary image migration completed.");
  } finally {
    await pool.end();
  }
};

run().catch((error) => {
  console.error("Cloudinary image migration failed:", error.message);
  process.exitCode = 1;
});
