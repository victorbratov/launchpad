import { db } from "../../db";

async function listTables() {
  try {
    const result = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `);

    console.log("📋 Tables in database:");
    for (const row of result.rows) {
      console.log("-", row.table_name);
    }
  } catch (error) {
    console.error("Error fetching tables:", error);
  } finally {
    process.exit(0);
  }
}

listTables();
