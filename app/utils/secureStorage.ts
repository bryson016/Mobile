import { Platform } from 'react-native';

const TOKEN_KEY = 'wrms_auth_token';
const USER_KEY = 'wrms_user';
const THEME_KEY = 'wrms_theme_mode';
const DRAFT_KEY = 'wrms_bursary_draft';

interface StoredUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
  ward?: string;
  token: string;
}

let SecureStore: any = null;
let AsyncStorage: any = null;

try {
  SecureStore = require('expo-secure-store');
} catch (e) {
  console.warn('expo-secure-store not available:', e);
}

try {
  AsyncStorage = require('@react-native-async-storage/async-storage');
} catch (e) {
  console.warn('@react-native-async-storage/async-storage not available:', e);
}

async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (!AsyncStorage || typeof AsyncStorage.setItem !== 'function') {
        console.warn('AsyncStorage.setItem not available on web');
        return;
      }
      await AsyncStorage.setItem(key, value);
    } else {
      if (SecureStore && typeof SecureStore.setItemAsync === 'function') {
        try {
          await SecureStore.setItemAsync(key, value);
          return;
        } catch (e) {
          console.warn('SecureStore.setItemAsync failed, falling back to AsyncStorage:', e);
        }
      }
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(key, value);
      } else {
        console.warn('No storage backend available for setItem');
      }
    }
  } catch (e) {
    console.warn('setSecureItem failed for key:', key, e);
  }
}

async function getSecureItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (!AsyncStorage || typeof AsyncStorage.getItem !== 'function') {
        console.warn('AsyncStorage.getItem not available on web');
        return null;
      }
      return await AsyncStorage.getItem(key);
    }
    if (SecureStore && typeof SecureStore.getItemAsync === 'function') {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (e) {
        console.warn('SecureStore.getItemAsync failed, falling back to AsyncStorage:', e);
      }
    }
    if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
      return await AsyncStorage.getItem(key);
    }
    console.warn('No storage backend available for getItem');
    return null;
  } catch (e) {
    console.warn('getSecureItem failed for key:', key, e);
    return null;
  }
}

async function removeSecureItem(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (!AsyncStorage || typeof AsyncStorage.removeItem !== 'function') {
        console.warn('AsyncStorage.removeItem not available on web');
        return;
      }
      await AsyncStorage.removeItem(key);
    } else {
      if (SecureStore && typeof SecureStore.deleteItemAsync === 'function') {
        try {
          await SecureStore.deleteItemAsync(key);
          return;
        } catch (e) {
          console.warn('SecureStore.deleteItemAsync failed, falling back to AsyncStorage:', e);
        }
      }
      if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
        await AsyncStorage.removeItem(key);
      } else {
        console.warn('No storage backend available for removeItem');
      }
    }
  } catch (e) {
    console.warn('removeSecureItem failed for key:', key, e);
  }
}

export const secureStorage = {
  getToken: async (): Promise<string | null> => getSecureItem(TOKEN_KEY),
  setToken: async (token: string): Promise<void> => setSecureItem(TOKEN_KEY, token),
  removeToken: async (): Promise<void> => removeSecureItem(TOKEN_KEY),

  getUser: async (): Promise<StoredUser | null> => {
    const data = await getSecureItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  setUser: async (user: StoredUser): Promise<void> => setSecureItem(USER_KEY, JSON.stringify(user)),
  removeUser: async (): Promise<void> => removeSecureItem(USER_KEY),

  getThemeMode: async (): Promise<string | null> => getSecureItem(THEME_KEY),
  setThemeMode: async (mode: string): Promise<void> => setSecureItem(THEME_KEY, mode),

  getBursaryDraft: async (): Promise<string | null> => getSecureItem(DRAFT_KEY),
  setBursaryDraft: async (draft: string): Promise<void> => setSecureItem(DRAFT_KEY, draft),
  removeBursaryDraft: async (): Promise<void> => removeSecureItem(DRAFT_KEY),

  setItem: async (key: string, value: string): Promise<void> => setSecureItem(key, value),
  getItem: async (key: string): Promise<string | null> => getSecureItem(key),
  removeItem: async (key: string): Promise<void> => removeSecureItem(key),
};
