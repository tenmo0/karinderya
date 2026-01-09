const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const SERVER_CONFIG = require("./server-config");

const app = express();
const PORT = SERVER_CONFIG.PORT;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// Logger middleware
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
  if (!fs.existsSync(file)) {
    console.log(`Creating missing file: ${file}`);
    fs.writeFileSync(file, "[]");
  }
});

// Safe JSON reader
const readJSON = (file) => {
  try {
    const content = fs.readFileSync(file, "utf-8");
    return JSON.parse(content || "[]");
  } catch (err) {
    console.error(`JSON READ ERROR (${file}):`, err.message);
    return [];
  }
};

// ===== API ROUTES (MUST BE BEFORE STATIC FILES) =====

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is alive" });
});

// Get all ulams
app.get("/ulams", (req, res) => {
  try {
    const ulams = readJSON(ULAMS_FILE);
    res.json(ulams);
  } catch (err) {
    console.error("Error getting ulams:", err);
    res.status(500).json({ message: "Error reading ulams" });
  }
});

// ===== SIGNUP ROUTE =====
app.post("/signup", (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    console.log("SIGNUP REQUEST:", { email, firstName, lastName });

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!email.endsWith("@cvsu.edu.ph")) {
      return res.status(400).json({ message: "Email must be a CVSU account" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const users = readJSON(USERS_FILE);

    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    console.log("USER REGISTERED:", email);
    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ===== LOGIN ROUTE =====
app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("LOGIN ATTEMPT:", email);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const users = readJSON(USERS_FILE);
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("LOGIN SUCCESS:", email);

    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      message: "Login successful", 
      user: userWithoutPassword 
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ===== ACCOUNT ROUTE =====
app.get("/account", (req, res) => {
  try {
    const { email } = req.query;
    console.log("ACCOUNT REQUEST:", email);

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const users = readJSON(USERS_FILE);
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error("ACCOUNT ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ===== RESERVE ROUTE =====
app.post("/reserve", (req, res) => {
  console.log("\n===================================");
  console.log("RESERVE REQUEST RECEIVED");
  console.log("===================================");
  
  try {
    const { stall, ulamId, withRice, userEmail } = req.body;
    
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // VALIDATE INPUT
    if (!stall && stall !== 0) {
      console.error("ERROR: Missing stall");
      return res.status(400).json({ message: "Missing stall number" });
    }
    
    if (!ulamId && ulamId !== 0) {
      console.error("ERROR: Missing ulamId");
      return res.status(400).json({ message: "Missing ulam ID" });
    }
    
    if (!userEmail) {
      console.error("ERROR: Missing userEmail");
      return res.status(400).json({ message: "Missing user email" });
    }

    // FIND USER
    const users = readJSON(USERS_FILE);
    const user = users.find((u) => u.email === userEmail);
    
    if (!user) {
      console.error("ERROR: User not found:", userEmail);
      return res.status(401).json({ message: "User not found" });
    }

    // FIND ULAM
    const ulams = readJSON(ULAMS_FILE);
    const ulam = ulams.find((u) => {
      return String(u.id) === String(ulamId) || Number(u.id) === Number(ulamId);
    });
    
    if (!ulam) {
      console.error("ERROR: Ulam not found:", ulamId);
      return res.status(404).json({ message: "Ulam not found" });
    }

    // VALIDATE ULAM DATA
    if (ulam.ulamOnlyPrice === undefined || ulam.withRicePrice === undefined) {
      console.error("ERROR: Ulam missing price fields");
      return res.status(500).json({ message: "Ulam configuration error" });
    }

    // CALCULATE PRICE
    const price = withRice ? ulam.withRicePrice : ulam.ulamOnlyPrice;

    // CREATE RESERVATION
    const reserves = readJSON(RESERVE_FILE);
    
    const reservation = {
      id: Date.now(),
      stall: Number(stall),
      ulamId: ulam.id,
      ulamName: ulam.name,
      price: price,
      withRice: withRice || false,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: userEmail,
      createdAt: new Date().toISOString(),
    };

    // SAVE TO FILE
    reserves.push(reservation);
    fs.writeFileSync(RESERVE_FILE, JSON.stringify(reserves, null, 2));

    console.log("SUCCESS: Reservation saved");
    console.log("===================================\n");
    
    return res.json({ reservation: reservation });
    
  } catch (err) {
    console.error("RESERVATION ERROR:", err.message);
    return res.status(500).json({ 
      message: "Internal server error",
      error: err.message 
    });
  }
});

// ===== HISTORY ROUTE =====
app.get("/history", (req, res) => {
  try {
    const { email } = req.query;
    console.log("HISTORY REQUEST:", email);

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    // Read all reservations
    const reserves = readJSON(RESERVE_FILE);

    // Filter reservations by user email and sort by date (newest first)
    const userReservations = reserves
      .filter((r) => r.userEmail === email)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`Found ${userReservations.length} reservations for ${email}`);
    res.json(userReservations);
  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ===== SERVE STATIC FILES (BEFORE 404 HANDLER!) =====
app.use(express.static(path.join(__dirname, "public")));

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({
    message: "Internal server error",
    error: err.message
  });
});

// ===== 404 HANDLER (MUST BE ABSOLUTE LAST) =====
app.use((req, res) => {
  console.log("404 - Not found:", req.method, req.url);
  res.status(404).json({
    message: "Route not found",
    path: req.url
  });
});

// ===== START SERVER =====
app.listen(PORT, SERVER_CONFIG.HOST, () => {
  console.log("\n================================");
  console.log("SERVER STARTED SUCCESSFULLY");
  console.log("================================");
  console.log(`Backend running on:`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  http://${SERVER_CONFIG.DISPLAY_IP}:${PORT}`);
  console.log("================================");
  console.log("Available routes:");
  console.log("  GET    /api/health");
  console.log("  GET    /ulams");
  console.log("  GET    /account");
  console.log("  GET    /history");
  console.log("  POST   /signup");
  console.log("  POST   /login");
  console.log("  POST   /reserve");
  console.log("  Static files from /public");
  console.log("================================\n");
});