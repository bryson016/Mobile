import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SearchResult = {
  id: number;
  type: 'program' | 'announcement' | 'event' | 'project' | 'story' | 'public-participation';
  title: string;
  subtitle?: string;
  description?: string;
};

export default function CitizenSearchScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const { theme, responsive } = useAppTheme();
  const insets = useSafeAreaInsets();
  const initialQuery = route?.params?.initialQuery || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [programs, setPrograms] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [publicParticipation, setPublicParticipation] = useState<any[]>([]);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      loadAllPublicData();
    }
  }, []);

  const loadAllPublicData = async () => {
    try {
      const [programsRes, annRes, eventsRes, projectsRes, storiesRes, ppRes] = await Promise.all([
        api.community.getPublicPrograms().catch(() => ({ programs: [] })),
        api.citizen.getAnnouncements().catch(() => ({ announcements: [] })),
        api.community.getPublicEvents().catch(() => ({ events: [] })),
        api.citizen.getProjects().catch(() => ({ projects: [] })),
        api.community.getImpactStories().catch(() => ({ stories: [] })),
        api.citizen.getPublicParticipation().catch(() => ({ publicParticipation: [] })),
      ]);
      setPrograms(programsRes.programs || []);
      setAnnouncements(annRes.announcements || []);
      setEvents(eventsRes.events || []);
      setProjects(projectsRes.projects || []);
      setStories(storiesRes.stories || []);
      setPublicParticipation(ppRes.publicParticipation || []);
      setLoaded(true);
    } catch (e) {
      setError('Failed to load search data.');
    }
  };

  const performSearch = useCallback(
    (text: string) => {
      const trimmed = text.trim().toLowerCase();
      if (!trimmed) {
        setResults([]);
        return;
      }

      const allResults: SearchResult[] = [];

      programs.forEach((p) => {
        if (p.name?.toLowerCase().includes(trimmed) || p.description?.toLowerCase().includes(trimmed) || p.category?.toLowerCase().includes(trimmed)) {
          allResults.push({ id: p.id, type: 'program', title: p.name, subtitle: p.category, description: p.description });
        }
      });

      announcements.forEach((a) => {
        if (a.title?.toLowerCase().includes(trimmed) || a.description?.toLowerCase().includes(trimmed) || a.category?.toLowerCase().includes(trimmed)) {
          allResults.push({ id: a.id, type: 'announcement', title: a.title, subtitle: a.category, description: a.description });
        }
      });

      events.forEach((e) => {
        if (e.title?.toLowerCase().includes(trimmed) || e.description?.toLowerCase().includes(trimmed) || e.type?.toLowerCase().includes(trimmed)) {
          allResults.push({ id: e.id, type: 'event', title: e.title, subtitle: `${e.date} • ${e.time}`, description: e.description });
        }
      });

      projects.forEach((p) => {
        if (p.projectName?.toLowerCase().includes(trimmed) || p.description?.toLowerCase().includes(trimmed) || p.category?.toLowerCase().includes(trimmed)) {
          allResults.push({ id: p.id, type: 'project', title: p.projectName, subtitle: p.category, description: p.description });
        }
      });

      stories.forEach((s) => {
        if (s.title?.toLowerCase().includes(trimmed) || s.description?.toLowerCase().includes(trimmed) || s.category?.toLowerCase().includes(trimmed)) {
          allResults.push({ id: s.id, type: 'story', title: s.title, subtitle: s.category, description: s.description });
        }
      });

      publicParticipation.forEach((p) => {
        if (p.title?.toLowerCase().includes(trimmed) || p.description?.toLowerCase().includes(trimmed)) {
          allResults.push({ id: p.id, type: 'public-participation', title: p.title, subtitle: p.category, description: p.description });
        }
      });

      setResults(allResults.slice(0, 50));
    },
    [programs, announcements, events, projects, stories, publicParticipation]
  );

  const debouncedSearch = useMemo(
    () => {
      const debounceFn = (fn: (text: string) => void, delay: number) => {
        const timerRef: { current: ReturnType<typeof setTimeout> | null } = { current: null };
        return (text: string) => {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          timerRef.current = setTimeout(() => {
            fn(text);
            timerRef.current = null;
          }, delay);
        };
      };
      return debounceFn((text: string) => {
        performSearch(text);
      }, 300);
    },
    [performSearch]
  );

  const handleSearch = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'program':
        return { name: 'folder-open' as any, color: theme.info };
      case 'announcement':
        return { name: 'megaphone' as any, color: theme.warning };
      case 'event':
        return { name: 'calendar' as any, color: theme.success };
      case 'project':
        return { name: 'business' as any, color: theme.primary };
      case 'story':
        return { name: 'book' as any, color: theme.secondary };
      case 'public-participation':
        return { name: 'people' as any, color: theme.accent };
      default:
        return { name: 'search', color: theme.textMuted };
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'program':
        return 'Program';
      case 'announcement':
        return 'Announcement';
      case 'event':
        return 'Event';
      case 'project':
        return 'Project';
      case 'story':
        return 'Impact Story';
      case 'public-participation':
        return 'Public Participation';
      default:
        return '';
    }
  };

  const renderItem = ({ item }: { item: SearchResult }) => {
    const icon = getResultIcon(item.type);
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.surface,
          borderRadius: responsive.cardRadius,
          padding: responsive.cardPadding,
          marginBottom: 8,
          elevation: 1,
        }}
        onPress={() => {
          if (item.type === 'story') {
            navigation.navigate('ImpactStoryDetail', { slug: '' });
          } else if (item.type === 'event') {
            navigation.navigate('EventDetail', { eventId: item.id });
          }
          // For other types, could navigate to detail screens
        }}
      >
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: icon.color + '15', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Ionicons name={icon.name} size={22} color={icon.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>{item.title}</Text>
          <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>{getTypeLabel(item.type)}</Text>
          {item.subtitle ? <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{item.subtitle}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={[styles.searchHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={[styles.searchBox, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search programs, announcements, events..."
            placeholderTextColor={theme.textMuted}
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!loaded && !error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 16, color: theme.textSecondary }}>Loading search data...</Text>
        </View>
      ) : error ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Ionicons name="cloud-offline-outline" size={48} color={theme.textMuted} />
          <Text style={{ color: theme.textSecondary, marginTop: 12, textAlign: 'center' }}>{error}</Text>
        </View>
      ) : query.trim().length === 0 ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Ionicons name="search" size={48} color={theme.textMuted} />
          <Text style={{ color: theme.textSecondary, marginTop: 12, textAlign: 'center', fontSize: 14 }}>
            Search public information: programs, bursary info, projects, events, announcements, help/FAQs.
          </Text>
          <Text style={{ color: theme.danger, marginTop: 8, fontSize: 12, textAlign: 'center' }}>
            Private citizen data (cases, applications, phone, email) is never searchable.
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Ionicons name="search-outline" size={48} color={theme.textMuted} />
          <Text style={{ color: theme.textSecondary, marginTop: 12 }}>No results found for "{query}".</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: responsive.horizontalPadding, paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 15, paddingHorizontal: 8 },
});
