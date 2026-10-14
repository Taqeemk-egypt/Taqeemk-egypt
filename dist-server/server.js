// server.ts
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var PORT = Number(process.env.PORT) || 3e3;
var DB_FILE = path.join(__dirname, "data", "db.json");
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
}
var defaultSettings = {
  lifetimeFeeEGP: 100,
  walletNumber: "01515926729",
  walletHolderName: "Taqeemk Payments (Official Mobile Wallet)",
  acceptedWallets: [
    "Vodafone Cash",
    "InstaPay Egypt",
    "Orange Cash",
    "Etisalat Cash",
    "WE Pay"
  ],
  sandboxAutoVerify: false,
  maintenanceMode: false,
  announcement: "Welcome to Taqeemk! Transfer 100 EGP to 01515926729 for instant lifetime access."
};
function initDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      if (!data.settings) data.settings = defaultSettings;
      ensureSuperAdmin(data);
      return data;
    } catch (e) {
      console.error("Failed reading db.json, re-initializing", e);
    }
  }
  const db2 = {
    users: [],
    passwords: {},
    profiles: {},
    qrLogs: [],
    auditLogs: [],
    settings: defaultSettings,
    tokens: {}
  };
  ensureSuperAdmin(db2);
  seedDemoUsers(db2);
  saveDatabase(db2);
  return db2;
}
function ensureSuperAdmin(db2) {
  const adminEmail = "elemamyoussef34@gmail.com";
  const existingAdmin = db2.users.find((u) => u.email.toLowerCase() === adminEmail.toLowerCase());
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync("KkK#6060", salt);
  if (!existingAdmin) {
    const adminId = "user_superadmin_01";
    const adminUser = {
      id: adminId,
      email: adminEmail,
      username: "youssef",
      role: "super_admin",
      paymentStatus: "lifetime_unlimited",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db2.users.push(adminUser);
    db2.passwords[adminId] = hashedPassword;
    db2.profiles[adminId] = {
      id: "prof_" + adminId,
      userId: adminId,
      username: "youssef",
      displayName: "Youssef El-Emam",
      bio: "Founder & Full-Stack Security Engineer @ Taqeemk | Building scalable web platforms & digital experiences",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      themeId: "cyber_emerald",
      customAccentColor: "#10b981",
      views: 1420,
      verified: true,
      dynamicQrDestination: "",
      dynamicQrScans: 89,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      socials: [
        { platform: "whatsapp", url: "https://wa.me/201515926729", label: "WhatsApp" },
        { platform: "github", url: "https://github.com", label: "GitHub" },
        { platform: "linkedin", url: "https://linkedin.com", label: "LinkedIn" },
        { platform: "x", url: "https://x.com", label: "X (Twitter)" },
        { platform: "email", url: "mailto:elemamyoussef34@gmail.com", label: "Email" }
      ],
      lists: [
        {
          id: "list_featured",
          title: "\u{1F31F} Featured Highlights",
          description: "Top priority links, latest releases & portfolio work",
          order: 1,
          links: [
            {
              id: "lnk_1",
              title: "\u{1F680} Taqeemk SaaS Platform",
              url: "https://taqeemk.app",
              subtitle: "Next-Gen Bio Link & Portfolio Engine",
              isActive: true,
              clicks: 452,
              highlight: "glow",
              type: "portfolio",
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            },
            {
              id: "lnk_2",
              title: "\u{1F4AC} Direct WhatsApp Consultation",
              url: "https://wa.me/201515926729",
              subtitle: "Chat directly for custom dev projects",
              isActive: true,
              clicks: 310,
              highlight: "pulse",
              type: "whatsapp",
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          ]
        },
        {
          id: "list_portfolio",
          title: "\u{1F4BC} Engineering Projects",
          description: "Client showcases, case studies & open source repositories",
          order: 2,
          links: [
            {
              id: "lnk_3",
              title: "\u{1F6E1}\uFE0F CyberGuard AI Security Suite",
              url: "https://github.com",
              subtitle: "Automated vulnerability scanner for Node & Cloud APIs",
              isActive: true,
              clicks: 184,
              type: "portfolio",
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            },
            {
              id: "lnk_4",
              title: "\u26A1 High-Performance Microservices",
              url: "https://github.com",
              subtitle: "Go & Express REST API architecture guide",
              isActive: true,
              clicks: 97,
              type: "link",
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          ]
        }
      ]
    };
  } else {
    existingAdmin.role = "super_admin";
    existingAdmin.paymentStatus = "lifetime_unlimited";
    db2.passwords[existingAdmin.id] = hashedPassword;
    const adminProf = db2.profiles[existingAdmin.id];
    if (adminProf) {
      if (!adminProf.links || adminProf.links.length === 0) {
        adminProf.links = adminProf.lists?.flatMap((l) => l.links || []) || [];
      }
    }
  }
}
function seedDemoUsers(db2) {
  const demoUserId = "user_demo_sarah";
  if (!db2.users.find((u) => u.id === demoUserId)) {
    const salt = bcrypt.genSaltSync(10);
    const demoUser = {
      id: demoUserId,
      email: "sarah.designer@example.com",
      username: "sarah_designs",
      role: "user",
      paymentStatus: "pending",
      paymentReference: "VOD-88492019",
      paymentPhone: "01099887766",
      paymentSubmittedAt: new Date(Date.now() - 36e5 * 2).toISOString(),
      paymentAmount: 100,
      createdAt: new Date(Date.now() - 864e5 * 3).toISOString()
    };
    db2.users.push(demoUser);
    db2.passwords[demoUserId] = bcrypt.hashSync("demo1234", salt);
    db2.profiles[demoUserId] = {
      id: "prof_" + demoUserId,
      userId: demoUserId,
      username: "sarah_designs",
      displayName: "Sarah Mansour",
      bio: "Senior UI/UX Designer & Brand Strategist | Crafting award-winning digital experiences",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      themeId: "sunset_gradient",
      views: 380,
      verified: true,
      dynamicQrScans: 42,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      socials: [
        { platform: "instagram", url: "https://instagram.com", label: "Instagram" },
        { platform: "linkedin", url: "https://linkedin.com", label: "LinkedIn" },
        { platform: "whatsapp", url: "https://wa.me/201515926729", label: "WhatsApp" }
      ],
      lists: [
        {
          id: "list_sarah_1",
          title: "\u{1F3A8} Design Portfolios & Case Studies",
          order: 1,
          links: [
            {
              id: "lnk_s1",
              title: "Behance Masterpieces",
              url: "https://behance.net",
              subtitle: "Mobile UI concepts & SaaS Design Systems",
              isActive: true,
              clicks: 120,
              highlight: "glow",
              type: "portfolio",
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            },
            {
              id: "lnk_s2",
              title: "Figma Community Files",
              url: "https://figma.com",
              subtitle: "Free UI kits & icons for web designers",
              isActive: true,
              clicks: 85,
              type: "link",
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          ]
        }
      ]
    };
  }
}
var db = initDatabase();
function saveDatabase(dataToSave = db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving db.json:", err);
  }
}
var rateLimitStore = /* @__PURE__ */ new Map();
function rateLimiter(maxRequests = 60, windowMs = 6e4) {
  return (req, res, next) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown-ip";
    const key = `${ip}_${req.path}`;
    const now = Date.now();
    const record = rateLimitStore.get(String(key));
    if (!record || now > record.resetAt) {
      rateLimitStore.set(String(key), { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (record.count >= maxRequests) {
      const waitSeconds = Math.ceil((record.resetAt - now) / 1e3);
      return res.status(429).json({
        error: `Too many requests from this IP. Please try again in ${waitSeconds} seconds.`
      });
    }
    record.count++;
    next();
  };
}
function createToken(userId, role) {
  const token = "tqk_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
  db.tokens[token] = {
    userId,
    role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1e3
  };
  saveDatabase();
  return token;
}
function verifyToken(token) {
  if (!token) return null;
  const cleanToken = token.replace("Bearer ", "").trim();
  const session = db.tokens[cleanToken];
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    delete db.tokens[cleanToken];
    saveDatabase();
    return null;
  }
  return session;
}
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const session = verifyToken(authHeader);
  if (!session) {
    return res.status(401).json({ error: "Session expired or invalid token" });
  }
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ error: "User account not found" });
  }
  if (user.isBanned) {
    return res.status(403).json({ error: "This account has been suspended by an administrator." });
  }
  req.user = user;
  next();
}
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    const user = req.user;
    if (user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
}
function logAudit(action, actorEmail, details, target, ip = "127.0.0.1") {
  const log = {
    id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    action,
    actorEmail,
    details,
    target,
    ip,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDatabase();
}
function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str.trim();
}
function isValidUsername(username) {
  return /^[a-zA-Z0-9_-]{3,30}$/.test(username);
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
var app = express();
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", rateLimiter(25, 6e4));
app.post("/api/auth/register", (req, res) => {
  try {
    const email = sanitizeString(req.body.email).toLowerCase();
    const password = sanitizeString(req.body.password);
    const username = sanitizeString(req.body.username).toLowerCase();
    const displayName = sanitizeString(req.body.displayName) || username;
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    if (!isValidUsername(username)) {
      return res.status(400).json({
        error: "Username must be 3-30 characters and contain only letters, numbers, underscores, or dashes."
      });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    if (db.users.some((u) => u.username.toLowerCase() === username)) {
      return res.status(409).json({ error: "This username is already taken. Please choose another." });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const isMasterAdmin = email === "elemamyoussef34@gmail.com";
    const userId = "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const newUser = {
      id: userId,
      email,
      username,
      role: isMasterAdmin ? "super_admin" : "user",
      paymentStatus: isMasterAdmin ? "lifetime_unlimited" : "not_paid",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.users.push(newUser);
    db.passwords[userId] = hashedPassword;
    const newProfile = {
      id: "prof_" + userId,
      userId,
      username,
      displayName,
      bio: "Welcome to my Taqeemk profile! Click on my links below to explore my work and connect.",
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      themeId: "dark_onyx",
      customAccentColor: "#10b981",
      views: 0,
      verified: isMasterAdmin,
      dynamicQrScans: 0,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      socials: [
        { platform: "whatsapp", url: "https://wa.me/201515926729", label: "WhatsApp" },
        { platform: "x", url: "https://x.com", label: "Twitter" },
        { platform: "instagram", url: "https://instagram.com", label: "Instagram" }
      ],
      lists: [
        {
          id: "list_" + Date.now() + "_1",
          title: "\u{1F525} Quick Links",
          order: 1,
          links: [
            {
              id: "lnk_" + Date.now() + "_1",
              title: "\u{1F4AC} Message Me on WhatsApp",
              url: "https://wa.me/201515926729",
              subtitle: "Direct mobile wallet & contact",
              isActive: true,
              clicks: 0,
              highlight: "glow",
              type: "whatsapp",
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            },
            {
              id: "lnk_" + Date.now() + "_2",
              title: "\u{1F310} Visit My Website",
              url: "https://google.com",
              subtitle: "Read more about my portfolio",
              isActive: true,
              clicks: 0,
              type: "link",
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          ]
        }
      ]
    };
    db.profiles[userId] = newProfile;
    saveDatabase();
    logAudit("USER_REGISTERED", email, `New registration with handle @${username}`);
    const token = createToken(userId, newUser.role);
    res.status(201).json({
      token,
      user: newUser,
      profile: newProfile,
      message: "Account created successfully!"
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});
app.post("/api/auth/login", (req, res) => {
  try {
    const email = sanitizeString(req.body.email).toLowerCase();
    const password = sanitizeString(req.body.password);
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const user = db.users.find((u) => u.email.toLowerCase() === email || u.username.toLowerCase() === email);
    if (!user) {
      logAudit("LOGIN_FAILED", email, "User not found");
      return res.status(401).json({ error: "Invalid email or password." });
    }
    if (user.isBanned) {
      return res.status(403).json({ error: "This account has been suspended by an administrator." });
    }
    const hashedPassword = db.passwords[user.id];
    const passwordMatches = bcrypt.compareSync(password, hashedPassword);
    if (!passwordMatches) {
      logAudit("LOGIN_FAILED", user.email, "Incorrect password attempt");
      return res.status(401).json({ error: "Invalid email or password." });
    }
    if (user.email.toLowerCase() === "elemamyoussef34@gmail.com") {
      user.role = "super_admin";
      user.paymentStatus = "lifetime_unlimited";
      saveDatabase();
    }
    const profile = db.profiles[user.id] || null;
    if (profile && (!profile.links || profile.links.length === 0) && profile.lists) {
      profile.links = profile.lists.flatMap((l) => l.links || []);
      saveDatabase();
    }
    const token = createToken(user.id, user.role);
    logAudit("LOGIN_SUCCESS", user.email, `Logged in with role ${user.role}`);
    res.json({
      token,
      user,
      profile,
      message: "Logged in successfully!"
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});
app.get("/api/auth/me", requireAuth, (req, res) => {
  const user = req.user;
  const profile = db.profiles[user.id] || null;
  res.json({ user, profile });
});
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "").trim();
    delete db.tokens[token];
    saveDatabase();
  }
  res.json({ success: true, message: "Logged out successfully" });
});
app.get("/api/payment/info", (req, res) => {
  res.json({
    amountEGP: db.settings.lifetimeFeeEGP,
    walletNumber: db.settings.walletNumber,
    walletHolderName: db.settings.walletHolderName,
    acceptedWallets: db.settings.acceptedWallets,
    instructions: [
      `1. Open your mobile wallet app (Vodafone Cash, InstaPay, Orange Cash, Etisalat Cash, or WE Pay).`,
      `2. Transfer ${db.settings.lifetimeFeeEGP} EGP to mobile cash number: ${db.settings.walletNumber}.`,
      `3. Note down the Transaction Reference ID and your Sender Phone Number.`,
      `4. Enter your details in the form below and click 'Submit for Instant Lifetime Access'.`,
      `5. Once submitted, our team or automatic sandbox verification will immediately unlock your lifetime access.`
    ],
    sandboxAutoVerify: db.settings.sandboxAutoVerify
  });
});
app.post("/api/payment/submit", requireAuth, (req, res) => {
  try {
    const user = req.user;
    const referenceId = sanitizeString(req.body.referenceId);
    const phone = sanitizeString(req.body.phone);
    const notes = sanitizeString(req.body.notes);
    if (!referenceId || !phone) {
      return res.status(400).json({ error: "Transaction Reference ID and Sender Phone number are required." });
    }
    if (user.role === "super_admin") {
      return res.json({ message: "Super admin already enjoys lifetime unlimited access.", status: "lifetime_unlimited" });
    }
    user.paymentReference = referenceId;
    user.paymentPhone = phone;
    user.paymentSubmittedAt = (/* @__PURE__ */ new Date()).toISOString();
    user.paymentAmount = db.settings.lifetimeFeeEGP;
    if (db.settings.sandboxAutoVerify) {
      user.paymentStatus = "approved";
      user.paymentApprovedAt = (/* @__PURE__ */ new Date()).toISOString();
      logAudit("PAYMENT_AUTO_VERIFIED", user.email, `Ref: ${referenceId}, Phone: ${phone}, EGP ${db.settings.lifetimeFeeEGP}`);
    } else {
      user.paymentStatus = "pending";
      logAudit("PAYMENT_SUBMITTED", user.email, `Ref: ${referenceId}, Phone: ${phone}, EGP ${db.settings.lifetimeFeeEGP}`);
    }
    saveDatabase();
    res.json({
      success: true,
      user,
      status: user.paymentStatus,
      message: user.paymentStatus === "approved" ? "Payment verified! Lifetime access unlocked." : "Payment proof submitted successfully! Verification pending approval by administrator."
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to process payment submission" });
  }
});
app.post("/api/payment/sandbox-instant-verify", requireAuth, (req, res) => {
  const user = req.user;
  user.paymentStatus = "approved";
  user.paymentApprovedAt = (/* @__PURE__ */ new Date()).toISOString();
  user.paymentAmount = db.settings.lifetimeFeeEGP;
  if (!user.paymentReference) user.paymentReference = "SANDBOX-" + Math.random().toString(36).substring(2, 9).toUpperCase();
  if (!user.paymentPhone) user.paymentPhone = "01515926729";
  saveDatabase();
  logAudit("SANDBOX_PAYMENT_VERIFIED", user.email, `Instant demo verification granted`);
  res.json({
    success: true,
    user,
    message: "Instant Lifetime Access unlocked via Sandbox Simulator!"
  });
});
app.get("/api/profile/me", requireAuth, (req, res) => {
  const user = req.user;
  let profile = db.profiles[user.id];
  if (!profile) {
    profile = {
      id: "prof_" + user.id,
      userId: user.id,
      username: user.username,
      displayName: user.username,
      bio: "Welcome to my Taqeemk profile!",
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`,
      themeId: "dark_onyx",
      views: 0,
      verified: user.role === "super_admin",
      dynamicQrScans: 0,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      socials: [],
      lists: []
    };
    db.profiles[user.id] = profile;
    saveDatabase();
  }
  res.json({ profile });
});
app.put("/api/profile/update", requireAuth, (req, res) => {
  try {
    const user = req.user;
    let profile = db.profiles[user.id];
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    const { displayName, bio, avatarUrl, coverUrl, coverType, coverValue, themeId, customAccentColor, socials } = req.body;
    if (displayName !== void 0) profile.displayName = sanitizeString(displayName);
    if (bio !== void 0) profile.bio = sanitizeString(bio);
    if (avatarUrl !== void 0) profile.avatarUrl = sanitizeString(avatarUrl);
    if (coverUrl !== void 0) profile.coverUrl = sanitizeString(coverUrl);
    if (coverType !== void 0) profile.coverType = coverType;
    if (coverValue !== void 0) profile.coverValue = sanitizeString(coverValue);
    if (themeId !== void 0) profile.themeId = sanitizeString(themeId);
    if (customAccentColor !== void 0) profile.customAccentColor = sanitizeString(customAccentColor);
    if (Array.isArray(socials)) profile.socials = socials;
    profile.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    saveDatabase();
    res.json({ success: true, profile, message: "Profile updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});
app.put("/api/profile/links", requireAuth, (req, res) => {
  try {
    const user = req.user;
    const profile = db.profiles[user.id];
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    const { links } = req.body;
    if (!Array.isArray(links)) {
      return res.status(400).json({ error: "Links must be an array" });
    }
    profile.links = links.map((link, linkIdx) => ({
      id: link.id || `lnk_${Date.now()}_${linkIdx}`,
      title: sanitizeString(link.title) || "Link",
      url: sanitizeString(link.url) || "#",
      subtitle: sanitizeString(link.subtitle),
      icon: link.icon,
      platform: link.platform || "custom",
      thumbnailUrl: link.thumbnailUrl,
      isActive: link.isActive !== false,
      clicks: Number(link.clicks) || 0,
      highlight: link.highlight || "none",
      type: link.type || "link",
      createdAt: link.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    }));
    profile.lists = [{
      id: "default_unified_list",
      title: "\u0631\u0648\u0627\u0628\u0637\u064A",
      order: 1,
      links: profile.links
    }];
    profile.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    saveDatabase();
    res.json({ success: true, links: profile.links, message: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0628\u0646\u062C\u0627\u062D!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update links" });
  }
});
app.put("/api/profile/lists", requireAuth, (req, res) => {
  try {
    const user = req.user;
    const profile = db.profiles[user.id];
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    const { lists } = req.body;
    if (!Array.isArray(lists)) {
      return res.status(400).json({ error: "Lists must be an array" });
    }
    profile.lists = lists.map((list, listIdx) => ({
      id: list.id || `list_${Date.now()}_${listIdx}`,
      title: sanitizeString(list.title) || "Links List",
      description: sanitizeString(list.description),
      icon: list.icon,
      isCollapsed: Boolean(list.isCollapsed),
      order: listIdx + 1,
      links: Array.isArray(list.links) ? list.links.map((link, linkIdx) => ({
        id: link.id || `lnk_${Date.now()}_${linkIdx}`,
        title: sanitizeString(link.title) || "Link",
        url: sanitizeString(link.url) || "#",
        subtitle: sanitizeString(link.subtitle),
        icon: link.icon,
        platform: link.platform || "custom",
        thumbnailUrl: link.thumbnailUrl,
        isActive: link.isActive !== false,
        clicks: Number(link.clicks) || 0,
        highlight: link.highlight || "none",
        type: link.type || "link",
        createdAt: link.createdAt || (/* @__PURE__ */ new Date()).toISOString()
      })) : []
    }));
    profile.links = profile.lists.flatMap((l) => l.links);
    profile.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    saveDatabase();
    res.json({ success: true, lists: profile.lists, links: profile.links, message: "Links and lists saved!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update lists" });
  }
});
app.post("/api/profile/links/track-click", (req, res) => {
  try {
    const { username, linkId } = req.body;
    if (!username || !linkId) {
      return res.status(400).json({ error: "Missing username or linkId" });
    }
    const user = db.users.find((u) => u.username.toLowerCase() === String(username).toLowerCase());
    if (!user) return res.status(404).json({ error: "User not found" });
    const profile = db.profiles[user.id];
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    let found = false;
    if (profile.links) {
      const link = profile.links.find((l) => l.id === linkId);
      if (link) {
        link.clicks = (link.clicks || 0) + 1;
        found = true;
      }
    }
    if (profile.lists) {
      for (const list of profile.lists) {
        const link = list.links.find((l) => l.id === linkId);
        if (link) {
          link.clicks = (link.clicks || 0) + 1;
          found = true;
          break;
        }
      }
    }
    if (found) {
      saveDatabase();
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Click tracking failed" });
  }
});
app.get("/api/u/:username", (req, res) => {
  try {
    const username = sanitizeString(req.params.username).toLowerCase();
    const user = db.users.find((u) => u.username.toLowerCase() === username);
    if (!user || user.isBanned) {
      return res.status(404).json({ error: "Profile not found or suspended." });
    }
    const profile = db.profiles[user.id];
    if (!profile) {
      return res.status(404).json({ error: "Profile has not been set up yet." });
    }
    profile.views = (profile.views || 0) + 1;
    saveDatabase();
    const sanitizedLists = (profile.lists || []).map((list) => ({
      ...list,
      links: (list.links || []).filter((l) => l.isActive)
    }));
    const sanitizedLinks = Array.isArray(profile.links) && profile.links.length > 0 ? profile.links.filter((l) => l.isActive) : sanitizedLists.flatMap((l) => l.links);
    res.json({
      profile: {
        ...profile,
        links: sanitizedLinks,
        lists: sanitizedLists
      },
      user: {
        username: user.username,
        role: user.role,
        verified: profile.verified || user.role === "super_admin"
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch profile" });
  }
});
app.get("/api/qr/list", requireAuth, (req, res) => {
  const user = req.user;
  const profile = db.profiles[user.id];
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  if (!profile.qrCodes || profile.qrCodes.length === 0) {
    profile.qrCodes = [
      {
        id: "qr_" + Date.now() + "_1",
        title: "\u0628\u0627\u0631\u0643\u0648\u062F \u0627\u0644\u0628\u0631\u0648\u0641\u0627\u064A\u0644 \u0627\u0644\u0631\u0626\u064A\u0633\u064A (Smart Bio Profile)",
        type: "dynamic",
        content: `/u/${user.username}`,
        scans: profile.dynamicQrScans || 42,
        lastModified: (/* @__PURE__ */ new Date()).toISOString(),
        fgColor: "#0f172a",
        bgColor: "#ffffff"
      },
      {
        id: "qr_" + Date.now() + "_2",
        title: "\u0628\u0627\u0631\u0643\u0648\u062F \u062A\u0642\u064A\u064A\u0645 \u062C\u0648\u062C\u0644 \u0644\u0644\u0641\u0631\u0639 (Google Reviews)",
        type: "dynamic",
        content: "https://g.page/r/",
        scans: 89,
        lastModified: new Date(Date.now() - 864e5 * 2).toISOString(),
        fgColor: "#4285F4",
        bgColor: "#ffffff"
      },
      {
        id: "qr_" + Date.now() + "_3",
        title: "\u0643\u0648\u062F \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0627\u0644\u0641\u0648\u0631\u064A\u0629 \u0644\u0644\u0648\u0627\u062A\u0633\u0627\u0628",
        type: "static",
        content: "https://wa.me/201515926729",
        scans: 19,
        lastModified: new Date(Date.now() - 864e5 * 5).toISOString(),
        fgColor: "#25D366",
        bgColor: "#ffffff"
      }
    ];
    saveDatabase();
  }
  res.json({ qrCodes: profile.qrCodes });
});
app.post("/api/qr/create", requireAuth, (req, res) => {
  try {
    const user = req.user;
    const profile = db.profiles[user.id];
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    const title = sanitizeString(req.body.title) || "\u0643\u0648\u062F QR \u062C\u062F\u064A\u062F";
    const type = req.body.type === "static" ? "static" : "dynamic";
    const content = sanitizeString(req.body.content) || `/u/${user.username}`;
    const fgColor = sanitizeString(req.body.fgColor) || "#0f172a";
    const bgColor = sanitizeString(req.body.bgColor) || "#ffffff";
    if (!profile.qrCodes) profile.qrCodes = [];
    const newQr = {
      id: "qr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      title,
      type,
      content,
      scans: 0,
      lastModified: (/* @__PURE__ */ new Date()).toISOString(),
      fgColor,
      bgColor
    };
    profile.qrCodes.unshift(newQr);
    profile.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    saveDatabase();
    logAudit("QR_CODE_CREATED", user.email, `Created QR: ${title} (${type})`);
    res.status(201).json({ success: true, qrCode: newQr, message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0643\u0648\u062F \u0627\u0644\u0640 QR \u0628\u0646\u062C\u0627\u062D!" });
  } catch (e) {
    res.status(500).json({ error: "Failed to create QR code" });
  }
});
app.put("/api/qr/:id", requireAuth, (req, res) => {
  try {
    const user = req.user;
    const profile = db.profiles[user.id];
    if (!profile || !profile.qrCodes) return res.status(404).json({ error: "Profile not found" });
    const qr = profile.qrCodes.find((q) => q.id === req.params.id);
    if (!qr) return res.status(404).json({ error: "QR Code not found" });
    if (req.body.title) qr.title = sanitizeString(req.body.title);
    if (req.body.type) qr.type = req.body.type === "static" ? "static" : "dynamic";
    if (req.body.content !== void 0) qr.content = sanitizeString(req.body.content);
    if (req.body.fgColor) qr.fgColor = sanitizeString(req.body.fgColor);
    if (req.body.bgColor) qr.bgColor = sanitizeString(req.body.bgColor);
    qr.lastModified = (/* @__PURE__ */ new Date()).toISOString();
    profile.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    saveDatabase();
    res.json({ success: true, qrCode: qr, message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0643\u0648\u062F \u0627\u0644\u0640 QR \u0628\u0646\u062C\u0627\u062D!" });
  } catch (e) {
    res.status(500).json({ error: "Failed to update QR code" });
  }
});
app.delete("/api/qr/:id", requireAuth, (req, res) => {
  try {
    const user = req.user;
    const profile = db.profiles[user.id];
    if (!profile || !profile.qrCodes) return res.status(404).json({ error: "Profile not found" });
    profile.qrCodes = profile.qrCodes.filter((q) => q.id !== req.params.id);
    profile.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    saveDatabase();
    res.json({ success: true, message: "\u062A\u0645 \u062D\u0630\u0641 \u0643\u0648\u062F \u0627\u0644\u0640 QR \u0628\u0646\u062C\u0627\u062D!" });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete QR code" });
  }
});
app.post("/api/qr/update-destination", requireAuth, (req, res) => {
  try {
    const user = req.user;
    const profile = db.profiles[user.id];
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    const destination = sanitizeString(req.body.destination);
    profile.dynamicQrDestination = destination;
    profile.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    saveDatabase();
    logAudit("QR_DESTINATION_UPDATED", user.email, `Updated to ${destination || "default profile"}`);
    res.json({
      success: true,
      dynamicQrDestination: profile.dynamicQrDestination,
      message: "Dynamic QR destination updated! Your physical QR code now directs here."
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update dynamic QR destination" });
  }
});
app.get("/api/qr/stats", requireAuth, (req, res) => {
  const user = req.user;
  const profile = db.profiles[user.id];
  const logs = db.qrLogs.filter((l) => l.userId === user.id).slice(0, 100);
  res.json({
    totalScans: profile?.dynamicQrScans || 0,
    dynamicDestination: profile?.dynamicQrDestination || "",
    logs
  });
});
app.get("/qr/c/:codeId", (req, res) => {
  try {
    const codeId = sanitizeString(req.params.codeId);
    let targetQr = null;
    let targetProfile = null;
    for (const p of Object.values(db.profiles)) {
      if (p.qrCodes) {
        const found = p.qrCodes.find((q) => q.id === codeId);
        if (found) {
          targetQr = found;
          targetProfile = p;
          break;
        }
      }
    }
    if (!targetQr) {
      return res.redirect("/");
    }
    targetQr.scans = (targetQr.scans || 0) + 1;
    saveDatabase();
    const destination = targetQr.content && targetQr.content.trim().startsWith("http") ? targetQr.content.trim() : targetQr.content.trim().startsWith("/") ? targetQr.content.trim() : `/u/${targetProfile.username}`;
    res.redirect(destination);
  } catch (e) {
    res.redirect("/");
  }
});
app.get("/qr/:username", (req, res) => {
  try {
    const username = sanitizeString(req.params.username).toLowerCase();
    const user = db.users.find((u) => u.username.toLowerCase() === username);
    if (!user) {
      return res.status(404).send("<h1>Taqeemk QR Not Found</h1><p>This QR code does not belong to any active profile.</p>");
    }
    const profile = db.profiles[user.id];
    profile.dynamicQrScans = (profile.dynamicQrScans || 0) + 1;
    const ua = req.headers["user-agent"] || "";
    let deviceType = "desktop";
    if (/tablet|ipad/i.test(ua)) deviceType = "tablet";
    else if (/mobile|iphone|android/i.test(ua)) deviceType = "mobile";
    const scanLog = {
      id: "qr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ipHash: Buffer.from(String(req.ip || "127.0.0.1")).toString("base64").substring(0, 12),
      userAgent: ua.substring(0, 120),
      deviceType,
      destinationUrl: profile.dynamicQrDestination || `/u/${user.username}`
    };
    db.qrLogs.unshift(scanLog);
    if (db.qrLogs.length > 1e3) db.qrLogs = db.qrLogs.slice(0, 1e3);
    saveDatabase();
    const destination = profile.dynamicQrDestination && profile.dynamicQrDestination.trim().startsWith("http") ? profile.dynamicQrDestination.trim() : `/u/${user.username}`;
    res.redirect(destination);
  } catch (error) {
    res.redirect("/");
  }
});
app.get("/api/admin/overview", requireAdmin, (req, res) => {
  try {
    const totalUsers = db.users.length;
    const pendingUsers = db.users.filter((u) => u.paymentStatus === "pending");
    const lifetimeUsers = db.users.filter((u) => u.paymentStatus === "approved" || u.paymentStatus === "lifetime_unlimited");
    const totalRevenueEGP = db.users.reduce((acc, u) => {
      if (u.paymentStatus === "approved" && u.role !== "super_admin") {
        return acc + (u.paymentAmount || db.settings.lifetimeFeeEGP);
      }
      return acc;
    }, 0);
    let totalClicks = 0;
    let totalViews = 0;
    Object.values(db.profiles).forEach((p) => {
      totalViews += p.views || 0;
      p.lists?.forEach((l) => {
        l.links?.forEach((lnk) => {
          totalClicks += lnk.clicks || 0;
        });
      });
    });
    const totalQrScans = db.qrLogs.length;
    res.json({
      metrics: {
        totalUsers,
        pendingApprovals: pendingUsers.length,
        lifetimeUsers: lifetimeUsers.length,
        totalRevenueEGP,
        totalViews,
        totalClicks,
        totalQrScans
      },
      settings: db.settings
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to get admin overview" });
  }
});
app.get("/api/admin/users", requireAdmin, (req, res) => {
  try {
    const { search, status, role } = req.query;
    let list = [...db.users];
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((u) => u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
    }
    if (status) {
      list = list.filter((u) => u.paymentStatus === status);
    }
    if (role) {
      list = list.filter((u) => u.role === role);
    }
    const enhanced = list.map((u) => {
      const prof = db.profiles[u.id];
      return {
        ...u,
        displayName: prof?.displayName || u.username,
        avatarUrl: prof?.avatarUrl,
        views: prof?.views || 0,
        linksCount: prof?.lists?.reduce((sum, l) => sum + (l.links?.length || 0), 0) || 0,
        qrScans: prof?.dynamicQrScans || 0
      };
    });
    res.json({ users: enhanced });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
app.post("/api/admin/users/:userId/payment", requireAdmin, (req, res) => {
  try {
    const adminUser = req.user;
    const { userId } = req.params;
    const { action, notes } = req.body;
    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: "User not found" });
    if (action === "approve" || action === "grant_unlimited") {
      targetUser.paymentStatus = action === "grant_unlimited" ? "lifetime_unlimited" : "approved";
      targetUser.paymentApprovedAt = (/* @__PURE__ */ new Date()).toISOString();
      targetUser.paymentAmount = db.settings.lifetimeFeeEGP;
      logAudit(
        "ADMIN_APPROVED_PAYMENT",
        adminUser.email,
        `Approved payment for ${targetUser.email} (${action}). Notes: ${notes || "None"}`,
        targetUser.id
      );
    } else if (action === "reject") {
      targetUser.paymentStatus = "rejected";
      logAudit(
        "ADMIN_REJECTED_PAYMENT",
        adminUser.email,
        `Rejected payment for ${targetUser.email}. Notes: ${notes || "None"}`,
        targetUser.id
      );
    }
    saveDatabase();
    res.json({ success: true, user: targetUser, message: `Payment updated to ${targetUser.paymentStatus}` });
  } catch (e) {
    res.status(500).json({ error: "Failed to update payment status" });
  }
});
app.post("/api/admin/users/:userId/status", requireAdmin, (req, res) => {
  try {
    const adminUser = req.user;
    const { userId } = req.params;
    const { isBanned } = req.body;
    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: "User not found" });
    if (targetUser.role === "super_admin") {
      return res.status(403).json({ error: "Super Admin cannot be banned or restricted." });
    }
    targetUser.isBanned = Boolean(isBanned);
    saveDatabase();
    logAudit(
      targetUser.isBanned ? "ADMIN_BANNED_USER" : "ADMIN_UNBANNED_USER",
      adminUser.email,
      `User ${targetUser.email} status changed. isBanned: ${targetUser.isBanned}`,
      targetUser.id
    );
    res.json({ success: true, user: targetUser, message: `User ${targetUser.isBanned ? "banned" : "unbanned"} successfully` });
  } catch (e) {
    res.status(500).json({ error: "Failed to update user status" });
  }
});
app.put("/api/admin/settings", requireAdmin, (req, res) => {
  try {
    const adminUser = req.user;
    const { lifetimeFeeEGP, walletNumber, walletHolderName, sandboxAutoVerify, maintenanceMode, announcement } = req.body;
    if (lifetimeFeeEGP !== void 0) db.settings.lifetimeFeeEGP = Number(lifetimeFeeEGP);
    if (walletNumber !== void 0) db.settings.walletNumber = sanitizeString(walletNumber);
    if (walletHolderName !== void 0) db.settings.walletHolderName = sanitizeString(walletHolderName);
    if (sandboxAutoVerify !== void 0) db.settings.sandboxAutoVerify = Boolean(sandboxAutoVerify);
    if (maintenanceMode !== void 0) db.settings.maintenanceMode = Boolean(maintenanceMode);
    if (announcement !== void 0) db.settings.announcement = sanitizeString(announcement);
    saveDatabase();
    logAudit("SETTINGS_UPDATED", adminUser.email, "Updated system configuration parameters");
    res.json({ success: true, settings: db.settings, message: "System settings updated successfully!" });
  } catch (e) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});
app.get("/api/admin/audit-logs", requireAdmin, (req, res) => {
  res.json({ logs: db.auditLogs.slice(0, 100) });
});
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
======================================================`);
    console.log(`\u{1F680} Taqeemk Platform running on http://localhost:${PORT}`);
    console.log(`\u{1F451} Super Admin: elemamyoussef34@gmail.com (Password: KkK#6060)`);
    console.log(`\u{1F4F1} Cash / Wallet Number: ${db.settings.walletNumber} (${db.settings.lifetimeFeeEGP} EGP)`);
    console.log(`======================================================
`);
  });
}
startServer();
