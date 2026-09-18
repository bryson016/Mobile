import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CitizenPublicParticipationScreen() {
  const { theme } = useAppTheme();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const result = await api.citizen.getPublicParticipation();
      setItems(result.publicParticipation || []);
    } catch (e) {
      console.error('Failed to load public participation', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Open') return theme.success;
    if (status === 'Closed') return theme.textMuted;
    return theme.warning;
  };

  return (
    
      <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <Text style={styles(responsive, theme).title}>Public Participation</Text>
        <Text style={styles(responsive, theme).subtitle}>Engage with constituency development initiatives</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles(responsive, theme).empty}>
          <Ionicons name="people-outline" size={48} color={theme.textMuted} />
          <Text style={styles(responsive, theme).emptyText}>No active public participation items</Text>
        </View>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles(responsive, theme).card}>
            <View style={styles(responsive, theme).cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles(responsive, theme).cardTitle}>{item.title}</Text>
                <Text style={styles(responsive, theme).cardSub} numberOfLines={2}>{item.description}</Text>
              </View>
              <View style={[styles(responsive, theme).badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles(responsive, theme).badgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
              </View>
            </View>
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
    </ScrollView>
  );
}

const styles = (responsive, theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: responsive.verticalPadding, paddingTop: responsive.verticalPadding, backgroundColor: theme.surface },
  title: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 4 },
  card: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, marginHorizontal: responsive.horizontalPadding, marginBottom: 12, padding: responsive.cardPadding, boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: responsive.isSmallPhone ? 14 : 16, fontWeight: '700', color: theme.text },
  cardSub: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  detailText: { fontSize: 13, color: theme.textSecondary, marginLeft: 8 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { marginTop: 12, color: theme.textMuted, fontSize: 14 },
});
