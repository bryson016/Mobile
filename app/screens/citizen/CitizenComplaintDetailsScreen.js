import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CitizenComplaintDetailsScreen({ route, navigation }) {
  const { theme } = useAppTheme();

  const { complaintId } = route.params || {};
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);

  useEffect(() => {
    loadComplaint();
  }, [complaintId]);

  const loadComplaint = async () => {
    try {
      const result = await api.citizen.getComplaintDetails(complaintId);
      if (result.complaint) {
        setComplaint({
          ...result.complaint,
          communicationHistory: result.complaint.communications || [],
        });
      }
    } catch (e) {
      console.error('Failed to load complaint', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Open' || status === 'Assigned') return theme.info;
    if (status === 'In Progress') return theme.warning;
    if (status === 'Resolved' || status === 'Closed') return theme.success;
    return theme.textMuted;
  };

  if (loading) {
    return (
      <View style={styles(responsive, theme).centerContainer}>
        <Text style={styles(responsive, theme).loadingText}>Loading complaint details...</Text>
      </View>
    );
  }

  if (!complaint) {
    return (
      
      <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
        <View style={styles(responsive, theme).centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.textMuted} />
          <Text style={styles(responsive, theme).errorTitle}>Complaint Not Found</Text>
          <Text style={styles(responsive, theme).errorText}>The complaint you are looking for does not exist.</Text>
          <TouchableOpacity style={styles(responsive, theme).backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles(responsive, theme).backBtnText}>Back to Complaints</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles(responsive, theme).container} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles(responsive, theme).backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
          <Text style={styles(responsive, theme).backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles(responsive, theme).title}>Complaint Details</Text>
        <View style={[styles(responsive, theme).statusBadge, { backgroundColor: getStatusColor(complaint.status) + '20' }]}>
          <Text style={[styles(responsive, theme).statusText, { color: getStatusColor(complaint.status) }]}>{complaint.status}</Text>
        </View>
      </View>

      <View style={styles(responsive, theme).section}>
        <Text style={styles(responsive, theme).sectionTitle}>Information</Text>
        <View style={styles(responsive, theme).detailRow}>
          <Text style={styles(responsive, theme).detailLabel}>Complaint Code</Text>
          <Text style={styles(responsive, theme).detailValue}>{complaint.id}</Text>
        </View>
        <View style={styles(responsive, theme).detailRow}>
          <Text style={styles(responsive, theme).detailLabel}>Category</Text>
          <Text style={styles(responsive, theme).detailValue}>{complaint.category}</Text>
        </View>
        <View style={styles(responsive, theme).detailRow}>
          <Text style={styles(responsive, theme).detailLabel}>Priority</Text>
          <Text style={styles(responsive, theme).detailValue}>{complaint.priority}</Text>
        </View>
        <View style={styles(responsive, theme).detailRow}>
          <Text style={styles(responsive, theme).detailLabel}>Village</Text>
          <Text style={styles(responsive, theme).detailValue}>{complaint.village}</Text>
        </View>
        <View style={styles(responsive, theme).detailRow}>
          <Text style={styles(responsive, theme).detailLabel}>Date Reported</Text>
          <Text style={styles(responsive, theme).detailValue}>{complaint.dateReported}</Text>
        </View>
        <View style={styles(responsive, theme).detailRow}>
          <Text style={styles(responsive, theme).detailLabel}>Last Updated</Text>
          <Text style={styles(responsive, theme).detailValue}>{complaint.lastUpdated}</Text>
        </View>
      </View>

      <View style={styles(responsive, theme).section}>
        <Text style={styles(responsive, theme).sectionTitle}>Description</Text>
        <Text style={styles(responsive, theme).description}>{complaint.description}</Text>
      </View>

      {complaint.assignedOfficer ? (
        <View style={styles(responsive, theme).section}>
          <Text style={styles(responsive, theme).sectionTitle}>Assigned Officer</Text>
          <View style={styles(responsive, theme).officerRow}>
            <Ionicons name="person-outline" size={20} color={theme.textSecondary} />
            <Text style={styles(responsive, theme).officerText}>{complaint.assignedOfficer}</Text>
          </View>
        </View>
      ) : null}

      {complaint.resolutionNotes ? (
        <View style={styles(responsive, theme).section}>
          <Text style={styles(responsive, theme).sectionTitle}>Resolution</Text>
          <Text style={styles(responsive, theme).description}>{complaint.resolutionNotes}</Text>
        </View>
      ) : null}

      {complaint.communicationHistory && complaint.communicationHistory.length > 0 ? (
        <View style={styles(responsive, theme).section}>
          <Text style={styles(responsive, theme).sectionTitle}>Updates & Communications</Text>
          {complaint.communicationHistory.map((comm, index) => (
            <View key={index} style={styles(responsive, theme).commItem}>
              <View style={styles(responsive, theme).commHeader}>
                <Text style={styles(responsive, theme).commAction}>{comm.action || 'Update'}</Text>
                <Text style={styles(responsive, theme).commDate}>{comm.date || ''}</Text>
              </View>
              <Text style={styles(responsive, theme).commNotes}>{comm.notes || ''}</Text>
              {comm.performedBy ? (
                <Text style={styles(responsive, theme).commPerformed}>By: {comm.performedBy}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = (responsive, theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { fontSize: 16, color: theme.textSecondary, marginTop: 16 },
  errorTitle: { fontSize: responsive.isSmallPhone ? 16 : 18, fontWeight: '700', color: theme.text, marginTop: 16 },
  errorText: { fontSize: 14, color: theme.textSecondary, marginTop: 8, textAlign: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, minHeight: 44 },
  backBtnText: { color: theme.text, fontSize: 16, marginLeft: 4 },
  header: { padding: responsive.verticalPadding, paddingTop: responsive.verticalPadding, backgroundColor: theme.surface },
  title: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text, marginTop: 12 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  section: { backgroundColor: theme.surface, marginHorizontal: responsive.horizontalPadding, marginTop: 16, padding: responsive.cardPadding, borderRadius: responsive.cardRadius },
  sectionTitle: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.borderLight },
  detailLabel: { fontSize: 14, color: theme.textSecondary },
  detailValue: { fontSize: 14, fontWeight: '600', color: theme.text },
  description: { fontSize: 14, color: theme.text, lineHeight: 20 },
  officerRow: { flexDirection: 'row', alignItems: 'center' },
  officerText: { fontSize: 14, color: theme.text, marginLeft: 8 },
  commItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderLight },
  commHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commAction: { fontSize: 14, fontWeight: '600', color: theme.text },
  commDate: { fontSize: 12, color: theme.textMuted },
  commNotes: { fontSize: 14, color: theme.textSecondary, lineHeight: 20 },
  commPerformed: { fontSize: 12, color: theme.textMuted, marginTop: 4 },
});
