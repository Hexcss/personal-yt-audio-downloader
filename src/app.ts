import express from "express";
import routes from "./routes";
import { errorHandler } from "./middlewares";
import { useHelmet, useCors, rateLimiter } from "./middlewares/security";

const app = express();

app.set("trust proxy", 1);
app.use(express.json());

app.use(useHelmet);

app.use(useCors);

app.use(rateLimiter);

app.use("/api", routes);

app.use(errorHandler);

export default app;
