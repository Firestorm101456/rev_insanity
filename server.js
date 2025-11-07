// server.js
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const fs = require("fs");

// 🔁 Auto-reload setup
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

// Create livereload server to watch static files
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "public"));
liveReloadServer.watch(__dirname);

// Refresh browser when reload event is triggered
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

const app = express();
const PORT = 3000;

app.use(connectLivereload()); // injects reload script
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ serve both root and /public
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "public")));

const usersFile = path.join(__dirname, "users.json");

// --- Register ---
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
  if (users[username]) return res.status(400).send("User already exists");
  const hashed = await bcrypt.hash(password, 10);
  users[username] = hashed;
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  res.send("Registration successful!");
});

// --- Login ---
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
  if (!users[username]) return res.status(400).send("User not found");
  const valid = await bcrypt.compare(password, users[username]);
  if (!valid) return res.status(401).send("Incorrect password");
  res.send("Login successful!");
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);