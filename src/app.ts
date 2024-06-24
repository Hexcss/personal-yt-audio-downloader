import express from "express";
import routes from "./routes";
import { errorHandler } from "./middlewares";
import { useHelmet, useCors } from "./middlewares/security";
import morgan from "morgan";
import logger from "./utils/logger";

const app = express();

app.use(express.json());

app.use(useHelmet);

app.use(useCors);

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.use("/api", routes);

app.use(errorHandler);

export default app;
