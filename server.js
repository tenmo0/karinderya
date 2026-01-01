const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const fs = require("fs");

const app = express();
const PORT = 5000;
const USERS_FILE = "./users.json";

app.use(cors());
app.use(express.json());

// Quick test route
app.get("/", (req, res) => {
  res.send("🚀 Server is running");
});

// Read users from users.json
const getUsers = () => {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  } catch (err) {
    console.error("Error reading users.json:", err);
    return [];
  }
};

// Save users to users.json
const saveUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// SIGN-UP endpoint
app.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  if (!email.endsWith("@cvsu.edu.ph")) {
    return res.status(400).json({ message: "CVSU email only" });
  }

  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  saveUsers(users);

  res.json({
    message: "Signup successful",
    user: { firstName, lastName, email },
  });
});

// LOGIN endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const users = getUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ message: "Wrong password" });
  }

  res.json({
    message: "Login successful",
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  });
});

// NEW: GET account endpoint
app.get("/account", (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const users = getUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });
});

// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
