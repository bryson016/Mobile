import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CitizenEventsScreen() {
  const { theme } = useAppTheme();

  const navigation = useNavigation();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);
  const [events, setEvents] = useState([]);
  const [registered, setRegistered] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const result = await api.citizen.getEvents?.();
      setEvents(result?.events || []);
      setRegistered(result?.registrations || []);
    } catch (e) {
      console.error('Failed to load events', e);
    }
  };

  const handleRegister = (eventId) => {
    Alert.alert('Register', 'Registration functionality would be implemented here.');
  };

  return (
    
      <ScrollView style={styles(responsive, theme).container} contentContainerStyle={{ paddingBottom: scrollBottomPadding }} showsVerticalScrollIndicator={false}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles(responsive, theme).backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
          <Text style={styles(responsive, theme).backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles(responsive, theme).title}>Events</Text>
        <Text style={styles(responsive, theme).subtitle}>Upcoming community events and forums</Text>
      </View>

      {events.length === 0 ? (
        <View style={styles(responsive, theme).empty}>
          <Ionicons name="calendar-outline" size={48} color={theme.textMuted} />
          <Text style={styles(responsive, theme).emptyText}>No upcoming events</Text>
        </View>
      ) : (
        events.map((event, index) => {
          const isRegistered = registered.some(r => r.eventId === event.id);
          return (
            <View key={index} style={styles(responsive, theme).card}>
              <View style={styles(responsive, theme).cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles(responsive, theme).cardTitle}>{event.title}</Text>
                  <Text style={styles(responsive, theme).cardSub}>{event.type}</Text>
                </View>
                {isRegistered && <View style={styles(responsive, theme).registeredBadge}><Text style={styles(responsive, theme).registeredText}>Registered</Text></View>}
              </View>
              <View style={styles(responsive, theme).detailsRow}>
                <Ionicons name="calendar-outline" size={16} color={theme.textMuted} />
                <Text style={styles(responsive, theme).detailText}>{event.date} at {event.time}</Text>
              </View>
              <View style={styles(responsive, theme).detailsRow}>
                <Ionicons name="location-outline" size={16} color={theme.textMuted} />
                <Text style={styles(responsive, theme).detailText}>{event.venue}</Text>
              </View>
              {event.description && <Text style={styles(responsive, theme).description} numberOfLines={2}>{event.description}</Text>}
              {!isRegistered && (
                <TouchableOpacity style={styles(responsive, theme).registerBtn} onPress={() => handleRegister(event.id)}>
                  <Text style={styles(responsive, theme).registerBtnText}>Register</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}
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
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { marginTop: 12, color: theme.textMuted, fontSize: 14 },
  card: { backgroundColor: theme.surface, borderRadius: responsive.cardRadius, marginHorizontal: responsive.horizontalPadding, marginBottom: 12, padding: 16, boxShadow: "0 2 8 0 ${theme.shadow}", elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  cardSub: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  registeredBadge: { backgroundColor: theme.success + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  registeredText: { fontSize: 12, fontWeight: '600', color: theme.success },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  detailText: { fontSize: 14, color: theme.textSecondary, marginLeft: 8 },
  description: { fontSize: 14, color: theme.textSecondary, marginTop: 12, lineHeight: 20 },
  registerBtn: { backgroundColor: theme.primary, padding: 12, borderRadius: responsive.buttonRadius, alignItems: 'center', marginTop: 16 },
  registerBtnText: { color: theme.white, fontSize: 14, fontWeight: '600' },
});
