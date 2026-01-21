const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const SERVER_CONFIG = require("./server-config");

const app = express();
const PORT = SERVER_CONFIG.PORT;

// ===== IOT TRACKING VARIABLES =====
let connectedDevices = new Set();
let requestCount = 0;
let systemStartTime = Date.now();
let recentActivity = [];

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// Device tracker - MUST BE FIRST
app.use((req, res, next) => {
  requestCount++;
  const deviceIP = req.ip || req.connection.remoteAddress || 'unknown';
  connectedDevices.add(deviceIP);
  
  // Log for debugging
  console.log(`[IOT] Device ${deviceIP} connected | Total devices: ${connectedDevices.size}`);
  
  recentActivity.unshift({
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    device: deviceIP
  });
  
  if (recentActivity.length > 20) {
    recentActivity = recentActivity.slice(0, 20);
  }
  
  next();
});

// Logger middleware
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} | ${req.method} ${req.url}`);
  next();
});

// ===== FILE PATHS =====
const USERS_FILE = "./users.json";
const ULAMS_FILE = "./ulams.json";
const RESERVE_FILE = "./reserve.json";

[USERS_FILE, ULAMS_FILE, RESERVE_FILE].forEach((file) => {
  if (!fs.existsSync(file)) {
    console.log(`Creating missing file: ${file}`);
    fs.writeFileSync(file, "[]");
  }
});

// Safe JSON reader - MUST BE BEFORE createAdminUser
const readJSON = (file) => {
  try {
    const content = fs.readFileSync(file, "utf-8");
    return JSON.parse(content || "[]");
  } catch (err) {
    console.error(`JSON READ ERROR (${file}):`, err.message);
    return [];
  }
};

// Create admin user on startup
const createAdminUser = () => {
  const users = readJSON(USERS_FILE);
  const adminExists = users.find(u => u.email === "admin@cvsu.edu.ph");
  
  if (!adminExists) {
    const adminUser = {
      id: Date.now(),
      firstName: "Admin",
      lastName: "User",
      email: "admin@cvsu.edu.ph",
      password: "admin123",
      createdAt: new Date().toISOString()
    };
    
    users.push(adminUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log("✅ Admin user created: admin@cvsu.edu.ph / admin123");
  } else {
    console.log("✅ Admin user already exists");
  }
};

createAdminUser();

// Helper function to format uptime
const formatUptime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

// ===== API ROUTES =====

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is alive" });
});

// IoT System Status - ENHANCED WITH DEBUG
app.get("/api/system-status", (req, res) => {
  const uptime = Date.now() - systemStartTime;
  const reserves = readJSON(RESERVE_FILE);
  const users = readJSON(USERS_FILE);
  
  console.log(`[DEBUG] Connected Devices: ${connectedDevices.size}, Total Orders: ${reserves.length}`);
  
  const stallStats = reserves.reduce((acc, order) => {
    acc[order.stall] = (acc[order.stall] || 0) + 1;
    return acc;
  }, {});
  
  res.json({
    status: "online",
    uptime: uptime,
    uptimeFormatted: formatUptime(uptime),
    connectedDevices: connectedDevices.size,
    totalRequests: requestCount,
    totalOrders: reserves.length,
    totalUsers: users.length,
    ordersByStall: stallStats,
    recentActivity: recentActivity.slice(0, 10),
    timestamp: new Date().toISOString()
  });
});

// Real-time Queue Status - ENHANCED
app.get("/api/queue-status", (req, res) => {
  const reserves = readJSON(RESERVE_FILE);
  
  // Get orders from last 30 minutes
  const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
  const recentOrders = reserves.filter(order => {
    return new Date(order.createdAt).getTime() > thirtyMinutesAgo;
  });
  
  console.log(`[DEBUG] Active Orders (last 30 min): ${recentOrders.length}`);
  
  const queueByStall = recentOrders.reduce((acc, order) => {
    if (!acc[order.stall]) {
      acc[order.stall] = [];
    }
    acc[order.stall].push({
      orderId: order.id,
      ulam: order.ulamName,
      customer: order.userName,
      time: order.createdAt,
      status: "Pending" // You can add status field to orders later
    });
    return acc;
  }, {});
  
  res.json({
    totalPending: recentOrders.length,
    queueByStall: queueByStall,
    recentOrders: recentOrders.slice(0, 5).map(order => ({
      orderId: order.id,
      stall: order.stall,
      ulam: order.ulamName,
      customer: order.userName,
      price: order.price,
      withRice: order.withRice,
      time: order.createdAt,
      status: "Pending"
    })),
    averageWaitTime: "5 minutes",
    timestamp: new Date().toISOString()
  });
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

// SIGNUP ROUTE
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

// LOGIN ROUTE
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

// ACCOUNT ROUTE
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

// RESERVE ROUTE
app.post("/reserve", (req, res) => {
  console.log("\n===================================");
  console.log("RESERVE REQUEST RECEIVED");
  console.log("===================================");
  
  try {
    const { stall, ulamId, withRice, userEmail } = req.body;
    
    console.log("Request body:", JSON.stringify(req.body, null, 2));

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

    const users = readJSON(USERS_FILE);
    const user = users.find((u) => u.email === userEmail);
    
    if (!user) {
      console.error("ERROR: User not found:", userEmail);
      return res.status(401).json({ message: "User not found" });
    }

    const ulams = readJSON(ULAMS_FILE);
    const ulam = ulams.find((u) => {
      return String(u.id) === String(ulamId) || Number(u.id) === Number(ulamId);
    });
    
    if (!ulam) {
      console.error("ERROR: Ulam not found:", ulamId);
      return res.status(404).json({ message: "Ulam not found" });
    }

    if (ulam.ulamOnlyPrice === undefined || ulam.withRicePrice === undefined) {
      console.error("ERROR: Ulam missing price fields");
      return res.status(500).json({ message: "Ulam configuration error" });
    }

    const price = withRice ? ulam.withRicePrice : ulam.ulamOnlyPrice;

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

// HISTORY ROUTE
app.get("/history", (req, res) => {
  try {
    const { email } = req.query;
    console.log("HISTORY REQUEST:", email);

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const reserves = readJSON(RESERVE_FILE);

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

// SERVE STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({
    message: "Internal server error",
    error: err.message
  });
});

// 404 HANDLER
app.use((req, res) => {
  console.log("404 - Not found:", req.method, req.url);
  res.status(404).json({
    message: "Route not found",
    path: req.url
  });
});

// START SERVER
app.listen(PORT, SERVER_CONFIG.HOST, () => {
  console.log("\n================================");
  console.log("IOT SERVER STARTED");
  console.log("================================");
  console.log(`Backend running on:`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  http://${SERVER_CONFIG.DISPLAY_IP}:${PORT}`);
  console.log("================================");
  console.log("IoT Features Active:");
  console.log("  - Device tracking");
  console.log("  - Real-time monitoring");
  console.log("  - Live order queue");
  console.log("================================");
  console.log("Admin Login:");
  console.log("  Email: admin@cvsu.edu.ph");
  console.log("  Pass:  admin123");
  console.log("================================\n");
});