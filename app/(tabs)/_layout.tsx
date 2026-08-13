import LanguageSheet from "@/components/LanguageSheet";
import { NAVBAR_V2_STYLE, NavbarV2Background } from "@/components/NavbarV2";
import OnboardingSheet from "@/components/OnboardingSheet";
import PrivacySheet from "@/components/PrivacySheet";
import SettingsSheet from "@/components/SettingsSheet";
import { useColorScheme } from "@/components/useColorScheme";
import BottomSheet, { type BottomSheetMethods } from "@devvie/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const ONBOARDING_KEY = "onboarding_done_v5";// bump it to the next number for the boarding flow to appear v5 to v6 

let _set: ((s: string | null) => void) | null = null;
export const openSheet = (s: string) => _set?.(s);
export const closeSheets = () => _set?.(null);

let _showConfirm: ((s: string | null) => void) | null = null;
export const showServiceConfirm = (s: string) => _showConfirm?.(s);
export const hideServiceConfirm = () => _showConfirm?.(null);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [sheet, setSheet] = useState<string | null>(null);
  const [confirmService, setConfirmService] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const serviceSheetRef = useRef<BottomSheetMethods>(null);

  useEffect(() => {
    _set = setSheet;
    _showConfirm = setConfirmService;
  }, []);

  useEffect(() => {
    (async () => {
      const done = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!done) setShowOnboarding(true);
    })();
  }, []);

  useEffect(() => {
    if (confirmService) {
      serviceSheetRef.current?.open();
    } else {
      serviceSheetRef.current?.close();
    }
  }, [confirmService]);

  const handleOnboardingClose = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const ACTIVE_COLOR = "#FF6B00";
  const INACTIVE_DARK = "#8A8A9A";
  const INACTIVE_LIGHT = "#8E8E93";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar
          style={isDark ? "light" : "dark"}
          backgroundColor="transparent"
          translucent
        />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: ACTIVE_COLOR,
            tabBarInactiveTintColor: isDark ? INACTIVE_DARK : INACTIVE_LIGHT,
            tabBarShowLabel: false,
            tabBarBackground: NavbarV2Background(isDark ? "dark" : "light"),
            tabBarStyle: {
              ...NAVBAR_V2_STYLE,
              backgroundColor: "transparent",
              paddingBottom: insets.bottom + 48,
            },
            tabBarIconStyle: {
              marginTop: 8,
            },
            tabBarItemStyle: {
              borderRadius: 34,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => (
                <Svg width={30} height={35} viewBox="0 0 32 32">
                  <Path
                    d="M9.8 11.6l1.3-8.4h-6.6l-2.8 7.2c-0.1 0.3-0.1 0.5-0.1 0.8 0 1.8 1.8 3.2 4.1 3.2 2.1 0 3.8-1.2 4.1-2.8zM16 14.4c2.3 0 4.1-1.4 4.1-3.2 0-0.1 0-0.1 0-0.2l-0.8-7.8h-6.6l-0.8 7.8c0 0.1 0 0.1 0 0.2 0 1.8 1.8 3.2 4.1 3.2zM24 16.1v6.3h-16v-6.3c-0.7 0.3-1.5 0.4-2.3 0.4-0.3 0-0.6 0-0.9-0.1v10.2c0 1.2 1 2.2 2.2 2.2h18c1.2 0 2.2-1 2.2-2.2v-10.2c-0.3 0-0.6 0.1-0.9 0.1-0.8 0-1.6-0.1-2.3-0.4zM30.3 10.4l-2.8-7.2h-6.6l1.3 8.4c0.2 1.6 2 2.8 4.1 2.8 2.3 0 4.1-1.4 4.1-3.2 0-0.3 0-0.5-0.1-0.8z"
                    fill={color}
                  />
                </Svg>
              ),
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: "Search",
              tabBarIcon: ({ color }) => (
                <Svg width={30} height={35} viewBox="0 0 32 32">
                  <Path
                    d="M24 9.6a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0ZM15.5 4.1A3.2 3.2 0 0 1 17.8 3.2l7.8 0.1a3.2 3.2 0 0 1 3.2 3.1l0 8a3.2 3.2 0 0 1-0.9 2.2l-0.6 0.6a7.2 7.2 0 0 0-1.1-1.1l0.6-0.6a1.6 1.6 0 0 0 0.4-1.1l0-8a1.6 1.6 0 0 0-1.6-1.6L17.8 4.8a1.6 1.6 0 0 0-1.1 0.5L6 15.9a1.6 1.6 0 0 0 0 2.3l7.9 7.9a1.6 1.6 0 0 0 2.2 0.1c0.3 0.4 0.7 0.8 1.1 1.1a3.2 3.2 0 0 1-4.5-0.1L4.8 19.3a3.2 3.2 0 0 1 0-4.5l10.7-10.7Zm10.6 20.9a5.6 5.6 0 1 0-1.1 1.1l4 4.1a0.8 0.8 0 1 0 1.2-1.2l-4.1-4ZM25.6 21.6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                    fill={color}
                  />
                </Svg>
              ),
            }}
          />
          <Tabs.Screen
            name="three"
            options={{
              title: "Wishlist",
              tabBarIcon: ({ color }) => (
                <Svg width={30} height={35} viewBox="0 0 30.65625 30.65625">
                  <Path
                    d="M30.1 32H15.4a0.4 0.4 0 0 1-0.4-0.4v-0.1 0l0.8-17.2a0.4 0.4 0 0 1 0.5-0.4h13c0.2 0 0.4 0.2 0.4 0.4v0l0.9 17.2c0 0 0 0.1 0 0.1v0a0.4 0.4 0 0 1-0.5 0.4h0z m-12.1-14.5c0 0.6 0.4 1.1 1 1.3l0 0c0.5 2.2 2 3.8 3.9 3.9s3.4-1.6 3.8-3.9a1.4 1.4 0 1 0-1.2-0.2l0 0c-0.3 1.6-1.4 2.8-2.6 2.8s-2.3-1.2-2.7-2.8a1.4 1.4 0 1 0-2.2-1.1v0zM0.4 30.3a0.4 0.4 0 0 1-0.4-0.5v0L1.2 5.8a0.4 0.4 0 0 1 0.4-0.4h3C5.5 2.2 8 0 10.8 0s5.3 2.2 6.3 5.4h2.6c0.2 0 0.4 0.2 0.4 0.4v0l0.4 7h-4.2c-0.8 0-1.5 0.6-1.6 1.4v0l-0.8 16.1zM14.6 7.6a1.9 1.9 0 0 0 1 3.5 1.9 1.9 0 0 0 0.7-3.7l0 0C16 3.8 13.7 1.1 10.8 1.1S5.6 3.8 5.3 7.4a1.9 1.9 0 1 0 1.7 0.2l0 0c0.2-2.7 1.8-4.7 3.8-4.8s3.6 2.1 3.8 4.8zM8.7 5.4h4.2a2.5 2.5 0 0 0-2.1-1.5l0 0c-0.9 0.1-1.7 0.7-2 1.5l-0.1 0z m17.1 12.1a0.5 0.5 0 1 1 1 0 0.5 0.5 0 0 1-1 0z m-7 0a0.5 0.5 0 1 1 0.6 0.5 0.5 0.5 0 0 1-0.6-0.5z m-3.9-8.2a0.8 0.8 0 1 1 1.5 0 0.8 0.8 0 0 1-1.5 0z m-9.7 0a0.8 0.8 0 1 1 1.6 0 0.8 0.8 0 0 1-1.6 0z"
                    fill={color}
                  />
                </Svg>
              ),
            }}
          />
             <Tabs.Screen
          name="models"
          options={{
           title: "3D Models",
          tabBarIcon: ({ color }) => (
          <Ionicons name="cube-outline" size={26} color={color} />
    ),
  }}
/>
          <Tabs.Screen
            name="center"
            options={{
              title: "Services",
              tabBarIcon: ({ color }) => (
                <Ionicons name="headset-outline" size={26} color={color} />
              ),
            }}
          />
        </Tabs>
        <PrivacySheet visible={sheet === "privacy"} onClose={closeSheets} />
        <LanguageSheet visible={sheet === "language"} onClose={closeSheets} />
        <SettingsSheet visible={sheet === "settings"} onClose={closeSheets} />
        <OnboardingSheet visible={showOnboarding} onClose={handleOnboardingClose} />
        <BottomSheet
          ref={serviceSheetRef}
          height={320}
          style={{ backgroundColor: "#101928", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
          closeOnDragDown
          closeOnBackdropPress
          onClose={hideServiceConfirm}
        >
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 12 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#1F883D20", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="checkmark-circle" size={44} color="#1F883D" />
            </View>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Request Sent</Text>
            <Text style={{ color: "#A9AEC0", fontSize: 14, textAlign: "center" }}>
              {confirmService ? `Your ${confirmService.toLowerCase()} service request has been submitted. We'll connect you with a professional shortly.` : "We'll connect you with a professional shortly."}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={hideServiceConfirm}
              style={{ marginTop: 8, backgroundColor: "#FF6B00", borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, width: "100%", alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>Done</Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}