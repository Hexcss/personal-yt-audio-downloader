import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

export const useHelmet = helmet();
export const useCors = cors({ origin: "*" });
export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
