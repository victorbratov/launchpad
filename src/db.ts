import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env"); // error throwup if cant connect
}

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });

console.log("database connected!!!!!!!!!!!!!!!!!!!!!!!!!!");