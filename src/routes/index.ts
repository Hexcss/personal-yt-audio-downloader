import { Router } from "express";
import ytdlRoutes from "./ytdl.mp3";

const router = Router();

router.use('/ytdl', ytdlRoutes);

export default router;
