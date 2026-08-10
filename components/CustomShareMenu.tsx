import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Linking,
    Modal,
    Platform,
    Pressable,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ShareOption = {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  url?: string;
};

export default function CustomShareMenu({ visible, onClose, title, message, url }: Props) {
  const isDark = useColorScheme() === 'dark';

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 30,
          mass: 1,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 28,
          mass: 0.8,
          stiffness: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const shareViaNative = async () => {
    try {
      await Share.share({
        message: `${message}\n\n${url || ''}`,
        title: title,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
    onClose();
  };

  // ⭐ Clean share options - matching context menu style
  const shareOptions: ShareOption[] = [
    {
      id: 'message',
      icon: 'chatbubble-outline',
      label: 'Messages',
      onPress: () => {
        const smsUrl = Platform.OS === 'ios' 
          ? `sms:&body=${encodeURIComponent(`${message}\n\n${url || ''}`)}`
          : `sms:?body=${encodeURIComponent(`${message}\n\n${url || ''}`)}`;
        Linking.openURL(smsUrl);
        onClose();
      },
    },
    {
      id: 'mail',
      icon: 'mail-outline',
      label: 'Mail',
      onPress: () => {
        Linking.openURL(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${message}\n\n${url || ''}`)}`);
        onClose();
      },
    },
    {
      id: 'share',
      icon: 'share-social-outline',
      label: 'More...',
      onPress: shareViaNative,
    },
  ];

  const textColor = isDark ? '#FFFFFF' : '#1A1A2E';
  const subTextColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(26,26,46,0.6)';
  const bgColor = isDark ? 'rgba(20,20,30,0.95)' : 'rgba(255,255,255,0.95)';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(26,26,46,0.08)';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
            backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)',
          },
        ]}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />

        <Animated.View
          style={[
            styles.menuContainer,
            {
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <BlurView
            intensity={120}
            tint={isDark ? 'dark' : 'light'}
            style={[
              styles.blurContainer,
              {
                backgroundColor: bgColor,
              },
            ]}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: textColor }]}>
                Share
              </Text>
              <Text style={[styles.headerSubtitle, { color: subTextColor }]}>
                {title}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: borderColor }]} />

            {/* ⭐ Clean share options - matching context menu */}
            {shareOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                onPress={option.onPress}
                activeOpacity={0.7}
                style={[
                  styles.menuItem,
                  index < shareOptions.length - 1 && {
                    borderBottomWidth: 0.5,
                    borderBottomColor: borderColor,
                  },
                ]}
              >
                <Ionicons name={option.icon as any} size={22} color={textColor} />
                <Text style={[styles.menuItemText, { color: textColor }]}>
                  {option.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={subTextColor} />
              </TouchableOpacity>
            ))}

            {/* Close button */}
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { borderTopColor: borderColor }]}
            >
              <Text style={[styles.closeText, { color: textColor }]}>Cancel</Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    flex: 1,
  },
  menuContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  blurContainer: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C7C7CC',
    alignSelf: 'center',
    marginBottom: 16,
    opacity: 0.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
  divider: {
    height: 0.5,
    marginHorizontal: -16,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  closeButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 0.5,
    marginTop: 4,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});