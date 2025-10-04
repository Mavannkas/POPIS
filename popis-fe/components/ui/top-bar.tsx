import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { IconSymbol } from "./icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth-context";

interface TopBarProps {
  showSearch?: boolean;
}

export function TopBar({ showSearch = true }: TopBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { signOut } = useAuth();

  const handleNotificationPress = () => {
    router.push("/notifications" as any);
  };

  const handleSearchPress = () => {
    router.push("/search" as any);
  };

  const handleProfilePress = async () => {
    console.log("Profile pressed, signing out...");
    await signOut();
    router.replace("/auth/login");
  };

  return (
    <View className="bg-white px-4 pt-12 pb-4 shadow-sm">
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
  );
}
