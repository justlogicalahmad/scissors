import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import authRoutes from "./api/v1/routes/auth.route";
import userAgent from "express-useragent";
import apiRoutes from "./api/v1/routes";
import cors, { CorsOptions } from "cors";
import config from "./config/server.config";
import { redirectUrl } from "./api/v1/controllers/url.controller";
import connectDb from "./database/database";
import IError from "./api/v1/entities/error.entity";
import limiter from "./api/v1/middlewares/limiter.middleware";
import authenticateToken from "./api/v1/middlewares/authenticate.middleware";
import cookieParser from "cookie-parser";
import locationMiddleware from "./api/v1/middlewares/reqLocation.middleware";

dotenv.config();

const app = express();
connectDb();

const validOrigins = [
  config.client.landing.BASE_URL,
  config.client.app.BASE_URL,
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || validOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Middleware to ignore favicon.ico requests
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/favicon.ico") {
    res.status(204).end(); // No Content
  } else {
    next();
  }
});

// Middlewares
app.set("trust proxy", "127.0.0.1");
app.use(express.json());
app.use(morgan("dev"));
app.use(userAgent.express());

// CORS configuration
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Rate Limiting
app.use(limiter);
app.use(cookieParser());
app.use(locationMiddleware);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", authenticateToken, apiRoutes);
app.get("/:code", redirectUrl);

// Internal server error middleware
app.use((err: IError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    failed: true,
    message,
    statusCode,
  });
});

export default app;
