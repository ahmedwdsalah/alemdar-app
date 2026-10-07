import { Text } from '@/components/Themed';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist, WishlistItem } from '@/context/WishlistContext';
import { useOfflineBannerVisible } from '@/hooks/useOfflineBanner';
import { t, useLocale } from '@/lib/i18n';
import { Ionicons } from '@expo/vector-icons';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  Alert,
  View as RNView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AMBER = "#FF6B00";

type WishlistCardProps = {
  item: WishlistItem;
  onRemove: (item: WishlistItem) => void;
  isDark: boolean;
  CARD_BG: string;
  TEXT: string;
  SUBTEXT: string;
  BORDER: string;
};

function WishlistCard({ item, onRemove, isDark, CARD_BG, TEXT, SUBTEXT, BORDER }: WishlistCardProps) {
  const router = useRouter();
  const { convertPrice } = useCurrency();
  const priceNum = parseFloat(`${item.price}.${item.dec}`);

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t('wishlistPage.removeTitle'),
      `Remove "${item.name}" from your wishlist?`,
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('wishlistPage.remove'), style: 'destructive', onPress: () => onRemove(item) },
      ]
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({ pathname: '/product-detail', params: { productId: item.id, section: item.sectionId } });
      }}
      style={{ backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}
    >
      <RNView style={{ width: 72, height: 72, borderRadius: 10, backgroundColor: isDark ? '#1a2030' : '#f5f5fa', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Ionicons name="image-outline" size={28} color={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} />
      </RNView>

      <RNView style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: item.accentColor, fontWeight: '600', marginBottom: 3 }}>
          {item.sectionTitle}
        </Text>
        <Text numberOfLines={2} style={{ fontSize: 13, fontWeight: '600', color: TEXT, lineHeight: 18, marginBottom: 6 }}>
          {item.name}
        </Text>
        <RNView style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: AMBER }}>
            {convertPrice(priceNum)}
          </Text>
          <RNView style={{ marginLeft: 6, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <RNView style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.low ? AMBER : '#2ecc71' }} />
            <Text style={{ fontSize: 10, color: item.low ? AMBER : '#2ecc71', fontWeight: '600' }}>{item.stock}</Text>
          </RNView>
        </RNView>
      </RNView>

      <TouchableOpacity onPress={handleRemove} style={{ padding: 6 }}>
        <Ionicons name="heart" size={22} color="#e3342f" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function EmptyWishlist({ isDark, TEXT, SUBTEXT }: { isDark: boolean; TEXT: string; SUBTEXT: string }) {
  const router = useRouter();
  return (
    <RNView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <RNView style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: isDark ? '#1e2433' : '#f0f0f5', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="heart-outline" size={44} color={AMBER} />
      </RNView>
      <Text style={{ fontSize: 20, fontWeight: '700', color: TEXT }}>{t('wishlistPage.empty')}</Text>
      <Text style={{ fontSize: 14, color: SUBTEXT, textAlign: 'center', paddingHorizontal: 40 }}>
        {t('wishlistPage.emptyDesc')}
      </Text>
      <TouchableOpacity onPress={() => router.push('/search')} style={{ marginTop: 8, backgroundColor: AMBER, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 13 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#000' }}>{t('wishlistPage.browseItems')}</Text>
      </TouchableOpacity>
    </RNView>
  );
}

export default function WishlistScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const offlineBannerVisible = useOfflineBannerVisible();

  const PAGE_BG = isDark ? '#0d0d0d' : '#f2f2f7';
  const CARD_BG = isDark ? '#131825' : '#ffffff';
  const TEXT    = isDark ? '#ffffff' : '#111111';
  const SUBTEXT = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';
  const BORDER  = isDark ? '#1e2433' : '#ebebeb';

  useLocale();
  const { items, toggleWishlist } = useWishlist();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<WishlistItem>) => (
      <WishlistCard
        item={item}
        onRemove={toggleWishlist}
        isDark={isDark}
        CARD_BG={CARD_BG}
        TEXT={TEXT}
        SUBTEXT={SUBTEXT}
        BORDER={BORDER}
      />
    ),
    [toggleWishlist, isDark, CARD_BG, TEXT, SUBTEXT, BORDER]
  );

  const keyExtractor = useCallback((item: WishlistItem) => item.id, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0d0d0d' : '#ffffff' }} edges={offlineBannerVisible ? [] : ['top']}>
      <RNView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: TEXT }}>
          {t('wishlistPage.title')}
        </Text>
        {items.length > 0 && (
          <Text style={{ fontSize: 13, color: SUBTEXT }}>
            {items.length} {t(items.length !== 1 ? 'wishlistPage.items' : 'wishlistPage.item')}
          </Text>
        )}
      </RNView>

      {items.length === 0 ? (
        <EmptyWishlist isDark={isDark} TEXT={TEXT} SUBTEXT={SUBTEXT} />
      ) : (
        <FlashList<WishlistItem>
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: PAGE_BG }}
        />
      )}
    </SafeAreaView>
  );
}