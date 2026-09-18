import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MEETING_TYPES = [
  'Women_Representative_Development_Committee', 'Public_Baraza', 'Budget_Review', 'Planning_Session',
  'Town_Hall', 'Project_Steering_Committee', 'Health_Sanitation_Forum',
  'Education_Committee', 'Security_Committee', 'Water_Environment_Committee',
];

export default function CitizenMeetingsScreen() {
  const { theme } = useAppTheme();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const result = await api.citizen.getMeetings();
      setMeetings(result.meetings || []);
    } catch (e) {
      console.error('Failed to load meetings', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return meetings.filter(m => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        (m.title && m.title.toLowerCase().includes(term)) ||
        (m.venue && m.venue.toLowerCase().includes(term)) ||
        (m.description && m.description.toLowerCase().includes(term));

      const matchesType = !typeFilter || m.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [meetings, searchTerm, typeFilter]);

  const getMeetingStatusColor = (status) => {
    if (status === 'Scheduled' || status === 'In_Progress') return theme.info;
    if (status === 'Completed') return theme.success;
    if (status === 'Cancelled') return theme.textMuted;
    return theme.warning;
  };

  return (
    <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <Text style={styles(responsive, theme).title}>Constituency Meetings</Text>
        <Text style={styles(responsive, theme).subtitle}>Stay updated with constituency meetings and events.</Text>
      </View>

      <View style={styles(responsive, theme).filters}>
        <TextInput
          style={styles(responsive, theme).searchInput}
          placeholder="Search by title, venue..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor={theme.textMuted}
        />
        <View style={styles(responsive, theme).filterRow}>
          <View style={styles(responsive, theme).filterItem}>
            <Text style={styles(responsive, theme).filterLabel}>Meeting Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles(responsive, theme).filterScroll}>
              <TouchableOpacity
                style={[styles(responsive, theme).filterChip, !typeFilter && styles(responsive, theme).filterChipActive]}
                onPress={() => setTypeFilter('')}
              >
                <Text style={[styles(responsive, theme).filterChipText, !typeFilter && styles(responsive, theme).filterChipTextActive]}>All</Text>
              </TouchableOpacity>
              {MEETING_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles(responsive, theme).filterChip, typeFilter === type && styles(responsive, theme).filterChipActive]}
                  onPress={() => setTypeFilter(typeFilter === type ? '' : type)}
                >
                  <Text style={[styles(responsive, theme).filterChipText, typeFilter === type && styles(responsive, theme).filterChipTextActive]}>{type.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles(responsive, theme).center}><Text style={styles(responsive, theme).loadingText}>Loading...</Text></View>
      ) : filtered.length === 0 ? (
        <View style={styles(responsive, theme).empty}>
          <Ionicons name="calendar-outline" size={48} color={theme.textMuted} />
          <Text style={styles(responsive, theme).emptyText}>No meetings found</Text>
        </View>
      ) : (
        filtered.map(meeting => (
          <View key={meeting.id} style={styles(responsive, theme).card}>
            <View style={styles(responsive, theme).cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles(responsive, theme).cardTitle}>{meeting.title}</Text>
                <View style={[styles(responsive, theme).typePill, { backgroundColor: theme.primary + '15' }]}>
                  <Text style={[styles(responsive, theme).typePillText, { color: theme.primary }]}>{meeting.type?.replace('_', ' ')}</Text>
                </View>
              </View>
              <View style={[styles(responsive, theme).badge, { backgroundColor: getMeetingStatusColor(meeting.status) + '20' }]}>
                <Text style={[styles(responsive, theme).badgeText, { color: getMeetingStatusColor(meeting.status) }]}>{meeting.status}</Text>
              </View>
            </View>

            {meeting.description && (
              <Text style={styles(responsive, theme).cardDesc} numberOfLines={2}>{meeting.description}</Text>
            )}

            <View style={styles(responsive, theme).detailsGrid}>
              <View style={styles(responsive, theme).detailRow}>
                <Ionicons name="calendar-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).detailText}>{meeting.date}</Text>
              </View>
              <View style={styles(responsive, theme).detailRow}>
                <Ionicons name="time-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).detailText}>{meeting.time} - {meeting.endTime}</Text>
              </View>
              <View style={styles(responsive, theme).detailRow}>
                <Ionicons name="location-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).detailText}>{meeting.venue}</Text>
              </View>
              <View style={styles(responsive, theme).detailRow}>
                <Ionicons name="people-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).detailText}>Expected: {meeting.expectedAttendance}</Text>
              </View>
            </View>

            {meeting.chairperson && (
              <View style={styles(responsive, theme).chairRow}>
                <Ionicons name="person-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).chairText}>Chairperson: {meeting.chairperson}</Text>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = (responsive, theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: responsive.verticalPadding, paddingTop: responsive.verticalPadding, backgroundColor: theme.surface },
  title: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 4 },
  filters: { paddingHorizontal: responsive.horizontalPadding, paddingBottom: 12 },
  searchInput: { backgroundColor: theme.surface, borderRadius: responsive.buttonRadius, padding: responsive.inputPadding, fontSize: 14, borderWidth: 1, borderColor: theme.border, color: theme.text },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  filterItem: { flex: 1, minWidth: '45%' },
  filterLabel: { fontSize: 12, color: theme.textMuted, marginBottom: 6, fontWeight: '600' },
  filterScroll: { flexDirection: 'row', flexWrap: 'nowrap' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: responsive.chipRadius, backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border, marginRight: 8 },
  filterChipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  filterChipText: { fontSize: 12, color: theme.textSecondary, whiteSpace: 'nowrap' },
  filterChipTextActive: { color: theme.white, fontWeight: '600' },
  center: { alignItems: 'center', paddingVertical: 48 },
  loadingText: { color: theme.textSecondary, marginTop: 16 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { marginTop: 12, color: theme.textMuted, fontSize: 14 },
  card: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, marginHorizontal: responsive.horizontalPadding, marginBottom: 12, padding: 16, boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: responsive.isSmallPhone ? 14 : 16, fontWeight: '600', color: theme.text, flex: 1 },
  typePill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 6 },
  typePillText: { fontSize: 12, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardDesc: { fontSize: 14, color: theme.textSecondary, marginTop: 8, lineHeight: 20 },
  detailsGrid: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.borderLight },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { marginLeft: 8, fontSize: 13, color: theme.textSecondary },
  chairRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  chairText: { fontSize: 13, color: theme.textSecondary },
});
