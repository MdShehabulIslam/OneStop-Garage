import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import productRoutes from "./routes/productRoutes.js";
import { sql } from "./config/db.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json()); // parse json bodies
app.use(cors()); // enable cors
app.use(helmet()); // Helmet is a security middleware that helps protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately.
app.use(morgan("dev")); // log the requests

// Apply arcjet rate-limit to all routes
app.use(async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        res.status(429).json({ error: "Too many requests" });
      } else if (decision.reason.isBot()) {
        res.status(403).json({ error: "Bot access denied" });
      } else {
        res.status(403).json({ error: "Forbidden" });
      }
      return;
    }

    // check for spoofed bots
    if (
      decision.results.some(
        (result) => result.reason.isBot() && result.reason.isSpoofed()
      )
    ) {
      res.status(403).json({ error: "Spoof Bot detected" });
      return;
    }

    next();
  } catch (error) {
    console.log("Arcjet error", error);
    next(error);
  }
});

app.use("/api/products", productRoutes);

async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      image VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    console.log("Database initialized successfuly");
  } catch (error) {
    console.log("Error connecting to the database", error);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
