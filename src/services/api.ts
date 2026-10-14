import type {
  User,
  UserProfile,
  SystemSettings,
  AuditLog,
  QRCodeScanLog,
  LinkList,
  SocialLink
} from '../types';

const TOKEN_KEY = 'taqeemk_jwt_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'An unexpected error occurred');
    }

    return data as T;
  },

  auth: {
    async register(payload: { email: string; password: string; username: string; displayName?: string }) {
      return api.request<{ token: string; user: User; profile: UserProfile; message: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async login(payload: { email: string; password: string }) {
      return api.request<{ token: string; user: User; profile: UserProfile; message: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async getMe() {
      return api.request<{ user: User; profile: UserProfile }>('/api/auth/me');
    },

    async logout() {
      try {
        await api.request('/api/auth/logout', { method: 'POST' });
      } catch (e) {
        // Ignore network errors during logout
      } finally {
        api.removeToken();
      }
    },
  },

  payment: {
    async getInfo() {
      return api.request<{
        amountEGP: number;
        walletNumber: string;
        walletHolderName: string;
        acceptedWallets: string[];
        instructions: string[];
        sandboxAutoVerify: boolean;
      }>('/api/payment/info');
    },

    async submitProof(payload: { referenceId: string; phone: string; notes?: string }) {
      return api.request<{ success: boolean; user: User; status: string; message: string }>('/api/payment/submit', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async sandboxInstantVerify() {
      return api.request<{ success: boolean; user: User; message: string }>('/api/payment/sandbox-instant-verify', {
        method: 'POST',
      });
    },
  },

  profile: {
    async getMyProfile() {
      return api.request<{ profile: UserProfile }>('/api/profile/me');
    },

    async updateProfile(payload: {
      displayName?: string;
      bio?: string;
      avatarUrl?: string;
      coverUrl?: string;
      coverType?: 'gradient' | 'image';
      coverValue?: string;
      themeId?: string;
      customAccentColor?: string;
      socials?: SocialLink[];
    }) {
      return api.request<{ success: boolean; profile: UserProfile; message: string }>('/api/profile/update', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    async updateLinks(links: any[]) {
      return api.request<{ success: boolean; links: any[]; message: string }>('/api/profile/links', {
        method: 'PUT',
        body: JSON.stringify({ links }),
      });
    },

    async updateLists(lists: LinkList[]) {
      return api.request<{ success: boolean; lists: LinkList[]; message: string }>('/api/profile/lists', {
        method: 'PUT',
        body: JSON.stringify({ lists }),
      });
    },

    async trackClick(username: string, linkId: string) {
      return api.request<{ success: boolean }>('/api/profile/links/track-click', {
        method: 'POST',
        body: JSON.stringify({ username, linkId }),
      });
    },

    async getPublicProfile(username: string) {
      return api.request<{ profile: UserProfile; user: { username: string; role: string; verified: boolean } }>(
        `/api/u/${encodeURIComponent(username)}`
      );
    },
  },

  qr: {
    async getList() {
      return api.request<{ qrCodes: any[] }>('/api/qr/list');
    },

    async create(payload: { title: string; type: 'dynamic' | 'static'; content: string; fgColor?: string; bgColor?: string }) {
      return api.request<{ success: boolean; qrCode: any; message: string }>('/api/qr/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async update(id: string, payload: { title?: string; type?: 'dynamic' | 'static'; content?: string; fgColor?: string; bgColor?: string }) {
      return api.request<{ success: boolean; qrCode: any; message: string }>(`/api/qr/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    async delete(id: string) {
      return api.request<{ success: boolean; message: string }>(`/api/qr/${id}`, {
        method: 'DELETE',
      });
    },

    async updateDestination(destination: string) {
      return api.request<{ success: boolean; dynamicQrDestination: string; message: string }>('/api/qr/update-destination', {
        method: 'POST',
        body: JSON.stringify({ destination }),
      });
    },

    async getStats() {
      return api.request<{ totalScans: number; dynamicDestination: string; logs: QRCodeScanLog[] }>('/api/qr/stats');
    },
  },

  admin: {
    async getOverview() {
      return api.request<{
        metrics: {
          totalUsers: number;
          pendingApprovals: number;
          lifetimeUsers: number;
          totalRevenueEGP: number;
          totalViews: number;
          totalClicks: number;
          totalQrScans: number;
        };
        settings: SystemSettings;
      }>('/api/admin/overview');
    },

    async getUsers(params: { search?: string; status?: string; role?: string } = {}) {
      const q = new URLSearchParams();
      if (params.search) q.append('search', params.search);
      if (params.status) q.append('status', params.status);
      if (params.role) q.append('role', params.role);
      return api.request<{ users: (User & { displayName: string; avatarUrl: string; views: number; linksCount: number; qrScans: number })[] }>(
        `/api/admin/users?${q.toString()}`
      );
    },

    async updatePayment(userId: string, action: 'approve' | 'reject' | 'grant_unlimited', notes?: string) {
      return api.request<{ success: boolean; user: User; message: string }>(`/api/admin/users/${userId}/payment`, {
        method: 'POST',
        body: JSON.stringify({ action, notes }),
      });
    },

    async updateUserStatus(userId: string, isBanned: boolean) {
      return api.request<{ success: boolean; user: User; message: string }>(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        body: JSON.stringify({ isBanned }),
      });
    },

    async updateSettings(settings: Partial<SystemSettings>) {
      return api.request<{ success: boolean; settings: SystemSettings; message: string }>('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    },

    async getAuditLogs() {
      return api.request<{ logs: AuditLog[] }>('/api/admin/audit-logs');
    },
  },
};
