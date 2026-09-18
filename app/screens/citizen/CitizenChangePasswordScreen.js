import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function CitizenChangePasswordScreen() {
  const { theme } = useAppTheme();

  const navigation = useNavigation();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!form.oldPassword) next.oldPassword = 'Current password is required.';
    if (!form.newPassword) next.newPassword = 'New password is required.';
    else if (form.newPassword.length < 6) next.newPassword = 'Password must be at least 6 characters.';
    if (form.newPassword !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.citizen.changePassword({
        currentPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      Alert.alert('Success', 'Your password has been changed successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    
      <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles(responsive, theme).backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
          <Text style={styles(responsive, theme).backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles(responsive, theme).title}>Change Password</Text>
        <Text style={styles(responsive, theme).subtitle}>Update your account password</Text>
      </View>

      <View style={styles(responsive, theme).form}>
        <Text style={styles(responsive, theme).label}>Current Password *</Text>
        <TextInput
          style={styles(responsive, theme).input}
          value={form.oldPassword}
          onChangeText={(text) => setForm({ ...form, oldPassword: text })}
          placeholder="Enter current password"
          secureTextEntry
        />
        {errors.oldPassword ? <Text style={styles(responsive, theme).fieldError}>{errors.oldPassword}</Text> : null}

        <Text style={styles(responsive, theme).label}>New Password *</Text>
        <TextInput
          style={styles(responsive, theme).input}
          value={form.newPassword}
          onChangeText={(text) => setForm({ ...form, newPassword: text })}
          placeholder="Enter new password"
          secureTextEntry
        />
        {errors.newPassword ? <Text style={styles(responsive, theme).fieldError}>{errors.newPassword}</Text> : null}

        <Text style={styles(responsive, theme).label}>Confirm New Password *</Text>
        <TextInput
          style={styles(responsive, theme).input}
          value={form.confirmPassword}
          onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
          placeholder="Re-enter new password"
          secureTextEntry
        />
        {errors.confirmPassword ? <Text style={styles(responsive, theme).fieldError}>{errors.confirmPassword}</Text> : null}

        <TouchableOpacity style={[styles(responsive, theme).submitBtn, submitting && styles(responsive, theme).disabledBtn]} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles(responsive, theme).submitBtnText}>{submitting ? 'Updating...' : 'Update Password'}</Text>
        </TouchableOpacity>
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
  form: { padding: responsive.horizontalPadding, marginTop: 16 },
  label: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: responsive.buttonRadius, padding: responsive.inputPadding, fontSize: 14, backgroundColor: theme.surface, color: theme.text },
  fieldError: { color: theme.danger, fontSize: 12, marginTop: 4 },
  submitBtn: { backgroundColor: theme.primary, padding: 16, borderRadius: responsive.buttonRadius, alignItems: 'center', marginTop: 24 },
  submitBtnText: { color: theme.white, fontSize: 16, fontWeight: '600' },
  disabledBtn: { opacity: 0.6 },
});
