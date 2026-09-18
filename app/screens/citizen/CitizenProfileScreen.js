import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CitizenProfileScreen({ navigation }) {
  const { theme } = useAppTheme();

  const { user, logout } = useAuth();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [complaintStats, setComplaintStats] = useState({ total: 0, resolved: 0 });
  const [loadError, setLoadError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phoneNumber: '', ward: '',
    firstName: '', lastName: '', gender: 'Male', dateOfBirth: '',
    occupation: '', village: '', subLocation: '', physicalAddress: '', emergencyContact: '',
  });
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);

  useEffect(() => {
    loadProfile();
  }, []);

  // Detects session expiry: the API layer tags HTTP 401 with status/code,
  // with a message match as fallback for older error shapes.
  const isSessionExpiredError = (error) => {
    if (!error) return false;
    if (error.status === 401 || error.code === 'UNAUTHORIZED') return true;
    return String(error.message || '').toLowerCase().includes('session expired');
  };

  const loadProfile = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [profileResponse, complaintsResponse] = await Promise.all([
        api.citizen.getProfile(),
        api.citizen.getComplaints().catch(() => ({ complaints: [] })),
      ]);

      // The backend returns `{ user, citizen }` on success, but a null/empty
      // body or unexpected shape must never reach `profileResponse.user` unchecked.
      if (!profileResponse || typeof profileResponse !== 'object' || !profileResponse.user || typeof profileResponse.user !== 'object') {
        throw new Error('Profile data is unavailable. Please try again.');
      }

      setProfile(profileResponse);

      const u = profileResponse.user;
      const c = profileResponse.citizen || {};

      setFormData({
        fullName: u.fullName || user?.fullName || '',
        email: u.email || '',
        phoneNumber: u.phoneNumber || '',
        ward: u.ward || '',
        firstName: c.firstName || '',
        lastName: c.lastName || '',
        gender: c.gender || 'Male',
        dateOfBirth: c.dateOfBirth || '',
        occupation: c.occupation || '',
        village: c.village || '',
        subLocation: c.subLocation || '',
        physicalAddress: c.physicalAddress || '',
        emergencyContact: c.emergencyContact || '',
      });

      const complaints = (complaintsResponse && complaintsResponse.complaints) || [];
      setComplaintStats({
        total: complaints.length,
        resolved: complaints.filter((item) => item.status === 'Resolved' || item.status === 'Closed').length,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      if (isSessionExpiredError(error)) {
        // Token expired/invalid: clear auth so the navigator returns to Login.
        setProfile(null);
        setLoadError('Session expired. Please log in again.');
        await logout();
        return;
      }
      // Keep profile null and surface a retryable error instead of rendering
      // an empty form that later crashes on save.
      setProfile(null);
      setLoadError(error?.message || 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await api.citizen.updateProfile(formData);
      // `profile` is null when the initial load failed — never read `.user` off null.
      setProfile((prev) => {
        const prevUser = (prev && prev.user) || {};
        return { ...(prev || {}), user: { ...prevUser, ...formData } };
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e) {
      if (isSessionExpiredError(e)) {
        await logout();
        return;
      }
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles(responsive, theme).centerContainer}>
        <Text style={styles(responsive, theme).loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (loadError && !profile) {
    return (
      <View style={styles(responsive, theme).centerContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={theme.textMuted} />
        <Text style={styles(responsive, theme).errorText}>{loadError}</Text>
        <TouchableOpacity style={styles(responsive, theme).retryBtn} onPress={loadProfile}>
          <Ionicons name="refresh" size={20} color={theme.black} />
          <Text style={styles(responsive, theme).retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).content, { paddingTop: insets.top }]}>
        <View style={styles(responsive, theme).profileHeader}>
          <View style={styles(responsive, theme).avatar}>
            <Ionicons name="person" size={responsive.isTablet ? 48 : 40} color={theme.white} />
          </View>
          <Text style={styles(responsive, theme).name}>{formData.fullName || 'Citizen'}</Text>
          <Text style={styles(responsive, theme).ward}>Constituency: {formData.ward || 'Not set'}</Text>
        </View>

        <View style={styles(responsive, theme).statsRow}>
          <View style={[styles(responsive, theme).statCard, { borderLeftColor: theme.primary }]}>
            <Ionicons name="document-text" size={20} color={theme.primary} />
            <Text style={styles(responsive, theme).statValue}>{complaintStats.total}</Text>
            <Text style={styles(responsive, theme).statLabel}>Total Complaints</Text>
          </View>
          <View style={[styles(responsive, theme).statCard, { borderLeftColor: theme.success }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.success} />
            <Text style={styles(responsive, theme).statValue}>{complaintStats.resolved}</Text>
            <Text style={styles(responsive, theme).statLabel}>Resolved</Text>
          </View>
        </View>

        <View style={styles(responsive, theme).formSection}>
          <Text style={styles(responsive, theme).sectionTitle}>Personal Information</Text>
          <View style={styles(responsive, theme).formGrid}>
            <View style={styles(responsive, theme).formGroup}>
              <Text style={styles(responsive, theme).label}>First Name</Text>
              <TextInput style={styles(responsive, theme).input} value={formData.firstName} onChangeText={(text) => handleChange('firstName', text)} />
            </View>
            <View style={styles(responsive, theme).formGroup}>
              <Text style={styles(responsive, theme).label}>Last Name</Text>
              <TextInput style={styles(responsive, theme).input} value={formData.lastName} onChangeText={(text) => handleChange('lastName', text)} />
            </View>
            <View style={styles(responsive, theme).formGroup}>
              <Text style={styles(responsive, theme).label}>Gender</Text>
              <View style={styles(responsive, theme).pickerRow}>
                {['Male', 'Female', 'Other'].map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles(responsive, theme).pill, formData.gender === g && styles(responsive, theme).pillActive]}
                    onPress={() => handleChange('gender', g)}
                  >
                    <Text style={[styles(responsive, theme).pillText, formData.gender === g && styles(responsive, theme).pillTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles(responsive, theme).formGroup}>
              <Text style={styles(responsive, theme).label}>Date of Birth</Text>
              <TextInput style={styles(responsive, theme).input} value={formData.dateOfBirth} onChangeText={(text) => handleChange('dateOfBirth', text)} placeholder="YYYY-MM-DD" />
            </View>
            <View style={styles(responsive, theme).formGroup}>
              <Text style={styles(responsive, theme).label}>Occupation</Text>
              <TextInput style={styles(responsive, theme).input} value={formData.occupation} onChangeText={(text) => handleChange('occupation', text)} />
            </View>
            <View style={styles(responsive, theme).formGroup}>
              <Text style={styles(responsive, theme).label}>Village</Text>
              <TextInput style={styles(responsive, theme).input} value={formData.village} onChangeText={(text) => handleChange('village', text)} />
            </View>
            <View style={styles(responsive, theme).formGroup}>
              <Text style={styles(responsive, theme).label}>Sub-Location</Text>
              <TextInput style={styles(responsive, theme).input} value={formData.subLocation} onChangeText={(text) => handleChange('subLocation', text)} />
            </View>
            <View style={styles(responsive, theme).formGroup}>
              <Text style={styles(responsive, theme).label}>Physical Address</Text>
              <TextInput style={styles(responsive, theme).input} value={formData.physicalAddress} onChangeText={(text) => handleChange('physicalAddress', text)} />
            </View>
            <View style={styles(responsive, theme).formGroup}>
              <Text style={styles(responsive, theme).label}>Emergency Contact</Text>
              <TextInput style={styles(responsive, theme).input} value={formData.emergencyContact} onChangeText={(text) => handleChange('emergencyContact', text)} keyboardType="phone-pad" />
            </View>
          </View>
        </View>

        <View style={styles(responsive, theme).formSection}>
          <Text style={styles(responsive, theme).sectionTitle}>Account Details</Text>
          <View style={styles(responsive, theme).infoCard}>
            <View style={styles(responsive, theme).infoRow}>
              <View style={styles(responsive, theme).infoLabelRow}>
                <Ionicons name="person-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).infoLabel}>Username</Text>
              </View>
              <Text style={styles(responsive, theme).infoValue}>{profile?.user?.username || '-'}</Text>
            </View>
            <View style={styles(responsive, theme).infoRow}>
              <View style={styles(responsive, theme).infoLabelRow}>
                <Ionicons name="mail-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).infoLabel}>Email</Text>
              </View>
              <Text style={styles(responsive, theme).infoValue}>{profile?.user?.email || '-'}</Text>
            </View>
            <View style={styles(responsive, theme).infoRow}>
              <View style={styles(responsive, theme).infoLabelRow}>
                <Ionicons name="call-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).infoLabel}>Phone</Text>
              </View>
              <Text style={styles(responsive, theme).infoValue}>{profile?.user?.phoneNumber || '-'}</Text>
            </View>
            <View style={styles(responsive, theme).infoRow}>
              <View style={styles(responsive, theme).infoLabelRow}>
                <Ionicons name="location-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).infoLabel}>Constituency</Text>
              </View>
              <Text style={styles(responsive, theme).infoValue}>{profile?.user?.ward || '-'}</Text>
            </View>
            <View style={styles(responsive, theme).infoRow}>
              <View style={styles(responsive, theme).infoLabelRow}>
                <Ionicons name="shield-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).infoLabel}>Role</Text>
              </View>
              <Text style={styles(responsive, theme).infoValue}>{profile?.user?.role || 'citizen'}</Text>
            </View>
            <View style={styles(responsive, theme).infoRow}>
              <View style={styles(responsive, theme).infoLabelRow}>
                <Ionicons name="pulse-outline" size={14} color={theme.textMuted} />
                <Text style={styles(responsive, theme).infoLabel}>Status</Text>
              </View>
              <Text style={styles(responsive, theme).infoValue}>{profile?.user?.isActive ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles(responsive, theme).saveBtn} onPress={handleSubmit} disabled={saving}>
          <Ionicons name="save" size={20} color={theme.white} />
          <Text style={styles(responsive, theme).saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>

        <View style={styles(responsive, theme).section}>
          <Text style={styles(responsive, theme).sectionTitle}>Account</Text>
          <View style={styles(responsive, theme).menuCard}>
            <TouchableOpacity style={styles(responsive, theme).menuItem} onPress={() => navigation.navigate('ChangePassword')}>
              <Ionicons name="lock-closed-outline" size={responsive.isTablet ? 22 : 20} color={theme.textMuted} />
              <Text style={styles(responsive, theme).menuText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={responsive.isTablet ? 20 : 18} color={theme.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles(responsive, theme).menuItem} onPress={() => navigation.navigate('NotificationSettings')}>
              <Ionicons name="notifications-outline" size={responsive.isTablet ? 22 : 20} color={theme.textMuted} />
              <Text style={styles(responsive, theme).menuText}>Notification Settings</Text>
              <Ionicons name="chevron-forward" size={responsive.isTablet ? 20 : 18} color={theme.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles(responsive, theme).menuItem} onPress={() => navigation.navigate('HelpSupport')}>
              <Ionicons name="help-circle-outline" size={responsive.isTablet ? 22 : 20} color={theme.textMuted} />
              <Text style={styles(responsive, theme).menuText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={responsive.isTablet ? 20 : 18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles(responsive, theme).logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={responsive.isTablet ? 22 : 20} color={theme.white} />
          <Text style={styles(responsive, theme).logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = (responsive, theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { maxWidth: responsive.maxContentWidth, width: '100%', alignSelf: 'center' },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: responsive.horizontalPadding },
  loadingText: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 16 },
  errorText: { fontSize: responsive.bodySize, color: theme.danger, textAlign: 'center', marginTop: 16, marginBottom: 16, paddingHorizontal: responsive.horizontalPadding },
  retryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primaryDark, paddingVertical: responsive.buttonPaddingVertical, paddingHorizontal: responsive.buttonPaddingHorizontal, borderRadius: responsive.buttonRadius },
  retryBtnText: { color: theme.black, marginLeft: 8, fontSize: responsive.bodySize, fontWeight: '600' },
  profileHeader: { alignItems: 'center', padding: responsive.isSmallPhone ? 24 : 32, paddingTop: responsive.verticalPadding, backgroundColor: theme.surface },
  avatar: { width: responsive.isSmallPhone ? 64 : responsive.isTablet ? 96 : 80, height: responsive.isSmallPhone ? 64 : responsive.isTablet ? 96 : 80, borderRadius: responsive.isSmallPhone ? 32 : responsive.isTablet ? 48 : 40, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  name: { fontSize: responsive.titleSize, fontWeight: '700', color: theme.text },
  ward: { fontSize: 13, color: theme.textMuted, marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: responsive.horizontalPadding, paddingVertical: responsive.verticalPadding, gap: 12 },
  statCard: { flex: 1, backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: responsive.cardPadding, borderLeftWidth: 4, alignItems: 'center', boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  statValue: { fontSize: responsive.isTablet ? 28 : 24, fontWeight: '700', color: theme.text, marginTop: 8 },
  statLabel: { fontSize: responsive.isTablet ? 14 : 12, color: theme.textSecondary, marginTop: 4 },
  formSection: { marginTop: 24, paddingHorizontal: responsive.horizontalPadding },
  sectionTitle: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text, marginBottom: 12 },
  formGrid: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, overflow: 'hidden', boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  formGroup: { padding: 16, borderBottomWidth: 1, borderBottomColor: theme.borderLight },
  label: { fontSize: 12, color: theme.textMuted, marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: responsive.buttonRadius, padding: responsive.inputPadding, fontSize: 14, backgroundColor: theme.background, color: theme.text },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: responsive.isSmallPhone ? 6 : 8, borderRadius: responsive.chipRadius, backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border },
  pillActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  pillText: { fontSize: responsive.bodySize, color: theme.textSecondary },
  pillTextActive: { color: theme.white, fontWeight: '600' },
  infoCard: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, overflow: 'hidden', boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.borderLight },
  infoLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { fontSize: 14, color: theme.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: theme.text },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primary, marginHorizontal: responsive.horizontalPadding, paddingVertical: responsive.buttonPaddingVertical, paddingHorizontal: responsive.buttonPaddingHorizontal, borderRadius: responsive.buttonRadius, marginTop: 24 },
  saveBtnText: { color: theme.white, marginLeft: 8, fontSize: responsive.bodySize, fontWeight: '600' },
  menuCard: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, overflow: 'hidden', boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: responsive.isTablet ? 20 : 16, borderBottomWidth: 1, borderBottomColor: theme.borderLight },
  menuText: { flex: 1, fontSize: responsive.isTablet ? 16 : 15, color: theme.text, marginLeft: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.danger, marginHorizontal: responsive.horizontalPadding, paddingVertical: responsive.buttonPaddingVertical, paddingHorizontal: responsive.buttonPaddingHorizontal, borderRadius: responsive.buttonRadius, marginTop: 32, marginBottom: 32 },
  logoutText: { color: theme.white, marginLeft: 8, fontSize: responsive.bodySize, fontWeight: '600' },
});
