import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { RootStackParamList } from '../../types/navigation';
import { fetchBursaryApplication, fetchBursaryApplicationHistory } from '../../services/bursaryService';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatDateLong, formatCurrency } from '../../utils/dateUtils';

export type BursaryApplicationDetailRouteProp = RouteProp<RootStackParamList, 'BursaryApplicationDetail'>;

type TimelineItem = {
  id: number;
  status: string;
  note: string;
  createdAt: string;
  createdBy?: string;
};

export default function BursaryApplicationDetailScreen() {
  const { theme, responsive } = useAppTheme();
  const route = useRoute<BursaryApplicationDetailRouteProp>();
  const navigation = useNavigation<any>();
  const { applicationId } = route.params;

  const [application, setApplication] = useState<any>(null);
  const [history, setHistory] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'withdrawing' | 'deleting'>('idle');

  const loadApplication = useCallback(async () => {
    try {
      const data = await fetchBursaryApplication(applicationId);
      setApplication(data);
      const hist = await fetchBursaryApplicationHistory(applicationId);
      setHistory(hist || []);
    } catch (e: any) {
      console.error('Failed to load application:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadApplication();
  }, [loadApplication]);

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'APPROVED' || s === 'COMPLETED') return theme.success;
    if (s === 'SUBMITTED' || s === 'UNDER_REVIEW') return theme.info;
    if (s === 'DOCUMENTS_REQUIRED') return theme.warning;
    if (s === 'REJECTED' || s === 'WITHDRAWN') return theme.danger;
    if (s === 'DRAFT') return theme.gray;
    return theme.textMuted;
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toUpperCase();
    const labels: Record<string, string> = {
      DRAFT: 'Draft',
      SUBMITTED: 'Submitted',
      UNDER_REVIEW: 'Under Review',
      DOCUMENTS_REQUIRED: 'Documents Required',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      COMPLETED: 'Completed',
      WITHDRAWN: 'Withdrawn',
    };
    return labels[s] || status;
  };

  const handleWithdraw = () => {
    // Withdraw functionality would go here
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 16, color: theme.textSecondary }}>Loading application...</Text>
      </View>
    );
  }

  if (!application) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.textMuted} />
        <Text style={{ marginTop: 16, color: theme.textSecondary }}>Application not found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={history}
      keyExtractor={(item, index) => `${item.id || index}`}
      onRefresh={onRefresh}
      refreshing={refreshing}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.reference, { color: theme.textSecondary }]}>Reference #{application.referenceNumber || application.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + '20' }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: getStatusColor(application.status) }}>{getStatusLabel(application.status)}</Text>
              </View>
            </View>

            <Text style={[styles.applicantName, { color: theme.text }]}>{application.fullName || application.applicantName}</Text>

            <View style={{ marginTop: 12, gap: 6 }}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Institution</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{application.institution || application.institutionName}</Text>
            </View>

            <View style={{ marginTop: 12, gap: 6 }}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Amount Requested</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{formatCurrency(Number(application.amountRequested || application.amount || 0))}</Text>
            </View>

            <View style={{ marginTop: 12, gap: 6 }}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Applied On</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{formatDateLong(application.createdAt || application.appliedAt || new Date())}</Text>
            </View>

            <View style={{ marginTop: 12, gap: 6 }}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Documents</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {['ID Document', 'Admission Letter', 'Fees Structure'].map((doc, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                    <Text style={{ fontSize: 12, color: theme.textSecondary, marginLeft: 4 }}>{doc}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Status Timeline</Text>
          </View>
        </>
      }
      ListEmptyComponent={
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Ionicons name="time-outline" size={40} color={theme.textMuted} />
          <Text style={{ marginTop: 12, color: theme.textSecondary, textAlign: 'center' }}>
            No timeline entries available yet.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.timelineItem, { borderBottomColor: theme.border }]}>
          <View style={[styles.timelineDot, { backgroundColor: getStatusColor(item.status) }]} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.timelineStatus, { color: theme.text }]}>{getStatusLabel(item.status)}</Text>
            {item.note ? <Text style={[styles.timelineNote, { color: theme.textSecondary }]}>{item.note}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <Ionicons name="time-outline" size={12} color={theme.textMuted} />
              <Text style={[styles.timelineDate, { color: theme.textMuted }]}>{formatDateLong(item.createdAt)}</Text>
              {item.createdBy ? <Text style={{ fontSize: 10, color: theme.textMuted }}>by {item.createdBy}</Text> : null}
            </View>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderWidth: 1,
    elevation: 2,
  },
  reference: { fontSize: 12, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  applicantName: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  infoLabel: { fontSize: 12, fontWeight: '600' },
  infoValue: { fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  timelineItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 2 },
  timelineStatus: { fontSize: 14, fontWeight: '600' },
  timelineNote: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  timelineDate: { fontSize: 11 },
});
