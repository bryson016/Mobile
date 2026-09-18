import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useBursaryStore } from '../../store/bursaryStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { FormInput } from '../../components/BursaryForm';
import Ionicons from '@expo/vector-icons/Ionicons';

const COUNTIES = [
  'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
  'Kakamega', 'Kericho', 'Kerugoya', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu',
  'Kitui', 'Kwale', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru',
  'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira',
  'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
];

export default function BursaryStep6() {
  const { theme } = useAppTheme();
  const { form, setField } = useBursaryStore();

  const updateField = (key: string, value: any) => setField(key as any, value);

  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.label, { color: theme.text, marginTop: 0 }]}>County *</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {COUNTIES.map((county) => {
          const selected = form.county === county;
          return (
            <TouchableOpacity
              key={county}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: selected ? theme.primary : theme.chipBg,
                borderWidth: 1,
                borderColor: selected ? theme.primary : theme.border,
              }}
              onPress={() => updateField('county', county)}
            >
              <Text style={{ fontSize: 12, fontWeight: selected ? '600' : '500', color: selected ? theme.white : theme.textSecondary }}>
                {county}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FormInput
        label="Constituency *"
        value={form.constituency}
        onChangeText={(t) => updateField('constituency', t)}
        placeholder="e.g. Kibwezi Central"
      />

      <FormInput
        label="Constituency *"
        value={form.ward}
        onChangeText={(t) => updateField('ward', t)}
        placeholder="e.g. Masinga"
      />

      <FormInput
        label="Village / Location *"
        value={form.village}
        onChangeText={(t) => updateField('village', t)}
        placeholder="e.g. Kijiji Centre"
      />

      <FormInput
        label="GPS Coordinates (Optional)"
        value={form.gpsCoordinates}
        onChangeText={(t) => updateField('gpsCoordinates', t)}
        placeholder="e.g. -1.2864, 36.8172"
      />

      {/* Verification Checkbox */}
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 }}
        onPress={() => {
          const newVal = form.agreeToTerms === 'Yes' ? 'No' : 'Yes';
          updateField('agreeToTerms', newVal);
        }}
        activeOpacity={0.7}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: form.agreeToTerms === 'Yes' ? theme.primary : theme.border,
            backgroundColor: form.agreeToTerms === 'Yes' ? theme.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          {form.agreeToTerms === 'Yes' && <Ionicons name="checkmark" size={14} color={theme.white} />}
        </View>
        <Text style={{ fontSize: 14, color: theme.text, flex: 1, lineHeight: 18 }}>
          I confirm that the information provided is true and accurate to the best of my knowledge.
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
});
