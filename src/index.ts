import express from "express";
import routes from "./routes";
import { errorHandler } from "./middlewares";
import { useHelmet, useCors, rateLimiter } from "./middlewares/security";

const PORT = process.env.PORT || 3000;

const app = express();

app.set('trust proxy', 1);
app.use(express.json());

// Use Helmet for security headers
app.use(useHelmet);
// Use CORS for Cross-Origin Resource Sharing
app.use(useCors);
// Apply rate limiting
app.use(rateLimiter);

// Routes
app.use('/', routes);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}!`);
});

