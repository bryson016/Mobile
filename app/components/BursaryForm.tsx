import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform, ViewStyle } from 'react-native';
import { useBursaryStore } from '../store/bursaryStore';
import { useAppTheme } from '../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
const { DateTimePicker } = require('@react-native-community/datetimepicker');

export const TOTAL_STEPS = 7;

export type StepConfig = {
  number: number;
  title: string;
  subtitle: string;
};

export const STEPS: StepConfig[] = [
  { number: 1, title: 'Applicant Information', subtitle: 'Personal and contact details' },
  { number: 2, title: 'Education Information', subtitle: 'School and academic details' },
  { number: 3, title: 'Parent/Guardian Information', subtitle: 'Guardian contact and income' },
  { number: 4, title: 'Financial Information', subtitle: 'Fees, income, and bursary reason' },
  { number: 5, title: 'Supporting Documents', subtitle: 'Upload required documents' },
  { number: 6, title: 'Declaration', subtitle: 'Confirm accuracy of information' },
  { number: 7, title: 'Review & Submit', subtitle: 'Verify all details before submission' },
];

export const StepIndicator = ({ step }: { step: number }) => {
  const { theme, responsive } = useAppTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.primary }}>
          Step {step} of {TOTAL_STEPS}
        </Text>
        <Text style={{ fontSize: 13, color: theme.textSecondary }}>
          {Math.round((step / TOTAL_STEPS) * 100)}%
        </Text>
      </View>
      <View style={{ height: 8, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ height: 8, width: `${(step / TOTAL_STEPS) * 100}%`, backgroundColor: theme.primary, borderRadius: 4 }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        {STEPS.map((s) => (
          <View key={s.number} style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: step >= s.number ? theme.primary : theme.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: theme.white }}>{s.number}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export const ProgressBar = ({ step }: { step: number }) => {
  const { theme, responsive } = useAppTheme();
  const percent = step / TOTAL_STEPS;
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.primary }}>
          Step {step} of {TOTAL_STEPS}
        </Text>
        <Text style={{ fontSize: 13, color: theme.textSecondary }}>
          {Math.round(percent * 100)}%
        </Text>
      </View>
      <View style={{ height: 8, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ height: 8, width: `${percent * 100}%`, backgroundColor: theme.primary, borderRadius: 4 }} />
      </View>
    </View>
  );
};

export const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  secureTextEntry = false,
  error,
  numberOfLines,
  multiline = false,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
  error?: string;
  numberOfLines?: number;
  multiline?: boolean;
  editable?: boolean;
}) => {
  const { theme, responsive } = useAppTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : theme.border,
            color: theme.text,
            minHeight: multiline ? 100 : 48,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
      />
      {error ? <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
};

export const DatePickerField = ({
  label,
  value,
  onChange,
  error,
  maxDate = new Date(),
}: {
  label: string;
  value: string;
  onChange: (dateStr: string) => void;
  error?: string;
  maxDate?: Date;
}) => {
  const { theme } = useAppTheme();
  const [show, setShow] = useState(false);

  const handlePress = () => setShow(true);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TouchableOpacity onPress={handlePress} style={{ marginBottom: 4 }}>
        <View
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: error ? theme.danger : theme.border,
              justifyContent: 'center',
              height: 48,
            },
          ]}
        >
          <Text style={{ fontSize: 14, color: value ? theme.text : theme.textMuted }}>
            {value || 'Select date'}
          </Text>
        </View>
      </TouchableOpacity>
      {error ? <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text> : null}
      {show && (
        <DateTimeField
          value={value ? new Date(value) : new Date(maxDate.getFullYear() - 18, 0, 1)}
          onChange={(date) => {
            onChange(date.toISOString().split('T')[0]);
            setShow(false);
          }}
          onCancel={() => setShow(false)}
          maximumDate={maxDate}
        />
      )}
    </View>
  );
};

function DateTimeField({ value, onChange, onCancel, maximumDate }: { value: Date; onChange: (date: Date) => void; onCancel: () => void; maximumDate?: Date }) {
  if (Platform.OS === 'web') {
    return (
      <View style={{ marginTop: 8 }}>
        <TextInput
          style={[styles.input, { backgroundColor: 'transparent', borderColor: 'transparent' }]}
          value={value.toISOString().split('T')[0]}
          onChangeText={(t) => onChange(new Date(t))}
          placeholder="YYYY-MM-DD"
        />
      </View>
    );
  }
  const RNDateTimePicker = require('@react-native-community/datetimepicker').default;
  return (
    <RNDateTimePicker
      value={value}
      mode="date"
      display="default"
      maximumDate={maximumDate}
      onValueChange={(event, selectedDate) => {
        if (selectedDate) onChange(selectedDate);
      }}
      onDismiss={onCancel}
    />
  );
}

export const ChipSelector = ({
  label,
  value,
  options,
  onChange,
  error,
  multi = false,
}: {
  label: string;
  value: string | string[];
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  error?: string;
  multi?: boolean;
}) => {
  const { theme } = useAppTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt) => {
          const selected = multi ? (value as string[]).includes(opt.value) : value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? theme.primary : theme.chipBg,
                  borderColor: selected ? theme.primary : theme.border,
                },
              ]}
              onPress={() => onChange(opt.value)}
            >
              <Text style={{ fontSize: 13, fontWeight: selected ? '600' : '500', color: selected ? theme.white : theme.textSecondary }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  errorText: { fontSize: 12, marginTop: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
});
