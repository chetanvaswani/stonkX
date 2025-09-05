import express, { Router } from "express"
import { users } from "../index.js";

export const userRouter: Router = express.Router()

userRouter.get("/me", (req, res) => {
    const userId = req.userId;
    console.log(userId, users)
    const user = users.find((u) => u.id === userId)
    if (!user){
        return res.status(404).json({
            success: false,
            data: {
                message: "User not found!"
            }
        })
    }

    return res.status(200).json({
        success: true,
        data: {
            user
        }
    })
})

userRouter.get("/balance", (req, res) => {
    const userId = req.userId;
    const user = users.find((u) => u.id === userId)
    if (!user){
        return res.status(404).json({
            success: false,
            data: {
                message: "User not found!"
            }
        })
    }

    res.status(200).json({
        success: true,
        data: {
            balance: user.balance
        }
    })
})