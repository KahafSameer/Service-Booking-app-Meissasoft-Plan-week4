/**
 * MOCK SERVER - Testing mode (no database required)
 * Run: npm run test:server
 * Use this to test frontend + Postman/curl when MySQL is not connected.
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "test-secret";

// In-memory fake data
const fakeUsers = [
  { id: 1, name: "Test Admin", email: "admin@test.com", role: "admin" },
  { id: 2, name: "Test User", email: "user@test.com", role: "customer" },
];
const fakeServices = [
  { id: 1, title: "DevOps Setup", category: "DevOps", providerName: "Meissa", contactEmail: "dev@test.com", contactPhone: "123", currentBookings: 1, maxBookings: 5, available: true },
  { id: 2, title: "CI/CD Pipeline", category: "CI/CD Automation", providerName: "Meissa", contactEmail: "ci@test.com", contactPhone: "456", currentBookings: 0, maxBookings: 5, available: true },
];
const fakeBookings = [
  { id: 1, userId: 2, serviceId: 1, service: fakeServices[0], user: fakeUsers[1], createdAt: new Date().toISOString() },
];

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(400).json({ message: "Invalid token." });
  }
};

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

app.get("/", (req, res) => res.send("Mock Server (Testing Mode) - No DB required"));

// Auth
app.post("/api/auth/signup", (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ message: "Please enter Name, Email and Password fields" });
  const user = { id: fakeUsers.length + 1, name, email, role: role || "customer" };
  fakeUsers.push(user);
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Please enter all fields" });
  const user = fakeUsers.find((u) => u.email === email);
  if (!user) return res.status(400).json({ message: "Invalid Email" });
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Services (all require auth in real app)
app.get("/api/services", authMiddleware, (req, res) => res.json(fakeServices));
app.get("/api/services/:id", authMiddleware, (req, res) => {
  const s = fakeServices.find((x) => x.id === parseInt(req.params.id, 10));
  if (!s) return res.status(404).json({ message: "Service not found" });
  return res.json(s);
});
app.post("/api/services", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  const { category, title, providerName, contactEmail, contactPhone, maxBookings } = req.body || {};
  if (!category || !title || !providerName || !contactEmail || !contactPhone) return res.status(400).json({ message: "Please enter all required fields" });
  const id = fakeServices.length + 1;
  const service = { id, category, title, providerName, contactEmail, contactPhone, maxBookings: maxBookings || 5, currentBookings: 0, available: true };
  fakeServices.push(service);
  return res.json(service);
});
app.put("/api/services/:id", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  const id = parseInt(req.params.id, 10);
  const s = fakeServices.find((x) => x.id === id);
  if (!s) return res.status(404).json({ message: "Service not found" });
  Object.assign(s, req.body);
  return res.json(s);
});
app.delete("/api/services/:id", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  const id = parseInt(req.params.id, 10);
  const i = fakeServices.findIndex((x) => x.id === id);
  if (i === -1) return res.status(404).json({ message: "Service not found" });
  fakeServices.splice(i, 1);
  return res.json({ message: "Service deleted" });
});

// Bookings
app.get("/api/booking", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  return res.json(fakeBookings);
});
app.get("/api/booking/my", authMiddleware, (req, res) => {
  const list = fakeBookings.filter((b) => b.userId === req.user.id);
  return res.json(list);
});
app.post("/api/booking/:serviceId", authMiddleware, (req, res) => {
  const serviceId = parseInt(req.params.serviceId, 10);
  const service = fakeServices.find((s) => s.id === serviceId);
  if (!service) return res.status(404).json({ message: "Service not found" });
  if (service.currentBookings >= service.maxBookings) return res.status(400).json({ message: "Service is fully booked" });
  service.currentBookings += 1;
  const user = fakeUsers.find((u) => u.id === req.user.id);
  const booking = { id: fakeBookings.length + 1, userId: req.user.id, serviceId, service, user, createdAt: new Date().toISOString() };
  fakeBookings.push(booking);
  return res.status(201).json({ message: "Booking created successfully", booking });
});
app.delete("/api/booking/:bookingId", authMiddleware, (req, res) => {
  const bookingId = parseInt(req.params.bookingId, 10);
  const b = fakeBookings.find((x) => x.id === bookingId);
  if (!b) return res.status(404).json({ message: "Booking not found" });
  if (req.user.role !== "admin" && b.userId !== req.user.id) return res.status(403).json({ message: "Forbidden" });
  const svc = fakeServices.find((s) => s.id === b.serviceId);
  if (svc) svc.currentBookings = Math.max(0, svc.currentBookings - 1);
  fakeBookings.splice(fakeBookings.indexOf(b), 1);
  return res.json({ message: "Booking cancelled" });
});

// Dashboard
app.get("/api/dashboard/data", authMiddleware, (req, res) => res.json({ message: `welcome user ${req.user.id}` }));

app.listen(PORT, () => {
  console.log(`[MOCK] Server running on port ${PORT} (no database)`);
  console.log("Use this for testing when MySQL is not available.");
});
