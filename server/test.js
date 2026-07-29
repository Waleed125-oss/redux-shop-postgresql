// require("dotenv").config();

// const pool = require("./config/db");

// async function testConnection() {
//   try {
//     const result = await pool.query("SELECT NOW()");
//     console.log("✅ PostgreSQL Connected Successfully");
//     console.log(result.rows[0]);
//     process.exit();
//   } catch (err) {
//     console.log("❌ Connection Failed");
//     console.log(err.message);
//   }
// }

// testConnection();