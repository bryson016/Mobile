import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CitizenNotificationsScreen({ navigation }: any) {
  const { theme } = useAppTheme();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);

  const loadNotifications = async () => {
    try {
      const result = await api.citizen.getNotifications();
      if (result.notifications) {
        setNotifications(result.notifications);
        setUnreadCount(result.unreadCount || result.notifications.filter((n: any) => !n.isRead).length);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
  }, []);

  useEffect(() => {
    loadNotifications();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.isRead);
    } else if (filter === 'read') {
      return notifications.filter((n) => n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.citizen.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.citizen.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Complaint_Update':
        return 'document-text';
      case 'Meeting_Reminder':
        return 'calendar';
      case 'Project_Update':
        return 'build';
      case 'Announcement':
        return 'megaphone';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'Complaint_Update':
        return theme.info;
      case 'Announcement':
        return theme.warning;
      case 'Meeting_Reminder':
        return theme.success;
      default:
        return theme.primary;
    }
  };

  return (
    <ScrollView
      style={styles(responsive, theme).container}
      contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />}
    >
      <View style={styles(responsive, theme).header}>
        <Text style={styles(responsive, theme).title}>Notifications</Text>
        <Text style={styles(responsive, theme).subtitle}>Stay updated with constituency alerts and messages.</Text>
      </View>

      <View style={styles(responsive, theme).actionsBar}>
        <View style={styles(responsive, theme).filterTabs}>
          <TouchableOpacity
            style={[styles(responsive, theme).filterTab, filter === 'all' && styles(responsive, theme).filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles(responsive, theme).filterTabText, filter === 'all' && styles(responsive, theme).filterTabTextActive]}>All ({notifications.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles(responsive, theme).filterTab, filter === 'unread' && styles(responsive, theme).filterTabActive]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles(responsive, theme).filterTabText, filter === 'unread' && styles(responsive, theme).filterTabTextActive]}>Unread ({unreadCount})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles(responsive, theme).filterTab, filter === 'read' && styles(responsive, theme).filterTabActive]}
            onPress={() => setFilter('read')}
          >
            <Text style={[styles(responsive, theme).filterTabText, filter === 'read' && styles(responsive, theme).filterTabTextActive]}>Read ({notifications.length - unreadCount})</Text>
          </TouchableOpacity>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles(responsive, theme).markAllBtn} onPress={handleMarkAllAsRead}>
            <Ionicons name="checkmark-done" size={18} color={theme.white} />
            <Text style={styles(responsive, theme).markAllBtnText}>Mark All as Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles(responsive, theme).center}>
          <Text style={styles(responsive, theme).loadingText}>Loading...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles(responsive, theme).empty}>
          <Ionicons name="notifications-off-outline" size={48} color={theme.textMuted} />
          <Text style={styles(responsive, theme).emptyText}>No notifications</Text>
        </View>
      ) : (
        filtered.map((notification) => {
          const iconName = getNotificationIcon(notification.type);
          const iconColor = getNotificationColor(notification.type);
          return (
            <TouchableOpacity
              key={notification.id}
              style={[styles(responsive, theme).card, !notification.isRead && styles(responsive, theme).unreadCard]}
              onPress={() => !notification.isRead && handleMarkAsRead(notification.id)}
            >
              <View style={[styles(responsive, theme).notificationIcon, { backgroundColor: iconColor + '15' }]}>
                <Ionicons name={iconName} size={20} color={iconColor} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles(responsive, theme).notificationHeader}>
                  <Text style={[styles(responsive, theme).cardTitle, !notification.isRead && styles(responsive, theme).unreadTitle]}>{notification.title}</Text>
                  {!notification.isRead && <View style={[styles(responsive, theme).unreadDot, { backgroundColor: theme.primary }]} />}
                </View>
                <Text style={styles(responsive, theme).cardMessage} numberOfLines={2}>{notification.message}</Text>
                <Text style={styles(responsive, theme).cardTime}>
                  {new Date(notification.createdAt).toLocaleDateString('en-KE', {
                    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </View>
              {!notification.isRead && (
                <TouchableOpacity style={styles(responsive, theme).markReadBtn} onPress={() => handleMarkAsRead(notification.id)}>
                  <Ionicons name="checkmark-done" size={16} color={theme.primary} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = (responsive, theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: responsive.verticalPadding, paddingTop: responsive.verticalPadding, backgroundColor: theme.surface },
  title: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 4 },
  actionsBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: responsive.horizontalPadding, paddingBottom: 12, flexWrap: 'wrap', gap: 12 },
  filterTabs: { flexDirection: 'row', gap: 8, flex: 1 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border },
  filterTabActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  filterTabText: { fontSize: 12, color: theme.textSecondary, fontWeight: '500' },
  filterTabTextActive: { color: theme.white, fontWeight: '600' },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  markAllBtnText: { color: theme.white, fontSize: 12, fontWeight: '600', marginLeft: 6 },
  center: { alignItems: 'center', paddingVertical: 48 },
  loadingText: { color: theme.textSecondary, marginTop: 16 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { marginTop: 12, color: theme.textMuted, fontSize: 14 },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: responsive.cardRadius,
    marginHorizontal: responsive.horizontalPadding,
    marginBottom: 12,
    padding: 16,
    elevation: 4,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  unreadCard: { borderLeftWidth: 4, borderLeftColor: theme.primary },
  notificationIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.chipBg, alignItems: 'center', justifyContent: 'center' },
  notificationHeader: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: theme.text, flex: 1 },
  unreadTitle: { fontWeight: '700' },
  cardMessage: { fontSize: 14, color: theme.textSecondary, lineHeight: 20, marginTop: 4 },
  cardTime: { fontSize: 12, color: theme.textMuted, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  markReadBtn: { padding: 8 },
});
