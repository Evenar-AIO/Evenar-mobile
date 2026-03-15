require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");

const { connectDB } = require("./config/db");
const { initSocket } = require("./config/socket");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const feedbackRoutes = require("./routes/feedback");
const supportRoutes = require("./routes/support");
const notificationRoutes = require("./routes/notification");

const app = express();
const httpServer = http.createServer(app);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/support", supportRoutes);
app.use("/notifications", notificationRoutes);

app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date() }),
);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(413)
      .json({ success: false, message: "File too large. Max 20MB." });
  }
  res
    .status(500)
    .json({ success: false, message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();
  initSocket(httpServer);
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
