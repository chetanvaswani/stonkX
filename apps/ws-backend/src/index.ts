import {WebSocketServer} from "ws";
import { createClient } from 'redis';
import { ALL_ASSETS } from "@repo/assets/index";

interface User{
    ws: WebSocket,
}

const users: User[] = [];

const wss = new WebSocketServer({ port: 8080 }, () => {
    console.log("ws started on port 8080");
});
const subscriber = createClient()

async function connectRedis() {
    await subscriber.connect();
}
connectRedis()

wss.on("connection", (ws: WebSocket, request) => {
    users.push({
        ws
    })
})


ALL_ASSETS.forEach((asset) => {
    subscriber.subscribe( asset, (data) => {
        users.forEach((user) => {
            user.ws.send(data)
        })
    });
})
