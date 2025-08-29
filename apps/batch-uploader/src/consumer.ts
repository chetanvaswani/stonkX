import { Kafka } from "kafkajs";
import { ALL_ASSETS } from "@repo/assets/index";
import { tradeInterface } from "@repo/types/trade";
import fs from "fs";
import path from "path";
import { client } from "@repo/timescaledb";
import * as pgCopyStreams from "pg-copy-streams";
const copyFrom = pgCopyStreams.from;

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
});

async function connectDB(){
    await client.connect()
}
connectDB()

async function loadCsvToDb(filePath: string) {
    const tableName = path.basename(filePath).split("_")[0]; // e.g., btcusdt_0.csv → btcusdt
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
        console.warn(`File ${absolutePath} not found, skipping.`);
        return;
    }

    const copyQuery = `
        COPY ${tableName} (symbol, price, timestamp, quantity)
        FROM STDIN WITH CSV HEADER
    `;

    const stream = client.query(copyFrom(copyQuery));
    const fileStream = fs.createReadStream(absolutePath);

    return new Promise<void>((resolve, reject) => {
        fileStream.on("error", reject);
        stream.on("error", reject);
        stream.on("finish", () => {
            console.log(`Loaded file ${filePath} into table ${tableName}`);
            resolve();
        });
        fileStream.pipe(stream);
    });
}

let writer_index = Object.fromEntries(
    ALL_ASSETS.map(asset => [asset, 0])
);

setInterval(() => {
    console.log("switching file")
    writer_index = Object.fromEntries(
        ALL_ASSETS.map((asset) => {
            loadCsvToDb(`data/${asset}_${writer_index[asset]}.csv`)
                .then(() => {
                    fs.writeFileSync(`data/${asset}_${writer_index[asset]}.csv`, HEADERS.join(",") + "\n", "utf8");
                })
                .catch(console.error);
            return [asset, Number(!writer_index[asset])]
        } )
    );
}, 15000);

const HEADERS = ["symbol", "price", "timeStamp", "quantity"];
const consumer = kafka.consumer({ groupId: 'sher-akela-ata-hai' });

async function main(){
    await consumer.connect();

    ALL_ASSETS.forEach(async (asset) => {
        await consumer.subscribe({ topic: asset, fromBeginning: true })
    });
    
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            if(message.value){

                const decoder = new TextDecoder('utf-8'); 
                const data = JSON.parse(decoder.decode(message.value));

                writeMessage(`${topic}_${writer_index[topic]}.csv`, data)
            }
        },
    })
}

function writeMessage(fileName: string, data: tradeInterface) {

    try {
        const filePath = path.join("data", fileName);
        const headerLine = HEADERS.join(",") + "\n";

        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(`data/${fileName}`, headerLine + Object.values(data).join(",") + "\n", "utf8");
        } else {
            fs.appendFileSync(`data/${fileName}`, Object.values(data).join(",") + "\n", "utf8");
        }
    } catch(err) {
        console.error(`Thak gaya bhai likhte likhte 2`, err);

    }
}

main();