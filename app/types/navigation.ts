import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  CitizenTabs: undefined;
  ReportIssue: undefined;
  Applications: undefined;
  Events: undefined;
  Feedback: undefined;
  WardInfo: undefined;
  OfficeInfo: undefined;
  Help: undefined;
  HelpSupport: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  Projects: undefined;
  Announcements: undefined;
  PublicParticipation: undefined;
  Chat: undefined;
  Alerts: undefined;
  Search: { initialQuery?: string };
  Dashboards: undefined;
  Profile: undefined;
  ImpactStoryDetail: { slug: string };
  EventDetail: { eventId: number };
  BursaryApplication: { applicationId?: number };
  BursaryThankYou: { referenceNumber?: string };
  BursaryTracking: undefined;
  BursaryApplicationDetail: { applicationId: number };
  BursaryConfirmation: { referenceNumber?: string };
};

export type CitizenTabParamList = {
  Home: undefined;
  Community: undefined;
  More: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type CitizenTabNavigationProp = BottomTabNavigationProp<CitizenTabParamList>;

export type RootTabNavigationProp = BottomTabNavigationProp<
  RootStackParamList & CitizenTabParamList
>;
