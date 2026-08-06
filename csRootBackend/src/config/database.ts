import mongoose from "mongoose";

const dbConnect = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGODB_URI is not defined in environment variables"
      );
    }

    await mongoose.connect(mongoUri, {
      dbName: "problemforge",
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed");
    console.error(error);

    throw error;
  }
};

export default dbConnect;