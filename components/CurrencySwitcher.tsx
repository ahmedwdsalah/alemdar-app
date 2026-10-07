import { currencies, useCurrency } from '@/context/CurrencyContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';

export default function CurrencySwitcher() {
  const [visible, setVisible] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const isDark = useColorScheme() === 'dark';

  const bgColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const subTextColor = isDark ? '#8E8E93' : '#8E8E93';
  const dividerColor = isDark ? '#38383A' : '#E5E5EA';

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={[styles.currencyButton, { marginLeft: 12 }]}
      >
        <Text style={[styles.currencyText, { color: textColor }]}>
          {currency.symbol}
        </Text>
        <Ionicons name="chevron-down" size={14} color={subTextColor} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={[styles.modalContainer, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: textColor }]}>
                Select Currency
              </Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {currencies.map((cur) => (
              <TouchableOpacity
                key={cur.code}
                onPress={() => {
                  setCurrency(cur);
                  setVisible(false);
                }}
                style={[
                  styles.currencyOption,
                  currency.code === cur.code && styles.selectedOption,
                ]}
              >
                <View style={styles.currencyInfo}>
                  <Text style={[styles.currencySymbol, { color: textColor }]}>
                    {cur.symbol}
                  </Text>
                  <Text style={[styles.currencyLabel, { color: textColor }]}>
                    {cur.label}
                  </Text>
                </View>
                {currency.code === cur.code && (
                  <Ionicons name="checkmark-circle" size={22} color="#FF6B00" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 360,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  selectedOption: {
    backgroundColor: '#FF6B00',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    width: 40,
  },
  currencyLabel: {
    fontSize: 16,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
  },
});