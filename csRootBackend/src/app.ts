import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

// Cron

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
    const allowedOrigins = [
        process.env.WEB_URL
    ];

    if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS."));
},
credentials: true
  })
);


app.use(express.urlencoded({
    extended: true
}));

app.get("/", (req, res) => {
    res.send("CS Root is Active");
});
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "OK",
        message: "CS ROOT backend is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

//Routing
import userRoutes from "./routes/user.route"
import githubRoutes from "./routes/github.route"
import compilerRoutes from "./routes/compiler.route";
import dsaRoutes from "./routes/dsa.route";

app.use("/api/v1/users",userRoutes)
app.use("/api/v1/oauth",githubRoutes)
app.use("/api/v1/compiler",compilerRoutes)
app.use("/api/v1/problems",dsaRoutes)

import errorHandler from "./utils/errorHandler";
app.use(errorHandler);

export default app;