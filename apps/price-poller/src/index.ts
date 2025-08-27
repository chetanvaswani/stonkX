import WebSocket from "ws";
import { createClient } from "redis";
import { ALL_ASSETS } from "@repo/assets/index";
import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
})

async function main() {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws");
    const publisher = createClient({
        url: "redis://localhost:6379"
    });
    const producer = kafka.producer()
    
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
            const data = res.toString();
            publisher.publish(asset.toString(), data);
            await producer.send({
                topic: asset.toString(),
                messages: [
                    { value: data },
                ],
            })
            console.log(data)
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