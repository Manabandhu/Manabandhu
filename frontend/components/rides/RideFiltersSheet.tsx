import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, TextInput, Switch } from "react-native";
import { RideFilters } from "@/types";

interface RideFiltersSheetProps {
  visible: boolean;
  filters: RideFilters;
  onApply: (filters: RideFilters) => void;
  onClose: () => void;
}

const parseNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export default function RideFiltersSheet({ visible, filters, onApply, onClose }: RideFiltersSheetProps) {
  const [radius, setRadius] = useState(filters.radiusMiles?.toString() ?? "");
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() ?? "");
  const [seats, setSeats] = useState(filters.seats?.toString() ?? "");
  const [luggage, setLuggage] = useState(Boolean(filters.luggage));
  const [pets, setPets] = useState(Boolean(filters.pets));

  useEffect(() => {
    if (!visible) return;
    setRadius(filters.radiusMiles?.toString() ?? "");
    setMinPrice(filters.minPrice?.toString() ?? "");
    setMaxPrice(filters.maxPrice?.toString() ?? "");
    setSeats(filters.seats?.toString() ?? "");
    setLuggage(Boolean(filters.luggage));
    setPets(Boolean(filters.pets));
  }, [filters, visible]);

  const apply = () => {
    onApply({
      ...filters,
      radiusMiles: parseNumber(radius),
      minPrice: parseNumber(minPrice),
      maxPrice: parseNumber(maxPrice),
      seats: parseNumber(seats),
      luggage,
      pets,
    });
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-600 font-semibold">Close</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm text-gray-600 mb-2">Radius (miles)</Text>
              <TextInput
                value={radius}
                onChangeText={setRadius}
                keyboardType="numeric"
                placeholder="10"
                className="border border-gray-200 rounded-xl px-3 py-2"
              />
            </View>
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-2">Min price</Text>
                <TextInput
                  value={minPrice}
                  onChangeText={setMinPrice}
                  keyboardType="numeric"
                  placeholder="$5"
                  className="border border-gray-200 rounded-xl px-3 py-2"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-2">Max price</Text>
                <TextInput
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="numeric"
                  placeholder="$40"
                  className="border border-gray-200 rounded-xl px-3 py-2"
                />
              </View>
            </View>
            <View>
              <Text className="text-sm text-gray-600 mb-2">Seats</Text>
              <TextInput
                value={seats}
                onChangeText={setSeats}
                keyboardType="numeric"
                placeholder="2"
                className="border border-gray-200 rounded-xl px-3 py-2"
              />
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-700">Luggage allowed</Text>
              <Switch value={luggage} onValueChange={setLuggage} />
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-700">Pets allowed</Text>
              <Switch value={pets} onValueChange={setPets} />
            </View>
          </View>

          <TouchableOpacity
            className="bg-blue-600 rounded-xl py-3 mt-6"
            onPress={apply}
          >
            <Text className="text-center text-white font-semibold">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
