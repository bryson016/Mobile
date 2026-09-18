import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CitizenFeedbackScreen() {
  const { theme } = useAppTheme();

  const navigation = useNavigation();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Validation', 'Please select a rating.');
      return;
    }
    if (!feedback.trim()) {
      Alert.alert('Validation', 'Please enter your feedback.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      Alert.alert('Thank You', 'Your feedback has been submitted.', [
        { text: 'OK', onPress: () => { setRating(0); setFeedback(''); setSubmitting(false); navigation.goBack(); } },
      ]);
    }, 500);
  };

  return (
    
      <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles(responsive, theme).backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
          <Text style={styles(responsive, theme).backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles(responsive, theme).title}>Community Feedback</Text>
        <Text style={styles(responsive, theme).subtitle}>Share your experience with services, projects, or events</Text>
      </View>

      <View style={styles(responsive, theme).form}>
        <Text style={styles(responsive, theme).label}>Rating</Text>
        <View style={styles(responsive, theme).starRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={32} color={star <= rating ? theme.warning : theme.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles(responsive, theme).label}>Your Feedback</Text>
        <TextInput style={[styles(responsive, theme).input, styles(responsive, theme).textArea]} value={feedback} onChangeText={setFeedback} placeholder="Tell us about your experience..." multiline numberOfLines={6} textAlignVertical="top" />

        <TouchableOpacity style={[styles(responsive, theme).submitBtn, submitting && styles(responsive, theme).disabledBtn]} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles(responsive, theme).submitBtnText}>{submitting ? 'Submitting...' : 'Submit Feedback'}</Text>
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
  subtitle: { fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 4 },
  form: { padding: responsive.horizontalPadding, marginTop: 16 },
  label: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 8, marginTop: 16 },
  starRow: { flexDirection: 'row', gap: 8 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: responsive.buttonRadius, padding: responsive.inputPadding, fontSize: 14, backgroundColor: theme.surface, color: theme.text },
  textArea: { height: 120, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: theme.primary, padding: 16, borderRadius: responsive.buttonRadius, alignItems: 'center', marginTop: 24 },
  submitBtnText: { color: theme.white, fontSize: 16, fontWeight: '600' },
  disabledBtn: { opacity: 0.6 },
});
