import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

// ✅ Allow ALL origins during development
app.use(cors({
  origin: true,        // allows every origin automatically
  credentials: true,
}));

app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "✅ Backend running" });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

console.log("🔄 Connecting to MongoDB...");
console.log("🔗 URI:", process.env.MONGO_URI ? "URI loaded ✅" : "URI missing ❌");

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log("✅ Server running on port", process.env.PORT || 5000)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });
