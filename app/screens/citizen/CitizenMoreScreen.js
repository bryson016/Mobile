import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useResponsive } from '../../utils/responsive';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CitizenMoreScreen() {
  const { theme } = useAppTheme();

  const navigation = useNavigation();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);

  const menuSections = [
    {
      title: 'My Services',
      items: [
        { label: 'My Profile', icon: 'person-outline', screen: 'Profile' },
        { label: 'My Applications', icon: 'checkbox-outline', screen: 'Applications' },
        { label: 'My Events', icon: 'calendar-outline', screen: 'Events' },
        { label: 'Notifications', icon: 'notifications-outline', screen: 'Alerts' },
        { label: 'My Bursary Applications', icon: 'school-outline', screen: 'BursaryTracking' },
        { label: 'All Dashboards', icon: 'grid-outline', screen: 'Dashboards' },
      ],
    },
    {
      title: 'Community',
      items: [
        { label: 'Development Projects', icon: 'business-outline', screen: 'Projects' },
        { label: 'Programs', icon: 'folder-open-outline', screen: 'Community' },
        { label: 'Public Participation', icon: 'people-outline', screen: 'PublicParticipation' },
        { label: 'Announcements', icon: 'megaphone-outline', screen: 'Announcements' },
        { label: 'Community Feedback', icon: 'chatbubble-outline', screen: 'Feedback' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Live Chat', icon: 'chatbubbles-outline', screen: 'Chat' },
        { label: 'Help & FAQ', icon: 'help-circle-outline', screen: 'Help' },
        { label: 'Contact Office', icon: 'call-outline', screen: 'OfficeInfo' },
        { label: 'My Constituency', icon: 'location-outline', screen: 'WardInfo' },
        { label: 'About WRMS', icon: 'information-circle-outline', screen: null },
      ],
    },
      {
        title: 'My Account',
        items: [
          { label: 'Change Password', icon: 'lock-closed-outline', screen: 'ChangePassword' },
          { label: 'Notification Settings', icon: 'notifications-outline', screen: 'NotificationSettings' },
          { label: 'Help & Support', icon: 'help-circle-outline', screen: 'HelpSupport' },
        ],
      },
  ];

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles(responsive, theme).container} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).content, { paddingBottom: scrollBottomPadding }]}>
        <View style={styles(responsive, theme).header}>
          <Text style={styles(responsive, theme).title}>More</Text>
          <Text style={styles(responsive, theme).subtitle}>Account and community</Text>
        </View>

      {menuSections.map((section, sIndex) => (
        <View key={sIndex} style={styles(responsive, theme).section}>
          <Text style={styles(responsive, theme).sectionTitle}>{section.title}</Text>
          <View style={styles(responsive, theme).menuCard}>
            {section.items.map((item, iIndex) => (
              <TouchableOpacity key={iIndex} style={styles(responsive, theme).menuItem} onPress={() => item.screen && navigation.navigate(item.screen)}>
                <View style={styles(responsive, theme).menuIcon}>
                  <Ionicons name={item.icon} size={responsive.isTablet ? 22 : 20} color={theme.primary} />
                </View>
                <Text style={styles(responsive, theme).menuText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={responsive.isTablet ? 20 : 18} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles(responsive, theme).logoutBtn} onPress={handleLogout}>
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
  header: { padding: responsive.verticalPadding, paddingTop: responsive.verticalPadding, backgroundColor: theme.surface },
  title: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 4 },
  section: { marginBottom: responsive.isTablet ? 32 : 24, paddingHorizontal: responsive.horizontalPadding },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  menuCard: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, overflow: 'hidden', boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: responsive.isTablet ? 20 : 16, borderBottomWidth: 1, borderBottomColor: theme.borderLight },
  menuIcon: { width: responsive.isTablet ? 40 : 32, height: responsive.isTablet ? 40 : 32, borderRadius: responsive.isTablet ? 20 : 16, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: responsive.isTablet ? 16 : 12 },
  menuText: { flex: 1, fontSize: responsive.isTablet ? 16 : 15, color: theme.text },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.danger, marginHorizontal: responsive.horizontalPadding, paddingVertical: responsive.buttonPaddingVertical, paddingHorizontal: responsive.buttonPaddingHorizontal, borderRadius: responsive.buttonRadius, marginTop: 8, marginBottom: 32 },
  logoutText: { color: theme.white, marginLeft: 8, fontSize: responsive.bodySize, fontWeight: '600' },
});
