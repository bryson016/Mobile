import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useThrottledNavigate } from './useThrottledNavigate';

const HERO_IMAGE = require('../../../assets/ateo.PNG');

export const WelcomeHero = () => {
  const navigate = useThrottledNavigate();
  const { responsive } = useAppTheme();

  const heroHeight = responsive.isTablet ? 192 : 168;
  const heroTextColor = '#FFFFFF';

  return (
    <View style={styles.wrapper}>
      <ImageBackground
        source={HERO_IMAGE}
        style={[styles.hero, { height: heroHeight }]}
        imageStyle={styles.heroImage}
        resizeMode="cover"
      >
        {/* Light scrim so the CTA stays legible but the photo stays visible */}
        <View style={styles.scrim} />

        {/* Copy block — anchored to the bottom-left corner */}
        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.cta, { borderColor: heroTextColor + '45' }]}
            onPress={() => navigate('ReportIssue')}
            accessibilityLabel="Report an issue"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.85}
          >
            <Text style={[styles.ctaText, { color: heroTextColor }]}>Report an Issue</Text>
            <Ionicons name="arrow-forward" size={14} color={heroTextColor} />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  hero: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  heroImage: {
    borderRadius: 22,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(20, 22, 28, 0.18)',
  },
  content: {
    position: 'absolute',
    left: 18,
    bottom: 16,
    alignItems: 'flex-start',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    minHeight: 36,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
