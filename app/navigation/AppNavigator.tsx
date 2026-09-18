import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import CitizenDashboardScreen from '../screens/citizen/CitizenDashboardScreen';
import CitizenCommunityScreen from '../screens/citizen/CitizenCommunityScreen';
import CitizenNotificationsScreen from '../screens/citizen/CitizenNotificationsScreen';
import CitizenMoreScreen from '../screens/citizen/CitizenMoreScreen';
import CitizenProfileScreen from '../screens/citizen/CitizenProfileScreen';
import CitizenReportIssueScreen from '../screens/citizen/CitizenReportIssueScreen';
import CitizenApplicationsScreen from '../screens/citizen/CitizenApplicationsScreen';
import CitizenEventsScreen from '../screens/citizen/CitizenEventsScreen';
import CitizenFeedbackScreen from '../screens/citizen/CitizenFeedbackScreen';
import CitizenWardInfoScreen from '../screens/citizen/CitizenWardInfoScreen';
import CitizenOfficeInfoScreen from '../screens/citizen/CitizenOfficeInfoScreen';
import CitizenHelpScreen from '../screens/citizen/CitizenHelpScreen';
import CitizenHelpSupportScreen from '../screens/citizen/CitizenHelpSupportScreen';
import CitizenChangePasswordScreen from '../screens/citizen/CitizenChangePasswordScreen';
import CitizenNotificationSettingsScreen from '../screens/citizen/CitizenNotificationSettingsScreen';
import CitizenProjectsScreen from '../screens/citizen/CitizenProjectsScreen';
import CitizenAnnouncementsScreen from '../screens/citizen/CitizenAnnouncementsScreen';
import CitizenPublicParticipationScreen from '../screens/citizen/CitizenPublicParticipationScreen';
import CitizenChatScreen from '../screens/citizen/CitizenChatScreen';
import BursaryApplication from '../screens/citizen/BursaryApplication';
import BursaryThankYou from '../screens/citizen/BursaryThankYou';
import BursaryTrackingScreen from '../screens/citizen/BursaryTrackingScreen';
import BursaryApplicationDetailScreen from '../screens/citizen/BursaryApplicationDetailScreen';
import CitizenSearchScreen from '../screens/citizen/CitizenSearchScreen';
import ImpactStoryDetailScreen from '../screens/citizen/ImpactStoryDetailScreen';
import EventDetailScreen from '../screens/citizen/EventDetailScreen';
import CitizenDashboardsScreen from '../screens/citizen/CitizenDashboardsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CitizenTabs = () => {
  const { theme, responsive } = useAppTheme();
  const insets = useSafeAreaInsets();
  const isTablet = responsive.isTablet;

  const iconSize = isTablet ? 26 : 22;
  const labelSize = isTablet ? 13 : 11;
  const bottomPadding = Math.max(insets.bottom, Platform.select({ ios: isTablet ? 12 : 10, android: isTablet ? 40 : 32 }) || 0);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tab.Navigator
      id="citizen-tabs"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Community') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'More') iconName = 'ellipsis-horizontal';
          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: labelSize, fontWeight: '600', marginTop: 2 },
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 6,
          elevation: 8,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          position: 'relative',
          zIndex: 10,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={CitizenDashboardScreen} />
      <Tab.Screen name="Community" component={CitizenCommunityScreen} />
      <Tab.Screen name="More" component={CitizenMoreScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, loading } = useAuth();
  const { theme, colorScheme } = useAppTheme();

  if (loading) return null;

  const navTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={{ ...navTheme, colors: { ...navTheme.colors, background: theme.background, card: theme.surface, border: theme.border, text: theme.text, primary: theme.primary } }}>
      <Stack.Navigator
        key={user?.id || 'guest'}
        id={user?.id || 'guest-stack'}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="CitizenTabs" component={CitizenTabs} />
            <Stack.Screen name="ReportIssue" component={CitizenReportIssueScreen} />
            <Stack.Screen name="Applications" component={CitizenApplicationsScreen} />
            <Stack.Screen name="Events" component={CitizenEventsScreen} />
            <Stack.Screen name="Feedback" component={CitizenFeedbackScreen} />
            <Stack.Screen name="WardInfo" component={CitizenWardInfoScreen} />
            <Stack.Screen name="OfficeInfo" component={CitizenOfficeInfoScreen} />
            <Stack.Screen name="Help" component={CitizenHelpScreen} />
            <Stack.Screen name="HelpSupport" component={CitizenHelpSupportScreen} />
            <Stack.Screen name="ChangePassword" component={CitizenChangePasswordScreen} />
            <Stack.Screen name="NotificationSettings" component={CitizenNotificationSettingsScreen} />
            <Stack.Screen name="Projects" component={CitizenProjectsScreen} />
            <Stack.Screen name="Announcements" component={CitizenAnnouncementsScreen} />
            <Stack.Screen name="PublicParticipation" component={CitizenPublicParticipationScreen} />
            <Stack.Screen name="Chat" component={CitizenChatScreen} />
            <Stack.Screen name="Alerts" component={CitizenNotificationsScreen} />
            <Stack.Screen name="Search" component={CitizenSearchScreen} />
            <Stack.Screen name="Dashboards" component={CitizenDashboardsScreen} />
            <Stack.Screen name="Profile" component={CitizenProfileScreen} />
            <Stack.Screen name="ImpactStoryDetail" component={ImpactStoryDetailScreen} />
            <Stack.Screen name="EventDetail" component={EventDetailScreen} />
            <Stack.Screen name="BursaryApplication" component={BursaryApplication} />
            <Stack.Screen name="BursaryThankYou" component={BursaryThankYou} />
            <Stack.Screen name="BursaryTracking" component={BursaryTrackingScreen} />
            <Stack.Screen name="BursaryApplicationDetail" component={BursaryApplicationDetailScreen} />
            <Stack.Screen name="BursaryConfirmation" component={BursaryThankYou} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
