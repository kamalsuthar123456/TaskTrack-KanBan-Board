import express       from "express";
import mongoose      from "mongoose";
import cors          from "cors";
import dotenv        from "dotenv";
import authRoutes    from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes    from "./routes/tasks.js";
import inviteRoutes  from "./routes/invites.js";

dotenv.config();

const app  = express();
const isProd = process.env.NODE_ENV === "production";

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || true,
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks",    taskRoutes);
app.use("/api/invites",  inviteRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) =>
  res.json({
    status:    "✅ Backend running",
    timestamp: new Date().toISOString(),
    env:       isProd ? "production" : "development",
  })
);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// ── Global error handler — catches any unhandled errors ───────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  res.status(err.status || 500).json({
    message: isProd ? "Internal server error" : err.message,
  });
});

// ── MongoDB + Server startup ───────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10_000,
  socketTimeoutMS:          45_000,
})
  .then(() => {
    console.log("✅ MongoDB Connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`✅ Server running on port ${PORT} [${isProd ? "production" : "development"}]`)
    );
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });
