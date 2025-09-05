import express, { Router } from "express";
import { users } from "../index.js";
import { ALL_ASSETS } from "@repo/assets/index";
import { currentPrice } from "../index.js";

export const orderRouter: Router = express.Router()

orderRouter.post("/order/open", (req, res) => {
    const userId = req.userId;
    const {type, asset} = req.body;
    let {stopLoss, takeProfit, leverage, margin, tradeBy, quantity} = req.body;
    const userIndex = users.findIndex((u) => u.id === userId);
    const user = users[userIndex];
    let amountToLock;
    let autoLiquidate: boolean;
    let userWantsToLiquidate: boolean = false;
    let priceToHitLiquidation;
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
            success: false,
            data: {
                message: "the asset you are trying to trade does not exist on our platform"
            }
        })
    }

    const isTradePossible = (totalSpending: number) => {
        console.log(totalSpending, usdBalance)
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
    }{
        if (tradeBy === "amount"){
            if (margin === null){
                return {
                    amountToLock: 0, 
                    quantity: 0
                }
            }
            return {
                amountToLock: Number(margin), 
                quantity: (Number(margin) / Number(currentPrice[asset]?.[type])) * Number(leverage)
            };
        } else if (tradeBy === "quantity") {
            if (quantity === null){
                return {
                    amountToLock: 0, 
                    quantity: 0
                }
            }
            console.log("here", Number(currentPrice[asset]![type]))
            return {
                amountToLock: Number(currentPrice[asset]![type]) * Number(quantity), 
                quantity: Number(quantity)
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
        if (leverage !== null && Number(leverage) > 1){
            autoLiquidate = true;
        } else {
            autoLiquidate = false;
        }

        ({amountToLock, quantity} = getAmountToLock(tradeBy, asset, quantity, margin, "buyPrice"))
        if (amountToLock == 0 || quantity == 0){
            res.status(403).json({
                success: false,
                data: {
                    message: "Amount or quantity should be a valid integer."
                }
            })
        }
    } else{
        autoLiquidate = true;
        ({amountToLock, quantity} = getAmountToLock(tradeBy, asset, quantity, margin, "sellPrice"))
        if (amountToLock == 0 || quantity == 0){
            res.status(403).json({
                success: false,
                data: {
                    message: "Amount or quantity should be a valid integer."
                }
            })
        }
    }
    console.log(amountToLock, quantity)

    if(!isTradePossible((amountToLock as number))){
        return res.status(403).json({
            success: false,
            data: {
                message: "Insufficient USD Balance"
            }
        })
    }
     
    if (autoLiquidate){
        const lossToHitLiquidation = (margin * 0.9)

        if (type === "buy"){
            priceToHitLiquidation = ((currentPrice[asset]?.sellPrice! * quantity) - lossToHitLiquidation)/quantity
        } else {
            priceToHitLiquidation = ((currentPrice[asset]?.buyPrice! * quantity) + lossToHitLiquidation)/quantity
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
            stopLoss,
            margin,
            entryPrice: currentPrice[asset]?.buyPrice!,
            leverage
        })
    }

    makeTrade(amountToLock)

    return res.status(200).json({
        success: true,
        data: {
            openPositions: users[userIndex]?.openPositions,
            priceToHitLiquidation
        }
    })
})

orderRouter.post("/order/close", (req, res) => {
    
})