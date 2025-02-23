import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json()); // parse json bodies
app.use(cors()); // enable cors
app.use(helmet()); // Helmet is a security middleware that helps protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately.
app.use(morgan("dev")); // log the requests

app.use("/api/products", productRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
