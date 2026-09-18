import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DashboardItem {
  name: string;
  screen: string;
  description: string;
}

interface DashboardSection {
  title: string;
  items: DashboardItem[];
}

const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    title: 'MAIN DASHBOARDS',
    items: [
      { name: 'Home', screen: 'Home', description: 'Main dashboard with reports, bursary, events, announcements, and notifications overview' },
      { name: 'Community', screen: 'Community', description: 'Browse projects, events, announcements, and public participation' },
      { name: 'More', screen: 'More', description: 'Account settings, support links, and additional services ' },
    ],
  },
  {
    title: 'CITIZEN SERVICES',
    items: [
      { name: 'Report Issue', screen: 'ReportIssue', description: 'Submit a new report or issue' },
      { name: 'My Applications', screen: 'Applications', description: 'View your submitted applications' },
      { name: 'Bursary Apply', screen: 'BursaryApplication', description: 'Apply for bursary funding' },
      { name: 'Bursary Tracking', screen: 'BursaryTracking', description: 'Track your bursary application status' },
      { name: 'Bursary Detail', screen: 'BursaryApplicationDetail', description: 'View bursary application details' },
    ],
  },
  {
    title: 'EVENTS & COMMUNICATION',
    items: [
      { name: 'Events', screen: 'Events', description: 'View community events' },
      { name: 'Event Detail', screen: 'EventDetail', description: 'View event details' },
      { name: 'Feedback', screen: 'Feedback', description: 'Submit community feedback' },
      { name: 'Live Chat', screen: 'Chat', description: 'Chat with support or community' },
      { name: 'Announcements', screen: 'Announcements', description: 'View official announcements' },
      { name: 'Public Participation', screen: 'PublicParticipation', description: 'Participate in public initiatives' },
    ],
  },
  {
    title: 'INFORMATION',
    items: [
      { name: 'Projects', screen: 'Projects', description: 'View development projects' },
      { name: 'Ward Info', screen: 'WardInfo', description: 'Your ward information' },
      { name: 'Office Info', screen: 'OfficeInfo', description: 'Representative office information' },
      { name: 'Help', screen: 'Help', description: 'Help and FAQ' },
      { name: 'Help Support', screen: 'HelpSupport', description: 'Get help and support' },
      { name: 'Search', screen: 'Search', description: 'Search programs, announcements, events' },
      { name: 'Alerts', screen: 'Alerts', description: 'View all notifications' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { name: 'Profile', screen: 'Profile', description: 'Your profile information' },
      { name: 'Change Password', screen: 'ChangePassword', description: 'Change your password' },
      { name: 'Notification Settings', screen: 'NotificationSettings', description: 'Manage notification preferences' },
    ],
  },
  {
    title: 'BURSARY DETAILS',
    items: [
      { name: 'Bursary Thank You', screen: 'BursaryThankYou', description: 'Bursary submission confirmation' },
      { name: 'Bursary Confirmation', screen: 'BursaryConfirmation', description: 'Bursary confirmation view' },
    ],
  },
];

export default function CitizenDashboardsScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const handleNavigate = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 32) }}
    >
      <View style={{ paddingTop: insets.top, paddingHorizontal: isTablet ? 32 : 16 }}>
        {/* Header */}
        <View style={{ paddingVertical: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.text }}>
            Dashboards
          </Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>
            Select a dashboard to navigate to
          </Text>
        </View>

        {/* Dashboard Sections */}
        {DASHBOARD_SECTIONS.map((section, sIndex) => (
          <View key={sIndex} style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: theme.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 8,
                marginLeft: 4,
              }}
            >
              {section.title}
            </Text>
            <View style={{ backgroundColor: theme.surface, borderRadius: 12, overflow: 'hidden' }}>
              {section.items.map((item, iIndex) => {
                const isLast = iIndex === section.items.length - 1;
                return (
                  <TouchableOpacity
                    key={item.screen}
                    activeOpacity={0.6}
                    onPress={() => handleNavigate(item.screen)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: isLast ? 0 : 1,
                      borderBottomColor: theme.border,
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '600',
                          color: theme.primary,
                        }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: theme.textMuted,
                          marginTop: 2,
                          lineHeight: 16,
                        }}
                      >
                        {item.description}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: theme.textMuted,
                          marginTop: 2,
                          opacity: 0.6,
                        }}
                      >
                        {item.screen}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 16, color: theme.textMuted, marginLeft: 8 }}>
                      {'>'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
