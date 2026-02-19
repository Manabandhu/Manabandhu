import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Switch } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { RideFilters } from '@/shared/types";

interface RideFiltersSheetProps {
  initialFilters: RideFilters;
  onApply: (filters: RideFilters) => void;
  onClose: () => void;
  sheetRef: React.RefObject<BottomSheet>;
}

const parseNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export default function RideFiltersSheet({
  initialFilters,
  onApply,
  onClose,
  sheetRef,
}: RideFiltersSheetProps) {
  const snapPoints = useMemo(() => ["25%", "60%"], []);
  const [radius, setRadius] = useState(initialFilters.radiusMiles?.toString() ?? "");
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice?.toString() ?? "");
  const [seats, setSeats] = useState(initialFilters.seats?.toString() ?? "");
  const [luggage, setLuggage] = useState(Boolean(initialFilters.luggage));
  const [pets, setPets] = useState(Boolean(initialFilters.pets));

  useEffect(() => {
    setRadius(initialFilters.radiusMiles?.toString() ?? "");
    setMinPrice(initialFilters.minPrice?.toString() ?? "");
    setMaxPrice(initialFilters.maxPrice?.toString() ?? "");
    setSeats(initialFilters.seats?.toString() ?? "");
    setLuggage(Boolean(initialFilters.luggage));
    setPets(Boolean(initialFilters.pets));
  }, [initialFilters]);

  const apply = () => {
    onApply({
      ...initialFilters,
      radiusMiles: parseNumber(radius),
      minPrice: parseNumber(minPrice),
      maxPrice: parseNumber(maxPrice),
      seats: parseNumber(seats),
      luggage,
      pets,
    });
  };

  return (
    <BottomSheet ref={sheetRef} index={-1} snapPoints={snapPoints} onClose={onClose}>
      <View className="flex-1 px-5 py-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Filters</Text>

        <View className="space-y-4">
          <View>
            <Text className="text-sm text-gray-600 mb-2">Radius (miles)</Text>
            <TextInput
              value={radius}
              onChangeText={setRadius}
              keyboardType="numeric"
              placeholder="10"
              className="border border-gray-200 rounded-lg px-3 py-2"
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
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-600 mb-2">Max price</Text>
              <TextInput
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
                placeholder="$40"
                className="border border-gray-200 rounded-lg px-3 py-2"
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
              className="border border-gray-200 rounded-lg px-3 py-2"
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

        <View className="flex-row gap-3 mt-6">
          <TouchableOpacity onPress={onClose} className="flex-1 border border-gray-200 rounded-lg py-3">
            <Text className="text-center text-gray-700 font-medium">Close</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={apply} className="flex-1 bg-blue-600 rounded-lg py-3">
            <Text className="text-center text-white font-semibold">Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}
