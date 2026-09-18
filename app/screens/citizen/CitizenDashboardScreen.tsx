import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { api } from '../../utils/api';
import { formatDateRelative } from '../../utils/dateUtils';
import { EmptyState, Skeleton } from '../../components/common';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { WelcomeHero } from '../../components/dashboard/WelcomeHero';
import { StatCard, ActionCard, ActivityItem } from '../../components/dashboard/DashboardWidgets';

/**
 * CitizenDashboardScreen — Home tab of the citizen app.
 *
 * Visual hierarchy: HEADER → COMPACT HERO → QUICK STATS →
 * QUICK ACTIONS → RECENT ACTIVITY.
 *
 * Data layer (unchanged architecture):
 * - identity: AuthContext (user.fullName / user.username) via DashboardHeader
 * - counts: GET /bursary/my-applications (Applications)
 * - saved/updates: safe local fallbacks — no backend fields exist for these yet
 * - recent activity: GET /citizen/notifications (UI-only, no backend change)
 * - destinations: existing stack routes (unchanged)
 */
interface QuickAction {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accentKey: 'primary' | 'success' | 'warning';
  route: string;
  params?: Record<string, unknown>;
}

interface ActivityRow {
  key: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  title: string;
  description: string;
  time: string;
  rawTime: number;
  status?: string;
  statusColor?: string;
  route: string;
  params?: Record<string, unknown>;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Report an Issue', icon: 'megaphone-outline', accentKey: 'primary', route: 'ReportIssue' },
  { label: 'Applications', icon: 'briefcase-outline', accentKey: 'success', route: 'Applications' },
  { label: 'Community', icon: 'people-outline', accentKey: 'warning', route: 'Community' },
];

export default function CitizenDashboardScreen() {
  const navigation = useNavigation<any>();
  const { theme, responsive, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationCount, setApplicationCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const [bursaryRes, notificationsRes] = await Promise.all([
          api.bursary.getMyApplications().catch((e: any) => {
            console.warn('[Dashboard] bursary/my-applications failed, using empty fallback:', e?.message);
            return { applications: [] as any[] };
          }),
          api.citizen.getNotifications().catch((e: any) => {
            console.warn('[Dashboard] citizen/notifications failed, using empty fallback:', e?.message);
            return { notifications: [] as any[], unreadCount: 0 };
          }),
        ]);

        const applications = bursaryRes?.applications || [];
        const notifications = notificationsRes?.notifications || [];
        const unread =
          typeof notificationsRes?.unreadCount === 'number'
            ? notificationsRes.unreadCount
            : notifications.filter((n: any) => !n.isRead).length;

        const rows: ActivityRow[] = [];

        notifications.slice(0, 5).forEach((n: any) => {
          const created = n.createdAt ? new Date(n.createdAt).getTime() : 0;
          rows.push({
            key: `notification-${n.id}`,
            icon: n.isRead ? 'notifications-outline' : 'notifications',
            iconColor: n.isRead ? theme.textMuted : theme.primary,
            title: n.title || 'Notification',
            description: n.message || 'You have a new update',
            time: formatDateRelative(n.createdAt) || 'Recently',
            rawTime: Number.isNaN(created) ? 0 : created,
            status: n.isRead ? undefined : 'New',
            statusColor: n.isRead ? undefined : theme.primary,
            route: 'Alerts',
          });
        });

        rows.sort((a, b) => b.rawTime - a.rawTime);

        if (mountedRef.current) {
          setApplicationCount(applications.length);
          setUnreadCount(unread);
          setActivity(rows.slice(0, 5));
        }
      } catch (e: any) {
        if (mountedRef.current) {
          setError(e?.message || 'Could not load dashboard data.');
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [theme]
  );

  useEffect(() => {
    loadDashboard(false);
  }, [loadDashboard]);

  const onRefresh = useCallback(() => {
    loadDashboard(true);
  }, [loadDashboard]);

  const goTo = useCallback(
    (action: QuickAction) => {
      if (action.route === 'Community') {
        navigation.navigate('CitizenTabs', { screen: action.route });
      } else {
        navigation.navigate(action.route, action.params);
      }
    },
    [navigation]
  );

  const goToActivity = useCallback(
    (item: ActivityRow) => {
      navigation.navigate(item.route, item.params);
    },
    [navigation]
  );

  const stats = useMemo(
    () => [
      { label: 'Applications', value: applicationCount, icon: 'briefcase-outline' as const, accent: theme.success },
      { label: 'Saved Jobs', value: 0, icon: 'bookmark-outline' as const, accent: theme.primary },
      { label: 'Updates', value: unreadCount, icon: 'notifications-outline' as const, accent: theme.warning },
    ],
    [applicationCount, unreadCount, theme]
  );

  const accentFor = useCallback((key: QuickAction['accentKey']) => theme[key], [theme]);

  const scrollBottomPadding = responsive.isTablet ? 120 : 96;
  const sectionTitleSize = responsive.isTablet ? 19 : 17;

  const renderStats = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.statsRow}>
          {[0, 1, 2, 3].map((k) => (
            <View
              key={k}
              style={[
                styles.statSkeleton,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Skeleton width={38} height={38} radius={11} />
              <Skeleton width={32} height={22} radius={6} />
              <Skeleton width={58} height={12} radius={6} />
            </View>
          ))}
        </View>
      );
    }
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsRow}
        style={styles.statsScroll}
      >
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <DashboardHeader unreadCount={unreadCount} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + scrollBottomPadding }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />
        }
      >
        <WelcomeHero />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: sectionTitleSize }]}>
              Quick Stats
            </Text>
          </View>
          {renderStats()}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: sectionTitleSize }]}>
              Quick Actions
            </Text>
          </View>
          <View style={styles.actionsGrid}>
            <View style={styles.actionsRow}>
              {QUICK_ACTIONS.slice(0, 2).map((a) => (
                <ActionCard
                  key={a.label}
                  label={a.label}
                  icon={a.icon}
                  accent={accentFor(a.accentKey)}
                  onPress={() => goTo(a)}
                />
              ))}
            </View>
            <View style={styles.actionsRow}>
              {QUICK_ACTIONS.slice(2, 4).map((a) => (
                <ActionCard
                  key={a.label}
                  label={a.label}
                  icon={a.icon}
                  accent={accentFor(a.accentKey)}
                  onPress={() => goTo(a)}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: sectionTitleSize }]}>
              Recent Activity
            </Text>
            {activity.length > 0 ? (
              <TouchableOpacity
                onPress={() => navigation.navigate('Alerts')}
                accessibilityLabel="View all activity"
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {loading && !refreshing ? (
            <View style={[styles.activityCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {[0, 1, 2].map((k) => (
                <View key={k} style={styles.loadingRow}>
                  <Skeleton width={40} height={40} radius={12} />
                  <View style={styles.loadingBody}>
                    <Skeleton width="70%" height={14} radius={6} />
                    <Skeleton width="90%" height={12} radius={6} />
                    <Skeleton width="40%" height={11} radius={6} />
                  </View>
                </View>
              ))}
            </View>
          ) : error && activity.length === 0 ? (
            <View style={[styles.activityCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <EmptyState
                icon="cloud-offline-outline"
                title="Couldn't load activity"
                subtitle={error}
                actionLabel="Try Again"
                onAction={() => loadDashboard(false)}
              />
            </View>
          ) : activity.length === 0 ? (
            <View style={[styles.activityCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <EmptyState
                icon="time-outline"
                title="No recent activity"
                subtitle="Updates about your cases and applications will appear here."
              />
            </View>
          ) : (
            <View style={[styles.activityCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {activity.map((item) => (
                <ActivityItem
                  key={item.key}
                  icon={item.icon}
                  iconColor={item.iconColor}
                  title={item.title}
                  description={item.description}
                  time={item.time}
                  status={item.status}
                  statusColor={item.statusColor}
                  onPress={() => goToActivity(item)}
                />
              ))}
            </View>
          )}
        </View>

        {isDark ? null : <View style={styles.bottomSpacer} />}
      </ScrollView>

      {loading && !refreshing ? (
        <View style={[styles.topLoader, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.topLoaderText, { color: theme.textSecondary }]}>Loading dashboard…</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 23,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  statsScroll: {
    marginHorizontal: -16,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  statSkeleton: {
    flex: 1,
    minWidth: 96,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  actionsGrid: {
    gap: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  activityCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 10,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 12,
  },
  loadingBody: {
    flex: 1,
    gap: 6,
  },
  bottomSpacer: {
    height: 4,
  },
  topLoader: {
    position: 'absolute',
    top: 76,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  topLoaderText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
