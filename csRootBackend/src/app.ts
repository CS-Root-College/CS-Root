
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Existing routes
import userRoutes from "./routes/user.route";
import githubRoutes from "./routes/github.route";
import compilerRoutes from "./routes/compiler.route";
import dsaRoutes from "./routes/dsa.route";
import notesRoutes from "./routes/notes.route";
import errorHandler from "./utils/errorHandler";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [process.env.WEB_URL].filter(
        (value): value is string => Boolean(value)
      );

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS."));
    },
    credentials: true,
  })
);

// Health check
app.get("/", (_req, res) => {
  res.send("CS Root is Active");
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "CS ROOT backend is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/oauth", githubRoutes);
app.use("/api/v1/compiler", compilerRoutes);
app.use("/api/v1/problems", dsaRoutes);
app.use("/api/v1/notes", notesRoutes);

// Error handler (keep this last)
app.use(errorHandler);

export default app;
