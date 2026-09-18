import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDateLong, formatCurrency } from '../../utils/dateUtils';
import { StatusBadge } from '../../components/common';

export default function ImpactStoryDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme, responsive } = useAppTheme();
  const insets = useSafeAreaInsets();

  const { story }: { story: any } = route.params || {};

  const categoryLabel = story?.category?.replace(/_/g, ' ') || 'Community Development';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: insets.top, paddingBottom: responsive.verticalPadding }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: responsive.horizontalPadding, marginBottom: 16 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
          <Text style={{ color: theme.text, fontSize: 16, marginLeft: 4 }}>Back</Text>
        </TouchableOpacity>

        {story?.imageUrl ? (
          <Image source={{ uri: story.imageUrl }} style={{ width: '100%', height: 220 }} resizeMode="cover" />
        ) : (
          <View style={{ width: '100%', height: 220, backgroundColor: theme.chipBg, alignItems: 'center', justifyContent: 'center', marginHorizontal: responsive.horizontalPadding }}>
            <Ionicons name="image-outline" size={64} color={theme.textMuted} />
          </View>
        )}

        <View style={{ paddingHorizontal: responsive.horizontalPadding, marginTop: 16 }}>
          <Text style={{ fontSize: responsive.titleSize, fontWeight: '700', color: theme.text, marginBottom: 8 }}>{story?.title}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <View style={{ backgroundColor: theme.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.primary }}>{categoryLabel}</Text>
            </View>
            <Text style={{ fontSize: 12, color: theme.textMuted }}>
              {formatDateLong(story?.publishedAt || story?.createdAt)}
            </Text>
          </View>

          {story?.location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Ionicons name="location-outline" size={14} color={theme.textMuted} />
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>{story.location}</Text>
            </View>
          ) : null}

          {story?.beneficiaries ? (
            <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 12 }}>
              Beneficiaries: {story.beneficiaries}
            </Text>
          ) : null}

          <Text style={{ fontSize: responsive.bodySize, color: theme.text, lineHeight: 24, marginBottom: 16 }}>
            {story?.content || story?.description}
          </Text>

          {story?.program ? (
            <View style={{ backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: responsive.cardPadding, marginBottom: 24 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>
                Related Program
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>{story.program.name}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}
