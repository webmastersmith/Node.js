import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import tourRouter from "./tours";
import userRouter from "./users";

const app = express();

const x = 22;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${process.cwd()}/public`));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// custom middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  return next();
});

// Routes
// Tours
app.use("/api/v1/tours", tourRouter);
// Users
app.use("/api/v1/users", userRouter);

export default app;
