import { CachedImage } from '@/components/CachedImage';
import { Text } from '@/components/Themed';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';
import { resolveImageUrl } from '@/lib/image-url';
import { splitPrice } from '@/lib/price';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import { Pressable, View as RNView, TouchableOpacity, useColorScheme } from 'react-native';
import CustomShareMenu from './CustomShareMenu';
import ProductContextMenu from './ProductContextMenu';

const AMBER = '#FF6B00';

export type CardProduct = {
  id: number | string;
  section: string;
  name: string | null;
  price: string | null;
  image_filename?: string | null;
  category?: string | null;
};

type Props = {
  product: CardProduct;
  sectionTitle?: string;
  accentColor?: string;
  width?: number;
  fluid?: boolean;
};

function ProductCardBase({ product, sectionTitle, accentColor = AMBER, width = 155, fluid = false }: Props) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { convertPrice } = useCurrency();
  const isDark = useColorScheme() === 'dark';
  const [menuVisible, setMenuVisible] = useState(false);
  const [shareMenuVisible, setShareMenuVisible] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const CARD_BG = isDark ? '#131825' : '#ffffff';
  const TEXT = isDark ? '#ffffff' : '#111111';
  const SUBTEXT = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';
  const BORDER = isDark ? '#1e2433' : '#ebebeb';
  const IMG_BG = isDark ? '#1a2030' : '#f5f5fa';

  const id = String(product.id);
  const name = product.name ?? 'Product';
  const { whole, dec } = splitPrice(product.price);
  const imageUrl = resolveImageUrl(product.image_filename);
  const categoryLabel = sectionTitle ?? product.category ?? '';

  const isProductWishlisted = isWishlisted(id);
  const priceNum = parseFloat(`${whole}.${dec}`);

  const goToDetail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/product-detail',
      params: {
        productId: id,
        section: product.section,
      },
    });
  };

  const handleAdd = (e: any = null) => {
    if (e) e.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addToCart({
      id,
      name,
      price: whole,
      dec,
      categoryId: product.section,
      categoryTitle: categoryLabel || product.section,
      image: imageUrl,
    });
  };

  const handleWishlist = (e: any = null) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault?.();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleWishlist({
      id,
      name,
      price: whole,
      dec,
      stock: '',
      low: false,
      sectionId: product.section,
      sectionTitle: categoryLabel || product.section,
      accentColor,
    });
  };

  const openShareMenu = () => {
    setShareMenuVisible(true);
  };

  const handleLongPress = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setCardPosition({
      x: pageX - 20,
      y: pageY - 60,
      width: 0,
      height: 0,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setMenuVisible(true);
  };

  return (
    <>
      <Pressable
        onPress={goToDetail}
        onLongPress={handleLongPress}
        delayLongPress={400}
        style={({ pressed }) => ({
          width: fluid ? '100%' : width,
          backgroundColor: CARD_BG,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: BORDER,
          marginRight: fluid ? 0 : 12,
          overflow: 'hidden',
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <RNView style={{ backgroundColor: IMG_BG, minHeight: 120 }}>
          {imageUrl ? (
            <CachedImage
              source={{ uri: imageUrl }}
              style={{ width: '100%', aspectRatio: 1 }}
              contentFit="cover"
              recyclingKey={id}
            />
          ) : (
            <RNView style={{ height: 120, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="image-outline" size={30} color={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} />
            </RNView>
          )}
        </RNView>

        <RNView style={{ padding: 10 }}>
          <Text numberOfLines={2} style={{ fontSize: 11, fontWeight: '600', color: TEXT, lineHeight: 15, minHeight: 30, marginBottom: 8 }}>
            {name}
          </Text>
          
          <RNView style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: TEXT }}>
              {convertPrice(priceNum)}
            </Text>
          </RNView>

          <RNView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <TouchableOpacity
              onPress={handleAdd}
              activeOpacity={0.7}
              style={{
                flex: 1,
                backgroundColor: isDark ? CARD_BG : "#fff",
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <Ionicons name="cart-outline" size={24} color={isDark ? AMBER : '#000'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleWishlist}
              activeOpacity={0.7}
              style={{
                backgroundColor: isDark ? CARD_BG : "#fff",
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 12,
                paddingRight: 16,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: isDark ? CARD_BG : "#fff",
              }}
            >
              <Ionicons
                name={isProductWishlisted ? 'heart' : 'heart-outline'}
                size={24}
                color={isProductWishlisted ? '#e8375a' : AMBER}
              />
            </TouchableOpacity>
          </RNView>
        </RNView>
      </Pressable>

      <ProductContextMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onShare={openShareMenu}
        onWishlist={handleWishlist}
        onAddToCart={handleAdd}
        productName={name}
        productImage={imageUrl || undefined}
        cardPosition={cardPosition}
      />

      {/* ⭐ Custom Share Menu */}
      <CustomShareMenu
        visible={shareMenuVisible}
        onClose={() => setShareMenuVisible(false)}
        title={name}
        message={`Check out ${name} on Alemdar Teknik!`}
        url={imageUrl || 'https://alemdarteknik.com'}
      />
    </>
  );
}

export const ProductCard = memo(ProductCardBase);