import { Client } from "pg";

const client = new Client({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "trades",
  password: process.env.DB_PASS || "yourpassword",
  port: Number(process.env.DB_PORT) || 5432,
});

let isConnected = false;

export async function getClient() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client;
}