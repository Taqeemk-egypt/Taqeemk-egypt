export type UserRole = 'super_admin' | 'admin' | 'user';

export type PaymentStatus = 'not_paid' | 'pending' | 'approved' | 'rejected' | 'lifetime_unlimited';

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  subtitle?: string;
  icon?: string;
  platform?: string;
  thumbnailUrl?: string;
  isActive: boolean;
  clicks: number;
  highlight?: 'none' | 'pulse' | 'glow' | 'bounce';
  type?: 'link' | 'whatsapp' | 'email' | 'phone' | 'portfolio' | 'video' | string;
  createdAt: string;
}

export interface LinkList {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  isCollapsed?: boolean;
  order: number;
  links: LinkItem[];
}

export interface SocialLink {
  platform: 'whatsapp' | 'instagram' | 'github' | 'linkedin' | 'x' | 'youtube' | 'tiktok' | 'telegram' | 'facebook' | 'email' | 'website' | 'google_review' | string;
  url: string;
  label?: string;
}

export interface ProfileTheme {
  id: string;
  name: string;
  background: string;
  cardBg: string;
  cardBorder: string;
  textColor: string;
  accentColor: string;
  buttonStyle: 'rounded-xl' | 'rounded-2xl' | 'rounded-lg' | 'rounded-full' | 'rounded-md' | 'border-only' | 'glass';
  fontFamily: string;
}

export interface QRCodeItem {
  id: string;
  title: string;
  type: 'dynamic' | 'static';
  content: string;
  scans: number;
  lastModified: string;
  fgColor?: string;
  bgColor?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  coverUrl?: string;
  coverType?: 'gradient' | 'image';
  coverValue?: string;
  themeId: string;
  customAccentColor?: string;
  socials: SocialLink[];
  links?: LinkItem[];
  lists: LinkList[];
  views: number;
  verified: boolean;
  dynamicQrDestination?: string;
  dynamicQrScans: number;
  qrCodes?: QRCodeItem[];
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paymentPhone?: string;
  paymentSubmittedAt?: string;
  paymentApprovedAt?: string;
  paymentAmount?: number;
  createdAt: string;
  isBanned?: boolean;
}

export interface PaymentProofSubmission {
  referenceId: string;
  phone: string;
  notes?: string;
  amount: number;
}

export interface QRCodeScanLog {
  id: string;
  userId: string;
  timestamp: string;
  ipHash: string;
  userAgent: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  destinationUrl: string;
}

export interface SystemSettings {
  lifetimeFeeEGP: number;
  walletNumber: string;
  walletHolderName: string;
  acceptedWallets: string[];
  sandboxAutoVerify: boolean;
  maintenanceMode: boolean;
  announcement?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorEmail: string;
  target?: string;
  details?: string;
  ip: string;
  timestamp: string;
}
