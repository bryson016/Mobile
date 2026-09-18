import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDateLong, formatDateTime } from '../../utils/dateUtils';

export default function EventDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme, responsive } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { eventId } = route.params || {};
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      if (eventId) {
        const events = await api.community.getPublicEvents();
        const found = events.events.find((e: any) => e.id === eventId);
        if (found) setEvent(found);
      }
    } catch (e) {
      console.error('Failed to load event', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!event) return;
    setRegistering(true);
    try {
      await api.community.registerForEvent(event.id);
      Alert.alert('Success', 'You have registered for this event.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 16, color: theme.textSecondary }}>Loading event...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background, flex: 1 }]}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.textMuted} />
        <Text style={{ color: theme.text, marginTop: 16 }}>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: insets.top }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', padding: responsive.verticalPadding }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
          <Text style={{ color: theme.text, fontSize: 16, marginLeft: 4 }}>Back</Text>
        </TouchableOpacity>

        <View style={{ paddingHorizontal: responsive.horizontalPadding }}>
          <Text style={{ fontSize: responsive.titleSize, fontWeight: '700', color: theme.text, marginBottom: 8 }}>{event.title}</Text>
          <Text style={{ fontSize: responsive.bodySize, color: theme.textSecondary, marginBottom: 16 }}>{event.type}</Text>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color={theme.primary} />
            <Text style={{ fontSize: 14, color: theme.text, marginLeft: 8 }}>{formatDateLong(event.date)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={18} color={theme.primary} />
            <Text style={{ fontSize: 14, color: theme.text, marginLeft: 8 }}>{event.time}</Text>
          </View>

          {event.location ? (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={18} color={theme.primary} />
              <Text style={{ fontSize: 14, color: theme.text, marginLeft: 8 }}>{event.location}</Text>
            </View>
          ) : null}

          {event.organizer ? (
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={18} color={theme.primary} />
              <Text style={{ fontSize: 14, color: theme.text, marginLeft: 8 }}>{event.organizer}</Text>
            </View>
          ) : null}

          {event.contactPhone ? (
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={18} color={theme.primary} />
              <Text style={{ fontSize: 14, color: theme.text, marginLeft: 8 }}>{event.contactPhone}</Text>
            </View>
          ) : null}

          {event.maxAttendees ? (
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={18} color={theme.primary} />
              <Text style={{ fontSize: 14, color: theme.text, marginLeft: 8 }}>Max attendees: {event.maxAttendees}</Text>
            </View>
          ) : null}

          {event.description ? (
            <View style={{ marginTop: 24 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text, marginBottom: 8 }}>Description</Text>
              <Text style={{ fontSize: 14, color: theme.text, lineHeight: 22 }}>{event.description}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.registerBtn, { backgroundColor: theme.primary, opacity: registering ? 0.6 : 1 }]}
            onPress={handleRegister}
            disabled={registering}
          >
            <Text style={{ color: theme.white, fontSize: 16, fontWeight: '600' }}>
              {registering ? 'Registering...' : 'Register for Event'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  registerBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    minHeight: 48,
  },
});
