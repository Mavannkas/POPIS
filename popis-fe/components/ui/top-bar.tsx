import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, Animated } from "react-native";
import { IconSymbol } from "./icon-symbol";
import { Colors } from "@/constants/theme";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth-context";

interface TopBarProps {
  showSearch?: boolean;
}

export function TopBar({ showSearch = true }: TopBarProps) {
  const colors = Colors;
  const { signOut } = useAuth();
  const [profileSidebarVisible, setProfileSidebarVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-320)).current; // Start off-screen to the left

  const handleNotificationPress = () => {
    router.push("/notifications" as any);
  };

  const handleSearchPress = () => {
    router.push("/search" as any);
  };

  const handleProfilePress = () => {
    setProfileSidebarVisible(true);
  };

  useEffect(() => {
    if (profileSidebarVisible) {
      // Slide in from left
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out to left
      Animated.timing(slideAnim, {
        toValue: -320,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [profileSidebarVisible, slideAnim]);

  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: -320,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setProfileSidebarVisible(false);
    });
  };

  const handleSignOut = async () => {
    closeSidebar();
    await signOut();
    router.replace("/auth/login");
  };

  const handleAccountPress = () => {
    closeSidebar();
    // TODO: Navigate to account page when created
    console.log("Navigate to account page");
  };

  return (
    <>
      <View className="bg-white px-4 pt-16 pb-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          {/* Logo/Brand */}
          <TouchableOpacity
            onPress={handleProfilePress}
            className="flex-row items-center"
          >
            <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
              <Text className="text-white font-bold text-lg">P</Text>
            </View>
          </TouchableOpacity>

          {/* Notification Button */}
          <TouchableOpacity
            onPress={handleNotificationPress}
            className="relative p-2"
          >
            <IconSymbol name="bell.fill" size={24} color={colors.primary} />
            {/* Notification Badge */}
            <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <TouchableOpacity onPress={handleSearchPress}>
            <View className="bg-gray-100 rounded-full px-4 py-3 flex-row items-center">
              <IconSymbol
                name="magnifyingglass"
                size={20}
                color={colors.primary}
              />
              <Text className="ml-3 text-gray-500 flex-1">
                Szukaj wydarzeń...
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Sidebar Modal */}
      <Modal
        visible={profileSidebarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeSidebar}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={closeSidebar}
        >
          <Animated.View
            className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-lg"
            style={{
              transform: [{ translateX: slideAnim }],
            }}
          >
            <Pressable onPress={() => {}}>
              {/* Header */}
              <View className="pt-16 pb-6 px-6 border-b border-gray-200">
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-primary rounded-full items-center justify-center mr-4">
                    <Text className="text-white font-bold text-xl">P</Text>
                  </View>
                  <View>
                    <Text className="text-lg font-semibold text-gray-900">
                      Profil użytkownika
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Zarządzaj swoim kontem
                    </Text>
                  </View>
                </View>
              </View>

              {/* Menu Items */}
              <View className="py-4">
                <TouchableOpacity
                  onPress={handleAccountPress}
                  className="flex-row items-center px-6 py-4 hover:bg-gray-50"
                >
                  <IconSymbol name="person.circle" size={24} color={colors.icon} />
                  <Text className="ml-4 text-base text-gray-900">
                    Ustawienia konta
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    closeSidebar();
                    router.push("/notifications" as any);
                  }}
                  className="flex-row items-center px-6 py-4 hover:bg-gray-50"
                >
                  <IconSymbol name="bell" size={24} color={colors.icon} />
                  <Text className="ml-4 text-base text-gray-900">
                    Powiadomienia
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    closeSidebar();
                    // TODO: Navigate to help page
                    console.log("Navigate to help");
                  }}
                  className="flex-row items-center px-6 py-4 hover:bg-gray-50"
                >
                  <IconSymbol name="questionmark.circle" size={24} color={colors.icon} />
                  <Text className="ml-4 text-base text-gray-900">
                    Pomoc i wsparcie
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    closeSidebar();
                    // TODO: Navigate to settings
                    console.log("Navigate to settings");
                  }}
                  className="flex-row items-center px-6 py-4 hover:bg-gray-50"
                >
                  <IconSymbol name="gearshape" size={24} color={colors.icon} />
                  <Text className="ml-4 text-base text-gray-900">
                    Ustawienia aplikacji
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Logout Button */}
              <View className="border-t border-gray-200 mt-4">
                <TouchableOpacity
                  onPress={handleSignOut}
                  className="flex-row items-center px-6 py-4 hover:bg-red-50"
                >
                  <IconSymbol name="arrow.right.square" size={24} color="#EF4444" />
                  <Text className="ml-4 text-base text-red-600 font-medium">
                    Wyloguj się
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}
