import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;
  onShare: () => void;
  onWishlist: () => void;
  onAddToCart: () => void;
  productName: string;
  productImage?: string;
  cardPosition?: { x: number; y: number; width: number; height: number };
};

export default function ProductContextMenu({
  visible,
  onClose,
  onShare,
  onWishlist,
  onAddToCart,
  productName,
  productImage,
  cardPosition,
}: Props) {
  const isDark = useColorScheme() === 'dark';

  const menuOptions = [
    {
      icon: 'heart-outline',
      label: 'Wishlist',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onWishlist();
        onClose();
      },
    },
    {
      icon: 'cart-outline',
      label: 'Add to Cart',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onAddToCart();
        onClose();
      },
    },
    {
      icon: 'share-outline',
      label: 'Share',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onShare();
        onClose();
      },
    },
  ];

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 22,
          mass: 0.8,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 18,
          mass: 0.7,
          stiffness: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.6,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const textColor = isDark ? '#FFFFFF' : '#1A1A2E';
  const subTextColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(26,26,46,0.6)';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(26,26,46,0.08)';

  const menuWidth = 260;
  const menuHeight = 300;

  let menuX = cardPosition ? cardPosition.x + cardPosition.width / 2 - menuWidth / 2 : SCREEN_WIDTH / 2 - menuWidth / 2;
  let menuY = cardPosition ? cardPosition.y - menuHeight - 10 : SCREEN_HEIGHT / 2 - menuHeight / 2;

  if (menuX < 12) menuX = 12;
  if (menuX + menuWidth > SCREEN_WIDTH - 12) menuX = SCREEN_WIDTH - menuWidth - 12;
  
  if (menuY < 40) {
    menuY = cardPosition ? cardPosition.y + cardPosition.height + 10 : 40;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.menuContainer,
            {
              left: menuX,
              top: menuY,
              width: menuWidth,
              transform: [
                { scale: scaleAnim },
                { translateY: translateY },
              ],
              opacity: fadeAnim,
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
                  : 'rgba(255,255,255,0.95)',
              },
            ]}
          >
            {/* Pointer arrow */}
            <View style={[
              styles.pointer,
              {
                borderBottomColor: isDark ? 'rgba(30,30,40,0.95)' : 'rgba(255,255,255,0.95)',
                top: -8,
                alignSelf: 'center',
              },
            ]} />

            {/* Product preview */}
            <View style={styles.productPreview}>
              <View style={styles.productImageWrapper}>
                {productImage ? (
                  <Image source={{ uri: productImage }} style={styles.productImage} />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Ionicons name="cube-outline" size={18} color={subTextColor} />
                  </View>
                )}
              </View>
              <Text style={[styles.productName, { color: textColor }]} numberOfLines={1}>
                {productName}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: borderColor }]} />

            {/* Menu options */}
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={option.label}
                onPress={option.onPress}
                activeOpacity={0.7}
                style={[
                  styles.menuItem,
                  index < menuOptions.length - 1 && {
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
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  menuContainer: {
    position: 'absolute',
    borderRadius: 20,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
  },
  blurContainer: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  pointer: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    zIndex: 5,
  },
  productPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  productImageWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
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