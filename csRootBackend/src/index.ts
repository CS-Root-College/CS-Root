import "./config/env"
// dns configuration
import dns from "dns"
dns.setServers(["1.1.1.1","8.8.8.8"]);

import app from "./app";
import dbConnect from "./config/database";
import redis from "./config/redis";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await dbConnect();
    await redis.connect();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server");
    console.error(error);
    process.exit(1);
  }
};

startServer();