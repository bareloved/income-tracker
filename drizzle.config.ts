import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // DATABASE_URL is required for migrations and push commands
    // For generate command, it's not needed since it only reads the schema
    url: process.env.DATABASE_URL || "",
  },
});

