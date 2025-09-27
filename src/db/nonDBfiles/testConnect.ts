import { db } from "../../db";

async function testConnect() {
  try {
    // Run a simple raw SQL query to check connection
    const result = await db.execute(`SELECT NOW() AS now;`);
    console.log("✅ Database connection successful!");
    console.log("Current time from DB:", result.rows[0].now);
  } catch (error) {
    console.error(" Database connection failed:", error);
  } finally {
    process.exit(0); // exit script after running
  }
}

testConnect();

//src\db\nonDBfiles\testConnect.ts