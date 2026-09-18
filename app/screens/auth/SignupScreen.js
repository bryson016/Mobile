import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { api, API_BASE_URL, getApiTroubleshooting } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const USERNAME_REGEX = /^[a-zA-Z0-9._-]{4,20}$/;

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const navigation = useNavigation();
  const responsive = useResponsive();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);

  const errors = useMemo(() => {
    const next = {};
    if (!fullName.trim()) next.fullName = 'Full name is required.';
    if (!username.trim()) next.username = 'Username is required.';
    else if (!USERNAME_REGEX.test(username.trim())) next.username = 'Use 4-20 characters: letters, numbers, ., _, -';
    if (!password) next.password = 'Password is required.';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters.';
    if (password && confirmPassword !== password) next.confirmPassword = 'Passwords do not match.';
    return next;
  }, [fullName, username, password, confirmPassword]);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await api.testConnectivity();
      if (res.ok) {
        Alert.alert('Server reachable', `Connected via ${res.testedUrl} (status ${res.status}). If signup still fails, check backend logs.`);
      } else {
        Alert.alert('Cannot reach server', `${res.error}\n\n${getApiTroubleshooting()}`);
      }
    } finally {
      setTesting(false);
    }
  };

  const handleSignup = async () => {
    setError('');
    if (Object.keys(errors).length > 0) {
      Alert.alert('Validation', Object.values(errors)[0]);
      return;
    }
    setSubmitting(true);
    try {
      await api.auth.register({
        username: username.trim(),
        fullName: fullName.trim(),
        password,
      });
      navigation.replace('Login');
    } catch (e) {
      const msg = e.message || 'Unable to create account. Please try again.';
      setError(msg);
      if (e.code === 'NETWORK_ERROR' || e.code === 'TIMEOUT' || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('timed out') || msg.toLowerCase().includes('could not reach')) {
        Alert.alert('Connection failed', `${msg}\n\n${getApiTroubleshooting()}`, [
          { text: 'Test connection', onPress: handleTestConnection },
          { text: 'OK', style: 'cancel' },
        ]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles(responsive, theme).container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles(responsive, theme).scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
          <Ionicons name="shield-checkmark" size={48} color={theme.primary} />
           <Text style={styles(responsive, theme).title}>Create Account</Text>
           <Text style={styles(responsive, theme).subtitle}>Register your Women Representative office account to access secure services.</Text>
        </View>

        <View style={styles(responsive, theme).card}>
          {error ? <Text style={styles(responsive, theme).errorText}>{error}</Text> : null}

          <View style={styles(responsive, theme).formGroup}>
            <Text style={styles(responsive, theme).label}>Full Name</Text>
            <TextInput style={styles(responsive, theme).input} placeholder="Enter your full name" value={fullName} onChangeText={setFullName} />
            {errors.fullName ? <Text style={styles(responsive, theme).fieldError}>{errors.fullName}</Text> : null}
          </View>

          <View style={styles(responsive, theme).formGroup}>
            <Text style={styles(responsive, theme).label}>Username</Text>
            <TextInput style={styles(responsive, theme).input} placeholder="Create a username" autoCapitalize="none" value={username} onChangeText={setUsername} />
            {errors.username ? <Text style={styles(responsive, theme).fieldError}>{errors.username}</Text> : null}
          </View>

          <View style={styles(responsive, theme).formGroup}>
            <Text style={styles(responsive, theme).label}>Password</Text>
            <View style={styles(responsive, theme).passwordWrap}>
              <TextInput style={styles(responsive, theme).input} placeholder="Create a password" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles(responsive, theme).eyeButton}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles(responsive, theme).fieldError}>{errors.password}</Text> : null}
          </View>

          <View style={styles(responsive, theme).formGroup}>
            <Text style={styles(responsive, theme).label}>Confirm Password</Text>
            <View style={styles(responsive, theme).passwordWrap}>
              <TextInput style={styles(responsive, theme).input} placeholder="Re-enter password" secureTextEntry={!showConfirm} value={confirmPassword} onChangeText={setConfirmPassword} />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles(responsive, theme).eyeButton}>
                <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? <Text style={styles(responsive, theme).fieldError}>{errors.confirmPassword}</Text> : null}
          </View>

          <TouchableOpacity style={[styles(responsive, theme).loginBtn, submitting && styles(responsive, theme).disabledBtn]} onPress={handleSignup} disabled={submitting}>
            <Text style={styles(responsive, theme).loginBtnText}>{submitting ? 'Creating Account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles(responsive, theme).switchBtn} onPress={() => navigation.goBack()}>
            <Text style={styles(responsive, theme).switchBtnText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleTestConnection} disabled={testing} style={{ alignItems: 'center', paddingVertical: 6 }}>
            <Text style={{ color: theme.textMuted, fontSize: 11 }}>{testing ? 'Testing server...' : `Server: ${API_BASE_URL} • Tap to test`}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (responsive, theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scroll: { flexGrow: 1, padding: responsive.horizontalPadding, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: responsive.isSmallPhone ? 20 : 32 },
  title: { fontSize: responsive.titleSize, fontWeight: '700', color: theme.text, marginTop: responsive.isSmallPhone ? 12 : 16 },
  subtitle: { fontSize: responsive.bodySize, color: theme.textSecondary, textAlign: 'center', marginTop: 8 },
  card: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: responsive.cardPadding, elevation: 8 },
  errorText: { color: theme.danger, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  formGroup: { marginBottom: responsive.isSmallPhone ? 12 : 16 },
  label: { fontSize: responsive.sectionHeaderSize, fontWeight: '600', color: theme.text, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: responsive.buttonRadius, padding: responsive.inputPadding, fontSize: 14, backgroundColor: theme.background, color: theme.text },
  passwordWrap: { position: 'relative' },
  eyeButton: { position: 'absolute', right: 12, top: 12, padding: 4 },
  fieldError: { color: theme.danger, fontSize: 12, marginTop: 4 },
  loginBtn: { backgroundColor: theme.primary, borderRadius: responsive.buttonRadius, paddingVertical: responsive.buttonPaddingVertical, paddingHorizontal: responsive.buttonPaddingHorizontal, alignItems: 'center', marginTop: 8, minHeight: 44 },
  disabledBtn: { opacity: 0.6 },
  loginBtnText: { color: theme.white, fontSize: responsive.bodySize, fontWeight: '600' },
  switchBtn: { marginTop: responsive.isSmallPhone ? 12 : 16, alignItems: 'center', paddingVertical: 8 },
  switchBtnText: { color: theme.primary, fontSize: responsive.bodySize, fontWeight: '500' },
});
