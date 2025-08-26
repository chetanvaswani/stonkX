import WebSocket from "ws";
import { createClient } from "redis";

const ALL_ASSETS = ["btcusdt", "solusdt"];

async function main() {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws");
    const publisher = createClient({
        url: "redis://localhost:6379"
    });
    
    await publisher.connect();
    
    
    async function pollData(asset: String){
    
        ws.on("open", () => {
            console.log("connected to the binance ws")
    
            const subscription = {
                method: "SUBSCRIBE",
                params: [`${asset}@trade`],
                id: 1
            }
    
            ws.send(JSON.stringify(subscription));
            console.log(`Subscribed to ${asset}`);
        })
    
        ws.on("message", (res) => {
            const data = res.toString();
            publisher.publish(asset.toString(), data);
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