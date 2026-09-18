import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useBursaryStore } from '../../store/bursaryStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatCurrency } from '../../utils/dateUtils';
import { submitBursaryApplication } from '../../services/bursaryService';

export default function BursaryStep7() {
  const { theme, responsive } = useAppTheme();
  const { form, isSubmitting, submitError } = useBursaryStore();

  const requiredDocsComplete = useMemo(() => {
    return true;
  }, [form.documents]);

  const completedSteps = useMemo(() => {
    const steps: string[] = [];
    if (form.firstName && form.lastName && form.idNumber && form.dateOfBirth && form.gender && form.residency) steps.push('1');
    if (form.institutionType && form.institutionName && form.gradeOrForm) steps.push('2');
    if (form.parentFullName && form.relationship && form.parentPhoneNumber && form.householdMonthlyIncome) steps.push('3');
    if (form.totalFees && form.amountPaid && form.amountRequested && form.reasonForApplication) steps.push('4');
    if (form.documents.length > 0) steps.push('5');
    if (form.county && form.constituency && form.ward && form.village && form.agreeToTerms === 'Yes') steps.push('6');
    return steps;
  }, [form]);

  const completionPercentage = Math.round((completedSteps.length / 6) * 100);

  const getStatusColor = (step: string) => {
    if (completedSteps.includes(step)) return theme.success;
    return theme.border;
  };

  const handleSubmit = async () => {
    if (!requiredDocsComplete) {
      Alert.alert('Missing Documents', 'Required documents are missing. Please complete the documents step.');
      return;
    }
    if (completionPercentage < 100) {
      Alert.alert('Incomplete Form', `Your application is ${completionPercentage}% complete. Complete all steps before submitting.`);
      return;
    }

    try {
      await submitBursaryApplication(form);
      Alert.alert('Success', 'Your bursary application has been submitted successfully!', [
        { text: 'OK', style: 'default' },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit application');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Application Summary</Text>

        <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Applicant</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {form.firstName} {form.lastName}
          </Text>
        </View>

        <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>ID Number</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{form.idNumber}</Text>
        </View>

        <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Phone</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{form.parentPhoneNumber || form.phoneNumber}</Text>
        </View>

        <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Institution</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{form.institutionName}</Text>
        </View>

        <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Course / Class</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{form.gradeOrForm}</Text>
        </View>

        <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Amount Requested</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{formatCurrency(Number(form.amountRequested) || 0)}</Text>
        </View>

        <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Outstanding Balance</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{formatCurrency(Number(form.outstandingBalance) || 0)}</Text>
        </View>

        <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>County</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{form.county}</Text>
        </View>

        <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Constituency</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{form.constituency}</Text>
        </View>

        <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Constituency</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{form.ward}</Text>
        </View>
      </View>

      {/* Documents Summary */}
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 16 }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Documents ({form.documents.length} attached)</Text>
        {form.documents.length === 0 ? (
          <Text style={{ fontSize: 13, color: theme.textMuted, paddingVertical: 8 }}>No documents uploaded.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {form.documents.map((doc) => (
              <View key={doc.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name={doc.uploaded ? 'checkmark-circle' : doc.uploading ? 'cloud-upload' : 'alert-circle'}
                    size={18}
                    color={doc.uploaded ? theme.success : doc.uploading ? theme.primary : theme.danger}
                  />
                  <Text style={{ fontSize: 13, color: theme.text, marginLeft: 8 }}>{doc.name}</Text>
                </View>
                {doc.uploaded && <Ionicons name="checkmark-done" size={16} color={theme.success} />}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Completion Progress */}
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Progress</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.primary }}>{completionPercentage}% Complete</Text>
        </View>

        <View style={{ backgroundColor: theme.border, borderRadius: 8, height: 10, overflow: 'hidden', marginBottom: 12 }}>
          <View style={{ width: `${completionPercentage}%`, backgroundColor: theme.primary, height: '100%', borderRadius: 8 }} />
        </View>

        <View style={{ gap: 8 }}>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <View key={step} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                Step {step} {step === 1 ? '(Personal Information)' : step === 2 ? '(Educational Details)' : step === 3 ? '(Financial Information)' : step === 4 ? '(Fee Structure)' : step === 5 ? '(Supporting Documents)' : '(Residential Details)'}
              </Text>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: getStatusColor(String(step)) }} />
            </View>
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: theme.primary }, isSubmitting && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={theme.white} size="small" />
        ) : (
          <Ionicons name="send-outline" size={20} color={theme.white} />
        )}
      <Text style={[styles.submitBtnText, { color: theme.white }]}>
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Text>
      </TouchableOpacity>

      {submitError ? <Text style={{ color: theme.danger, textAlign: 'center', marginTop: 12 }}>{submitError}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  summaryLabel: {
    fontSize: 13,
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
