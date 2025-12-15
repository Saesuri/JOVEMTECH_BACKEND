import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";
import { generalLimiter, errorHandler, notFoundHandler } from "./middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://localhost:3000", // Alternative dev server
  // Production URLs (Vercel)
  "https://jovemtech-frontend.vercel.app",
  // Also allow any Vercel preview deployments
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments (*.vercel.app)
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(generalLimiter);

// Routes
app.use("/api", router);

// Health Check
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "JOVEMTECH API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
