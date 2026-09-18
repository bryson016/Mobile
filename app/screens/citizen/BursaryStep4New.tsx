import React, { useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useBursaryStore } from '../../store/bursaryStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { FormInput } from '../../components/BursaryForm';
import { formatCurrency } from '../../utils/dateUtils';

export default function BursaryStep4() {
  const { theme } = useAppTheme();
  const { form, setField } = useBursaryStore();

  const updateField = (key: string, value: any) => setField(key as any, value);

  // Auto-calculate outstanding balance
  useEffect(() => {
    const total = Number(form.totalFees) || 0;
    const paid = Number(form.amountPaid) || 0;
    const balance = total - paid;
    if (total >= 0 && paid >= 0 && balance >= 0) {
      if (form.outstandingBalance !== String(balance)) {
        updateField('outstandingBalance', String(balance));
      }
    }
  }, [form.totalFees, form.amountPaid]);

  const totalFees = Number(form.totalFees) || 0;
  const amountPaid = Number(form.amountPaid) || 0;
  const outstanding = Number(form.outstandingBalance) || 0;
  const requested = Number(form.amountRequested) || 0;

  const maxRequest = outstanding;
  const isOverRequest = requested > maxRequest && maxRequest > 0;

  const toggleYesNo = (field: string) => {
    const current = form[field as keyof typeof form] as string;
    updateField(field, current === 'Yes' ? 'No' : 'Yes');
  };

  return (
    <View style={{ flex: 1 }}>
      <FormInput
        label="Total Fees (KSh) *"
        value={form.totalFees}
        onChangeText={(t) => updateField('totalFees', t)}
        placeholder="e.g. 45000"
        keyboardType="numeric"
      />

      <FormInput
        label="Amount Paid (KSh) *"
        value={form.amountPaid}
        onChangeText={(t) => updateField('amountPaid', t)}
        placeholder="e.g. 20000"
        keyboardType="numeric"
      />

      <FormInput
        label="Outstanding Balance (KSh) *"
        value={form.outstandingBalance}
        onChangeText={(t) => updateField('outstandingBalance', t)}
        placeholder={formatCurrency(outstanding)}
        keyboardType="numeric"
        editable={false}
      />
      {totalFees > 0 && amountPaid > 0 && outstanding > 0 && (
        <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: -8, marginBottom: 16 }}>
          Auto-calculated: {formatCurrency(totalFees - amountPaid)}
        </Text>
      )}

      <FormInput
        label="Amount Requested (KSh) *"
        value={form.amountRequested}
        onChangeText={(t) => updateField('amountRequested', t)}
        placeholder="e.g. 30000"
        keyboardType="numeric"
      />
      {isOverRequest && (
        <Text style={{ fontSize: 12, color: theme.danger, marginTop: -8, marginBottom: 16 }}>
          Requested amount should not exceed the outstanding balance of {formatCurrency(outstanding)}.
        </Text>
      )}

      {/* Previous Bursary Section */}
      <Text style={[styles.label, { color: theme.text }]}>Have you previously received a bursary? *</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TouchableOpacity
          style={[styles.yesNoBtn, form.previousBursaryReceived === 'Yes' && styles.yesNoActive]}
          onPress={() => toggleYesNo('previousBursaryReceived')}
        >
          <Text style={[styles.yesNoText, form.previousBursaryReceived === 'Yes' && styles.yesNoTextActive]}>YES</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.yesNoBtn, form.previousBursaryReceived === 'No' && styles.yesNoActive]}
          onPress={() => toggleYesNo('previousBursaryReceived')}
        >
          <Text style={[styles.yesNoText, form.previousBursaryReceived === 'No' && styles.yesNoTextActive]}>NO</Text>
        </TouchableOpacity>
      </View>

      {form.previousBursaryReceived === 'Yes' && (
        <>
          <FormInput
            label="Previous Bursary Amount (KSh)"
            value={form.previousBursaryAmount}
            onChangeText={(t) => updateField('previousBursaryAmount', t)}
            placeholder="e.g. 20000"
            keyboardType="numeric"
          />
          <FormInput
            label="Previous Bursary Year"
            value={form.previousBursaryYear}
            onChangeText={(t) => updateField('previousBursaryYear', t)}
            placeholder="e.g. 2025"
            keyboardType="numeric"
          />
          <FormInput
            label="Previous Bursary Program/Source"
            value={form.previousBursaryProgram}
            onChangeText={(t) => updateField('previousBursaryProgram', t)}
            placeholder="e.g. Higher Education Bursary"
          />
        </>
      )}

      {/* Other Financial Assistance Section */}
      <Text style={[styles.label, { color: theme.text }]}>Are you receiving financial assistance from another source? *</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TouchableOpacity
          style={[styles.yesNoBtn, form.otherFinancialAssistance === 'Yes' && styles.yesNoActive]}
          onPress={() => toggleYesNo('otherFinancialAssistance')}
        >
          <Text style={[styles.yesNoText, form.otherFinancialAssistance === 'Yes' && styles.yesNoTextActive]}>YES</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.yesNoBtn, form.otherFinancialAssistance === 'No' && styles.yesNoActive]}
          onPress={() => toggleYesNo('otherFinancialAssistance')}
        >
          <Text style={[styles.yesNoText, form.otherFinancialAssistance === 'No' && styles.yesNoTextActive]}>NO</Text>
        </TouchableOpacity>
      </View>

      {form.otherFinancialAssistance === 'Yes' && (
        <>
          <FormInput
            label="Source of Assistance"
            value={form.otherFinancialSource}
            onChangeText={(t) => updateField('otherFinancialSource', t)}
            placeholder="e.g. HELB, Private scholarship"
          />
          <FormInput
            label="Amount (KSh)"
            value={form.otherFinancialAmount}
            onChangeText={(t) => updateField('otherFinancialAmount', t)}
            placeholder="e.g. 10000"
            keyboardType="numeric"
          />
          <FormInput
            label="Description"
            value={form.otherFinancialDescription}
            onChangeText={(t) => updateField('otherFinancialDescription', t)}
            placeholder="Describe the assistance"
            multiline
            numberOfLines={4}
          />
        </>
      )}

      <FormInput
        label="Reason for Bursary Application *"
        value={form.reasonForApplication}
        onChangeText={(t) => updateField('reasonForApplication', t)}
        placeholder="Explain your financial and educational situation..."
        multiline
        numberOfLines={6}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
        <Text style={{ fontSize: 12, color: theme.textMuted }}>
          {form.reasonForApplication ? form.reasonForApplication.length : 0} / 1000 characters
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  yesNoBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  yesNoActive: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  yesNoText: { fontSize: 16, fontWeight: '600' },
  yesNoTextActive: {},
});
