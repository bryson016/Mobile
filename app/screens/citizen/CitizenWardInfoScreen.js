import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function CitizenWardInfoScreen() {
  const { theme } = useAppTheme();

  const navigation = useNavigation();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    loadWardData();
  }, []);

  const loadWardData = async () => {
    try {
      const [projectsRes, eventsRes, programsRes] = await Promise.all([
        api.citizen.getProjects().catch(() => ({ projects: [] })),
        api.citizen.getEvents?.().catch(() => ({ events: [] })),
        api.citizen.getPrograms?.().catch(() => ({ programs: [] })),
      ]);
      setProjects(projectsRes.projects || []);
      setEvents(eventsRes.events || []);
      setPrograms(programsRes.programs || []);
    } catch (e) {
      console.error('Failed to load ward data', e);
    }
  };

  return (
    
      <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles(responsive, theme).backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
          <Text style={styles(responsive, theme).backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles(responsive, theme).title}>My Constituency</Text>
        <Text style={styles(responsive, theme).subtitle}>{user?.ward || 'Thika Township'} Constituency</Text>
      </View>

      <View style={styles(responsive, theme).statsRow}>
        <View style={[styles(responsive, theme).statCard, { borderLeftColor: theme.primary }]}>
          <Text style={styles(responsive, theme).statValue}>{projects.length}</Text>
          <Text style={styles(responsive, theme).statLabel}>Projects</Text>
        </View>
        <View style={[styles(responsive, theme).statCard, { borderLeftColor: theme.success }]}>
          <Text style={styles(responsive, theme).statValue}>{events.length}</Text>
          <Text style={styles(responsive, theme).statLabel}>Events</Text>
        </View>
        <View style={[styles(responsive, theme).statCard, { borderLeftColor: theme.info }]}>
          <Text style={styles(responsive, theme).statValue}>{programs.length}</Text>
          <Text style={styles(responsive, theme).statLabel}>Programs</Text>
        </View>
      </View>

      <View style={styles(responsive, theme).section}>
        <Text style={styles(responsive, theme).sectionTitle}>Active Projects</Text>
        {projects.length === 0 ? (
          <View style={styles(responsive, theme).empty}><Text style={styles(responsive, theme).emptyText}>No active projects</Text></View>
        ) : (
          projects.slice(0, 3).map((project, index) => (
            <View key={index} style={styles(responsive, theme).card}>
              <Text style={styles(responsive, theme).cardTitle}>{project.projectName}</Text>
              <Text style={styles(responsive, theme).cardSub}>{project.category} | {project.status}</Text>
              <View style={styles(responsive, theme).progressContainer}>
                <View style={styles(responsive, theme).progressBarBg}>
                  <View style={[styles(responsive, theme).progressBarFill, { width: `${project.progress}%`, backgroundColor: project.status === 'Completed' ? theme.success : theme.primary }]} />
                </View>
                <Text style={styles(responsive, theme).progressText}>{project.progress}%</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles(responsive, theme).section}>
        <Text style={styles(responsive, theme).sectionTitle}>Upcoming Events</Text>
        {events.length === 0 ? (
          <View style={styles(responsive, theme).empty}><Text style={styles(responsive, theme).emptyText}>No upcoming events</Text></View>
        ) : (
          events.slice(0, 3).map((event, index) => (
            <View key={index} style={styles(responsive, theme).eventCard}>
              <View style={[styles(responsive, theme).eventIcon, { backgroundColor: theme.success + '20' }]}>
                <Ionicons name="calendar" size={20} color={theme.success} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles(responsive, theme).eventTitle}>{event.title}</Text>
                <Text style={styles(responsive, theme).eventDetails}>{event.date} | {event.venue}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = (responsive, theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: responsive.verticalPadding, paddingTop: responsive.verticalPadding, backgroundColor: theme.surface },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backBtnText: { color: theme.text, fontSize: 16, marginLeft: 4 },
  title: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text, marginTop: 8 },
  subtitle: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: responsive.horizontalPadding, paddingVertical: responsive.verticalPadding, gap: 12 },
  statCard: { flex: 1, backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: responsive.cardPadding, borderLeftWidth: 4, alignItems: 'center', boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  statValue: { fontSize: 22, fontWeight: '700', color: theme.text },
  statLabel: { fontSize: 12, color: theme.textSecondary, marginTop: 4 },
  section: { marginBottom: 24, paddingHorizontal: responsive.horizontalPadding },
  sectionTitle: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text, marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { marginTop: 12, color: theme.textMuted, fontSize: 14 },
  card: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: 16, marginBottom: 12, boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  cardSub: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressText: { marginLeft: 8, fontSize: 12, fontWeight: '600', color: theme.text },
  eventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: 16, marginBottom: 12, boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  eventIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  eventTitle: { fontSize: 15, fontWeight: '600', color: theme.text },
  eventDetails: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
});
