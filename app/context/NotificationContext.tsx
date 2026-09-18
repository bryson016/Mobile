import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';
import { secureStorage } from '../utils/secureStorage';

const isExpoGo = Constants.appOwnership === 'expo';

let Notifications: any = null;
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
  } catch (e) {
    console.warn('expo-notifications not available:', e);
  }
}

interface NotificationContextValue {
  registerForNotifications: () => Promise<void>;
  expoPushToken: string | null;
  supportsRemoteNotifications: boolean;
}

const NotificationContext = createContext<NotificationContextValue>({
  registerForNotifications: async () => {},
  expoPushToken: null,
  supportsRemoteNotifications: false,
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Notifications) {
    console.warn('expo-notifications module not loaded.');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Notifications Disabled',
        'Enable notifications from your device settings to receive important updates.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings();
            },
          },
        ]
      );
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        description: 'Default notification channel',
        importance: Notifications.AndroidImportance.MAX,
        sound: undefined,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#B6FF2E',
      });
    }

    if (isExpoGo) {
      console.log('Running in Expo Go. Local notifications are supported, but remote push requires a development build.');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData?.data || null;
    return token;
  } catch (error: any) {
    if (error?.message?.includes('expo-notifications') || error?.message?.includes('remote')) {
      console.warn('Remote push notifications are not available in this build:', error.message);
      return null;
    }
    console.error('Failed to register for push notifications:', error);
    return null;
  }
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = React.useState<string | null>(null);

  useEffect(() => {
    if (!Notifications) {
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  const registerForNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        if (secureStorage) {
          try {
            await secureStorage.setItem('expo_push_token', token);
          } catch (storageError) {
            console.warn('Failed to save push token to secureStorage:', storageError);
          }
        } else {
          console.warn('secureStorage is not available');
        }
        if (user?.id) {
          try {
            await api.citizen.updateDeviceToken({ token, platform: Platform.OS });
          } catch (e) {
            console.warn('Failed to send push token to backend:', e);
          }
        }
      }
    } catch (error) {
      console.warn('Notification registration failed:', error);
    }
  };

  useEffect(() => {
    if (user && Notifications) {
      registerForNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!Notifications) {
      return;
    }

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification?.request?.content?.data;
      const screen = data?.screen as string | undefined;
      if (screen) {
        console.log('Notification tapped, target screen:', screen);
      }
    });

    const foregroundListener = Notifications.addNotificationReceivedListener(() => {
      // Refresh notification badge / data when in foreground
    });

    return () => {
      responseListener.remove();
      foregroundListener.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ registerForNotifications, expoPushToken, supportsRemoteNotifications: !isExpoGo }}>
      {children}
    </NotificationContext.Provider>
  );
};
