import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../../hooks/useAppTheme';

interface DashboardWidgetsProps {
  children?: React.ReactNode;
}

/**
 * StatCard — compact informational stat tile.
 * Used by the Quick Stats row.
 */
export const StatCard = ({
  label,
  value,
  icon,
  accent,
  onPress,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accent: string;
  onPress?: () => void;
}) => {
  const { theme, responsive } = useAppTheme();
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[
        styles.statCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
    >
      <View style={[styles.statIcon, { backgroundColor: accent + '22' }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]} numberOfLines={1}>
        {label}
      </Text>
    </Wrapper>
  );
};

/**
 * ActionCard — compact quick-action tile in a 2-column grid.
 */
export const ActionCard = ({
  label,
  icon,
  accent,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accent: string;
  onPress: () => void;
}) => {
  const { theme, responsive } = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.actionCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.actionIcon, { backgroundColor: accent + '1F' }]}>
        <Ionicons name={icon} size={22} color={accent} />
      </View>
      <Text style={[styles.actionLabel, { color: theme.text }]} numberOfLines={2}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={14} color={theme.textMuted} style={styles.actionChevron} />
    </TouchableOpacity>
  );
};

/**
 * ActivityItem — a single recent-activity row.
 */
export const ActivityItem = ({
  icon,
  iconColor,
  title,
  description,
  time,
  status,
  statusColor,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  title: string;
  description: string;
  time: string;
  status?: string;
  statusColor?: string;
  onPress?: () => void;
}) => {
  const { theme } = useAppTheme();
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[styles.activityItem, { borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={[styles.activityIcon, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.activityBody}>
        <View style={styles.activityTop}>
          <Text style={[styles.activityTitle, { color: theme.text }]} numberOfLines={1}>
            {title}
          </Text>
          {status ? (
            <View style={[styles.activityBadge, { backgroundColor: (statusColor || theme.primary) + '22' }]}>
              <Text style={[styles.activityBadgeText, { color: statusColor || theme.primary }]}>
                {status}
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.activityDesc, { color: theme.textSecondary }]} numberOfLines={1}>
          {description}
        </Text>
        <Text style={[styles.activityTime, { color: theme.textMuted }]}>{time}</Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={16} color={theme.textMuted} style={styles.activityChevron} />
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  // StatCard
  statCard: {
    flex: 1,
    minWidth: 96,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  // ActionCard
  actionCard: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    margin: 6,
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 17,
    letterSpacing: 0.1,
  },
  actionChevron: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  // ActivityItem
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activityBody: {
    flex: 1,
    minWidth: 0,
  },
  activityTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    flexShrink: 1,
    letterSpacing: -0.1,
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    flexShrink: 0,
  },
  activityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  activityDesc: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  activityTime: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500',
  },
  activityChevron: {
    flexShrink: 0,
  },
});