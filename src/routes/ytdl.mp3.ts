import { Router, Request, Response, NextFunction } from "express";
import { downloadMP3 } from "../services/ytdl.service";
import { downloadMP3ValidationRules } from '../middlewares/validators';
import { validationResult } from "express-validator";
import { downloadFile } from "../services/downloader.service";

const router = Router();

router.post("/convertmp3", downloadMP3ValidationRules, (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}, downloadMP3);

router.get("/downloadmp3/:slug", downloadFile);

export default router;
