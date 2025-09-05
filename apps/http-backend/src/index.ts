import express from "express";
import { authRouter } from "./routes/authRoutes";
import { UserInterface} from "./types";
import { orderRouter } from "./routes/OrderRoutes";
import * as dotenv from 'dotenv';
import notFoundMiddlewear from "./middlewear/notFound";
import errorHandlerMiddlewar from "./middlewear/errorHandler";
import { ALL_ASSETS, INTERVALS } from "@repo/assets/index";
import { createClient } from 'redis';
import { client } from "@repo/timescaledb";
import cookieParser from "cookie-parser";
import cors from "cors";
import { userRouter } from "./routes/userRoutes";
import auth from "./middlewear/authentication";

dotenv.config();

const subscriber = createClient();
async function connectRedis() {
    await subscriber.connect();
}
connectRedis();

async function connectDB(){
    await client.connect()
}
connectDB();

export const JWT_SECRET = process.env.JWT_SECRET || "guessmypassword";

ALL_ASSETS.forEach((asset) => {
    subscriber.subscribe( asset, (data) => {
        const resJSON = JSON.parse(data);
        currentPrice[asset]!.buyPrice = resJSON.buyPrice
        currentPrice[asset]!.sellPrice = resJSON.sellPrice
    });
});

const app = express();
const PORT = process.env.PORT || 3001;

export const users: UserInterface[] = [
    {
        id: "9d8cd557-b715-41cc-8613-83b9c45c2c96",
        email: "chetan.vaswani.cv@gmail.com",
        password: "$2b$04$ff9ZwD8GxdTKwIjFsKJt5eE75Wjgw8q7F5o1v9e474Dwhg78YA1FK",
        balance: {
            usd: {
                quantity: 10000
            }
        },
        openPositions: [],
        orderHistory: []
    }
]

interface currentPriceInterface{
    [asset: string]: {
        buyPrice: number,
        sellPrice: number
    }
}

export const currentPrice: currentPriceInterface = {
    "ethusdt": {
        buyPrice: 0,
        sellPrice: 0
    },
    "solusdt": {
        buyPrice: 0,
        sellPrice: 0
    },
    "btcusdt": {
        buyPrice: 0,
        sellPrice: 0
    }, 
    "atomusdt": {
        buyPrice: 0,
        sellPrice: 0
    }
}

app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(cookieParser());
app.use("/api/v1", authRouter);
app.use("/api/v1", auth, userRouter);
app.use("/api/v1", auth, orderRouter);

async function getCandles(table: string, startTime: string, endTime: string) {
    const query = `SELECT * FROM ${table} ORDER BY bucket DESC LIMIT 100;`;

    // const values = [startTime, endTime];
  
    const {rows} = (await client.query(query));
    return rows;
}

app.get("/getCandles", async (req, res) => {
    const {asset, duration} = req.query;
    let {startTime, endTime} = req.query;
    if (asset == undefined || duration == undefined || startTime == undefined || endTime === undefined){
        return res.status(404).send("not found")
    }
    if(!INTERVALS.includes(duration.toString())){
        return res.status(403).json({
            success: false,
            data: {
                message: "Not a valid candle duration"
            }
        })
    }
    if (!ALL_ASSETS.includes(asset.toString())){
        return res.status(403).json({
            success: false,
            data: {
                message: "Not a valid asset"
            }
        })
    }
    console.log(asset, duration, startTime, endTime);
    const tableName = `${asset}_ohlcv_${duration}`
    console.log(tableName)
    startTime = (new Date((startTime).toString()).toISOString())
    endTime = (new Date((startTime).toString()).toISOString())

    const candles = await getCandles(tableName, startTime, endTime);
    // console.log(candles);
    res.status(200).json({
        success: true,
        data: {
            candles
        }
    })
})

app.get("/logout", (req, res) => {
    res.clearCookie("token", { path: "/" })
    res.status(200).json({
        success: true,
        data: {
            message: "cookie cleared!"
        }
    })
})

app.use(errorHandlerMiddlewar)
app.use(notFoundMiddlewear)

app.listen(PORT, async () => {
    console.log(`app is listening on port: ${PORT}`);
})