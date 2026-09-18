import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useThrottledNavigate } from './useThrottledNavigate';
import { getCurrentDateLong } from '../../utils/dateUtils';

const ICON_BUTTON_SIZE = 44;

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/**
 * DashboardHeader — greeting, authenticated user's name, current date,
 * search / notification (with unread badge) / avatar controls.
 *
 * User identity comes from the existing AuthContext (no hard-coding).
 * Destinations reuse existing stack routes: Search, Alerts, Profile.
 * Navigation is throttled so rapid double-taps can't push duplicates.
 */
export const DashboardHeader = ({ unreadCount = 0 }: { unreadCount?: number }) => {
  const navigate = useThrottledNavigate();
  const { user } = useAuth();
  const { theme, responsive } = useAppTheme();
  const insets = useSafeAreaInsets();

  const displayName = useMemo(() => {
    const full = String(user?.fullName || '').trim();
    if (full) return full.split(/\s+/)[0];
    const username = String(user?.username || '').trim();
    return username || 'there';
  }, [user]);

  const today = useMemo(() => getCurrentDateLong(), []);
  const greeting = useMemo(() => getGreeting(), []);

  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.textBlock}>
        <Text
          style={[styles.greeting, { color: theme.textSecondary }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {greeting},
        </Text>
        <Text
          style={[styles.name, { color: theme.text, fontSize: responsive.isTablet ? 28 : 24 }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {displayName} 👋
        </Text>
        <Text
          style={[styles.date, { color: theme.textMuted }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {today}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => navigate('Search')}
          accessibilityLabel="Search"
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={20} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => navigate('Alerts')}
          accessibilityLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={20} color={theme.text} />
          {unreadCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: theme.danger }]}>
              <Text style={styles.badgeText} numberOfLines={1}>
                {badgeLabel}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.avatar, { backgroundColor: theme.primary }]}
          onPress={() => navigate('Profile')}
          accessibilityLabel="View profile"
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          activeOpacity={0.7}
        >
          <Text style={[styles.avatarText, { color: theme.white }]} numberOfLines={1}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  textBlock: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  name: {
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 8,
  },
  iconButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    borderRadius: ICON_BUTTON_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
  },
  avatar: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    borderRadius: ICON_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
