import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CitizenCommunityScreen() {
  const navigation = useNavigation();
  const { theme, responsive } = useAppTheme();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [publicParticipation, setPublicParticipation] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadCommunityData = async () => {
    try {
      setError(null);
      const safeGet = (promise, key) =>
        Promise.resolve(promise).catch((e) => ({ [key]: [], error: e }));

      const [projectsRes, eventsRes, annRes, ppRes] = await Promise.all([
        safeGet(api.citizen.getProjects?.(), 'projects'),
        safeGet(api.citizen.getEvents?.(), 'events'),
        safeGet(api.citizen.getAnnouncements?.(), 'announcements'),
        safeGet(api.citizen.getPublicParticipation?.(), 'publicParticipation'),
      ]);

      const failed = [projectsRes, eventsRes, annRes, ppRes].filter((r) => r && r.error);
      if (failed.length) {
        console.warn('[Community] some sections failed to load:', failed.map((f) => f.error?.message || f.error));
      }

      setProjects(projectsRes?.projects || []);
      setEvents(eventsRes?.events || []);
      setAnnouncements(annRes?.announcements || []);
      setPublicParticipation(ppRes?.publicParticipation || []);
    } catch (e) {
      console.error('Failed to load community data', e);
      setError(e.message || 'Failed to load community data');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCommunityData();
  }, []);

  const sections = [
    { title: 'Development Projects', count: projects.length, icon: 'business', color: theme.primary, screen: 'Projects' },
    { title: 'Events', count: events.length, icon: 'calendar', color: theme.success, screen: 'Events' },
    { title: 'Announcements', count: announcements.length, icon: 'megaphone', color: theme.warning, screen: 'Announcements' },
    { title: 'Public Participation', count: publicParticipation.length, icon: 'people', color: theme.info, screen: 'PublicParticipation' },
  ];

  if (error && !refreshing) {
    return (
      <ScrollView style={styles(responsive, theme).container} contentContainerStyle={styles(responsive, theme).centerContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />}>
        <Ionicons name="alert-circle-outline" size={responsive.isTablet ? 56 : 48} color={theme.textMuted} />
        <Text style={styles(responsive, theme).errorTitle}>Unable to load community data</Text>
        <Text style={styles(responsive, theme).errorText}>{error}</Text>
        <TouchableOpacity style={styles(responsive, theme).retryBtn} onPress={loadCommunityData}>
          <Text style={styles(responsive, theme).retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles(responsive, theme).container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />}
    >
      <View style={[styles(responsive, theme).content, { paddingBottom: scrollBottomPadding }]}>
        <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
          <Text style={styles(responsive, theme).title}>Community</Text>
          <Text style={styles(responsive, theme).subtitle}>Stay connected with your constituency</Text>
        </View>

      <View style={styles(responsive, theme).section}>
        <Text style={styles(responsive, theme).sectionTitle}>Browse</Text>
        <View style={styles(responsive, theme).grid}>
          {sections.map((section, index) => (
            <TouchableOpacity key={index} style={styles(responsive, theme).gridItem} onPress={() => section.screen && navigation.navigate(section.screen)}>
              <View style={[styles(responsive, theme).iconCircle, { backgroundColor: section.color + '20' }]}>
                <Ionicons name={section.icon} size={24} color={section.color} />
              </View>
              <Text style={styles(responsive, theme).gridTitle}>{section.title}</Text>
              <Text style={styles(responsive, theme).gridCount}>{section.count} items</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles(responsive, theme).section}>
        <Text style={styles(responsive, theme).sectionTitle}>Recent Announcements</Text>
        {announcements.length === 0 ? (
          <View style={styles(responsive, theme).empty}><Text style={styles(responsive, theme).emptyText}>No announcements yet</Text></View>
        ) : (
          announcements.slice(0, 3).map((ann, index) => (
            <View key={index} style={styles(responsive, theme).card}>
              <Text style={styles(responsive, theme).cardTitle}>{ann.title}</Text>
              <Text style={styles(responsive, theme).cardSub} numberOfLines={2}>{ann.description}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles(responsive, theme).section}>
        <Text style={styles(responsive, theme).sectionTitle}>Development Projects</Text>
        {projects.length === 0 ? (
          <View style={styles(responsive, theme).empty}><Text style={styles(responsive, theme).emptyText}>No projects yet</Text></View>
        ) : (
          projects.slice(0, 3).map((project, index) => (
            <View key={index} style={styles(responsive, theme).card}>
              <View style={styles(responsive, theme).cardHeader}>
                <Text style={styles(responsive, theme).cardTitle}>{project.projectName}</Text>
                <View style={[styles(responsive, theme).badge, { backgroundColor: project.status === 'Ongoing' || project.status === 'In Progress' ? theme.info + '20' : theme.success + '20' }]}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: project.status === 'Ongoing' || project.status === 'In Progress' ? theme.info : theme.success }}>{project.status}</Text>
                </View>
              </View>
              <Text style={styles(responsive, theme).cardSub}>{project.category} | {project.ward}</Text>
              <View style={styles(responsive, theme).progressContainer}>
                <View style={styles(responsive, theme).progressBarBg}>
                  <View style={{ width: `${project.progress}%`, backgroundColor: project.status === 'Completed' ? theme.success : theme.primary, ...styles(responsive, theme).progressBarFill }} />
                </View>
                <Text style={styles(responsive, theme).progressText}>{project.progress}%</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles(responsive, theme).section}>
        <Text style={styles(responsive, theme).sectionTitle}>Public Participation</Text>
        {publicParticipation.length === 0 ? (
          <View style={styles(responsive, theme).empty}><Text style={styles(responsive, theme).emptyText}>No active public participation items</Text></View>
        ) : (
          publicParticipation.slice(0, 3).map((item, index) => (
            <View key={index} style={styles(responsive, theme).card}>
              <View style={styles(responsive, theme).cardHeader}>
                <Text style={styles(responsive, theme).cardTitle}>{item.title}</Text>
                <View style={[styles(responsive, theme).badge, { backgroundColor: item.status === 'Open' ? theme.success + '20' : theme.warning + '20' }]}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: item.status === 'Open' ? theme.success : theme.warning }}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles(responsive, theme).cardSub} numberOfLines={2}>{item.description}</Text>
              <View style={styles(responsive, theme).detailRow}>
                <Ionicons name="calendar-outline" size={16} color={theme.textMuted} />
                <Text style={styles(responsive, theme).detailText}>{item.startDate} - {item.endDate}</Text>
              </View>
              {item.location ? (
                <View style={styles(responsive, theme).detailRow}>
                  <Ionicons name="location-outline" size={16} color={theme.textMuted} />
                  <Text style={styles(responsive, theme).detailText}>{item.location}</Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </View>
      </View>
    </ScrollView>
  );
}

const styles = (responsive, theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { maxWidth: responsive.maxContentWidth, width: '100%', alignSelf: 'center' },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: responsive.horizontalPadding },
  errorTitle: { fontSize: responsive.titleSize, fontWeight: '700', color: theme.text, marginTop: 16 },
  errorText: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 8, textAlign: 'center' },
  retryBtn: { marginTop: 16, backgroundColor: theme.primary, paddingHorizontal: responsive.buttonPaddingHorizontal, paddingVertical: responsive.buttonPaddingVertical, borderRadius: responsive.buttonRadius },
  retryBtnText: { color: theme.white, fontWeight: '600' },
  header: { padding: responsive.verticalPadding, paddingTop: responsive.verticalPadding, backgroundColor: theme.surface },
  title: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 4 },
  section: { marginBottom: responsive.isTablet ? 32 : 24, paddingHorizontal: responsive.horizontalPadding },
  sectionTitle: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '48%', backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: responsive.cardPadding, alignItems: 'center', elevation: 4 },
  iconCircle: { width: responsive.isTablet ? 56 : 48, height: responsive.isTablet ? 56 : 48, borderRadius: responsive.isTablet ? 28 : 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  gridTitle: { fontSize: responsive.isTablet ? 15 : 14, fontWeight: '600', color: theme.text, textAlign: 'center' },
  gridCount: { fontSize: 12, color: theme.textMuted, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { marginTop: 12, color: theme.textMuted, fontSize: 14 },
  card: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: responsive.cardPadding, marginBottom: 12, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: responsive.isTablet ? 16 : 16, fontWeight: '700', color: theme.text },
  cardSub: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressText: { marginLeft: 8, fontSize: 12, fontWeight: '600', color: theme.text },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  detailText: { fontSize: responsive.bodySize, color: theme.textSecondary, marginLeft: 8 },
});
