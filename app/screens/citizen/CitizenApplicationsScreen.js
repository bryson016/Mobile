import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CitizenApplicationsScreen() {
  const { theme } = useAppTheme();

  const navigation = useNavigation();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const result = await api.citizen.getApplications();
      setApplications(result?.applications || []);
    } catch (e) {
      console.error('Failed to load applications', e);
      Alert.alert('Error', e.message || 'Failed to load applications');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return theme.success;
      case 'Rejected': return theme.danger;
      case 'Under Review': return theme.warning;
      case 'Documents Required': return theme.info;
      default: return theme.textMuted;
    }
  };

  return (
    
      <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles(responsive, theme).backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
          <Text style={styles(responsive, theme).backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles(responsive, theme).title}>My Applications</Text>
        <Text style={styles(responsive, theme).subtitle}>Track your program applications</Text>
      </View>

      {applications.length === 0 ? (
        <View style={styles(responsive, theme).empty}>
          <Ionicons name="document-text-outline" size={48} color={theme.textMuted} />
          <Text style={styles(responsive, theme).emptyText}>No applications yet</Text>
          <Text style={styles(responsive, theme).emptySubtext}>You haven't started any applications yet.</Text>
          <TouchableOpacity style={styles(responsive, theme).ctaBtn} onPress={() => navigation.navigate('BursaryApplication')}>
            <Text style={styles(responsive, theme).ctaBtnText}>Start an Application</Text>
            <Ionicons name="arrow-forward" size={16} color={theme.white} />
          </TouchableOpacity>
        </View>
      ) : (
        applications.map((app, index) => (
          <View key={index} style={styles(responsive, theme).card}>
            <View style={styles(responsive, theme).cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles(responsive, theme).cardTitle}>{app.programName || 'Program Application'}</Text>
                <Text style={styles(responsive, theme).appId}>App: {app.applicationCode || app.id}</Text>
              </View>
              <View style={[styles(responsive, theme).badge, { backgroundColor: getStatusColor(app.status) + '20' }]}>
                <Text style={[styles(responsive, theme).badgeText, { color: getStatusColor(app.status) }]}>{app.status}</Text>
              </View>
            </View>
            <Text style={styles(responsive, theme).cardSub}>Submitted: {app.submittedAt || app.date}</Text>
            {app.documents && app.documents.length > 0 && (
              <View style={styles(responsive, theme).docsRow}>
                <Ionicons name="document-attach-outline" size={16} color={theme.textMuted} />
                <Text style={styles(responsive, theme).docsText}>{app.documents.length} document(s) attached</Text>
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
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backBtnText: { color: theme.text, fontSize: 16, marginLeft: 4 },
  title: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text, marginTop: 8 },
  subtitle: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { marginTop: 12, color: theme.textMuted, fontSize: 14, fontWeight: '700' },
  emptySubtext: { marginTop: 6, color: theme.textSecondary, fontSize: 13, textAlign: 'center' },
  ctaBtn: { marginTop: 16, backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: responsive.buttonRadius, flexDirection: 'row', alignItems: 'center', gap: 6 },
  ctaBtnText: { color: theme.white, fontWeight: '600' },
  card: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, marginHorizontal: responsive.horizontalPadding, marginBottom: 12, padding: 16, boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  appId: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardSub: { fontSize: 13, color: theme.textSecondary, marginTop: 8 },
  docsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  docsText: { fontSize: 13, color: theme.textMuted, marginLeft: 6 },
});
