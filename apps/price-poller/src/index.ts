import WebSocket from "ws";
import { createClient } from "redis";
import { ALL_ASSETS } from "@repo/assets/index";
import { Kafka } from "kafkajs";
import { tradeInterface } from "@repo/types/trade";

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
})

async function main() {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws");
    const publisher = createClient({
        url: "redis://localhost:6379"
    });
    const producer = kafka.producer();
    
    await publisher.connect();
    await producer.connect()
    
    async function pollData(asset: String){
    
        ws.on("open", () => {
            console.log("connected to the binance ws")
    
            const subscription = {
                method: "SUBSCRIBE",
                params: [`${asset}@trade`],
            }
    
            ws.send(JSON.stringify(subscription));
            console.log(`Subscribed to ${asset}`);
        })
    
        ws.on("message", async (res) => {
            const data_string = res.toString();
            const data_JSON = JSON.parse(data_string);
            let priceGap = (0.01*Number(data_JSON.p));
            const GAP_CEILING = 100;
            if (priceGap > GAP_CEILING){
                priceGap = GAP_CEILING;
            }

            // console.log(Number(data_JSON.p) + priceGap)

            if (data_JSON.s){
                const pubSubData: tradeInterface = {
                    symbol: data_JSON.s.toLowerCase(),
                    sellPrice: data_JSON.p,
                    buyPrice: (Number(data_JSON.p) + priceGap),
                    timeStamp: new Date(data_JSON.T).toISOString(),
                    quantity: data_JSON.q
                };
                const queueData: tradeInterface = {
                    symbol: data_JSON.s.toLowerCase(),
                    price: data_JSON.p,
                    timeStamp: new Date(data_JSON.T).toISOString(),
                    quantity: data_JSON.q
                };

                publisher.publish(pubSubData.symbol, JSON.stringify(pubSubData));
                await producer.send({
                    topic: queueData.symbol,
                    messages: [
                        { value: JSON.stringify(queueData) },
                    ],
                })
                // console.log(queue_data)
            }
        })
    
        ws.on("error", (err) => {
            console.log(`Fuckup ho gaya ji ${err}`);
        })
    
        ws.on("close", () => {
            console.log("These fuckers blocked us!");
        })
    }
    
    ALL_ASSETS.forEach((asset) => {
        pollData(asset)
    })
}

main()