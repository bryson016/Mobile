import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CitizenAlertsScreen() {
  const { theme } = useAppTheme();

  const navigation = useNavigation();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const result = await api.citizen.getNotifications();
      if (result.notifications) {
        setNotifications(result.notifications);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.citizen.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await api.citizen.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('Failed to mark all notifications as read', e);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (notif) => {
    if (notif.title?.toLowerCase().includes('case')) return 'document-text';
    if (notif.title?.toLowerCase().includes('event')) return 'calendar';
    if (notif.title?.toLowerCase().includes('program')) return 'folder';
    if (notif.title?.toLowerCase().includes('application')) return 'checkbox';
    return 'notifications';
  };

  const getNotificationColor = (notif) => {
    if (notif.title?.toLowerCase().includes('resolved')) return theme.success;
    if (notif.title?.toLowerCase().includes('approved')) return theme.success;
    if (notif.title?.toLowerCase().includes('required')) return theme.warning;
    if (notif.title?.toLowerCase().includes('reminder')) return theme.info;
    return theme.primary;
  };

  if (loading) {
    return (
      <View style={styles(responsive, theme).centerContainer}>
        <Text style={styles(responsive, theme).loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    
      <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles(responsive, theme).backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
          <Text style={styles(responsive, theme).backBtnText}>Back</Text>
        </TouchableOpacity>
        <View style={styles(responsive, theme).headerCenter}>
          <Text style={styles(responsive, theme).title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles(responsive, theme).unreadPill}>
              <Text style={styles(responsive, theme).unreadPillText}>{unreadCount} new</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles(responsive, theme).markAllBtn} onPress={markAllAsRead} disabled={markingAll}>
            <Text style={styles(responsive, theme).markAllText}>{markingAll ? 'Marking...' : 'Mark all read'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles(responsive, theme).empty}>
          <View style={styles(responsive, theme).emptyIcon}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.textMuted} />
          </View>
          <Text style={styles(responsive, theme).emptyTitle}>No notifications yet</Text>
          <Text style={styles(responsive, theme).emptySubtitle}>We'll notify you when there's an update on your cases, applications, or events.</Text>
        </View>
      ) : (
        <View style={styles(responsive, theme).list}>
          {notifications.map((notif) => {
            const iconName = getNotificationIcon(notif);
            const iconColor = getNotificationColor(notif);
            return (
              <TouchableOpacity
                key={notif.id}
                style={[styles(responsive, theme).card, !notif.isRead && styles(responsive, theme).unreadCard]}
                onPress={() => markAsRead(notif.id)}
                activeOpacity={0.7}
              >
                <View style={[styles(responsive, theme).iconCircle, { backgroundColor: iconColor + '15' }]}>
                  <Ionicons name={iconName} size={20} color={iconColor} />
                </View>
                <View style={styles(responsive, theme).cardBody}>
                  <View style={styles(responsive, theme).cardHeader}>
                    <Text style={[styles(responsive, theme).cardTitle, !notif.isRead && styles(responsive, theme).unreadTitle]}>{notif.title}</Text>
                    {!notif.isRead && <View style={styles(responsive, theme).unreadDot} />}
                  </View>
                  <Text style={styles(responsive, theme).cardMessage}>{notif.message}</Text>
                  <Text style={styles(responsive, theme).cardTime}>{notif.createdAt ? new Date(notif.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = (responsive, theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { fontSize: 16, color: theme.textSecondary, marginTop: 16 },
  header: { padding: responsive.verticalPadding, paddingTop: responsive.verticalPadding, backgroundColor: theme.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  backBtnText: { color: theme.text, fontSize: 16, marginLeft: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 4 },
  unreadPill: { backgroundColor: theme.primary + '15', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
  unreadPillText: { fontSize: 11, fontWeight: '600', color: theme.primary },
  markAllBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  markAllText: { color: theme.primary, fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.chipBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 20 },
  list: { paddingHorizontal: responsive.horizontalPadding },
  card: { flexDirection: 'row', backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: responsive.cardPadding, marginBottom: 12, boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4, borderLeftWidth: 0 },
  unreadCard: { borderLeftWidth: 4, borderLeftColor: theme.primary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: theme.text, flex: 1 },
  unreadTitle: { fontWeight: '700' },
  cardMessage: { fontSize: 14, color: theme.textSecondary, lineHeight: 20, marginBottom: 6 },
  cardTime: { fontSize: 12, color: theme.textMuted },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.primary, marginLeft: 8 },
});
