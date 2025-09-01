import express from "express";
import { authRouter } from "./routes/auth";
import { UserInterface, PositionInterface, OrderInterface } from "./types";
import notFoundMiddlewear from "./middlewear/notFound";
import errorHandlerMiddlewar from "./middlewear/errorHandler";
import { ALL_ASSETS, INTERVALS } from "@repo/assets/index";
import { createClient } from 'redis';
import { client } from "@repo/timescaledb";
import cors from "cors";

async function connectDB(){
    await client.connect()
}
connectDB()

const subscriber = createClient();
async function connectRedis() {
    await subscriber.connect();
}
connectRedis();

ALL_ASSETS.forEach((asset) => {
    subscriber.subscribe( asset, (data) => {
        const resJSON = JSON.parse(data);
        currentPrice[asset]!.buyPrice = resJSON.buyPrice
        currentPrice[asset]!.sellPrice = resJSON.sellPrice
    });
})

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "guessmypassword";

export const users: UserInterface[] = []

interface currentPriceInterface{
    [asset: string]: {
        buyPrice: number,
        sellPrice: number
    }
}

const currentPrice: currentPriceInterface = {
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
    }
}

app.use(cors())
app.use(express.json())
app.use("/api/v1", authRouter);

app.get("/api/v1/balance", (req, res) => {
    const userId = req.userId;
    const user = users.find((u) => u.id === userId)
    if (!user){
        return
    }

    res.status(200).json({
        success: true,
        data: {
            balance: user.balance
        }
    })
})

app.get("/candles", (req, res) => {
    
})

// export interface PositionInterface{
//     entryTimeStamp: number,
//     type: "buy" | "sell",
//     asset: string,
//     quantity: number,
//     entryPrice: number,
//     stopLoss?: number,
//     margin?: number,
//     takeProfit?: number,
//     leverage?: number,
// }

app.post("/api/v1/order/open", (req, res) => {
    const userId = req.userId;
    const {type, asset} = req.body;
    let {stopLoss, takeProfit, leverage, margin, tradeBy, quantity} = req.body;
    const userIndex = users.findIndex((u) => u.id === userId);
    const user = users[userId];
    let amountToLock;
    let autoLiquidate: boolean;
    let userWantsToLiquidate: boolean = false;
    if (!user){
        return res.status(401).json({
            success:false,
            data: {
                message: "You are not authorised to make this trade."
            }
        })
    }

    const usdBalance = user.balance["usd"]!.quantity;

    if (!(ALL_ASSETS.includes(asset))){
        return res.status(404).json({
            success:false,
            data: {
                message: "the asset you are trying to trade does not exist on our platform"
            }
        })
    }

    const isTradePossible = (totalSpending: number) => {
        return totalSpending <= usdBalance;
    }

    if (!(0 < Number(stopLoss) && Number(stopLoss) < 1)){
        stopLoss = null;
    } else {
        userWantsToLiquidate = true;
    }
    if (!(0 < Number(takeProfit))){
        takeProfit = null;
    } else {
        userWantsToLiquidate = true;
    }

    function getAmountToLock(tradeBy: string, asset: string, quantity: number, margin: number, type: "buyPrice"| "sellPrice"): {
        amountToLock: number,
        quantity: number,
    }  {
        if (tradeBy === "amount"){
            if (margin === null){
                return {
                    amountToLock: 0, 
                    quantity: 0
                }
            }
            return {
                amountToLock: margin, 
                quantity:  Number(currentPrice[asset]?.buyPrice)/(margin)/(leverage)
            };
        } else if (tradeBy === "quantity") {
            if (quantity === null){
                return {
                    amountToLock: 0, 
                    quantity: 0
                }
            }
            return {
                amountToLock: currentPrice[asset]![type] * quantity, 
                quantity: quantity
            }
        }

        return {
            amountToLock: 0, 
            quantity: 0
        }
    }


    //  I would only allow the user to trade by quantity and not amout when leverage is not involved.
    // Quantity, leverage and margin are inter related and changing one would lead to recalculation of others 
    // leading to bad UX and unecessarily complicated UI.
    if (type === "buy"){
        if (leverage !== null && Number(leverage) > 0){
            autoLiquidate = true;
        } else {
            autoLiquidate = false;
        }

        ({amountToLock, quantity} = getAmountToLock(tradeBy, asset, quantity, margin, type))
        if (amountToLock == 0 || quantity == 0){
            res.status(403).json({
                success: false,
                data: {
                    message: "Amount or quantity should be a number"
                }
            })
        }
        
    } else if (type === "sell"){
        autoLiquidate = true;
        ({amountToLock, quantity} = getAmountToLock(tradeBy, asset, quantity, margin, type))
        if (amountToLock == 0 || quantity == 0){
            res.status(403).json({
                success: false,
                data: {
                    message: "Amount or quantity should be a number"
                }
            })
        }
    }

    const makeTrade = (amount: number) => {
        users[userIndex]!.balance = {
            ...users[userIndex]!.balance,
            "usd": {
                quantity: usdBalance - amount
            }, 
            [asset]: {
                quantity,
                type
            }
        }

        users[userIndex]!.openPositions.push({
            entryTimeStamp: Date.now(),
            type,
            asset,
            quantity,
            takeProfit,
            margin,
            entryPrice: currentPrice[asset]?.buyPrice!,
        })
    }
})

app.post("/order/close", (req, res) => {
    
})

async function getCandles(table: string, startTime: string, endTime: string) {
    const query = `SELECT * FROM ${table} ORDER BY bucket DESC LIMIT 100;`;
  
    const values = [startTime, endTime];
    // console.log(table)
  
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
    console.log(candles);
    res.status(200).json({
        success: true,
        data: {
            candles
        }
    })
})

app.use(errorHandlerMiddlewar)
app.use(notFoundMiddlewear)

app.listen(PORT, async () => {
    console.log(`app is listening on port: ${PORT}`);
})