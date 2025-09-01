import express, { Router } from "express";
import { UserInterface, PositionInterface, OrderInterface } from "../types";
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
dotenv.config();
import { users } from "../index";

export const authRouter: Router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "guessmypassword";
const saltRounds = 3;


authRouter.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    if (users.find(u => u.username === username)) {
        return res.status(400).json({
            success: false,
            data: {
                message: "Username already exists"
            }
        });
    }

    const hash = await bcrypt.hash(password, saltRounds);
    
    
    const newUser: UserInterface = {
        id: users.length + 1,
        username,
        password: hash, 
        balance: {
            "usd": {
                quantity: 10000,
            }
        },
        openPositions: [],
        orderHistory: []
    };

    console.log(newUser);
    users.push(newUser);

    res.status(201).json({
        success: true,
        data: {
            message: "Signup Successful!"
        }
    })
})

authRouter.post("/sigin", async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);

    if (!user){
        return res.status(404).json({
            success: false,
            data: {
                message: "username does not exist"
            }
        })
    }

    if (!(await bcrypt.compare(password, user.password ))){
        return res.status(401).json({
            success: false,
            data: {
                message: "invalid password"
            }
        })
    }


})