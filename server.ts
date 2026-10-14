import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import type {
  User,
  UserProfile,
  SystemSettings,
  AuditLog,
  QRCodeScanLog,
  LinkList
} from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> bcrypt hash
  profiles: Record<string, UserProfile>; // userId -> profile
  qrLogs: QRCodeScanLog[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  tokens: Record<string, { userId: string; role: string; expiresAt: number }>;
}

const defaultSettings: SystemSettings = {
  lifetimeFeeEGP: 100,
  walletNumber: '01515926729',
  walletHolderName: 'Taqeemk Payments (Official Mobile Wallet)',
  acceptedWallets: [
    'Vodafone Cash',
    'InstaPay Egypt',
    'Orange Cash',
    'Etisalat Cash',
    'WE Pay'
  ],
  sandboxAutoVerify: false,
  maintenanceMode: false,
  announcement: 'Welcome to Taqeemk! Transfer 100 EGP to 01515926729 for instant lifetime access.'
};

// Seed initial database
function initDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      // Ensure settings and admin exist
      if (!data.settings) data.settings = defaultSettings;
      ensureSuperAdmin(data);
      return data;
    } catch (e) {
      console.error('Failed reading db.json, re-initializing', e);
    }
  }

  const db: DatabaseSchema = {
    users: [],
    passwords: {},
    profiles: {},
    qrLogs: [],
    auditLogs: [],
    settings: defaultSettings,
    tokens: {}
  };

  ensureSuperAdmin(db);
  seedDemoUsers(db);
  saveDatabase(db);
  return db;
}

function ensureSuperAdmin(db: DatabaseSchema) {
  const adminEmail = 'elemamyoussef34@gmail.com';
  const existingAdmin = db.users.find(u => u.email.toLowerCase() === adminEmail.toLowerCase());

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('KkK#6060', salt);

  if (!existingAdmin) {
    const adminId = 'user_superadmin_01';
    const adminUser: User = {
      id: adminId,
      email: adminEmail,
      username: 'youssef',
      role: 'super_admin',
      paymentStatus: 'lifetime_unlimited',
      createdAt: new Date().toISOString()
    };

    db.users.push(adminUser);
    db.passwords[adminId] = hashedPassword;

    // Create an impressive default profile for the super admin
    db.profiles[adminId] = {
      id: 'prof_' + adminId,
      userId: adminId,
      username: 'youssef',
      displayName: 'Youssef El-Emam',
      bio: 'Founder & Full-Stack Security Engineer @ Taqeemk | Building scalable web platforms & digital experiences',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      themeId: 'cyber_emerald',
      customAccentColor: '#10b981',
      views: 1420,
      verified: true,
      dynamicQrDestination: '',
      dynamicQrScans: 89,
      updatedAt: new Date().toISOString(),
      socials: [
        { platform: 'whatsapp', url: 'https://wa.me/201515926729', label: 'WhatsApp' },
        { platform: 'github', url: 'https://github.com', label: 'GitHub' },
        { platform: 'linkedin', url: 'https://linkedin.com', label: 'LinkedIn' },
        { platform: 'x', url: 'https://x.com', label: 'X (Twitter)' },
        { platform: 'email', url: 'mailto:elemamyoussef34@gmail.com', label: 'Email' }
      ],
      lists: [
        {
          id: 'list_featured',
          title: '🌟 Featured Highlights',
          description: 'Top priority links, latest releases & portfolio work',
          order: 1,
          links: [
            {
              id: 'lnk_1',
              title: '🚀 Taqeemk SaaS Platform',
              url: 'https://taqeemk.app',
              subtitle: 'Next-Gen Bio Link & Portfolio Engine',
              isActive: true,
              clicks: 452,
              highlight: 'glow',
              type: 'portfolio',
              createdAt: new Date().toISOString()
            },
            {
              id: 'lnk_2',
              title: '💬 Direct WhatsApp Consultation',
              url: 'https://wa.me/201515926729',
              subtitle: 'Chat directly for custom dev projects',
              isActive: true,
              clicks: 310,
              highlight: 'pulse',
              type: 'whatsapp',
              createdAt: new Date().toISOString()
            }
          ]
        },
        {
          id: 'list_portfolio',
          title: '💼 Engineering Projects',
          description: 'Client showcases, case studies & open source repositories',
          order: 2,
          links: [
            {
              id: 'lnk_3',
              title: '🛡️ CyberGuard AI Security Suite',
              url: 'https://github.com',
              subtitle: 'Automated vulnerability scanner for Node & Cloud APIs',
              isActive: true,
              clicks: 184,
              type: 'portfolio',
              createdAt: new Date().toISOString()
            },
            {
              id: 'lnk_4',
              title: '⚡ High-Performance Microservices',
              url: 'https://github.com',
              subtitle: 'Go & Express REST API architecture guide',
              isActive: true,
              clicks: 97,
              type: 'link',
              createdAt: new Date().toISOString()
            }
          ]
        }
      ]
    };
  } else {
    // Keep credentials updated and role confirmed
    existingAdmin.role = 'super_admin';
    existingAdmin.paymentStatus = 'lifetime_unlimited';
    db.passwords[existingAdmin.id] = hashedPassword;
  }
}

function seedDemoUsers(db: DatabaseSchema) {
  // Demo user with pending payment to demonstrate verification workflow
  const demoUserId = 'user_demo_sarah';
  if (!db.users.find(u => u.id === demoUserId)) {
    const salt = bcrypt.genSaltSync(10);
    const demoUser: User = {
      id: demoUserId,
      email: 'sarah.designer@example.com',
      username: 'sarah_designs',
      role: 'user',
      paymentStatus: 'pending',
      paymentReference: 'VOD-88492019',
      paymentPhone: '01099887766',
      paymentSubmittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      paymentAmount: 100,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    };

    db.users.push(demoUser);
    db.passwords[demoUserId] = bcrypt.hashSync('demo1234', salt);

    db.profiles[demoUserId] = {
      id: 'prof_' + demoUserId,
      userId: demoUserId,
      username: 'sarah_designs',
      displayName: 'Sarah Mansour',
      bio: 'Senior UI/UX Designer & Brand Strategist | Crafting award-winning digital experiences',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      themeId: 'sunset_gradient',
      views: 380,
      verified: true,
      dynamicQrScans: 42,
      updatedAt: new Date().toISOString(),
      socials: [
        { platform: 'instagram', url: 'https://instagram.com', label: 'Instagram' },
        { platform: 'linkedin', url: 'https://linkedin.com', label: 'LinkedIn' },
        { platform: 'whatsapp', url: 'https://wa.me/201515926729', label: 'WhatsApp' }
      ],
      lists: [
        {
          id: 'list_sarah_1',
          title: '🎨 Design Portfolios & Case Studies',
          order: 1,
          links: [
            {
              id: 'lnk_s1',
              title: 'Behance Masterpieces',
              url: 'https://behance.net',
              subtitle: 'Mobile UI concepts & SaaS Design Systems',
              isActive: true,
              clicks: 120,
              highlight: 'glow',
              type: 'portfolio',
              createdAt: new Date().toISOString()
            },
            {
              id: 'lnk_s2',
              title: 'Figma Community Files',
              url: 'https://figma.com',
              subtitle: 'Free UI kits & icons for web designers',
              isActive: true,
              clicks: 85,
              type: 'link',
              createdAt: new Date().toISOString()
            }
          ]
        }
      ]
    };
  }
}

let db = initDatabase();

function saveDatabase(dataToSave = db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

// Security: In-memory sliding window rate limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitRecord>();

function rateLimiter(maxRequests = 60, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    const key = `${ip}_${req.path}`;
    const now = Date.now();

    const record = rateLimitStore.get(String(key));
    if (!record || now > record.resetAt) {
      rateLimitStore.set(String(key), { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
      return res.status(429).json({
        error: `Too many requests from this IP. Please try again in ${waitSeconds} seconds.`
      });
    }

    record.count++;
    next();
  };
}

// Token helper
function createToken(userId: string, role: string): string {
  const token = 'tqk_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  // Valid for 7 days
  db.tokens[token] = {
    userId,
    role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  };
  saveDatabase();
  return token;
}

function verifyToken(token: string) {
  if (!token) return null;
  const cleanToken = token.replace('Bearer ', '').trim();
  const session = db.tokens[cleanToken];
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    delete db.tokens[cleanToken];
    saveDatabase();
    return null;
  }
  return session;
}

// Authentication Middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const session = verifyToken(authHeader);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid token' });
  }

  const user = db.users.find(u => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User account not found' });
  }

  if (user.isBanned) {
    return res.status(403).json({ error: 'This account has been suspended by an administrator.' });
  }

  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    const user = (req as any).user as User;
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

function logAudit(action: string, actorEmail: string, details?: string, target?: string, ip = '127.0.0.1') {
  const log: AuditLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    action,
    actorEmail,
    details,
    target,
    ip,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDatabase();
}

// Input sanitization helpers
function sanitizeString(str: any): string {
  if (typeof str !== 'string') return '';
  return str.trim();
}

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_-]{3,30}$/.test(username);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all /api/auth routes
app.use('/api/auth', rateLimiter(25, 60000));

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const email = sanitizeString(req.body.email).toLowerCase();
    const password = sanitizeString(req.body.password);
    const username = sanitizeString(req.body.username).toLowerCase();
    const displayName = sanitizeString(req.body.displayName) || username;

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({
        error: 'Username must be 3-30 characters and contain only letters, numbers, underscores, or dashes.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if email already registered
    if (db.users.some(u => u.email.toLowerCase() === email)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Check if username taken
    if (db.users.some(u => u.username.toLowerCase() === username)) {
      return res.status(409).json({ error: 'This username is already taken. Please choose another.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const isMasterAdmin = email === 'elemamyoussef34@gmail.com';
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const newUser: User = {
      id: userId,
      email,
      username,
      role: isMasterAdmin ? 'super_admin' : 'user',
      paymentStatus: isMasterAdmin ? 'lifetime_unlimited' : 'not_paid',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.passwords[userId] = hashedPassword;

    // Create default profile
    const newProfile: UserProfile = {
      id: 'prof_' + userId,
      userId,
      username,
      displayName,
      bio: 'Welcome to my Taqeemk profile! Click on my links below to explore my work and connect.',
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      themeId: 'dark_onyx',
      customAccentColor: '#10b981',
      views: 0,
      verified: isMasterAdmin,
      dynamicQrScans: 0,
      updatedAt: new Date().toISOString(),
      socials: [
        { platform: 'whatsapp', url: 'https://wa.me/201515926729', label: 'WhatsApp' },
        { platform: 'x', url: 'https://x.com', label: 'Twitter' },
        { platform: 'instagram', url: 'https://instagram.com', label: 'Instagram' }
      ],
      lists: [
        {
          id: 'list_' + Date.now() + '_1',
          title: '🔥 Quick Links',
          order: 1,
          links: [
            {
              id: 'lnk_' + Date.now() + '_1',
              title: '💬 Message Me on WhatsApp',
              url: 'https://wa.me/201515926729',
              subtitle: 'Direct mobile wallet & contact',
              isActive: true,
              clicks: 0,
              highlight: 'glow',
              type: 'whatsapp',
              createdAt: new Date().toISOString()
            },
            {
              id: 'lnk_' + Date.now() + '_2',
              title: '🌐 Visit My Website',
              url: 'https://google.com',
              subtitle: 'Read more about my portfolio',
              isActive: true,
              clicks: 0,
              type: 'link',
              createdAt: new Date().toISOString()
            }
          ]
        }
      ]
    };

    db.profiles[userId] = newProfile;
    saveDatabase();

    logAudit('USER_REGISTERED', email, `New registration with handle @${username}`);

    const token = createToken(userId, newUser.role);
    res.status(201).json({
      token,
      user: newUser,
      profile: newProfile,
      message: 'Account created successfully!'
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const email = sanitizeString(req.body.email).toLowerCase();
    const password = sanitizeString(req.body.password);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email || u.username.toLowerCase() === email);
    if (!user) {
      logAudit('LOGIN_FAILED', email, 'User not found');
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'This account has been suspended by an administrator.' });
    }

    const hashedPassword = db.passwords[user.id];
    const passwordMatches = bcrypt.compareSync(password, hashedPassword);

    if (!passwordMatches) {
      logAudit('LOGIN_FAILED', user.email, 'Incorrect password attempt');
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Special guarantee for super admin
    if (user.email.toLowerCase() === 'elemamyoussef34@gmail.com') {
      user.role = 'super_admin';
      user.paymentStatus = 'lifetime_unlimited';
      saveDatabase();
    }

    const profile = db.profiles[user.id] || null;
    const token = createToken(user.id, user.role);

    logAudit('LOGIN_SUCCESS', user.email, `Logged in with role ${user.role}`);

    res.json({
      token,
      user,
      profile,
      message: 'Logged in successfully!'
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get Current User Session (Me)
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const profile = db.profiles[user.id] || null;
  res.json({ user, profile });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '').trim();
    delete db.tokens[token];
    saveDatabase();
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==========================================
// PAYMENT & LIFETIME ACCESS ROUTES
// ==========================================

// Get payment instructions & current price
app.get('/api/payment/info', (req, res) => {
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

// Submit payment proof
app.post('/api/payment/submit', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as User;
    const referenceId = sanitizeString(req.body.referenceId);
    const phone = sanitizeString(req.body.phone);
    const notes = sanitizeString(req.body.notes);

    if (!referenceId || !phone) {
      return res.status(400).json({ error: 'Transaction Reference ID and Sender Phone number are required.' });
    }

    // If super admin, already lifetime
    if (user.role === 'super_admin') {
      return res.json({ message: 'Super admin already enjoys lifetime unlimited access.', status: 'lifetime_unlimited' });
    }

    user.paymentReference = referenceId;
    user.paymentPhone = phone;
    user.paymentSubmittedAt = new Date().toISOString();
    user.paymentAmount = db.settings.lifetimeFeeEGP;

    // Check if auto-verify sandbox mode is active
    if (db.settings.sandboxAutoVerify) {
      user.paymentStatus = 'approved';
      user.paymentApprovedAt = new Date().toISOString();
      logAudit('PAYMENT_AUTO_VERIFIED', user.email, `Ref: ${referenceId}, Phone: ${phone}, EGP ${db.settings.lifetimeFeeEGP}`);
    } else {
      user.paymentStatus = 'pending';
      logAudit('PAYMENT_SUBMITTED', user.email, `Ref: ${referenceId}, Phone: ${phone}, EGP ${db.settings.lifetimeFeeEGP}`);
    }

    saveDatabase();

    res.json({
      success: true,
      user,
      status: user.paymentStatus,
      message: user.paymentStatus === 'approved'
        ? 'Payment verified! Lifetime access unlocked.'
        : 'Payment proof submitted successfully! Verification pending approval by administrator.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process payment submission' });
  }
});

// Sandbox Instant Verification (For testing & demos)
app.post('/api/payment/sandbox-instant-verify', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  user.paymentStatus = 'approved';
  user.paymentApprovedAt = new Date().toISOString();
  user.paymentAmount = db.settings.lifetimeFeeEGP;
  if (!user.paymentReference) user.paymentReference = 'SANDBOX-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  if (!user.paymentPhone) user.paymentPhone = '01515926729';

  saveDatabase();
  logAudit('SANDBOX_PAYMENT_VERIFIED', user.email, `Instant demo verification granted`);

  res.json({
    success: true,
    user,
    message: 'Instant Lifetime Access unlocked via Sandbox Simulator!'
  });
});

// ==========================================
// PROFILE & LISTS MANAGEMENT
// ==========================================

// Get My Profile
app.get('/api/profile/me', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  let profile = db.profiles[user.id];
  if (!profile) {
    profile = {
      id: 'prof_' + user.id,
      userId: user.id,
      username: user.username,
      displayName: user.username,
      bio: 'Welcome to my Taqeemk profile!',
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`,
      themeId: 'dark_onyx',
      views: 0,
      verified: user.role === 'super_admin',
      dynamicQrScans: 0,
      updatedAt: new Date().toISOString(),
      socials: [],
      lists: []
    };
    db.profiles[user.id] = profile;
    saveDatabase();
  }
  res.json({ profile });
});

// Update Profile Details (bio, theme, socials, avatar)
app.put('/api/profile/update', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as User;
    let profile = db.profiles[user.id];
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { displayName, bio, avatarUrl, coverUrl, coverType, coverValue, themeId, customAccentColor, socials } = req.body;

    if (displayName !== undefined) profile.displayName = sanitizeString(displayName);
    if (bio !== undefined) profile.bio = sanitizeString(bio);
    if (avatarUrl !== undefined) profile.avatarUrl = sanitizeString(avatarUrl);
    if (coverUrl !== undefined) profile.coverUrl = sanitizeString(coverUrl);
    if (coverType !== undefined) profile.coverType = coverType;
    if (coverValue !== undefined) profile.coverValue = sanitizeString(coverValue);
    if (themeId !== undefined) profile.themeId = sanitizeString(themeId);
    if (customAccentColor !== undefined) profile.customAccentColor = sanitizeString(customAccentColor);
    if (Array.isArray(socials)) profile.socials = socials;

    profile.updatedAt = new Date().toISOString();
    saveDatabase();

    res.json({ success: true, profile, message: 'Profile updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update Unified Links List
app.put('/api/profile/links', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as User;
    const profile = db.profiles[user.id];
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { links } = req.body;
    if (!Array.isArray(links)) {
      return res.status(400).json({ error: 'Links must be an array' });
    }

    profile.links = links.map((link: any, linkIdx: number) => ({
      id: link.id || `lnk_${Date.now()}_${linkIdx}`,
      title: sanitizeString(link.title) || 'Link',
      url: sanitizeString(link.url) || '#',
      subtitle: sanitizeString(link.subtitle),
      icon: link.icon,
      platform: link.platform || 'custom',
      thumbnailUrl: link.thumbnailUrl,
      isActive: link.isActive !== false,
      clicks: Number(link.clicks) || 0,
      highlight: link.highlight || 'none',
      type: link.type || 'link',
      createdAt: link.createdAt || new Date().toISOString()
    }));

    // Keep backwards compatibility with single default list
    profile.lists = [{
      id: 'default_unified_list',
      title: 'روابطي',
      order: 1,
      links: profile.links
    }];

    profile.updatedAt = new Date().toISOString();
    saveDatabase();

    res.json({ success: true, links: profile.links, message: 'تم حفظ الروابط بنجاح!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update links' });
  }
});

// Update / Reorder Lists and Links (legacy fallback)
app.put('/api/profile/lists', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as User;
    const profile = db.profiles[user.id];
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { lists } = req.body;
    if (!Array.isArray(lists)) {
      return res.status(400).json({ error: 'Lists must be an array' });
    }

    // Validate and sanitize lists
    profile.lists = lists.map((list: LinkList, listIdx: number) => ({
      id: list.id || `list_${Date.now()}_${listIdx}`,
      title: sanitizeString(list.title) || 'Links List',
      description: sanitizeString(list.description),
      icon: list.icon,
      isCollapsed: Boolean(list.isCollapsed),
      order: listIdx + 1,
      links: Array.isArray(list.links)
        ? list.links.map((link: any, linkIdx: number) => ({
            id: link.id || `lnk_${Date.now()}_${linkIdx}`,
            title: sanitizeString(link.title) || 'Link',
            url: sanitizeString(link.url) || '#',
            subtitle: sanitizeString(link.subtitle),
            icon: link.icon,
            platform: link.platform || 'custom',
            thumbnailUrl: link.thumbnailUrl,
            isActive: link.isActive !== false,
            clicks: Number(link.clicks) || 0,
            highlight: link.highlight || 'none',
            type: link.type || 'link',
            createdAt: link.createdAt || new Date().toISOString()
          }))
        : []
    }));

    profile.links = profile.lists.flatMap(l => l.links);
    profile.updatedAt = new Date().toISOString();
    saveDatabase();

    res.json({ success: true, lists: profile.lists, links: profile.links, message: 'Links and lists saved!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lists' });
  }
});

// Track Click on Link
app.post('/api/profile/links/track-click', (req, res) => {
  try {
    const { username, linkId } = req.body;
    if (!username || !linkId) {
      return res.status(400).json({ error: 'Missing username or linkId' });
    }

    const user = db.users.find(u => u.username.toLowerCase() === String(username).toLowerCase());
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = db.profiles[user.id];
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    let found = false;
    if (profile.links) {
      const link = profile.links.find(l => l.id === linkId);
      if (link) {
        link.clicks = (link.clicks || 0) + 1;
        found = true;
      }
    }
    if (profile.lists) {
      for (const list of profile.lists) {
        const link = list.links.find(l => l.id === linkId);
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
    res.status(500).json({ error: 'Click tracking failed' });
  }
});

// Public Profile Endpoint
app.get('/api/u/:username', (req, res) => {
  try {
    const username = sanitizeString(req.params.username).toLowerCase();
    const user = db.users.find(u => u.username.toLowerCase() === username);

    if (!user || user.isBanned) {
      return res.status(404).json({ error: 'Profile not found or suspended.' });
    }

    const profile = db.profiles[user.id];
    if (!profile) {
      return res.status(404).json({ error: 'Profile has not been set up yet.' });
    }

    // Increment view count
    profile.views = (profile.views || 0) + 1;
    saveDatabase();

    // Filter out inactive links for public visitors
    const sanitizedLists = (profile.lists || []).map(list => ({
      ...list,
      links: (list.links || []).filter(l => l.isActive)
    }));

    const sanitizedLinks = Array.isArray(profile.links) && profile.links.length > 0
      ? profile.links.filter(l => l.isActive)
      : sanitizedLists.flatMap(l => l.links);

    res.json({
      profile: {
        ...profile,
        links: sanitizedLinks,
        lists: sanitizedLists
      },
      user: {
        username: user.username,
        role: user.role,
        verified: profile.verified || user.role === 'super_admin'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch profile' });
  }
});

// ==========================================
// DYNAMIC QR CODE & SCAN TRACKING
// ==========================================

// QR Codes List Management
app.get('/api/qr/list', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const profile = db.profiles[user.id];
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  if (!profile.qrCodes || profile.qrCodes.length === 0) {
    profile.qrCodes = [
      {
        id: 'qr_' + Date.now() + '_1',
        title: 'باركود البروفايل الرئيسي (Smart Bio Profile)',
        type: 'dynamic',
        content: `/u/${user.username}`,
        scans: profile.dynamicQrScans || 42,
        lastModified: new Date().toISOString(),
        fgColor: '#0f172a',
        bgColor: '#ffffff'
      },
      {
        id: 'qr_' + Date.now() + '_2',
        title: 'باركود تقييم جوجل للفرع (Google Reviews)',
        type: 'dynamic',
        content: 'https://g.page/r/',
        scans: 89,
        lastModified: new Date(Date.now() - 86400000 * 2).toISOString(),
        fgColor: '#4285F4',
        bgColor: '#ffffff'
      },
      {
        id: 'qr_' + Date.now() + '_3',
        title: 'كود المحادثة الفورية للواتساب',
        type: 'static',
        content: 'https://wa.me/201515926729',
        scans: 19,
        lastModified: new Date(Date.now() - 86400000 * 5).toISOString(),
        fgColor: '#25D366',
        bgColor: '#ffffff'
      }
    ];
    saveDatabase();
  }

  res.json({ qrCodes: profile.qrCodes });
});

app.post('/api/qr/create', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as User;
    const profile = db.profiles[user.id];
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const title = sanitizeString(req.body.title) || 'كود QR جديد';
    const type: 'dynamic' | 'static' = req.body.type === 'static' ? 'static' : 'dynamic';
    const content = sanitizeString(req.body.content) || `/u/${user.username}`;
    const fgColor = sanitizeString(req.body.fgColor) || '#0f172a';
    const bgColor = sanitizeString(req.body.bgColor) || '#ffffff';

    if (!profile.qrCodes) profile.qrCodes = [];

    const newQr = {
      id: 'qr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title,
      type,
      content,
      scans: 0,
      lastModified: new Date().toISOString(),
      fgColor,
      bgColor
    };

    profile.qrCodes.unshift(newQr);
    profile.updatedAt = new Date().toISOString();
    saveDatabase();

    logAudit('QR_CODE_CREATED', user.email, `Created QR: ${title} (${type})`);

    res.status(201).json({ success: true, qrCode: newQr, message: 'تم إنشاء كود الـ QR بنجاح!' });
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to create QR code' });
  }
});

app.put('/api/qr/:id', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as User;
    const profile = db.profiles[user.id];
    if (!profile || !profile.qrCodes) return res.status(404).json({ error: 'Profile not found' });

    const qr = profile.qrCodes.find(q => q.id === req.params.id);
    if (!qr) return res.status(404).json({ error: 'QR Code not found' });

    if (req.body.title) qr.title = sanitizeString(req.body.title);
    if (req.body.type) qr.type = req.body.type === 'static' ? 'static' : 'dynamic';
    if (req.body.content !== undefined) qr.content = sanitizeString(req.body.content);
    if (req.body.fgColor) qr.fgColor = sanitizeString(req.body.fgColor);
    if (req.body.bgColor) qr.bgColor = sanitizeString(req.body.bgColor);
    qr.lastModified = new Date().toISOString();

    profile.updatedAt = new Date().toISOString();
    saveDatabase();

    res.json({ success: true, qrCode: qr, message: 'تم تحديث كود الـ QR بنجاح!' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update QR code' });
  }
});

app.delete('/api/qr/:id', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as User;
    const profile = db.profiles[user.id];
    if (!profile || !profile.qrCodes) return res.status(404).json({ error: 'Profile not found' });

    profile.qrCodes = profile.qrCodes.filter(q => q.id !== req.params.id);
    profile.updatedAt = new Date().toISOString();
    saveDatabase();

    res.json({ success: true, message: 'تم حذف كود الـ QR بنجاح!' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete QR code' });
  }
});

// Update Dynamic QR Destination
app.post('/api/qr/update-destination', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as User;
    const profile = db.profiles[user.id];
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const destination = sanitizeString(req.body.destination);
    profile.dynamicQrDestination = destination;
    profile.updatedAt = new Date().toISOString();
    saveDatabase();

    logAudit('QR_DESTINATION_UPDATED', user.email, `Updated to ${destination || 'default profile'}`);

    res.json({
      success: true,
      dynamicQrDestination: profile.dynamicQrDestination,
      message: 'Dynamic QR destination updated! Your physical QR code now directs here.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update dynamic QR destination' });
  }
});

// Get QR Stats & Logs for user
app.get('/api/qr/stats', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const profile = db.profiles[user.id];
  const logs = db.qrLogs.filter(l => l.userId === user.id).slice(0, 100);

  res.json({
    totalScans: profile?.dynamicQrScans || 0,
    dynamicDestination: profile?.dynamicQrDestination || '',
    logs
  });
});

// Individual QR Code Redirect by ID
app.get('/qr/c/:codeId', (req, res) => {
  try {
    const codeId = sanitizeString(req.params.codeId);
    let targetQr: any = null;
    let targetProfile: any = null;

    for (const p of Object.values(db.profiles)) {
      if (p.qrCodes) {
        const found = p.qrCodes.find(q => q.id === codeId);
        if (found) {
          targetQr = found;
          targetProfile = p;
          break;
        }
      }
    }

    if (!targetQr) {
      return res.redirect('/');
    }

    targetQr.scans = (targetQr.scans || 0) + 1;
    saveDatabase();

    const destination = targetQr.content && targetQr.content.trim().startsWith('http')
      ? targetQr.content.trim()
      : targetQr.content.trim().startsWith('/')
      ? targetQr.content.trim()
      : `/u/${targetProfile.username}`;

    res.redirect(destination);
  } catch (e) {
    res.redirect('/');
  }
});

// Dynamic QR Scan Handler & Redirect
app.get('/qr/:username', (req, res) => {
  try {
    const username = sanitizeString(req.params.username).toLowerCase();
    const user = db.users.find(u => u.username.toLowerCase() === username);

    if (!user) {
      return res.status(404).send('<h1>Taqeemk QR Not Found</h1><p>This QR code does not belong to any active profile.</p>');
    }

    const profile = db.profiles[user.id];
    profile.dynamicQrScans = (profile.dynamicQrScans || 0) + 1;

    // Detect device type from user-agent
    const ua = req.headers['user-agent'] || '';
    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';
    else if (/mobile|iphone|android/i.test(ua)) deviceType = 'mobile';

    // Log the scan
    const scanLog: QRCodeScanLog = {
      id: 'qr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      timestamp: new Date().toISOString(),
      ipHash: Buffer.from(String(req.ip || '127.0.0.1')).toString('base64').substring(0, 12),
      userAgent: ua.substring(0, 120),
      deviceType,
      destinationUrl: profile.dynamicQrDestination || `/u/${user.username}`
    };

    db.qrLogs.unshift(scanLog);
    if (db.qrLogs.length > 1000) db.qrLogs = db.qrLogs.slice(0, 1000);
    saveDatabase();

    const destination = profile.dynamicQrDestination && profile.dynamicQrDestination.trim().startsWith('http')
      ? profile.dynamicQrDestination.trim()
      : `/u/${user.username}`;

    res.redirect(destination);
  } catch (error) {
    res.redirect('/');
  }
});

// ==========================================
// ADMIN & SUPER ADMIN MANAGEMENT ROUTES
// ==========================================

// Admin Overview Metrics
app.get('/api/admin/overview', requireAdmin, (req, res) => {
  try {
    const totalUsers = db.users.length;
    const pendingUsers = db.users.filter(u => u.paymentStatus === 'pending');
    const lifetimeUsers = db.users.filter(u => u.paymentStatus === 'approved' || u.paymentStatus === 'lifetime_unlimited');

    const totalRevenueEGP = db.users.reduce((acc, u) => {
      if (u.paymentStatus === 'approved' && u.role !== 'super_admin') {
        return acc + (u.paymentAmount || db.settings.lifetimeFeeEGP);
      }
      return acc;
    }, 0);

    let totalClicks = 0;
    let totalViews = 0;
    Object.values(db.profiles).forEach(p => {
      totalViews += (p.views || 0);
      p.lists?.forEach(l => {
        l.links?.forEach(lnk => {
          totalClicks += (lnk.clicks || 0);
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
    res.status(500).json({ error: 'Failed to get admin overview' });
  }
});

// Admin User List
app.get('/api/admin/users', requireAdmin, (req, res) => {
  try {
    const { search, status, role } = req.query;
    let list = [...db.users];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(u => u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
    }

    if (status) {
      list = list.filter(u => u.paymentStatus === status);
    }

    if (role) {
      list = list.filter(u => u.role === role);
    }

    const enhanced = list.map(u => {
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
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin Approve / Reject Payment
app.post('/api/admin/users/:userId/payment', requireAdmin, (req, res) => {
  try {
    const adminUser = (req as any).user as User;
    const { userId } = req.params;
    const { action, notes } = req.body; // 'approve' | 'reject' | 'grant_unlimited'

    const targetUser = db.users.find(u => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    if (action === 'approve' || action === 'grant_unlimited') {
      targetUser.paymentStatus = action === 'grant_unlimited' ? 'lifetime_unlimited' : 'approved';
      targetUser.paymentApprovedAt = new Date().toISOString();
      targetUser.paymentAmount = db.settings.lifetimeFeeEGP;
      logAudit(
        'ADMIN_APPROVED_PAYMENT',
        adminUser.email,
        `Approved payment for ${targetUser.email} (${action}). Notes: ${notes || 'None'}`,
        targetUser.id
      );
    } else if (action === 'reject') {
      targetUser.paymentStatus = 'rejected';
      logAudit(
        'ADMIN_REJECTED_PAYMENT',
        adminUser.email,
        `Rejected payment for ${targetUser.email}. Notes: ${notes || 'None'}`,
        targetUser.id
      );
    }

    saveDatabase();
    res.json({ success: true, user: targetUser, message: `Payment updated to ${targetUser.paymentStatus}` });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Admin Toggle User Ban/Active Status
app.post('/api/admin/users/:userId/status', requireAdmin, (req, res) => {
  try {
    const adminUser = (req as any).user as User;
    const { userId } = req.params;
    const { isBanned } = req.body;

    const targetUser = db.users.find(u => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Protect super admin from being banned
    if (targetUser.role === 'super_admin') {
      return res.status(403).json({ error: 'Super Admin cannot be banned or restricted.' });
    }

    targetUser.isBanned = Boolean(isBanned);
    saveDatabase();

    logAudit(
      targetUser.isBanned ? 'ADMIN_BANNED_USER' : 'ADMIN_UNBANNED_USER',
      adminUser.email,
      `User ${targetUser.email} status changed. isBanned: ${targetUser.isBanned}`,
      targetUser.id
    );

    res.json({ success: true, user: targetUser, message: `User ${targetUser.isBanned ? 'banned' : 'unbanned'} successfully` });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Admin Update System Settings
app.put('/api/admin/settings', requireAdmin, (req, res) => {
  try {
    const adminUser = (req as any).user as User;
    const { lifetimeFeeEGP, walletNumber, walletHolderName, sandboxAutoVerify, maintenanceMode, announcement } = req.body;

    if (lifetimeFeeEGP !== undefined) db.settings.lifetimeFeeEGP = Number(lifetimeFeeEGP);
    if (walletNumber !== undefined) db.settings.walletNumber = sanitizeString(walletNumber);
    if (walletHolderName !== undefined) db.settings.walletHolderName = sanitizeString(walletHolderName);
    if (sandboxAutoVerify !== undefined) db.settings.sandboxAutoVerify = Boolean(sandboxAutoVerify);
    if (maintenanceMode !== undefined) db.settings.maintenanceMode = Boolean(maintenanceMode);
    if (announcement !== undefined) db.settings.announcement = sanitizeString(announcement);

    saveDatabase();
    logAudit('SETTINGS_UPDATED', adminUser.email, 'Updated system configuration parameters');

    res.json({ success: true, settings: db.settings, message: 'System settings updated successfully!' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Admin Security Audit Logs
app.get('/api/admin/audit-logs', requireAdmin, (req, res) => {
  res.json({ logs: db.auditLogs.slice(0, 100) });
});

// ==========================================
// VITE DEV & PRODUCTION STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Taqeemk Platform running on http://localhost:${PORT}`);
    console.log(`👑 Super Admin: elemamyoussef34@gmail.com (Password: KkK#6060)`);
    console.log(`📱 Cash / Wallet Number: ${db.settings.walletNumber} (${db.settings.lifetimeFeeEGP} EGP)`);
    console.log(`======================================================\n`);
  });
}

startServer();
