import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = [
  'General', 'Road_Maintenance', 'Water_Service', 'Health_Campaign',
  'Public_Participation', 'Community_Event', 'Emergency', 'Other',
];

export default function CitizenAnnouncementsScreen() {
  const { theme } = useAppTheme();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const result = await api.citizen.getAnnouncements();
      if (result.announcements && result.announcements.length > 0) {
        setAnnouncements(result.announcements);
      }
    } catch (e) {
      console.error('Failed to load announcements', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return announcements.filter(a => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        (a.title && a.title.toLowerCase().includes(term)) ||
        (a.description && a.description.toLowerCase().includes(term));

      const matchesCategory = !categoryFilter || a.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [announcements, searchTerm, categoryFilter]);

  return (
    <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <Text style={styles(responsive, theme).title}>Announcements</Text>
        <Text style={styles(responsive, theme).subtitle}>Stay informed with the latest constituency news and updates.</Text>
      </View>

      <View style={styles(responsive, theme).filters}>
        <TextInput
          style={styles(responsive, theme).searchInput}
          placeholder="Search by title or content..."
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
        </View>
      </View>

      {loading ? (
        <View style={styles(responsive, theme).center}><Text style={styles(responsive, theme).loadingText}>Loading...</Text></View>
      ) : filtered.length === 0 ? (
        <View style={styles(responsive, theme).empty}>
          <Ionicons name="megaphone-outline" size={48} color={theme.textMuted} />
          <Text style={styles(responsive, theme).emptyText}>No announcements found</Text>
        </View>
      ) : (
        filtered.map(ann => (
          <View key={ann.id} style={styles(responsive, theme).card}>
            <View style={styles(responsive, theme).cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles(responsive, theme).cardTitle}>{ann.title}</Text>
                <Text style={styles(responsive, theme).cardDate}>
                  {ann.publishedAt ? new Date(ann.publishedAt).toLocaleDateString() : new Date(ann.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={[styles(responsive, theme).categoryPill, { backgroundColor: theme.info + '15' }]}>
                <Text style={[styles(responsive, theme).categoryPillText, { color: theme.info }]}>{ann.category?.replace('_', ' ')}</Text>
              </View>
            </View>
            <Text style={styles(responsive, theme).cardContent}>{ann.description}</Text>
            {ann.ward && (
              <View style={styles(responsive, theme).wardRow}>
                <Ionicons name="location-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).wardText}>{ann.ward}</Text>
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
  card: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, marginHorizontal: responsive.horizontalPadding, marginBottom: 12, padding: responsive.cardPadding, boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: responsive.isSmallPhone ? 14 : 16, fontWeight: '700', color: theme.text, flex: 1 },
  cardDate: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  categoryPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryPillText: { fontSize: 12, fontWeight: '600' },
  cardContent: { fontSize: responsive.bodySize, color: theme.textSecondary, lineHeight: 20, marginTop: 12 },
  wardRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.borderLight },
  wardText: { marginLeft: 8, fontSize: 13, color: theme.textMuted },
});
