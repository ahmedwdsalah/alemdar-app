import FacebookIcon from '@/assets/icons/facebook.svg';
import InstagramIcon from '@/assets/icons/instagram.svg';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Linking,
    Modal,
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
  icon: React.ReactNode;
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

  // ⭐ Clean icons — no backgrounds
  const shareOptions: ShareOption[] = [
    {
      id: 'whatsapp',
      icon: (
        <View style={styles.iconWrapper}>
          <Ionicons name="logo-whatsapp" size={40} color="#25D366" />
        </View>
      ),
      label: 'WhatsApp',
      onPress: () => {
        const shareUrl = url || 'https://alemdarteknik.com';
        const waUrl = `https://wa.me/?text=${encodeURIComponent(`${message}\n\n${shareUrl}`)}`;
        Linking.openURL(waUrl);
        onClose();
      },
    },
    {
      id: 'instagram',
      icon: (
        <View style={styles.iconWrapper}>
          <InstagramIcon width={40} height={40} />
        </View>
      ),
      label: 'Instagram',
      onPress: () => {
        Linking.openURL('instagram://app');
        onClose();
      },
    },
    {
      id: 'facebook',
      icon: (
        <View style={styles.iconWrapper}>
          <FacebookIcon width={40} height={40} />
        </View>
      ),
      label: 'Facebook',
      onPress: () => {
        const shareUrl = url || 'https://alemdarteknik.com';
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        Linking.openURL(fbUrl);
        onClose();
      },
    },
  ];

  const textColor = isDark ? '#FFFFFF' : '#1A1A2E';
  const subTextColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(26,26,46,0.6)';
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
          },
        ]}
      >
        {/* ⭐ Full screen blur backdrop */}
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />

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
                backgroundColor: isDark
                  ? 'rgba(20,20,30,0.92)'
                  : 'rgba(255,255,255,0.92)',
              },
            ]}
          >
            <View style={styles.dragHandle} />

            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: textColor }]}>
                Share
              </Text>
              <Text style={[styles.headerSubtitle, { color: subTextColor }]}>
                {title}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: borderColor }]} />

            <View style={styles.optionsGrid}>
              {shareOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={option.onPress}
                  activeOpacity={0.7}
                  style={styles.optionItem}
                >
                  {option.icon}
                  <Text style={[styles.optionLabel, { color: textColor }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.divider, { backgroundColor: borderColor }]} />

            <TouchableOpacity
              onPress={shareViaNative}
              activeOpacity={0.7}
              style={styles.moreOption}
            >
              <Ionicons name="share-social-outline" size={22} color={textColor} />
              <Text style={[styles.moreText, { color: textColor }]}>More...</Text>
              <Ionicons name="chevron-forward" size={16} color={subTextColor} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
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
    marginHorizontal: 0,
    marginBottom: 0,
    borderRadius: 0,
    overflow: 'hidden',
  },
  blurContainer: {
    borderRadius: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    overflow: 'hidden',
    borderWidth: 0,
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
    marginHorizontal: -20,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  optionItem: {
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 14,
    marginBottom: 4,
  },
  moreText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  closeButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 0.5,
    marginTop: 4,
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
  },
});