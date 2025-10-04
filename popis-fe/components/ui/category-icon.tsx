import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCategoryEmoji, getCategoryColor, getCategoryLabel } from '@/lib/services/events';

interface CategoryIconProps {
  category: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  style?: any;
}

export function CategoryIcon({
  category,
  size = 'medium',
  showLabel = false,
  style
}: CategoryIconProps) {
  const emoji = getCategoryEmoji(category);
  const label = getCategoryLabel(category);
  const color = getCategoryColor(category);

  const getSize = () => {
    switch (size) {
      case 'small':
        return { circle: 24, emoji: 12 };
      case 'large':
        return { circle: 40, emoji: 20 };
      default:
        return { circle: 32, emoji: 16 };
    }
  };

  const { circle, emoji: emojiSize } = getSize();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconCircle, { width: circle, height: circle, borderRadius: circle / 2 }]}>
        <Text style={[styles.iconEmoji, { fontSize: emojiSize }]}>
          {emoji}
        </Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, { color }]}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    backgroundColor: '#F1DAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
