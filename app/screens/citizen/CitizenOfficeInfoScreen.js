import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CitizenOfficeInfoScreen() {
  const { theme } = useAppTheme();

  const navigation = useNavigation();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);

  return (
    
      <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles(responsive, theme).backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
          <Text style={styles(responsive, theme).backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles(responsive, theme).title}>Office Information</Text>
        <Text style={styles(responsive, theme).subtitle}>Contact and visit the Women Representative office</Text>
      </View>

      <View style={styles(responsive, theme).section}>
        <View style={styles(responsive, theme).card}>
          <View style={styles(responsive, theme).cardHeader}>
            <View style={[styles(responsive, theme).iconWrap, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="business" size={24} color={theme.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles(responsive, theme).officeName}>Women Representative Office</Text>
              <Text style={styles(responsive, theme).officeLocation}>Thika Township, Kiambu County</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles(responsive, theme).section}>
        <Text style={styles(responsive, theme).sectionTitle}>Contact Details</Text>
        <View style={styles(responsive, theme).infoCard}>
          <View style={styles(responsive, theme).infoRow}>
            <Ionicons name="call-outline" size={20} color={theme.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles(responsive, theme).infoLabel}>Phone</Text>
              <Text style={styles(responsive, theme).infoValue}>+254 700 000 000</Text>
            </View>
          </View>
          <View style={styles(responsive, theme).infoRow}>
            <Ionicons name="mail-outline" size={20} color={theme.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles(responsive, theme).infoLabel}>Email</Text>
              <Text style={styles(responsive, theme).infoValue}>info@wrms.go.ke</Text>
            </View>
          </View>
          <View style={styles(responsive, theme).infoRow}>
            <Ionicons name="time-outline" size={20} color={theme.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles(responsive, theme).infoLabel}>Opening Hours</Text>
              <Text style={styles(responsive, theme).infoValue}>Mon - Fri: 8:00 AM - 5:00 PM</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles(responsive, theme).section}>
        <Text style={styles(responsive, theme).sectionTitle}>Services</Text>
        <View style={styles(responsive, theme).infoCard}>
          {['Case Submissions', 'Program Applications', 'Document Verification', 'Community Meetings', 'Feedback Submission'].map((service, index) => (
            <View key={index} style={styles(responsive, theme).serviceRow}>
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
              <Text style={styles(responsive, theme).serviceText}>{service}</Text>
            </View>
          ))}
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
  section: { marginBottom: 24, paddingHorizontal: responsive.horizontalPadding },
  sectionTitle: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text, marginBottom: 12 },
  card: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: 16, boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  officeName: { fontSize: 16, fontWeight: '700', color: theme.text },
  officeLocation: { fontSize: 14, color: theme.textSecondary, marginTop: 2 },
  infoCard: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: 16, boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderLight },
  infoLabel: { fontSize: 12, color: theme.textMuted },
  infoValue: { fontSize: 15, fontWeight: '600', color: theme.text, marginTop: 2 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  serviceText: { fontSize: 14, color: theme.text, marginLeft: 12 },
});
