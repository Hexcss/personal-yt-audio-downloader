import { Router, Request, Response, NextFunction } from "express";
import { downloadMP3 } from "../services/ytdl.service";
import { downloadMP3ValidationRules } from '../middlewares/validators';
import { validationResult } from "express-validator";

const router = Router();

router.post("/downloadmp3", downloadMP3ValidationRules, (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}, downloadMP3);

export default router;
