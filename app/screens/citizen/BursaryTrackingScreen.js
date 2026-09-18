import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STATUS_LABELS = {
  pending: 'Pending',
  reviewing: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function BursaryTrackingScreen() {
  const { theme } = useAppTheme();

  const STATUS_COLORS = {
    pending: theme.warning,
    reviewing: theme.info,
    approved: theme.success,
    rejected: theme.danger,
  };

  const navigation = useNavigation();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const result = await api.bursary.getMyApplications();
      setApplications(result?.applications || []);
    } catch (e) {
      console.error('Failed to load bursary applications', e);
      Alert.alert('Error', e.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (app) => {
    try {
      setLoadingDetail(true);
      setShowDetail(true);
      const result = await api.bursary.getMyApplication(app.id);
      setSelectedApp(result?.application || app);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to load application details');
      setShowDetail(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedApp) return;
    Alert.alert(
      'Withdraw Application',
      `Are you sure you want to withdraw application ${selectedApp.referenceNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await api.bursary.withdrawMyApplication(selectedApp.id);
              setShowDetail(false);
              loadApplications();
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to withdraw application');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    if (!selectedApp) return;
    Alert.alert(
      'Delete Draft',
      `Are you sure you want to delete draft application ${selectedApp.referenceNumber}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await api.bursary.deleteMyApplication(selectedApp.id);
              setShowDetail(false);
              loadApplications();
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to delete application');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const filtered = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      app.referenceNumber?.toLowerCase().includes(q) ||
      app.fullName?.toLowerCase().includes(q) ||
      app.institution?.toLowerCase().includes(q);
    const matchesStatus = !filterStatus || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statCards = [
    { title: 'Total', value: applications.length, color: theme.primary },
    { title: 'Pending', value: applications.filter((a) => a.status === 'pending').length, color: theme.warning },
    { title: 'Under Review', value: applications.filter((a) => a.status === 'reviewing').length, color: theme.info },
    { title: 'Approved', value: applications.filter((a) => a.status === 'approved').length, color: theme.success },
    { title: 'Rejected', value: applications.filter((a) => a.status === 'rejected').length, color: theme.danger },
  ];

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'KES 0';
    return `KES ${Number(amount).toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles(responsive, theme).backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
          <Text style={styles(responsive, theme).backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles(responsive, theme).title}>My Bursary Applications</Text>
        <Text style={styles(responsive, theme).subtitle}>Track and manage your bursary applications</Text>
      </View>

      <View style={styles(responsive, theme).statsRow}>
        {statCards.map((card, index) => (
          <View key={card.title} style={[styles(responsive, theme).statCard, { borderLeftColor: card.color }]}>
            <Text style={styles(responsive, theme).statValue}>{card.value}</Text>
            <Text style={styles(responsive, theme).statLabel}>{card.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles(responsive, theme).filters}>
        <View style={styles(responsive, theme).searchWrap}>
          <Ionicons name="search" size={16} color={theme.textMuted} style={styles(responsive, theme).searchIcon} />
          <TextInput
            style={styles(responsive, theme).searchInput}
            placeholder="Search applications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.textMuted}
          />
        </View>
        <View style={styles(responsive, theme).chipsRow}>
          {['', 'pending', 'reviewing', 'approved', 'rejected'].map((status) => (
            <TouchableOpacity
              key={status || 'all'}
              style={[styles(responsive, theme).chip, filterStatus === status && styles(responsive, theme).activeChip]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles(responsive, theme).chipText, filterStatus === status && styles(responsive, theme).activeChipText]}>
                {status ? STATUS_LABELS[status] : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles(responsive, theme).center}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles(responsive, theme).loadingText}>Loading applications...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles(responsive, theme).empty}>
          <Ionicons name="document-text-outline" size={48} color={theme.textMuted} />
          <Text style={styles(responsive, theme).emptyText}>No applications found</Text>
          <TouchableOpacity style={styles(responsive, theme).primaryBtn} onPress={() => navigation.navigate('BursaryApplication')}>
            <Text style={styles(responsive, theme).primaryBtnText}>Apply for Bursary</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles(responsive, theme).list}>
          {filtered.map((app, index) => (
            <TouchableOpacity
              key={app.id}
              style={styles(responsive, theme).card}
              onPress={() => openDetail(app)}
            >
              <View style={styles(responsive, theme).cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles(responsive, theme).cardTitle}>{app.referenceNumber}</Text>
                  <Text style={styles(responsive, theme).cardSub}>{app.institution} • {app.educationLevel}</Text>
                </View>
                <View style={[styles(responsive, theme).badge, { backgroundColor: (STATUS_COLORS[app.status] || theme.textMuted) + '20' }]}>
                  <Text style={[styles(responsive, theme).badgeText, { color: STATUS_COLORS[app.status] || theme.textMuted }]}>
                    {STATUS_LABELS[app.status] || app.status}
                  </Text>
                </View>
              </View>
              <View style={styles(responsive, theme).cardFooter}>
                <Text style={styles(responsive, theme).dateText}>Submitted: {formatDate(app.createdAt)}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Modal visible={showDetail} animationType="slide" transparent onRequestClose={() => setShowDetail(false)}>
        <View style={styles(responsive, theme).modalOverlay}>
          <View style={[styles(responsive, theme).modalContent, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {loadingDetail ? (
              <View style={styles(responsive, theme).center}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles(responsive, theme).loadingText}>Loading details...</Text>
              </View>
            ) : selectedApp ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles(responsive, theme).modalHeader}>
                  <Text style={styles(responsive, theme).modalTitle}>Application Details</Text>
                  <TouchableOpacity onPress={() => setShowDetail(false)}>
                    <Ionicons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <View style={[styles(responsive, theme).detailCard, { backgroundColor: theme.primaryLight }]}>
                  <Text style={styles(responsive, theme).detailRef}>{selectedApp.referenceNumber}</Text>
                  <View style={[styles(responsive, theme).statusBadge, { backgroundColor: (STATUS_COLORS[selectedApp.status] || theme.textMuted) + '20' }]}>
                    <Text style={[styles(responsive, theme).statusBadgeText, { color: STATUS_COLORS[selectedApp.status] || theme.textMuted }]}>
                      {STATUS_LABELS[selectedApp.status] || selectedApp.status}
                    </Text>
                  </View>
                  <Text style={styles(responsive, theme).detailSub}>{selectedApp.institution} • {selectedApp.educationLevel}</Text>
                </View>

                <View style={styles(responsive, theme).detailGrid}>
                  <View style={styles(responsive, theme).detailItem}>
                    <Text style={styles(responsive, theme).detailLabel}>Full Name</Text>
                    <Text style={styles(responsive, theme).detailValue}>{selectedApp.fullName}</Text>
                  </View>
                  <View style={styles(responsive, theme).detailItem}>
                    <Text style={styles(responsive, theme).detailLabel}>ID Number</Text>
                    <Text style={styles(responsive, theme).detailValue}>{selectedApp.idNumber}</Text>
                  </View>
                  <View style={styles(responsive, theme).detailItem}>
                    <Text style={styles(responsive, theme).detailLabel}>Email</Text>
                    <Text style={styles(responsive, theme).detailValue}>{selectedApp.email}</Text>
                  </View>
                  <View style={styles(responsive, theme).detailItem}>
                    <Text style={styles(responsive, theme).detailLabel}>Phone</Text>
                    <Text style={styles(responsive, theme).detailValue}>{selectedApp.phone || 'N/A'}</Text>
                  </View>
                  <View style={styles(responsive, theme).detailItem}>
                    <Text style={styles(responsive, theme).detailLabel}>Course</Text>
                    <Text style={styles(responsive, theme).detailValue}>{selectedApp.course}</Text>
                  </View>
                  <View style={styles(responsive, theme).detailItem}>
                    <Text style={styles(responsive, theme).detailLabel}>Year of Study</Text>
                    <Text style={styles(responsive, theme).detailValue}>{selectedApp.yearOfStudy}</Text>
                  </View>
                  <View style={styles(responsive, theme).detailItem}>
                    <Text style={styles(responsive, theme).detailLabel}>Academic Score</Text>
                    <Text style={styles(responsive, theme).detailValue}>{selectedApp.academicScore}%</Text>
                  </View>
                  <View style={styles(responsive, theme).detailItem}>
                    <Text style={styles(responsive, theme).detailLabel}>Parent Income</Text>
                    <Text style={styles(responsive, theme).detailValue}>{formatCurrency(selectedApp.parentIncome)}</Text>
                  </View>
                  <View style={styles(responsive, theme).detailItem}>
                    <Text style={styles(responsive, theme).detailLabel}>Dependents</Text>
                    <Text style={styles(responsive, theme).detailValue}>{selectedApp.dependents}</Text>
                  </View>
                  <View style={styles(responsive, theme).detailItem}>
                    <Text style={styles(responsive, theme).detailLabel}>Submitted</Text>
                    <Text style={styles(responsive, theme).detailValue}>{formatDate(selectedApp.createdAt)}</Text>
                  </View>
                </View>

                {selectedApp.motivationalEssay ? (
                  <View style={styles(responsive, theme).sectionBlock}>
                    <Text style={styles(responsive, theme).sectionTitle}>Motivational Essay</Text>
                    <Text style={styles(responsive, theme).sectionBody}>{selectedApp.motivationalEssay}</Text>
                  </View>
                ) : null}

                <View style={styles(responsive, theme).modalActions}>
                  <TouchableOpacity style={styles(responsive, theme).secondaryBtn} onPress={() => setShowDetail(false)}>
                    <Text style={styles(responsive, theme).secondaryBtnText}>Close</Text>
                  </TouchableOpacity>
                  {(selectedApp.status === 'pending' || selectedApp.status === 'reviewing') && (
                    <TouchableOpacity
                      style={[styles(responsive, theme).dangerBtn, actionLoading && styles(responsive, theme).disabledBtn]}
                      onPress={handleWithdraw}
                      disabled={actionLoading}
                    >
                      <Text style={styles(responsive, theme).dangerBtnText}>
                        {actionLoading ? 'Withdrawing...' : 'Withdraw'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {selectedApp.status === 'pending' && (
                    <TouchableOpacity
                      style={[styles(responsive, theme).dangerBtn, actionLoading && styles(responsive, theme).disabledBtn]}
                      onPress={handleDelete}
                      disabled={actionLoading}
                    >
                      <Text style={styles(responsive, theme).dangerBtnText}>
                        {actionLoading ? 'Deleting...' : 'Delete'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = (responsive, theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: responsive.verticalPadding, backgroundColor: theme.surface },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backBtnText: { color: theme.text, fontSize: 16, marginLeft: 4 },
  title: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text, marginTop: 8 },
  subtitle: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: responsive.horizontalPadding, paddingVertical: responsive.verticalPadding, gap: 8, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: responsive.isTablet ? 140 : 100, backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: responsive.cardPadding, borderLeftWidth: 4, alignItems: 'center', boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  statValue: { fontSize: responsive.isTablet ? 24 : 20, fontWeight: '700', color: theme.text, marginTop: 4 },
  statLabel: { fontSize: responsive.isTablet ? 12 : 11, color: theme.textSecondary, marginTop: 4, textAlign: 'center' },
  filters: { flexDirection: 'row', paddingHorizontal: responsive.horizontalPadding, paddingVertical: 12, gap: 8, flexWrap: 'wrap' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: responsive.buttonRadius, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.border, flex: 1, minWidth: responsive.isTablet ? 300 : 200 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: responsive.isTablet ? 12 : 10, fontSize: responsive.bodySize, color: theme.text },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', width: '100%' },
  chip: { paddingHorizontal: responsive.isTablet ? 16 : 12, paddingVertical: responsive.isTablet ? 10 : 8, borderRadius: 20, backgroundColor: theme.chipBg },
  activeChip: { backgroundColor: theme.primary },
  chipText: { fontSize: responsive.isTablet ? 13 : 12, color: theme.textSecondary, fontWeight: '500' },
  activeChipText: { color: theme.white, fontWeight: '600' },
  center: { alignItems: 'center', paddingVertical: 48 },
  loadingText: { marginTop: 12, color: theme.textSecondary, fontSize: 14 },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: responsive.horizontalPadding },
  emptyText: { marginTop: 12, color: theme.textMuted, fontSize: 14, marginBottom: 16 },
  primaryBtn: { backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: responsive.buttonRadius },
  primaryBtnText: { color: theme.white, fontWeight: '600' },
  list: { paddingHorizontal: responsive.horizontalPadding, gap: 12 },
  card: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: responsive.cardPadding, boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: responsive.isTablet ? 16 : 15, fontWeight: '700', color: theme.text },
  cardSub: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: responsive.isTablet ? 12 : 10, paddingVertical: responsive.isTablet ? 6 : 4, borderRadius: 12 },
  badgeText: { fontSize: responsive.isTablet ? 13 : 12, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.borderLight, marginTop: 12 },
  dateText: { fontSize: 12, color: theme.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: responsive.verticalPadding, borderBottomWidth: 1, borderBottomColor: theme.border },
  modalTitle: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text },
  detailCard: { margin: responsive.horizontalPadding, padding: 16, borderRadius: responsive.cardRadius, alignItems: 'center' },
  detailRef: { fontSize: responsive.isTablet ? 22 : 20, fontWeight: '800', color: theme.primary, letterSpacing: 1 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  statusBadgeText: { fontSize: 13, fontWeight: '600' },
  detailSub: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 8 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: responsive.horizontalPadding, paddingVertical: responsive.verticalPadding, gap: 12 },
  detailItem: { width: '48%', backgroundColor: theme.background, borderRadius: responsive.cardRadius, padding: 12 },
  detailLabel: { fontSize: 12, color: theme.textMuted, fontWeight: '600', marginBottom: 4 },
  detailValue: { fontSize: responsive.bodySize, color: theme.text, fontWeight: '500' },
  sectionBlock: { paddingHorizontal: responsive.horizontalPadding, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 8 },
  sectionBody: { fontSize: responsive.bodySize, color: theme.textSecondary, lineHeight: responsive.isTablet ? 22 : 20 },
  modalActions: { flexDirection: 'row', gap: 12, paddingHorizontal: responsive.horizontalPadding, paddingVertical: 16, justifyContent: 'flex-end', flexWrap: 'wrap' },
  secondaryBtn: { backgroundColor: theme.surface, paddingHorizontal: 20, paddingVertical: 12, borderRadius: responsive.buttonRadius, borderWidth: 1, borderColor: theme.border },
  secondaryBtnText: { color: theme.text, fontWeight: '600' },
  dangerBtn: { backgroundColor: theme.danger, paddingHorizontal: 20, paddingVertical: 12, borderRadius: responsive.buttonRadius },
  dangerBtnText: { color: theme.white, fontWeight: '600' },
  disabledBtn: { opacity: 0.6 },
});
