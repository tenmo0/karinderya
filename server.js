const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// Serve images
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Logger
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} | ${req.method} ${req.url}`);
  next();
});

// ===== FILE PATHS =====
const USERS_FILE = "./users.json";
const ULAMS_FILE = "./ulams.json";
const RESERVE_FILE = "./reserve.json";

// Create files if missing
[USERS_FILE, ULAMS_FILE, RESERVE_FILE].forEach((file) => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
});

// Safe JSON reader
const readJSON = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8") || "[]");
  } catch (err) {
    console.error(`JSON READ ERROR (${file})`, err);
    return [];
  }
};

// ===== ROUTES =====

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Server is alive" });
});

// Get ulams
app.get("/ulams", (req, res) => {
  res.json(readJSON(ULAMS_FILE));
});

// ===== RESERVE ROUTE =====
app.post("/reserve", (req, res) => {
  try {
    const { stall, ulamId, withRice, userEmail } = req.body;
    console.log("📥 RESERVE DATA:", req.body);

    if (!stall || !ulamId || !userEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const users = readJSON(USERS_FILE);
    const user = users.find((u) => u.email === userEmail);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const ulams = readJSON(ULAMS_FILE);
    const ulam = ulams.find((u) => u.id.toString() === ulamId.toString());
    if (!ulam) {
      return res.status(404).json({ message: "Ulam not found" });
    }

    const price = withRice ? ulam.withRicePrice : ulam.ulamOnlyPrice;

    const reserves = readJSON(RESERVE_FILE);
    const reservation = {
      id: Date.now(),
      stall: Number(stall),
      ulamId: ulam.id,
      ulamName: ulam.name,
      price,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail,
      createdAt: new Date().toISOString(),
    };

    reserves.push(reservation);
    fs.writeFileSync(RESERVE_FILE, JSON.stringify(reserves, null, 2));

    console.log("✅ RESERVATION SAVED");
    res.json({ reservation });
  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ===== JSON 404 (NO HTML EVER) =====
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.url,
  });
});

// ===== START SERVER =====
app.listen(PORT, "0.0.0.0", () => {
  console.log("================================");
  console.log(`Backend running on:`);
  console.log(`http://localhost:${PORT}`);
  console.log(`http://192.168.18.3:${PORT}`);
  console.log("================================");
});
