import { t, useLocale } from '@/lib/i18n';
import BottomSheet, { ANIMATIONS, CUSTOM_BACKDROP_POSITIONS, type BottomSheetMethods } from '@devvie/bottom-sheet';
import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

type Props = { visible: boolean; onClose: () => void };

export default function PrivacySheet({ visible, onClose }: Props) {
  useLocale();
  const ref = useRef<BottomSheetMethods>(null);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const SHEET_BG = isDark ? '#101928' : '#ffffff';
  const TEXT     = isDark ? '#FFFFFF' : '#111111';
  const SUBTEXT  = isDark ? '#A9AEC0' : '#6B7280';
  const HANDLE   = isDark ? '#26344C' : '#d1d5db';

  useEffect(() => {
    if (visible) ref.current?.open();
    else ref.current?.close();
  }, [visible]);

  return (
    <BottomSheet
      ref={ref}
      height="75%"
      animationType={ANIMATIONS.SLIDE}
      backdropMaskColor="#00000080"
      closeOnBackdropPress
      closeOnDragDown
      hideDragHandle={false}
      dragHandleStyle={{ width: 40, height: 5, borderRadius: 3, backgroundColor: HANDLE, alignSelf: 'center', marginTop: 10 }}
      disableDragHandlePanning={false}
      disableBodyPanning={false}
      android_backdropMaskRippleColor="#26344C"
      customBackdropPosition={CUSTOM_BACKDROP_POSITIONS.BEHIND}
      modal
      openDuration={500}
      closeDuration={350}
      android_closeOnBackPress
      disableKeyboardHandling={false}
      onOpen={() => {}}
      onClose={onClose}
      onAnimate={(_v: number) => {}}
      style={{ backgroundColor: SHEET_BG }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: TEXT }]}>{t('privacyTitle')}</Text>
          <Text style={[styles.text, { color: SUBTEXT }]}>{t('privacyText')}</Text>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40 },
  title:   { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  text:    { fontSize: 13, lineHeight: 20 },
});
