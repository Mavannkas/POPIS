import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { EventFilters } from "@/lib/services/events";
import { useAuth } from "@/lib/auth/context";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: EventFilters) => void;
  currentFilters: EventFilters;
}

const CATEGORIES = [
  { label: "Edukacja", value: "education", emoji: "📚" },
  { label: "Środowisko", value: "environment", emoji: "🌱" },
  { label: "Pomoc społeczna", value: "social", emoji: "🤝" },
  { label: "Zdrowie", value: "health", emoji: "❤️" },
  { label: "Zwierzęta", value: "animals", emoji: "🐾" },
  { label: "Kultura", value: "culture", emoji: "🎨" },
  { label: "Sport", value: "sport", emoji: "🏃" },
  { label: "Inne", value: "other", emoji: "📌" },
];

const EVENT_SIZES = [
  { label: "Małe", value: "small" },
  { label: "Średnie", value: "medium" },
  { label: "Duże", value: "large" },
];

const MIN_AGES = [
  { label: "13+", value: 13 },
  { label: "15+", value: 15 },
  { label: "16+", value: 16 },
  { label: "18+", value: 18 },
];

const EVENT_TYPES = [
  { label: "Publiczne", value: "public" },
  { label: "Szkolne", value: "school" },
];

export function FilterModal({
  visible,
  onClose,
  onApply,
  currentFilters,
}: FilterModalProps) {
  const { user } = useAuth();
  const [filters, setFilters] = useState<EventFilters>(currentFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: EventFilters = {};
    setFilters(resetFilters);
    onApply(resetFilters);
    onClose();
  };

  const toggleSingle = (key: keyof EventFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  };

  const toggleMulti = (key: 'category' | 'size', value: any) => {
    setFilters((prev) => {
      const current = prev[key];
      const arr = Array.isArray(current) ? current.slice() : current ? [current] : [];
      const idx = arr.indexOf(value);
      if (idx >= 0) {
        arr.splice(idx, 1);
      } else {
        arr.push(value);
      }
      const next: any = { ...prev };
      next[key] = arr.length === 0 ? undefined : arr;
      return next;
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-xl font-bold">Filtry</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-lg text-gray-600">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Event Type - Only for Students */}
            {user?.isStudent && (
              <View className="mb-6">
                <Text className="text-base font-semibold mb-3">
                  Typ wydarzenia
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {EVENT_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      onPress={() => toggleSingle("eventType", type.value)}
                      className={`px-4 py-2 rounded-full border-2 ${
                        filters.eventType === type.value
                          ? "bg-blue-500 border-blue-500"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Text
                        className={`font-medium ${
                          filters.eventType === type.value
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Category */}
            <View className="mb-6">
              <Text className="text-base font-semibold mb-3">Kategoria</Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    onPress={() => toggleMulti("category", category.value)}
                    className={`px-3 py-2 rounded-full border-2 flex-row items-center gap-1 ${
                      (Array.isArray(filters.category) ? filters.category.includes(category.value) : filters.category === category.value)
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text className="text-base">{category.emoji}</Text>
                    <Text
                      className={`font-medium ${
                        filters.category === category.value
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Event Size */}
            <View className="mb-6">
              <Text className="text-base font-semibold mb-3">
                Rozmiar wydarzenia
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {EVENT_SIZES.map((size) => (
                  <TouchableOpacity
                    key={size.value}
                      onPress={() => toggleMulti("size", size.value)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      (Array.isArray(filters.size) ? filters.size.includes(size.value as any) : filters.size === size.value)
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        filters.size === size.value
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {size.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Minimum Age */}
            <View className="mb-6">
              <Text className="text-base font-semibold mb-3">
                Minimalny wiek
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {MIN_AGES.map((age) => (
                  <TouchableOpacity
                    key={age.value}
                    onPress={() => toggleSingle("minAge", age.value)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      filters.minAge === age.value
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        filters.minAge === age.value
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {age.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Active Filters Count */}
            {(() => {
              const count = Object.entries(filters).reduce((acc, [key, val]) => {
                if (val === undefined || val === null || val === '') return acc;
                if (Array.isArray(val)) return acc + val.length;
                return acc + 1;
              }, 0);
              if (count === 0) return null;
              return (
                <View className="mb-4">
                  <Text className="text-sm text-gray-600">Aktywne filtry: {count}</Text>
                </View>
              );
            })()}
          </ScrollView>

          {/* Footer Buttons */}
          <View className="p-4 border-t border-gray-200 gap-3">
            <TouchableOpacity
              onPress={handleApply}
              className="bg-blue-500 py-3 rounded-lg items-center"
            >
              <Text className="text-white font-semibold text-base">
                Zastosuj filtry
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReset}
              className="bg-gray-200 py-3 rounded-lg items-center"
            >
              <Text className="text-gray-700 font-semibold text-base">
                Wyczyść filtry
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
