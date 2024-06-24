import express from "express";
import routes from "./routes";
import { errorHandler } from "./middlewares";
import { useHelmet, useCors } from "./middlewares/security";

const app = express();

app.use(express.json());

app.use(useHelmet);

app.use(useCors);

app.use("/api", routes);

app.use(errorHandler);

export default app;
