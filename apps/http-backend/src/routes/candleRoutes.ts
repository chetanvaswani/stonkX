// import express, { Router } from "express"
// import { INTERVALS, ALL_ASSETS } from "@repo/assets/index";
// // import { client } from "@repo/timescaledb";

// // async function connectDB(){
// //     await client.connect()
// // }
// // connectDB()

// export const candleRouter: Router = express.Router()


// async function getCandles(table: string, startTime: string, endTime: string) {
//     const query = `SELECT * FROM ${table} ORDER BY bucket DESC LIMIT 100;`;
  
//     const values = [startTime, endTime];
  
//     const {rows} = (await client.query(query));
//     return rows;
// }

// candleRouter.get("/getCandles", async (req, res) => {
//     const {asset, duration} = req.query;
//     let {startTime, endTime} = req.query;
//     if (asset == undefined || duration == undefined || startTime == undefined || endTime === undefined){
//         return res.status(404).send("not found")
//     } 
//     if(!INTERVALS.includes(duration.toString())){
//         return res.status(403).json({
//             success: false,
//             data: {
//                 message: "Not a valid candle duration"
//             }
//         })
//     }
//     if (!ALL_ASSETS.includes(asset.toString())){
//         return res.status(403).json({
//             success: false,
//             data: {
//                 message: "Not a valid asset"
//             }
//         })
//     }
//     console.log(asset, duration, startTime, endTime);
//     const tableName = `${asset}_ohlcv_${duration}`
//     console.log(tableName)
//     startTime = (new Date((startTime).toString()).toISOString())
//     endTime = (new Date((startTime).toString()).toISOString())

//     const candles = await getCandles(tableName, startTime, endTime);
//     console.log(candles);
//     res.status(200).json({
//         success: true,
//         data: {
//             candles
//         }
//     })
// })