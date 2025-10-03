import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface ListItemProps {
  title: string;
  subtitle?: string;
  rightText?: string;
  rightSubtext?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
  showChevron?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  rightText,
  rightSubtext,
  icon,
  iconColor,
  onPress,
  showChevron = false,
}) => {
  const { theme } = useTheme();

  const content = (
    <View style={[styles.container, { backgroundColor: theme.card, borderBottomColor: theme.separator }]}>
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: iconColor || theme.primary }]}>
          <Ionicons name={icon} size={20} color="#FFFFFF" />
        </View>
      )}

      <View style={styles.contentContainer}>
        <View style={styles.leftContent}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
        </View>

        <View style={styles.rightContent}>
          {rightText && <Text style={[styles.rightText, { color: theme.text }]}>{rightText}</Text>}
          {rightSubtext && <Text style={[styles.rightSubtext, { color: theme.textSecondary }]}>{rightSubtext}</Text>}
          {showChevron && <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />}
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 2,
  },
  rightText: {
    fontSize: 17,
    fontWeight: '500',
  },
  rightSubtext: {
    fontSize: 15,
  },
});
