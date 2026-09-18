import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useBursaryStore, GENDER_OPTIONS, RESIDENCY_OPTIONS, ID_DOCUMENT_TYPES } from '../../store/bursaryStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { FormInput } from '../../components/BursaryForm';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDateLong } from '../../utils/dateUtils';

export default function BursaryStep1New() {
  const { theme } = useAppTheme();
  const { form, setField } = useBursaryStore();
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const updateField = (key: string, value: any) => setField(key as any, value);

  return (
    <View style={{ flex: 1 }}>
      <FormInput
        label="First Name *"
        value={form.firstName}
        onChangeText={(t) => updateField('firstName', t)}
        placeholder="e.g. Akinyi"
      />

      <FormInput
        label="Last Name *"
        value={form.lastName}
        onChangeText={(t) => updateField('lastName', t)}
        placeholder="e.g. Omondi"
      />

      <FormInput
        label="Phone Number *"
        value={form.phoneNumber}
        onChangeText={(t) => updateField('phoneNumber', t)}
        placeholder="e.g. 0712345678"
        keyboardType="phone-pad"
      />

      <FormInput
        label="Email Address"
        value={form.email}
        onChangeText={(t) => updateField('email', t)}
        placeholder="e.g. akinyi@example.com"
        keyboardType="email-address"
      />

      <Text style={[styles.label, { color: theme.text }]}>ID Document Type *</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {ID_DOCUMENT_TYPES.map((docType) => {
          const selected = form.idDocumentType === docType.value;
          return (
            <TouchableOpacity
              key={docType.value}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: selected ? theme.primary : theme.chipBg,
                borderWidth: 1,
                borderColor: selected ? theme.primary : theme.border,
              }}
              onPress={() => updateField('idDocumentType', docType.value)}
            >
              <Text style={{ fontSize: 13, fontWeight: selected ? '600' : '500', color: selected ? theme.white : theme.textSecondary }}>
                {docType.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FormInput
        label="ID Number *"
        value={form.idNumber}
        onChangeText={(t) => updateField('idNumber', t)}
        placeholder="e.g. 12345678"
        keyboardType="numeric"
      />

      <Text style={[styles.label, { color: theme.text }]}>Date of Birth *</Text>
      <TouchableOpacity
        style={[styles.datePickerBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color={theme.textMuted} />
        <Text style={{ fontSize: 14, color: form.dateOfBirth ? theme.text : theme.textMuted, marginLeft: 8 }}>
          {form.dateOfBirth || 'Select date of birth'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={form.dateOfBirth ? new Date(form.dateOfBirth) : new Date()}
          mode="date"
          display="default"
          onValueChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              const formatted = formatDateLong(selectedDate);
              updateField('dateOfBirth', formatted);
            }
          }}
          onDismiss={() => setShowDatePicker(false)}
          maximumDate={new Date()}
        />
      )}

      <Text style={[styles.label, { color: theme.text }]}>Gender *</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {GENDER_OPTIONS.map((g) => {
          const selected = form.gender === g.value;
          return (
            <TouchableOpacity
              key={g.value}
              style={{
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 20,
                backgroundColor: selected ? theme.primary : theme.chipBg,
                borderWidth: 1,
                borderColor: selected ? theme.primary : theme.border,
              }}
              onPress={() => updateField('gender', g.value)}
            >
              <Text style={{ fontSize: 14, fontWeight: selected ? '600' : '500', color: selected ? theme.white : theme.textSecondary }}>
                {g.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.label, { color: theme.text }]}>Disability Status</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {[
          { value: 'No', label: 'None' },
          { value: 'Physical', label: 'Physical' },
          { value: 'Sensory', label: 'Sensory' },
          { value: 'Mental', label: 'Mental' },
          { value: 'Learning', label: 'Learning' },
          { value: 'Other', label: 'Other' },
        ].map((option) => {
          const selected = form.disabilityStatus === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: selected ? theme.primary : theme.chipBg,
                borderWidth: 1,
                borderColor: selected ? theme.primary : theme.border,
              }}
              onPress={() => updateField('disabilityStatus', option.value)}
            >
              <Text style={{ fontSize: 13, fontWeight: selected ? '600' : '500', color: selected ? theme.white : theme.textSecondary }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.label, { color: theme.text }]}>Residency Status *</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {RESIDENCY_OPTIONS.map((res) => {
          const selected = form.residency === res.value;
          return (
            <TouchableOpacity
              key={res.value}
              style={{
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 20,
                backgroundColor: selected ? theme.primary : theme.chipBg,
                borderWidth: 1,
                borderColor: selected ? theme.primary : theme.border,
              }}
              onPress={() => updateField('residency', res.value)}
            >
              <Text style={{ fontSize: 14, fontWeight: selected ? '600' : '500', color: selected ? theme.white : theme.textSecondary }}>
                {res.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
});
