import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Rymble backend running");
});

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on -> http://localhost:${PORT}`);
});
