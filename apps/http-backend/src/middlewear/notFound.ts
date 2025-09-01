import { Request, Response, NextFunction } from "express";

const notFoundMiddlewear = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    status: "failure",
    msg: "path not found",
  });
};

export default notFoundMiddlewear;
