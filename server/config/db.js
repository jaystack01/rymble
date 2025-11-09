import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in your environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: true,
    });

    console.log(
      `🚀 MongoDB connected successfully to database: ${mongoose.connection.name}`
    );
  } catch (error) {
    console.error("💥 Houston, we have a problem:", error.message);
    process.exit(1);
  }
};

export default connectDB;
