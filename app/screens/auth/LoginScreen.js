import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api, API_BASE_URL, getApiTroubleshooting } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const USERNAME_REGEX = /^[a-zA-Z0-9._-]{4,20}$/;

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const { login } = useAuth();
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);

  const errors = useMemo(() => {
    const next = {};
    if (!username.trim()) next.username = 'Username is required.';
    else if (!USERNAME_REGEX.test(username.trim())) next.username = 'Use 4-20 characters: letters, numbers, ., _, -';
    if (!password) next.password = 'Password is required.';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters.';
    return next;
  }, [username, password]);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await api.testConnectivity();
      if (res.ok) {
        Alert.alert('Server reachable', `Connected via ${res.testedUrl} (status ${res.status}). If login still fails, check credentials / backend logs.`);
      } else {
        Alert.alert('Cannot reach server', `${res.error}\n\n${getApiTroubleshooting()}`);
      }
    } finally {
      setTesting(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    if (Object.keys(errors).length > 0) {
      Alert.alert('Validation', Object.values(errors)[0]);
      return;
    }
    setSubmitting(true);
    try {
      const result = await api.auth.login({
        username: username.trim(),
        password,
      });

      const userData = {
        id: String(result.user.id),
        username: result.user.username,
        fullName: result.user.fullName,
        role: result.user.role,
        ward: result.user.ward || 'Westlands',
        token: result.token,
      };

      await login(userData);
    } catch (e) {
      const msg = e.message || 'Invalid username or password.';
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
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles(responsive, theme).scroll} showsVerticalScrollIndicator={false}>
        {responsive.isTablet || responsive.isLargeTablet ? (
          <View style={styles(responsive, theme).splitContainer}>
            <View style={[styles(responsive, theme).leftSection, { paddingTop: insets.top }]}>
              <View style={styles(responsive, theme).logoContainer}>
                <View style={styles(responsive, theme).logoRing}>
                    <Ionicons name="shield-checkmark" size={responsive.isLargeTablet ? 56 : 48} color={theme.primary} />
                </View>
                <Text style={styles(responsive, theme).logoTitle}>Advenware</Text>
                <Text style={styles(responsive, theme).logoSubtitle}>Women Representative Management System</Text>
              </View>
              <View style={styles(responsive, theme).badge}>
                <Ionicons name="business-outline" size={responsive.isLargeTablet ? 24 : 18} color={theme.primary} />
                <Text style={styles(responsive, theme).badgeText}>Kenya County e-Service Portal</Text>
              </View>
              <Text style={styles(responsive, theme).mainTitle}>Women Representative Management System</Text>
              <Text style={styles(responsive, theme).subtitle}>Citizen Services for Women Representative Engagement</Text>
              <View style={styles(responsive, theme).featureList}>
                <View style={styles(responsive, theme).featureItem}>
                  <Ionicons name="people" size={responsive.isLargeTablet ? 26 : 22} color={theme.primary} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles(responsive, theme).featureTitle}>Citizen Records</Text>
                    <Text style={styles(responsive, theme).featureDesc}>Maintain accurate and secure citizen profiles.</Text>
                  </View>
                </View>
                <View style={styles(responsive, theme).featureItem}>
                  <Ionicons name="folder" size={responsive.isLargeTablet ? 26 : 22} color={theme.primary} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles(responsive, theme).featureTitle}>Development Projects</Text>
                    <Text style={styles(responsive, theme).featureDesc}>Track planning, budget, and implementation.</Text>
                  </View>
                </View>
                <View style={styles(responsive, theme).featureItem}>
                  <Ionicons name="alert-circle" size={responsive.isLargeTablet ? 26 : 22} color={theme.primary} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles(responsive, theme).featureTitle}>Complaint Management</Text>
                    <Text style={styles(responsive, theme).featureDesc}>Receive, assign, and resolve Women Representative issues.</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={[styles(responsive, theme).rightSection, { paddingTop: insets.top }]}>
              <View style={styles(responsive, theme).card}>
                <Text style={styles(responsive, theme).cardTitle}>Welcome Back</Text>
                <Text style={styles(responsive, theme).cardSubtitle}>Sign in to access citizen services.</Text>
                {error ? <Text style={styles(responsive, theme).errorText}>{error}</Text> : null}
                <View style={styles(responsive, theme).formGroup}>
                  <Text style={styles(responsive, theme).label}>Username</Text>
                  <TextInput style={styles(responsive, theme).input} placeholder="Enter your username" autoCapitalize="none" value={username} onChangeText={setUsername} />
                  {errors.username ? <Text style={styles(responsive, theme).fieldError}>{errors.username}</Text> : null}
                </View>
                <View style={styles(responsive, theme).formGroup}>
                  <Text style={styles(responsive, theme).label}>Password</Text>
                  <View style={styles(responsive, theme).passwordWrap}>
                    <TextInput style={styles(responsive, theme).input} placeholder="Enter your password" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles(responsive, theme).eyeButton}>
                   <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>
                  {errors.password ? <Text style={styles(responsive, theme).fieldError}>{errors.password}</Text> : null}
                </View>
                <TouchableOpacity style={[styles(responsive, theme).loginBtn, submitting && styles(responsive, theme).disabledBtn]} onPress={handleLogin} disabled={submitting}>
                  <Text style={styles(responsive, theme).loginBtnText}>{submitting ? 'Signing In...' : 'Login'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles(responsive, theme).switchBtn} onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles(responsive, theme).switchBtnText}>Don't have an account? Create one</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleTestConnection} disabled={testing} style={{ alignItems: 'center', paddingVertical: 6 }}>
                  <Text style={{ color: theme.textMuted, fontSize: 11 }}>{testing ? 'Testing server...' : `Server: ${API_BASE_URL} • Tap to test`}</Text>
                </TouchableOpacity>
                <Text style={styles(responsive, theme).footer}>© 2026 Advenware. All rights reserved.</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles(responsive, theme).rightSectionFull, { paddingTop: insets.top }]}>
            <View style={styles(responsive, theme).mobileHeader}>
              <View style={styles(responsive, theme).logoRingSmall}>
                 <Ionicons name="shield-checkmark" size={28} color={theme.primary} />
              </View>
              <Text style={styles(responsive, theme).mobileTitle}>Women Representative Management System</Text>
              <Text style={styles(responsive, theme).mobileSubtitle}>Citizen Services for Women Representative Engagement</Text>
            </View>
            <View style={styles(responsive, theme).card}>
              <Text style={styles(responsive, theme).cardTitle}>Welcome Back</Text>
                <Text style={styles(responsive, theme).cardSubtitle}>Sign in to access citizen services.</Text>
              {error ? <Text style={styles(responsive, theme).errorText}>{error}</Text> : null}
              <View style={styles(responsive, theme).formGroup}>
                <Text style={styles(responsive, theme).label}>Username</Text>
                <TextInput style={styles(responsive, theme).input} placeholder="Enter your username" autoCapitalize="none" value={username} onChangeText={setUsername} />
                {errors.username ? <Text style={styles(responsive, theme).fieldError}>{errors.username}</Text> : null}
              </View>
              <View style={styles(responsive, theme).formGroup}>
                <Text style={styles(responsive, theme).label}>Password</Text>
                <View style={styles(responsive, theme).passwordWrap}>
                  <TextInput style={styles(responsive, theme).input} placeholder="Enter your password" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles(responsive, theme).eyeButton}>
                     <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={styles(responsive, theme).fieldError}>{errors.password}</Text> : null}
              </View>
              <TouchableOpacity style={[styles(responsive, theme).loginBtn, submitting && styles(responsive, theme).disabledBtn]} onPress={handleLogin} disabled={submitting}>
                <Text style={styles(responsive, theme).loginBtnText}>{submitting ? 'Signing In...' : 'Login'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles(responsive, theme).switchBtn} onPress={() => navigation.navigate('Signup')}>
                <Text style={styles(responsive, theme).switchBtnText}>Don't have an account? Create one</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleTestConnection} disabled={testing} style={{ alignItems: 'center', paddingVertical: 6 }}>
                <Text style={{ color: theme.textMuted, fontSize: 11 }}>{testing ? 'Testing server...' : `Server: ${API_BASE_URL} • Tap to test`}</Text>
              </TouchableOpacity>
              <Text style={styles(responsive, theme).footer}>© 2026 Advenware. All rights reserved.</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (responsive, theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scroll: { flexGrow: 1 },
  splitContainer: { flexDirection: 'row', flex: 1 },
  leftSection: { flex: 1, backgroundColor: theme.primary, padding: responsive.isLargeTablet ? 48 : 32, justifyContent: 'center', paddingTop: responsive.verticalPadding, minWidth: 320 },
  rightSection: { flex: 1, backgroundColor: theme.background, padding: responsive.cardPadding, justifyContent: 'center', paddingTop: responsive.verticalPadding, minWidth: 320 },
  rightSectionFull: { padding: responsive.horizontalPadding, paddingTop: responsive.verticalPadding },
  mobileHeader: { alignItems: 'center', marginBottom: responsive.isSmallPhone ? 16 : 24 },
  logoRingSmall: { width: responsive.isSmallPhone ? 52 : 64, height: responsive.isSmallPhone ? 52 : 64, borderRadius: responsive.isSmallPhone ? 26 : 32, backgroundColor: theme.white, alignItems: 'center', justifyContent: 'center', marginBottom: responsive.isSmallPhone ? 8 : 12 },
  mobileTitle: { fontSize: responsive.titleSize, fontWeight: '700', color: theme.text, textAlign: 'center', marginTop: responsive.isSmallPhone ? 8 : 12 },
  mobileSubtitle: { fontSize: responsive.bodySize, color: theme.textSecondary, textAlign: 'center', marginTop: 4 },
  logoContainer: { alignItems: 'center', marginBottom: responsive.isSmallPhone ? 16 : 24 },
  logoRing: { width: responsive.isSmallPhone ? 64 : 80, height: responsive.isSmallPhone ? 64 : 80, borderRadius: responsive.isSmallPhone ? 32 : 40, backgroundColor: theme.white, alignItems: 'center', justifyContent: 'center', marginBottom: responsive.isSmallPhone ? 8 : 12 },
  logoTitle: { fontSize: responsive.isSmallPhone ? 20 : 24, fontWeight: '700', color: theme.white },
  logoSubtitle: { fontSize: responsive.isSmallPhone ? 12 : 14, color: 'rgba(255,255,255,0.8)' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: responsive.isSmallPhone ? 16 : 24 },
  badgeText: { color: theme.white, marginLeft: 8, fontSize: 12, fontWeight: '500' },
  mainTitle: { fontSize: responsive.isSmallPhone ? 18 : 22, fontWeight: '700', color: theme.white, marginBottom: 8 },
  subtitle: { fontSize: responsive.isSmallPhone ? 12 : 14, color: 'rgba(255,255,255,0.85)', marginBottom: responsive.isSmallPhone ? 20 : 32 },
  featureList: { gap: responsive.isSmallPhone ? 10 : 16 },
  featureItem: { flexDirection: 'row', alignItems: 'flex-start' },
  featureTitle: { fontSize: responsive.isSmallPhone ? 12 : 14, fontWeight: '600', color: theme.white },
  featureDesc: { fontSize: responsive.isSmallPhone ? 11 : 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  card: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: responsive.cardPadding, elevation: 8, alignSelf: 'center', width: '100%', maxWidth: responsive.isTablet || responsive.isLargeTablet ? 480 : 400 },
  cardTitle: { fontSize: responsive.titleSize, fontWeight: '700', color: theme.text, marginBottom: 4 },
  cardSubtitle: { fontSize: responsive.bodySize, color: theme.textSecondary, marginBottom: responsive.isSmallPhone ? 16 : 24 },
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
  footer: { textAlign: 'center', color: theme.textMuted, fontSize: 11, marginTop: responsive.isSmallPhone ? 16 : 24 },
});
