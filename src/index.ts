import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL, // Production frontend URL (e.g., https://your-app.vercel.app)
  "http://localhost:5173",  // Vite dev server
  "http://localhost:3000",  // Alternative dev server
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow all Vercel preview deployments
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    // Reject other origins
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // Allow cookies and auth headers
}));
app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/api", router); // All routes will start with /api (e.g., /api/floors)

// Health Check
app.get("/", (_req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
