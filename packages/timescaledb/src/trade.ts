import { client } from "./index.js";

export async function initDB() {
  try {
    await client.connect();

    await client.query("CREATE EXTENSION IF NOT EXISTS timescaledb");

    await client.query(
        `CREATE TABLE IF NOT EXISTS solusdt(
            id SERIAL,
            symbol TEXT NOT NULL,
            price NUMERIC NOT NULL,
            quantity NUMERIC NOT NULL,
            timestamp TIMESTAMPTZ NOT NULL,
            PRIMARY KEY (id, timestamp)
        )`
      );
      await client.query(
        `CREATE TABLE IF NOT EXISTS ethusdt(
            id SERIAL,
            symbol TEXT NOT NULL,
            price NUMERIC NOT NULL,
            quantity NUMERIC NOT NULL,
            timestamp TIMESTAMPTZ NOT NULL,
            PRIMARY KEY (id, timestamp)
        )`
      );

      await client.query(
        `CREATE TABLE IF NOT EXISTS btcusdt(
            id SERIAL,
            symbol TEXT NOT NULL,
            price NUMERIC NOT NULL,
            quantity NUMERIC NOT NULL,
            timestamp TIMESTAMPTZ NOT NULL,
            PRIMARY KEY (id, timestamp)
        )`
      );

    await client.query(`
        SELECT create_hypertable('btcusdt', 'timestamp', if_not_exists => TRUE);
    `);
    await client.query(`
        SELECT create_hypertable('ethusdt', 'timestamp', if_not_exists => TRUE);
    `);
    await client.query(`
        SELECT create_hypertable('solusdt', 'timestamp', if_not_exists => TRUE);
    `);
  

    await client.end();
    console.log("✅ trades table and hypertable ready");
  } catch (error) {
    console.error("error", error);
  }
}

initDB().catch(console.error);