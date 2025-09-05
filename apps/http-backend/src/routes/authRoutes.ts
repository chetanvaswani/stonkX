import express, { Router } from "express";
import { UserInterface } from "../types";
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { JWT_SECRET } from "../index";
dotenv.config();
import { users } from "../index";

export const authRouter: Router = express.Router();
const saltRounds = 3;

authRouter.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password)
    if (users.find(u => u.email === email)) {
        return res.status(400).json({
            success: false,
            data: {
                message: "email already exists"
            }
        });
    }

    const hash = await bcrypt.hash(password, saltRounds);
    const userId = uuidv4();
    
    const newUser: UserInterface = {
        id: userId,
        email,
        password: hash, 
        balance: {
            "usd": {
                quantity: 10000,
            }
        },
        openPositions: [],
        orderHistory: []
    };

    const token = jwt.sign({
        userId: userId 
    }, JWT_SECRET);

    // console.log(newUser);
    users.push(newUser);
    console.log(users)
    res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    })
    return res.status(201).json({
        success: true,
        data: {
            message: "Signup Successful!",
            token: token
        }
    })
})

authRouter.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);

    if (!user){
        return res.status(404).json({
            success: false,
            data: {
                message: "email does not exist"
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

    const token = jwt.sign({
       userId: user.id 
    }, JWT_SECRET);

    res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    })

    return res.status(200).json({
        success: true,
        data: {
            message: "login successful!"
        }
    })

})