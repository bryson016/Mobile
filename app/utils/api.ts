import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { secureStorage } from './secureStorage';
import type {
  LoginResponse,
  DashboardData,
  Complaint,
  ComplaintDetail,
  Attachment,
  Project,
  Event,
  EventRegistration,
  Announcement,
  Notification,
  Program,
  ImpactStory,
  CitizenProfile,
  BursaryApplication,
  PublicParticipation,
} from '../types/api';

export const normalizeBaseUrl = (url: string): string => {
  return String(url || '').trim().replace(/\/+$/, '');
};

const resolveHostForPlatform = (host: string): string => {
  const h = String(host || '').trim();
  // Android emulator cannot reach host localhost / 127.0.0.1 directly.
  // 10.0.2.2 = host loopback for default Android emulator, 10.0.3.2 = Genymotion.
  if (Platform.OS === 'android' && (h === 'localhost' || h === '127.0.0.1' || h === '')) {
    return '10.0.2.2';
  }
  return h;
};

export const getApiBaseUrl = (): string => {
  const envUrl: string | undefined = (process.env as any)?.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl !== 'undefined' && String(envUrl).length > 0) {
    const normalized = normalizeBaseUrl(envUrl);
    console.log('[API CONFIG] Using EXPO_PUBLIC_API_URL:', normalized);
    return normalized;
  }

  const configuredUrl =
    (Constants.expoConfig?.extra?.apiUrl as string | undefined) ||
    (Constants.manifest as any)?.extra?.apiUrl;
  if (configuredUrl && String(configuredUrl).length > 0) {
    const normalized = normalizeBaseUrl(configuredUrl);
    try {
      const parsed = new URL(normalized);
      const fixedHost = resolveHostForPlatform(parsed.hostname);
      if (fixedHost !== parsed.hostname) {
        const fixed = `${parsed.protocol}//${fixedHost}${parsed.port ? `:${parsed.port}` : ''}${parsed.pathname}`;
        console.log('[API CONFIG] Using app.json extra.apiUrl (emulator host mapped):', fixed, 'original:', normalized);
        return normalizeBaseUrl(fixed);
      }
    } catch {
      // not a valid URL, fall through
    }
    console.log('[API CONFIG] Using app.json extra.apiUrl:', normalized);
    return normalized;
  }

  try {
    const debuggerHost =
      (Constants.expoConfig?.hostUri as string | undefined) ||
      (Constants.manifest as any)?.debuggerHost ||
      (Constants.manifest2 as any)?.extra?.expoGo?.debuggerHost;
    if (debuggerHost) {
      const rawHost = String(debuggerHost).split(':')[0].split(' ')[0];
      const host = resolveHostForPlatform(rawHost);
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        const derived = `http://${host}:5000/api`;
        console.log('[API CONFIG] Using derived dev-server URL:', derived, 'from debuggerHost:', debuggerHost);
        return derived;
      }
      if (Platform.OS === 'android') {
        const derived = `http://10.0.2.2:5000/api`;
        console.log('[API CONFIG] Using Android emulator fallback URL:', derived);
        return derived;
      }
    }
  } catch {
    // ignore
  }

  if (Platform.OS === 'android') {
    const fallback = 'http://10.0.2.2:5000/api';
    console.log('[API CONFIG] Using Android emulator fallback URL:', fallback);
    return fallback;
  }

  const fallback = 'http://localhost:5000/api';
  console.log('[API CONFIG] Using fallback URL:', fallback);
  return fallback;
};

export const API_BASE_URL = getApiBaseUrl();

export const getApiTroubleshooting = (): string => {
  return (
    `Could not reach server at ${API_BASE_URL}.\n\n` +
    `1. Backend running? (npm run dev on port 5000)\n` +
    `2. Same Wi-Fi for phone + PC? Update app.json extra.apiUrl / EXPO_PUBLIC_API_URL to your PC LAN IP.\n` +
    `3. Emulator? Use 10.0.2.2 instead of localhost.\n` +
    `4. Rebuild native app after changing app.json (npx expo prebuild / eas build).`
  );
};
const REQUEST_TIMEOUT_MS = 15000;
const NETWORK_RETRY_COUNT = 1;
const NETWORK_RETRY_DELAY_MS = 750;

function isTransientNetworkError(e: any): boolean {
  if (!e) return false;
  const msg = String(e?.message || '').toLowerCase();
  if (e?.name === 'AbortError') return false;
  return (
    msg.includes('network request failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('fetch failed') ||
    msg.includes('noroutetohostexception') ||
    msg.includes('host unreachable') ||
    msg.includes('network error')
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logApiRequest(method: string, url: string) {
  console.log('[API]', method.toUpperCase(), url);
}

function logApiError(method: string, url: string, error: any) {
  const code = error?.code || error?.name || 'UNKNOWN';
  const message = error?.message || 'Unknown error';
  const status = error?.status;
  const response = error?.data;

  const isTimeout = code === 'AbortError' || message.toLowerCase().includes('timed out');
  const isNetwork = code === 'NETWORK_ERROR' || message.toLowerCase().includes('network') || message.toLowerCase().includes('failed to fetch');
  const isAuth = status === 401 || message.toLowerCase().includes('session expired');
  const isForbidden = status === 403;
  const isNotFound = status === 404;
  const isServerError = status >= 500;

  console.log('[API ERROR]', {
    method: method.toUpperCase(),
    url,
    message,
    code,
    status,
    isTimeout,
    isNetwork,
    isAuth,
    isForbidden,
    isNotFound,
    isServerError,
    response,
  });
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = await secureStorage.getToken();
  console.log('[AUTH] access token exists:', !!token, 'length:', token?.length || 0);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log('[API AUTH] Authorization header attached: true');
  } else {
    console.log('[API AUTH] Authorization header attached: false');
  }

  return headers;
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const method = options.method || 'GET';
  const headers = await getAuthHeaders();
  const mergedHeaders = { ...headers, ...(options.headers || {}) };

  logApiRequest(method, url);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response | undefined;
  let lastError: any = null;
  for (let attempt = 0; attempt <= NETWORK_RETRY_COUNT; attempt++) {
    try {
      response = await fetch(url, {
        ...options,
        headers: mergedHeaders,
        signal: controller.signal,
      });
      lastError = null;
      break;
    } catch (e: any) {
      lastError = e;
      const isTimeout = e?.name === 'AbortError';
      if (isTimeout) break;
      if (attempt < NETWORK_RETRY_COUNT && isTransientNetworkError(e)) {
        console.warn(`[API] Transient network error, retrying in ${NETWORK_RETRY_DELAY_MS}ms (attempt ${attempt + 1}/${NETWORK_RETRY_COUNT})`);
        await delay(NETWORK_RETRY_DELAY_MS);
        continue;
      }
      break;
    }
  }
  if (!response) {
    clearTimeout(timeout);
    const isTimeout = lastError?.name === 'AbortError';
    console.log('[API ERROR DETAIL]', {
      name: lastError?.name,
      message: lastError?.message,
      stack: lastError?.stack,
      cause: (lastError as any)?.cause,
      url,
    });

    logApiError(method, url, {
      code: lastError?.name || 'FETCH_ERROR',
      message: isTimeout ? 'Request timed out' : 'Network error. Please check your connection.',
      status: null,
      data: null,
    });

    if (isTimeout) {
      const err: any = new Error(`Request timed out. Server not responding at ${API_BASE_URL}. Check backend + Wi-Fi.`);
      err.code = 'TIMEOUT';
      err.url = url;
      throw err;
    }
    const err: any = new Error(
      `Network error. Please check your connection.\nCould not reach ${API_BASE_URL}. Is backend running and phone on same Wi-Fi?`
    );
    err.code = 'NETWORK_ERROR';
    err.url = url;
    err.causeDetail = lastError?.message;
    throw err;
  }
  clearTimeout(timeout);

  const data = await response.json().catch(() => ({} as any));

  if (response.status === 401) {
    if (path !== '/auth/login') {
      console.warn('[API] 401 received — token may be invalid or expired. User can re-login.');
    }
    logApiError(method, url, {
      code: 'UNAUTHORIZED',
      message: 'Session expired. Please log in again.',
      status: 401,
      data,
    });
    const authError: any = new Error('Session expired. Please log in again.');
    authError.code = 'UNAUTHORIZED';
    authError.status = 401;
    authError.data = data;
    throw authError;
  }

  if (!response.ok) {
    let message = (data as any)?.message || 'Something went wrong.';
    if (response.status === 403) message = 'Access denied. You do not have permission.';
    if (response.status === 404) message = 'The requested resource was not found.';
    if (response.status >= 500) message = 'Server error. Please try again later.';

    const error: any = new Error(message);
    error.status = response.status;
    error.data = data;
    logApiError(method, url, error);
    throw error;
  }

  console.log('[API OK]', method.toUpperCase(), url, '->', response.status);

  return data as T;
}

async function multipart<T>(path: string, formData: FormData): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const method = 'POST';
  const token = await secureStorage.getToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  logApiRequest(method, url);

  const response = await fetch(url, {
    method,
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({} as any));

  if (response.status === 401) {
    if (path !== '/auth/login') {
      console.warn('[API] 401 received — token may be invalid or expired. User can re-login.');
    }
    logApiError(method, url, {
      code: 'UNAUTHORIZED',
      message: 'Session expired. Please log in again.',
      status: 401,
      data,
    });
    const authError: any = new Error('Session expired. Please log in again.');
    authError.code = 'UNAUTHORIZED';
    authError.status = 401;
    authError.data = data;
    throw authError;
  }

  if (!response.ok) {
    let message = (data as any)?.message || 'Something went wrong.';
    if (response.status === 403) message = 'Access denied. You do not have permission.';
    if (response.status === 404) message = 'The requested resource was not found.';
    if (response.status >= 500) message = 'Server error. Please try again later.';

    const error: any = new Error(message);
    error.status = response.status;
    error.data = data;
    logApiError(method, url, error);
    throw error;
  }

  console.log('[API OK]', method.toUpperCase(), url, '->', response.status);

  return data as T;
}

export const api = {
  testConnectivity: async (): Promise<{ ok: boolean; status?: number; data?: any; error?: string; testedUrl?: string }> => {
    const candidates = [`${API_BASE_URL}/health`, `${API_BASE_URL}/auth/health`, API_BASE_URL.replace(/\/api$/, '/health'), API_BASE_URL.replace(/\/api$/, '/')];
    let lastError = 'Unknown error';
    for (const url of candidates) {
      try {
        console.log('[API CONNECTIVITY] Testing:', url);
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(url, { method: 'GET', signal: controller.signal });
        clearTimeout(t);
        const data = await response.json().catch(() => ({}));
        console.log('[API CONNECTIVITY] Status:', response.status, 'for', url);
        // 404 means server IS reachable (just no health endpoint) -> treat as reachable
        if (response.status < 500) {
          return { ok: true, status: response.status, data, testedUrl: url };
        }
        lastError = `Server error ${response.status}`;
      } catch (e: any) {
        console.log('[API CONNECTIVITY] Error:', e?.name, e?.message, 'for', url);
        lastError = e?.message || 'Unknown error';
      }
    }
    return { ok: false, error: `${lastError} (tried ${API_BASE_URL})`, testedUrl: API_BASE_URL };
  },
  auth: {
    login: (payload: { username: string; password: string }): Promise<LoginResponse> =>
      request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    register: (payload: { username: string; fullName: string; password: string }): Promise<any> =>
      request<any>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  },
  citizen: {
    getDashboard: () => request<DashboardData>('/citizen/dashboard'),
    getProfile: () => request<{ user: any; citizen: CitizenProfile | null }>('/citizen/profile'),
    updateProfile: (payload: any) => request<any>('/citizen/profile', { method: 'PUT', body: JSON.stringify(payload) }),
    getComplaints: () => request<{ complaints: Complaint[] }>('/citizen/complaints'),
    getComplaintDetails: (id: number) => request<{ complaint: any }>('/citizen/complaints/' + id),
    submitComplaint: (payload: { category: string; priority: string; description: string; village?: string }) =>
      request<{ message: string; complaintId: number; complaintCode: string }>('/citizen/complaints', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getComplaintAttachments: (id: number) => request<{ attachments: Attachment[] }>('/citizen/complaints/' + id + '/attachments'),
    uploadComplaintAttachment: (id: number, formData: FormData) => multipart<{ message: string; attachment: Attachment }>('/citizen/complaints/' + id + '/attachments', formData),
    getProjects: () => request<{ projects: Project[] }>('/citizen/projects'),
    getMeetings: () => request<{ meetings: any[] }>('/citizen/meetings'),
    getAnnouncements: () => request<{ announcements: Announcement[] }>('/citizen/announcements'),
    getNotifications: () => request<{ notifications: Notification[]; unreadCount: number }>('/citizen/notifications'),
    markNotificationRead: (id: number) => request<any>('/citizen/notifications/' + id + '/read', { method: 'PUT' }),
    markAllNotificationsRead: () => request<any>('/citizen/notifications/read-all', { method: 'PUT' }),
    getEvents: () => request<{ events: Event[] }>('/citizen/events'),
    getApplications: () => request<{ applications: any[] }>('/citizen/applications'),
    getPrograms: () => request<{ programs: Program[] }>('/citizen/programs'),
    getPublicParticipation: () => request<{ publicParticipation: PublicParticipation[] }>('/citizen/public-participation'),
    submitFeedback: (payload: any) => request<any>('/citizen/feedback', { method: 'POST', body: JSON.stringify(payload) }),
    getChatMessages: () => request<{ messages: any[] }>('/citizen/chat/messages'),
    sendChatMessage: (message: string) => request<any>('/citizen/chat/messages', { method: 'POST', body: JSON.stringify({ message }) }),
    changePassword: (payload: { currentPassword: string; newPassword: string }) =>
      request<any>('/citizen/change-password', { method: 'POST', body: JSON.stringify(payload) }),
    getNotificationSettings: () => request<{ settings: any }>('/citizen/notification-settings'),
    updateNotificationSettings: (payload: { settings: any }) =>
      request<any>('/citizen/notification-settings', { method: 'PUT', body: JSON.stringify(payload) }),
    updateDeviceToken: (payload: { token: string; platform: string; deviceId?: string }) =>
      request<any>('/citizen/device-token', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  bursary: {
    apply: (formData: FormData) => multipart<{ message: string; application: any }>('/bursary/apply', formData),
    getMyApplications: () => request<{ applications: BursaryApplication[] }>('/bursary/my-applications'),
    getMyApplication: (id: number) => request<{ application: BursaryApplication }>('/bursary/my-applications/' + id),
    withdrawMyApplication: (id: number) => request<any>('/bursary/my-applications/' + id + '/withdraw', { method: 'PUT' }),
    deleteMyApplication: (id: number) => request<any>('/bursary/my-applications/' + id, { method: 'DELETE' }),
    getApplicationHistory: (id: number) => request<{ history: any[] }>('/bursary/my-applications/' + id + '/history'),
  },
  community: {
    getImpactStories: () => request<{ stories: ImpactStory[] }>('/community/impact-stories'),
    getImpactStoryBySlug: (slug: string) => request<{ story: ImpactStory }>('/community/impact-stories/' + slug),
    getPublicEvents: () => request<{ events: Event[] }>('/community/public-events'),
    registerForEvent: (id: number) => request<{ message: string }>('/community/events/' + id + '/register', { method: 'POST' }),
    getMyEventRegistrations: () => request<{ registrations: EventRegistration[] }>('/community/event-registrations'),
    cancelEventRegistration: (id: number) => request<any>('/community/events/' + id + '/register', { method: 'DELETE' }),
    getPublicPrograms: () => request<{ programs: Program[] }>('/community/public-programs'),
  },
};
