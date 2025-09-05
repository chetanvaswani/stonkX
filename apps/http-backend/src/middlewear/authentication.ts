import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "..";

const auth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies.token;
    if (!token){
        return res.status(403).json({ msg : "Can not verify user. Token rejected." })
    }

    const decoded =  jwt.verify(token, JWT_SECRET);
    if (!decoded ){
        res.status(403).json({ msg : "Can not verify user. Token rejected." })
    }
    console.log(decoded)
    // @ts-ignore
    req.userId = decoded.userId;
    console.log(req.userId)
    next();
}

export default auth