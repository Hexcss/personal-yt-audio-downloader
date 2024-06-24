import { Router } from "express";
import ytdlRoutes from "./ytdl.mp3";
import healthRouter from "./health";

const router = Router();

router.use("/ytdl", ytdlRoutes);
router.use("/health", healthRouter);

export default router;
