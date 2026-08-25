import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

// Cron

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.WEB_URL,
    credentials: true,
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
import githubRoutes from "./routes/github.route"

app.use("/api/v1/users",userRoutes)
app.use("/api/v1/oauth",githubRoutes)

import errorHandler from "./utils/errorHandler";
app.use(errorHandler);

export default app;