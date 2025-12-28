import express from "express";
import { createDemoSession } from "../controllers/demo_controller.js";

const router = express.Router();

router.post("/", createDemoSession);

export default router;
