import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

console.log("🔎 DB_NAME en runtime:", process.env.DB_NAME);

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || undefined,
  database: "TimeSlot",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10
});
