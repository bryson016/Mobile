import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = [
  'Roads_Transport', 'Water_Sanitation', 'Health_Services', 'Education_Support',
  'Public_Markets', 'Street_Lighting', 'Drainage_Flood_Control', 'Community_Facilities',
];

const STATUSES = ['Planning', 'Approved', 'Ongoing', 'Delayed', 'Completed', 'Cancelled'];

export default function CitizenProjectsScreen() {
  const { theme } = useAppTheme();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const result = await api.citizen.getProjects();
      setProjects(result.projects || []);
    } catch (e) {
      console.error('Failed to load projects', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        (p.projectName && p.projectName.toLowerCase().includes(term)) ||
        (p.projectCode && p.projectCode.toLowerCase().includes(term)) ||
        (p.location && p.location.toLowerCase().includes(term)) ||
        (p.village && p.village.toLowerCase().includes(term));

      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      const matchesStatus = !statusFilter || p.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [projects, searchTerm, categoryFilter, statusFilter]);

  const getProjectStatusColor = (status) => {
    if (status === 'Ongoing') return theme.info;
    if (status === 'Completed') return theme.success;
    if (status === 'Delayed') return theme.danger;
    if (status === 'Planning' || status === 'Approved') return theme.warning;
    return theme.textMuted;
  };

  return (
    <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <Text style={styles(responsive, theme).title}>Development Projects</Text>
        <Text style={styles(responsive, theme).subtitle}>Track constituency development projects and progress.</Text>
      </View>

      <View style={styles(responsive, theme).filters}>
        <TextInput
          style={styles(responsive, theme).searchInput}
          placeholder="Search by name, code, location..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor={theme.textMuted}
        />
        <View style={styles(responsive, theme).filterRow}>
          <View style={styles(responsive, theme).filterItem}>
            <Text style={styles(responsive, theme).filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles(responsive, theme).filterScroll}>
              <TouchableOpacity
                style={[styles(responsive, theme).filterChip, !categoryFilter && styles(responsive, theme).filterChipActive]}
                onPress={() => setCategoryFilter('')}
              >
                <Text style={[styles(responsive, theme).filterChipText, !categoryFilter && styles(responsive, theme).filterChipTextActive]}>All</Text>
              </TouchableOpacity>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles(responsive, theme).filterChip, categoryFilter === cat && styles(responsive, theme).filterChipActive]}
                  onPress={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
                >
                  <Text style={[styles(responsive, theme).filterChipText, categoryFilter === cat && styles(responsive, theme).filterChipTextActive]}>{cat.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles(responsive, theme).filterItem}>
            <Text style={styles(responsive, theme).filterLabel}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles(responsive, theme).filterScroll}>
              <TouchableOpacity
                style={[styles(responsive, theme).filterChip, !statusFilter && styles(responsive, theme).filterChipActive]}
                onPress={() => setStatusFilter('')}
              >
                <Text style={[styles(responsive, theme).filterChipText, !statusFilter && styles(responsive, theme).filterChipTextActive]}>All</Text>
              </TouchableOpacity>
              {STATUSES.map(status => (
                <TouchableOpacity
                  key={status}
                  style={[styles(responsive, theme).filterChip, statusFilter === status && styles(responsive, theme).filterChipActive]}
                  onPress={() => setStatusFilter(statusFilter === status ? '' : status)}
                >
                  <Text style={[styles(responsive, theme).filterChipText, statusFilter === status && styles(responsive, theme).filterChipTextActive]}>{status}</Text>
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
          <Ionicons name="folder-outline" size={48} color={theme.textMuted} />
          <Text style={styles(responsive, theme).emptyText}>No projects found</Text>
        </View>
      ) : (
        filtered.map(project => (
          <View key={project.id} style={styles(responsive, theme).card}>
            {project.coverImageUrl || (project.images && project.images.length > 0) ? (
              <Image
                source={{ uri: project.coverImageUrl || project.images[0].imageUrl }}
                style={styles(responsive, theme).cardImage}
                resizeMode="cover"
              />
            ) : null}
            <View style={styles(responsive, theme).cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles(responsive, theme).cardTitle}>{project.projectName}</Text>
                <Text style={styles(responsive, theme).cardSub}>{project.projectCode}</Text>
              </View>
              <View style={[styles(responsive, theme).badge, { backgroundColor: getProjectStatusColor(project.status) + '20' }]}>
                <Text style={[styles(responsive, theme).badgeText, { color: getProjectStatusColor(project.status) }]}>{project.status}</Text>
              </View>
            </View>
            <Text style={styles(responsive, theme).cardDesc} numberOfLines={2}>{project.description}</Text>

            <View style={styles(responsive, theme).progressContainer}>
              <View style={styles(responsive, theme).progressBarBg}>
                <View style={[styles(responsive, theme).progressBarFill, { width: `${project.progress}%` }]} />
              </View>
              <Text style={styles(responsive, theme).progressText}>{project.progress}% Complete</Text>
            </View>

            <View style={styles(responsive, theme).detailsGrid}>
              <View style={styles(responsive, theme).detailRow}>
                <Ionicons name="location-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).detailText}>{project.location || project.village || 'N/A'}</Text>
              </View>
              <View style={styles(responsive, theme).detailRow}>
                <Ionicons name="calendar-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).detailText}>
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'} - {project.expectedCompletion ? new Date(project.expectedCompletion).toLocaleDateString() : 'TBD'}
                </Text>
              </View>
              <View style={styles(responsive, theme).detailRow}>
                <Ionicons name="person-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).detailText}>{project.projectManagerName || 'TBD'}</Text>
              </View>
              <View style={styles(responsive, theme).detailRow}>
                <Ionicons name="cash-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).detailText}>KES {Number(project.budget).toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles(responsive, theme).cardFooter}>
              <View style={[styles(responsive, theme).categoryPill, { backgroundColor: theme.primary + '15' }]}>
                <Text style={[styles(responsive, theme).categoryPillText, { color: theme.primary }]}>{project.category?.replace('_', ' ')}</Text>
              </View>
              <View style={[styles(responsive, theme).priorityPill, { backgroundColor: theme.warning + '15' }]}>
                <Text style={[styles(responsive, theme).priorityPillText, { color: theme.warning }]}>{project.priority}</Text>
              </View>
            </View>
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
  card: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, marginHorizontal: responsive.horizontalPadding, marginBottom: 12, overflow: 'hidden', boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  cardImage: { width: '100%', height: 180 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16 },
  cardTitle: { fontSize: responsive.isSmallPhone ? 14 : 16, fontWeight: '700', color: theme.text, flex: 1 },
  cardSub: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  cardDesc: { fontSize: 14, color: theme.textSecondary, marginTop: 8, lineHeight: 20 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4, backgroundColor: theme.primary },
  progressText: { marginLeft: 8, fontSize: 12, fontWeight: '600', color: theme.text },
  detailsGrid: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.borderLight },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { marginLeft: 8, fontSize: 13, color: theme.textSecondary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.borderLight },
  categoryPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryPillText: { fontSize: 12, fontWeight: '600' },
  priorityPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  priorityPillText: { fontSize: 12, fontWeight: '600' },
});
