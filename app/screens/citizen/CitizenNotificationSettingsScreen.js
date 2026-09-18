import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SETTINGS_KEY = 'notification_settings';

export default function CitizenNotificationSettingsScreen() {
  const { theme } = useAppTheme();

  const navigation = useNavigation();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    caseUpdates: true,
    eventReminders: true,
    announcements: true,
    applications: true,
    chatMessages: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.citizen.getNotificationSettings?.();
      if (data?.settings) setSettings(data.settings);
    } catch (e) {
      console.error('Failed to load notification settings', e);
    }
  };

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.citizen.updateNotificationSettings?.({ settings });
      Alert.alert('Success', 'Notification preferences saved.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const items = [
    { key: 'caseUpdates', label: 'Case Status Updates', description: 'Get notified when your cases are updated' },
    { key: 'eventReminders', label: 'Event Reminders', description: 'Receive reminders for upcoming events' },
    { key: 'announcements', label: 'Announcements', description: 'Important constituency announcements and news' },
    { key: 'applications', label: 'Application Updates', description: 'Program and application status changes' },
    { key: 'chatMessages', label: 'Chat Messages', description: 'New messages from support chat' },
  ];

  return (
    
      <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles(responsive, theme).backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
          <Text style={styles(responsive, theme).backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles(responsive, theme).title}>Notification Settings</Text>
        <Text style={styles(responsive, theme).subtitle}>Choose what notifications you receive</Text>
      </View>

      <View style={styles(responsive, theme).section}>
        {items.map((item) => (
          <View key={item.key} style={styles(responsive, theme).settingItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles(responsive, theme).settingLabel}>{item.label}</Text>
              <Text style={styles(responsive, theme).settingDesc}>{item.description}</Text>
            </View>
            <TouchableOpacity
              style={[styles(responsive, theme).toggle, settings[item.key] && styles(responsive, theme).toggleActive]}
              onPress={() => toggle(item.key)}
            >
              <View style={[styles(responsive, theme).toggleDot, settings[item.key] && styles(responsive, theme).toggleDotActive]} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={[styles(responsive, theme).saveBtn, saving && styles(responsive, theme).disabledBtn]} onPress={handleSave} disabled={saving}>
        <Text style={styles(responsive, theme).saveBtnText}>{saving ? 'Saving...' : 'Save Preferences'}</Text>
      </TouchableOpacity>
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
  section: { marginTop: 16, paddingHorizontal: responsive.horizontalPadding },
  settingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: 16, marginBottom: 12, boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  settingLabel: { fontSize: 15, fontWeight: '600', color: theme.text },
  settingDesc: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: theme.border, padding: 2, justifyContent: 'center' },
  toggleActive: { backgroundColor: theme.success },
  toggleDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.white, boxShadow: "0 1 3 0 rgba(0,0,0,0.2)", elevation: 2 },
  toggleDotActive: { alignSelf: 'flex-end' },
  saveBtn: { backgroundColor: theme.primary, padding: 16, borderRadius: responsive.buttonRadius, alignItems: 'center', marginHorizontal: responsive.horizontalPadding, marginTop: 24, marginBottom: 32 },
  saveBtnText: { color: theme.white, fontSize: 16, fontWeight: '600' },
  disabledBtn: { opacity: 0.6 },
});
