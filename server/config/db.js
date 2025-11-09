import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`🚀 MongoDB connected successfully.`);
  } catch (error) {
    console.error("💥 Houston, we have a problem:", error.message);
    process.exit(1);
  }
};

export default connectDB;
