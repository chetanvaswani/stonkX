import { Kafka } from "kafkajs";
import { ALL_ASSETS } from "@repo/assets/index";
import { tradeInterface } from "@repo/types/trade";
import fs from "fs";
import path from "path";

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
});

let switchFile = false;


let writer_index = Object.fromEntries(
    ALL_ASSETS.map(asset => [asset, 0])
);

setInterval(() => {
    console.log("switching file")
    writer_index = Object.fromEntries(
        ALL_ASSETS.map(asset => [asset, Number(!writer_index[asset])])
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
                // if (switchFile){
                //     console.log("switching file")
                //     writer_index = {
                //         ...writer_index,
                //         [data.symbol]: Number(!(writer_index[data.symbol]))
                //     }
                // }

                writeMessage(`${topic}_${writer_index[topic]}.csv`, data)
                // console.log({
                //     topic, data
                // })
            }
        },
    })
}

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
}
  

function writeMessage(fileName: string, data: tradeInterface) {

    // if (Math.random() > 0.5){
    //     writer_index = {
    //         ...writer_index,
    //         [data.symbol]: Number(!(writer_index[data.symbol]))
    //     }
    // }

    try {

        const filePath = path.join("data", fileName);
        // ensureDir(DATA_DIR);
    
        const headerLine = HEADERS.join(",") + "\n";
        if (!fs.existsSync(filePath)) {
            // fs.writeFileSync(filePath, headerLine + line, "utf8");
            // console.log("likh raha hu bkl rukja");
            fs.writeFileSync(`data/${fileName}`, headerLine + Object.values(data).join(",") + "\n", "utf8");
        } else {
            fs.appendFileSync(`data/${fileName}`, Object.values(data).join(",") + "\n", "utf8");
        }
    } catch(err) {
        console.error(`Thak gaya bhai likhte likhte 2`, err);

    }
}

main()