import { client } from "@repo/timescaledb";
export let timescaledbClient: void;

async function connectDB(){
    timescaledbClient = await client.connect()
}

connectDB();