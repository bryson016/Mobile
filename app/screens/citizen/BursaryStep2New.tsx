import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useBursaryStore, EDUCATION_LEVELS } from '../../store/bursaryStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { FormInput } from '../../components/BursaryForm';

function getYearOptions(educationLevel: string): string[] {
  switch (educationLevel) {
    case 'primary':
      return ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];
    case 'high_school':
      return ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
    case 'college':
    case 'university':
    case 'other':
      return ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year'];
    default:
      return [];
  }
}

export default function BursaryStep2() {
  const { theme, responsive } = useAppTheme();
  const { form, setField } = useBursaryStore();

  const years = getYearOptions(form.institutionType);

  const updateField = (key: string, value: any) => setField(key as any, value);

  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.label, { color: theme.text, marginTop: 0 }]}>Institution Type *</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {EDUCATION_LEVELS.map((cat) => {
          const selected = form.institutionType === cat.value;
          return (
            <TouchableOpacity
              key={cat.value}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: selected ? theme.primary : theme.chipBg,
                borderWidth: 1,
                borderColor: selected ? theme.primary : theme.border,
              }}
              onPress={() => {
                updateField('institutionType', cat.value);
                updateField('gradeOrForm', '');
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: selected ? '600' : '500', color: selected ? theme.white : theme.textSecondary }}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FormInput
        label="Institution Name *"
        value={form.institutionName}
        onChangeText={(t) => updateField('institutionName', t)}
        placeholder="e.g. Makongeni Primary School"
      />

      <FormInput
        label="Course / Class / Grade *"
        value={form.gradeOrForm}
        onChangeText={(t) => updateField('gradeOrForm', t)}
        placeholder="e.g. BSc. Nursing, Form 2, Grade 7"
      />

      <Text style={[styles.label, { color: theme.text }]}>Year / Grade Level *</Text>
      {years.length === 0 ? (
        <Text style={{ fontSize: 13, color: theme.textMuted, marginBottom: 6, marginTop: 4 }}>
          Select an institution type above to choose the year.
        </Text>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {years.map((year) => {
            const selected = form.academicYear === year;
            return (
              <TouchableOpacity
                key={year}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: selected ? theme.primary : theme.chipBg,
                  borderWidth: 1,
                  borderColor: selected ? theme.primary : theme.border,
                }}
                onPress={() => updateField('academicYear', year)}
              >
                <Text style={{ fontSize: 13, fontWeight: selected ? '600' : '500', color: selected ? theme.white : theme.textSecondary }}>
                  {year}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <FormInput
        label="Admission Number"
        value={form.admissionNumber}
        onChangeText={(t) => updateField('admissionNumber', t)}
        placeholder="e.g. ADM/001/2025"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
});
