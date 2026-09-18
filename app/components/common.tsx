import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: any;
}

export const Skeleton = ({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) => {
  const { theme } = useAppTheme();
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.border,
        },
        style,
      ]}
    />
  );
};

export const Card = ({ children, style, onPress }: { children?: React.ReactNode; style?: any; onPress?: () => void }) => {
  const { theme, responsive } = useAppTheme();
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: responsive.cardRadius,
          padding: responsive.cardPadding,
          marginHorizontal: responsive.horizontalPadding,
          marginBottom: 12,
          elevation: 2,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {children}
    </Wrapper>
  );
};

export const AppText = ({
  children,
  variant = 'body',
  style,
  ...props
}: {
  children?: React.ReactNode;
  variant?: 'title' | 'subtitle' | 'body' | 'caption' | 'label';
  style?: any;
} & any) => {
  const { theme, responsive } = useAppTheme();
  const fontSizeMap = {
    title: responsive.titleSize,
    subtitle: responsive.bodySize,
    body: responsive.bodySize,
    caption: 12,
    label: responsive.sectionHeaderSize,
  };
  const fontWeightMap = {
    title: '700',
    subtitle: '500',
    body: '400',
    caption: '400',
    label: '600',
  };
  return (
    <Text
      style={[
        {
          fontSize: fontSizeMap[variant],
          fontWeight: fontWeightMap[variant] as any,
          color: theme.text,
          lineHeight: fontSizeMap[variant] * 1.4,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export const StatusBadge = ({
  status,
  type = 'complaint',
}: {
  status: string;
  type?: 'complaint' | 'bursary' | 'event' | 'project';
}) => {
  const { theme } = useAppTheme();

  const getColor = () => {
    const s = String(status).toLowerCase();
    switch (type) {
      case 'complaint':
        if (s === 'open' || s === 'assigned') return theme.info;
        if (s === 'in_progress' || s === 'in progress') return theme.warning;
        if (s === 'resolved' || s === 'closed') return theme.success;
        return theme.gray;
      case 'bursary':
        if (s === 'approved') return theme.success;
        if (s === 'rejected' || s === 'withdrawn') return theme.danger;
        if (s === 'reviewing' || s === 'documents_required') return theme.warning;
        if (s === 'pending' || s === 'draft') return theme.info;
        return theme.gray;
      case 'event':
        if (s === 'in_progress') return theme.warning;
        if (s === 'completed') return theme.success;
        if (s === 'cancelled') return theme.danger;
        return theme.info;
      case 'project':
        if (s === 'completed') return theme.success;
        if (s === 'delayed') return theme.danger;
        if (s === 'ongoing') return theme.info;
        return theme.warning;
      default:
        return theme.gray;
    }
  };

  const labelColor = getColor();
  return (
    <View style={{ backgroundColor: labelColor + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: labelColor }}>{status}</Text>
    </View>
  );
};

export const Loader = ({ text = 'Loading...' }: { text?: string }) => {
  const { theme, responsive } = useAppTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={{ fontSize: responsive.bodySize, color: theme.textSecondary, marginTop: 16 }}>{text}</Text>
    </View>
  );
};

export const EmptyState = ({
  icon = 'document-text-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) => {
  const { theme, responsive } = useAppTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 }}>
      <View
        style={{
          width: responsive.isTablet ? 80 : 64,
          height: responsive.isTablet ? 80 : 64,
          borderRadius: responsive.isTablet ? 40 : 32,
          backgroundColor: theme.chipBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Ionicons name={icon as any} size={responsive.isTablet ? 36 : 30} color={theme.textMuted} />
      </View>
      <Text style={{ fontSize: responsive.isTablet ? 18 : 16, fontWeight: '600', color: theme.text, marginBottom: 4, textAlign: 'center' }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ fontSize: responsive.bodySize, color: theme.textSecondary, marginBottom: 16, textAlign: 'center', lineHeight: 20 }}>
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          style={{
            backgroundColor: theme.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: responsive.buttonRadius,
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={onAction}
        >
          <Text style={{ color: theme.white, fontWeight: '600', fontSize: 14 }}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export const PullToRefreshView = ({
  children,
  refreshing,
  onRefresh,
}: {
  children: React.ReactNode;
  refreshing: boolean;
  onRefresh: () => void;
}) => {
  return (
    <View style={{ flex: 1 }} {...({ refreshing, onRefresh } as any)}>
      {children}
    </View>
  );
};
