import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import auth_routes from "./routes/auth_routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", auth_routes);

// Connect DB and start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  console.log("🛰  Mission Control: Systems nominal.");
  app.listen(PORT, () =>
    console.log(`🌍 Ground control online at http://localhost:${PORT}`)
  );
});
