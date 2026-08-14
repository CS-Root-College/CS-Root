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

//Routing
import userRoutes from "./routes/user.route"
app.use("/api/v1/users",userRoutes)

export default app;