import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useBursaryStore } from '../../store/bursaryStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { FormInput } from '../../components/BursaryForm';

const RELATIONSHIPS = [
  { value: 'Father', label: 'Father' },
  { value: 'Mother', label: 'Mother' },
  { value: 'Guardian', label: 'Guardian' },
  { value: 'Other', label: 'Other' },
];

export default function BursaryStep3() {
  const { theme } = useAppTheme();
  const { form, setField } = useBursaryStore();

  const updateField = (key: string, value: any) => setField(key as any, value);

  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.label, { color: theme.text, marginTop: 0 }]}>Parent / Guardian Full Name *</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
        ]}
        value={form.parentFullName}
        onChangeText={(t) => updateField('parentFullName', t)}
        placeholder="Full name of parent/guardian"
      />

      <Text style={[styles.label, { color: theme.text }]}>Relationship *</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {RELATIONSHIPS.map((rel) => {
          const selected = form.relationship === rel.value;
          return (
            <TouchableOpacity
              key={rel.value}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: selected ? theme.primary : theme.chipBg,
                borderWidth: 1,
                borderColor: selected ? theme.primary : theme.border,
              }}
              onPress={() => updateField('relationship', rel.value)}
            >
              <Text style={{ fontSize: 13, fontWeight: selected ? '600' : '500', color: selected ? theme.white : theme.textSecondary }}>
                {rel.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FormInput
        label="Phone Number *"
        value={form.parentPhoneNumber}
        onChangeText={(t) => updateField('parentPhoneNumber', t)}
        placeholder="e.g. 0712345678"
        keyboardType="phone-pad"
      />

      <FormInput
        label="Occupation"
        value={form.occupation}
        onChangeText={(t) => updateField('occupation', t)}
        placeholder="e.g. Teacher, Nurse, Business owner"
      />

      <FormInput
        label="Number of Dependants in Household *"
        value={form.numberOfDependants}
        onChangeText={(t) => updateField('numberOfDependants', t)}
        placeholder="e.g. 4"
        keyboardType="numeric"
      />

      <FormInput
        label="Household Monthly Income (KSh) *"
        value={form.householdMonthlyIncome}
        onChangeText={(t) => updateField('householdMonthlyIncome', t)}
        placeholder="e.g. 25000"
        keyboardType="numeric"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
});
