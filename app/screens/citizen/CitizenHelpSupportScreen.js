import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CitizenHelpSupportScreen() {
  const { theme } = useAppTheme();

  const navigation = useNavigation();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I submit a report?',
      answer: 'Go to the Home screen and tap "Report Issue". Fill in the form with details about your issue and submit.',
    },
    {
      question: 'How do I view my submitted reports?',
      answer: 'Submitted reports can be viewed in your notifications or activity feed.',
    },
    {
      question: 'How do I apply for a program?',
      answer: 'Visit the Community section to browse available programs. Select a program and follow the application process. You can track your applications in the More menu.',
    },
    {
      question: 'How do I update my profile?',
      answer: 'Go to More > My Profile. Tap "Edit" to update your personal information such as phone number, email, and constituency details.',
    },
    {
      question: 'How do I register for events?',
      answer: 'Visit the Community section and select Events. Browse upcoming events and tap "Register" to sign up. You can view your registered events in More > My Events.',
    },
    {
      question: 'What should I do if I need help?',
      answer: 'Use the Contact Office option in the More menu to get in touch with the Women Representative office. You can also submit feedback through the Community Feedback section.',
    },
    {
      question: 'How do I change my password?',
      answer: 'Go to More > My Profile, then select "Change Password" under Account. Enter your current password and choose a new one.',
    },
    {
      question: 'How can I contact support?',
      answer: 'You can reach the Women Representative office during working hours at +254 700 000 000 or email support@advenware.co.ke. For urgent issues, visit the office directly.',
    },
  ];

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    
      <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles(responsive, theme).backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
          <Text style={styles(responsive, theme).backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles(responsive, theme).title}>Help & Support</Text>
        <Text style={styles(responsive, theme).subtitle}>Frequently asked questions and support</Text>
      </View>

      <View style={styles(responsive, theme).section}>
        <Text style={styles(responsive, theme).sectionTitle}>FAQs</Text>
        <View style={styles(responsive, theme).faqCard}>
          {faqs.map((faq, index) => (
            <TouchableOpacity key={index} style={styles(responsive, theme).faqItem} onPress={() => toggleExpand(index)}>
              <View style={styles(responsive, theme).faqHeader}>
                <Text style={styles(responsive, theme).faqQuestion}>{faq.question}</Text>
                <Ionicons name={expandedIndex === index ? 'chevron-up' : 'chevron-down'} size={20} color={theme.textMuted} />
              </View>
              {expandedIndex === index && <Text style={styles(responsive, theme).faqAnswer}>{faq.answer}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles(responsive, theme).section}>
        <Text style={styles(responsive, theme).sectionTitle}>Contact Us</Text>
        <View style={styles(responsive, theme).contactCard}>
          <View style={styles(responsive, theme).contactRow}>
            <View style={styles(responsive, theme).contactIcon}>
              <Ionicons name="call" size={24} color={theme.primary} />
            </View>
            <View>
              <Text style={styles(responsive, theme).contactLabel}>Phone</Text>
              <Text style={styles(responsive, theme).contactValue}>+254 700 000 000</Text>
            </View>
          </View>
          <View style={styles(responsive, theme).contactRow}>
            <View style={styles(responsive, theme).contactIcon}>
              <Ionicons name="mail" size={24} color={theme.primary} />
            </View>
            <View>
              <Text style={styles(responsive, theme).contactLabel}>Email</Text>
              <Text style={styles(responsive, theme).contactValue}>support@advenware.co.ke</Text>
            </View>
          </View>
          <View style={styles(responsive, theme).contactRow}>
            <View style={styles(responsive, theme).contactIcon}>
              <Ionicons name="location" size={24} color={theme.primary} />
            </View>
            <View>
              <Text style={styles(responsive, theme).contactLabel}>Office</Text>
              <Text style={styles(responsive, theme).contactValue}>Women Representative Office</Text>
            </View>
          </View>
        </View>
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
  section: { marginTop: 24, paddingHorizontal: responsive.horizontalPadding },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  faqCard: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, overflow: 'hidden', boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  faqItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: theme.borderLight },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.text, marginRight: 12 },
  faqAnswer: { fontSize: 14, color: theme.textSecondary, marginTop: 8, lineHeight: 20 },
  contactCard: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, overflow: 'hidden', boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  contactRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.borderLight },
  contactIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  contactLabel: { fontSize: 12, color: theme.textMuted, marginBottom: 2 },
  contactValue: { fontSize: 15, fontWeight: '600', color: theme.text },
});