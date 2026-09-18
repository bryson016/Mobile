import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function CitizenReportIssueScreen() {
  const { theme } = useAppTheme();

  const navigation = useNavigation();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: 'Road_Repair', subject: '', description: '', location: '', ward: user?.ward || '' });

  const categories = ['Sanitation', 'Road_Repair', 'Water_Supply', 'Street_Lighting', 'Waste_Management', 'Health_Services', 'Education', 'Security', 'Other'];

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.description.trim() || !form.location.trim()) {
      Alert.alert('Validation', 'Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await api.citizen.submitComplaint({
        category: form.category,
        priority: 'Medium',
        description: `${form.subject}\n\n${form.description}`,
        village: form.location,
      });
      Alert.alert('Success', `Issue reported successfully. Tracking: ${result.complaintCode}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      setForm({ category: 'Road_Repair', subject: '', description: '', location: '', ward: user?.ward || '' });
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to report issue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    
      <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles(responsive, theme).backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
          <Text style={styles(responsive, theme).backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles(responsive, theme).title}>Report an Issue</Text>
      </View>

      <View style={styles(responsive, theme).form}>
        <Text style={styles(responsive, theme).label}>Category</Text>
        <View style={styles(responsive, theme).chipRow}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat} style={[styles(responsive, theme).chip, form.category === cat && styles(responsive, theme).activeChip]} onPress={() => setForm({ ...form, category: cat })}>
              <Text style={[styles(responsive, theme).chipText, form.category === cat && styles(responsive, theme).activeChipText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles(responsive, theme).label}>Subject</Text>
        <TextInput style={styles(responsive, theme).input} value={form.subject} onChangeText={(text) => setForm({ ...form, subject: text })} placeholder="Brief subject" />

        <Text style={styles(responsive, theme).label}>Description</Text>
        <TextInput style={[styles(responsive, theme).input, styles(responsive, theme).textArea]} value={form.description} onChangeText={(text) => setForm({ ...form, description: text })} placeholder="Describe the issue in detail" multiline numberOfLines={4} textAlignVertical="top" />

        <Text style={styles(responsive, theme).label}>Location</Text>
        <TextInput style={styles(responsive, theme).input} value={form.location} onChangeText={(text) => setForm({ ...form, location: text })} placeholder="Where is the issue?" />

        <Text style={styles(responsive, theme).label}>Constituency</Text>
        <TextInput style={styles(responsive, theme).input} value={form.ward} onChangeText={(text) => setForm({ ...form, ward: text })} placeholder="Your constituency" />

        <TouchableOpacity style={[styles(responsive, theme).submitBtn, submitting && styles(responsive, theme).disabledBtn]} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles(responsive, theme).submitBtnText}>{submitting ? 'Submitting...' : 'Submit Report'}</Text>
        </TouchableOpacity>
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
  form: { padding: responsive.horizontalPadding, marginTop: 16 },
  label: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: responsive.buttonRadius, padding: responsive.inputPadding, fontSize: 14, backgroundColor: theme.surface, color: theme.text },
  textArea: { height: 100, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.chipBg },
  activeChip: { backgroundColor: theme.primary },
  chipText: { fontSize: 13, color: theme.textSecondary, fontWeight: '500' },
  activeChipText: { color: theme.white, fontWeight: '600' },
  submitBtn: { backgroundColor: theme.primary, padding: 16, borderRadius: responsive.buttonRadius, alignItems: 'center', marginTop: 24 },
  submitBtnText: { color: theme.white, fontSize: 16, fontWeight: '600' },
  disabledBtn: { opacity: 0.6 },
});
