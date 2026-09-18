import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CitizenHelpScreen() {
  const { theme } = useAppTheme();

  const navigation = useNavigation();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 120 : 80);

  const menuItems = [
    { icon: 'person-outline', title: 'My Profile', description: 'View and edit your personal information', screen: 'Profile' },
    { icon: 'document-text-outline', title: 'My Reports', description: 'View your submitted reports and status', screen: 'Alerts' },
    { icon: 'card-outline', title: 'My Applications', description: 'Track your bursary and program applications', screen: 'Applications' },
    { icon: 'settings-outline', title: 'Settings', description: 'Manage notification and account settings', screen: 'NotificationSettings' },
    { icon: 'lock-closed-outline', title: 'Change Password', description: 'Update your account password', screen: 'ChangePassword' },
    { icon: 'help-outline', title: 'Help & Support', description: 'FAQs and contact information', screen: 'HelpSupport' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>More Info</Text>
        <Text style={styles.subtitle}>Get help or manage your account</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>QUICK LINKS</Text>
        <View style={styles.menuList}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.7}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={22} color={theme.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = (responsive, theme) => StyleSheet.create({
  container: { flex: 1 },
  header: { padding: responsive.verticalPadding, paddingTop: responsive.verticalPadding + 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backBtnText: { color: theme.text, fontSize: 16, marginLeft: 4 },
  title: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text, marginTop: 4 },
  subtitle: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 4 },
  section: { paddingHorizontal: responsive.horizontalPadding, marginTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  menuList: { gap: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: responsive.inputPadding, marginBottom: 8, borderWidth: 1, borderColor: theme.border },
  menuIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600', color: theme.text, marginBottom: 2 },
  menuDescription: { fontSize: 13, color: theme.textSecondary },
});