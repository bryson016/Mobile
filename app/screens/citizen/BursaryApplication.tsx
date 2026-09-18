import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, BackHandler } from 'react-native';
import { useBursaryStore, BursaryForm } from '../../store/bursaryStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { submitBursaryApplication } from '../../services/bursaryService';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BursaryStep1New from './BursaryStep1New';
import BursaryStep2New from './BursaryStep2New';
import BursaryStep3New from './BursaryStep3New';
import BursaryStep4New from './BursaryStep4New';
import BursaryStep5New from './BursaryStep5New';
import BursaryStep6New from './BursaryStep6New';
import BursaryStep7New from './BursaryStep7New';

export type BursaryApplicationRouteProp = RouteProp<RootStackParamList, 'BursaryApplication'>;

const STEP_TITLES = [
  'Personal Information',
  'Educational Details',
  'Parent/Guardian Info',
  'Financial Information',
  'Supporting Documents',
  'Residential Details',
  'Review & Submit',
];

const STEPS = [1, 2, 3, 4, 5, 6, 7];

function validateStep(form: BursaryForm, step: number): { valid: boolean; message: string } {
  switch (step) {
    case 1:
      if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.gender || !form.phoneNumber || !form.idNumber || !form.residency) {
        return { valid: false, message: 'Please fill in all required fields in Personal Information.' };
      }
      break;
    case 2:
      if (!form.institutionType || !form.institutionName || !form.gradeOrForm || !form.academicYear) {
        return { valid: false, message: 'Please fill in all required fields in Educational Details.' };
      }
      break;
    case 3:
      if (!form.parentFullName || !form.relationship || !form.parentPhoneNumber || !form.numberOfDependants || !form.householdMonthlyIncome) {
        return { valid: false, message: 'Please fill in all required fields in Parent/Guardian Information.' };
      }
      break;
    case 4:
      if (!form.totalFees || !form.amountPaid || !form.amountRequested || !form.reasonForApplication) {
        return { valid: false, message: 'Please fill in all required fields in Financial Information.' };
      }
      break;
    case 5:
      const requiredDocs = form.documents.filter((d) => d.uploaded);
      if (requiredDocs.length < 3) {
        return { valid: false, message: 'Please upload at least the required documents.' };
      }
      break;
    case 6:
      if (!form.county || !form.constituency || !form.ward || !form.village) {
        return { valid: false, message: 'Please fill in all required fields in Residential Details.' };
      }
      if (form.agreeToTerms !== 'Yes') {
        return { valid: false, message: 'Please agree to the terms to continue.' };
      }
      break;
    case 7:
      return validateStep(form, 6);
  }
  return { valid: true, message: '' };
}

const STEP_COMPONENTS: Record<number, React.ComponentType> = {
  1: BursaryStep1New,
  2: BursaryStep2New,
  3: BursaryStep3New,
  4: BursaryStep4New,
  5: BursaryStep5New,
  6: BursaryStep6New,
  7: BursaryStep7New,
};

export default function BursaryApplication() {
  const { theme, responsive } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { form, setCurrentStep, setField, setSubmitting, isSubmitting, submitError, setSubmitError, hydrateDraft } = useBursaryStore();
  const navigation = useNavigation<any>();
  const route = useRoute<BursaryApplicationRouteProp>();

  useEffect(() => {
    hydrateDraft();
  }, [hydrateDraft]);

  useEffect(() => {
    const backAction = () => {
      if (form.currentStep > 1) {
        setCurrentStep(1);
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => subscription.remove();
  }, [form.currentStep]);

  useEffect(() => {
    if (route.params?.applicationId) {
      setField('applicationId', route.params.applicationId);
    }
  }, [route.params]);

  const renderStep = () => {
    const StepComponent = STEP_COMPONENTS[form.currentStep];
    if (!StepComponent) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.textMuted }}>Step component not found</Text>
        </View>
      );
    }
    return <StepComponent />;
  };

  const handleNext = () => {
    const { valid, message } = validateStep(form, form.currentStep);
    if (!valid) {
      Alert.alert('Validation Error', message);
      return;
    }
    if (form.currentStep < 7) {
      setCurrentStep(form.currentStep + 1);
    }
  };

  const handleBack = () => {
    if (form.currentStep > 1) {
      setCurrentStep(form.currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    const { valid, message } = validateStep(form, 6);
    if (!valid) {
      Alert.alert('Validation Error', message);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      const result = await submitBursaryApplication(form);
      setCurrentStep(7);
      setField('currentStep', 7);
      setField('referenceNumber', result?.referenceNumber || result?.application?.referenceNumber || null);
      setField('draftStatus', 'SUBMITTED');
      setField('savedAt', new Date().toISOString());
      Alert.alert('Success', 'Your bursary application has been submitted successfully!', [
        { text: 'OK', style: 'default' },
      ]);
      navigation.navigate('BursaryConfirmation', { referenceNumber: result?.referenceNumber || '' });
    } catch (e: any) {
      setSubmitError(e.message || 'Failed to submit application');
      Alert.alert('Submission Failed', e.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const isLastStep = form.currentStep === 7;
  const isStepValid = validateStep(form, form.currentStep).valid;

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={[styles.stepIndicatorContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.stepIndicatorRow}>
          {STEPS.map((step, index) => {
            const completed = step < form.currentStep;
            const active = step === form.currentStep;
            const valid = isStepValidForIndicator(step);
            return (
              <React.Fragment key={step}>
                <View style={{ alignItems: 'center' }}>
                  <View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor: active ? theme.primary : completed ? theme.success : valid ? theme.chipBg : theme.chipBg,
                        borderColor: active ? theme.primary : completed ? theme.success : valid ? theme.border : theme.border,
                        width: 32,
                        height: 32,
                      },
                    ]}
                  >
                    {completed ? (
                      <Ionicons name="checkmark" size={16} color={theme.white} />
                    ) : (
                      <Text style={{ fontSize: 12, fontWeight: '600', color: active ? theme.white : theme.textSecondary }}>{step}</Text>
                    )}
                  </View>
                  <Text style={[styles.stepLabel, { color: active ? theme.primary : theme.textMuted, fontSize: 10 }]}>
                    {STEP_TITLES[index]}
                  </Text>
                </View>
                {step < 7 && (
                  <View style={{ flex: 1, height: 2, backgroundColor: theme.border, marginHorizontal: 4 }} />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {renderStep()}
      </ScrollView>

      <View style={[styles.buttonContainer, { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {!isLastStep && (
            <TouchableOpacity
              style={[styles.button, styles.backButton, { borderColor: theme.border }]}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={18} color={theme.text} />
              <Text style={[styles.backButtonText, { color: theme.text }]}>Back</Text>
            </TouchableOpacity>
          )}
          {isLastStep ? (
            <TouchableOpacity
              style={[styles.button, styles.submitButton, { backgroundColor: theme.primary }, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color={theme.white} /> : <Ionicons name="send-outline" size={18} color={theme.white} />}
              <Text style={[styles.submitButtonText, { color: theme.white }]}>{isSubmitting ? 'Submitting...' : 'Submit Application'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.nextButton, { backgroundColor: theme.primary }, !isStepValid && { opacity: 0.5 }]}
              onPress={handleNext}
              disabled={!isStepValid}
            >
              <Text style={[styles.nextButtonText, { color: theme.white }]}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={theme.white} />
            </TouchableOpacity>
          )}
        </View>
        {submitError ? <Text style={{ color: theme.danger, fontSize: 12, marginTop: 8, textAlign: 'center' }}>{submitError}</Text> : null}
      </View>
    </View>
  );
}

function isStepValidForIndicator(step: number): boolean {
  // For step indicator, just check if the step has been visited
  return true;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stepIndicatorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCircle: {
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepLabel: {
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 80,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  backButton: {
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  nextButton: {},
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  submitButton: {},
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
