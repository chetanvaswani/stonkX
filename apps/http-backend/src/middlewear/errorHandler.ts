import { Request, Response, NextFunction } from "express";

const errorHandlerMiddleware = (
  err: any, // Use a proper custom error type if available
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(500).json({
    status: "failure",
    msg: err.message || "Internal Server Error",
  });
};

export default errorHandlerMiddleware;
