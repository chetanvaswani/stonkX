import { Client } from "pg";

export const client = new Client({
  connectionString: "postgresql://postgres:yourpassword@localhost:5432/tradesdb",
})