import { OfflineBanner } from "@/components/OfflineBanner";
import { EasUpdateAlert } from "@/components/updates/EasUpdateAlert";
import { useColorScheme } from "@/components/useColorScheme";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { LanguageProvider } from "@/lib/i18n";
import { setupOnlineManager } from "@/lib/online-manager";
import { createQueryClient, persistOptions } from "@/lib/query-client";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export { ErrorBoundary } from "expo-router";

let _set: ((s: string | null) => void) | null = null;
export const openSheet = (s: string) => _set?.(s);
export const closeSheets = () => _set?.(null);

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 400, fade: true });
setupOnlineManager();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(createQueryClient);
  const isDark = colorScheme === "dark";
  const appBackground = isDark ? "#0d0d0d" : "#ffffff";
  const navigationTheme = isDark ? DarkTheme : DefaultTheme;

  const [sheet, setSheet] = useState<string | null>(null);

  useEffect(() => {
    _set = setSheet;
    return () => {
      _set = null;
    };
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: appBackground }}>
      <LanguageProvider>
        <CurrencyProvider>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={persistOptions}
          >
            <WishlistProvider>
              <CartProvider>
                <EasUpdateAlert />
                <OfflineBanner />
                <ThemeProvider
                  value={{
                    ...navigationTheme,
                    colors: {
                      ...navigationTheme.colors,
                      background: appBackground,
                      card: appBackground,
                    },
                  }}
                >
                  <Stack
                    screenOptions={{
                      contentStyle: { backgroundColor: appBackground },
                    }}
                  >
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="product-detail"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="cart" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="help-center"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="help/faq"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="address-edit"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="modal"
                      options={{ presentation: "modal" }}
                    />
                    <Stack.Screen
                      name="notifications"
                      options={{ headerShown: false }}
                    />
                  </Stack>
                </ThemeProvider>
              </CartProvider>
            </WishlistProvider>
          </PersistQueryClientProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}