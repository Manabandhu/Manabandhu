import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { ListingFor, RoomFilters, RoomType } from "@/types";
import { formatRoomType, formatListingFor } from "@/lib/rooms/format";

interface RoomFiltersBottomSheetProps {
  initialFilters: RoomFilters;
  onApply: (filters: RoomFilters) => void;
  onClose: () => void;
  sheetRef: React.RefObject<BottomSheet>;
}

const ROOM_TYPES: RoomType[] = ["PRIVATE", "SHARED", "ENTIRE_UNIT"];
const LISTING_FOR: ListingFor[] = ["STUDENT", "COUPLE", "PROFESSIONAL", "FAMILY"];

export default function RoomFiltersBottomSheet({
  initialFilters,
  onApply,
  onClose,
}: RoomFiltersBottomSheetProps) {
  const [minRent, setMinRent] = useState(initialFilters.minRent?.toString() ?? "");
  const [maxRent, setMaxRent] = useState(initialFilters.maxRent?.toString() ?? "");
  const [roomType, setRoomType] = useState<RoomType | undefined>(initialFilters.roomType);
  const [listingFor, setListingFor] = useState<ListingFor | undefined>(initialFilters.listingFor);
  const [amenities, setAmenities] = useState((initialFilters.amenities || []).join(", "));
  const [radiusKm, setRadiusKm] = useState(initialFilters.radiusKm?.toString() ?? "");

  useEffect(() => {
    setMinRent(initialFilters.minRent?.toString() ?? "");
    setMaxRent(initialFilters.maxRent?.toString() ?? "");
    setRoomType(initialFilters.roomType);
    setListingFor(initialFilters.listingFor);
    setAmenities((initialFilters.amenities || []).join(", "));
    setRadiusKm(initialFilters.radiusKm?.toString() ?? "");
  }, [initialFilters]);

  const applyFilters = () => {
    const next: RoomFilters = {
      minRent: minRent ? Number(minRent) : undefined,
      maxRent: maxRent ? Number(maxRent) : undefined,
      roomType,
      listingFor,
      amenities: amenities
        ? amenities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : undefined,
      radiusKm: radiusKm ? Number(radiusKm) : undefined,
    };
    onApply(next);
  };

  const clearFilters = () => {
    setMinRent("");
    setMaxRent("");
    setRoomType(undefined);
    setListingFor(undefined);
    setAmenities("");
    setRadiusKm("");
    onApply({});
  };

  return (
    <View className="flex-1 px-5 py-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Filters</Text>
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Min Rent</Text>
            <TextInput
              value={minRent}
              onChangeText={setMinRent}
              keyboardType="numeric"
              placeholder="0"
              className="border border-gray-200 rounded-lg px-3 py-2"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Max Rent</Text>
            <TextInput
              value={maxRent}
              onChangeText={setMaxRent}
              keyboardType="numeric"
              placeholder="3000"
              className="border border-gray-200 rounded-lg px-3 py-2"
            />
          </View>
        </View>

        <Text className="text-sm text-gray-600 mb-2">Room Type</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {ROOM_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setRoomType(type === roomType ? undefined : type)}
              className={`px-3 py-2 rounded-full border ${
                type === roomType ? "bg-blue-600 border-blue-600" : "border-gray-200"
              }`}
            >
              <Text className={`${type === roomType ? "text-white" : "text-gray-700"}`}>{formatRoomType(type)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-sm text-gray-600 mb-2">Listing For</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {LISTING_FOR.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setListingFor(type === listingFor ? undefined : type)}
              className={`px-3 py-2 rounded-full border ${
                type === listingFor ? "bg-blue-600 border-blue-600" : "border-gray-200"
              }`}
            >
              <Text className={`${type === listingFor ? "text-white" : "text-gray-700"}`}>{formatListingFor(type)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-sm text-gray-600 mb-1">Amenities</Text>
        <TextInput
          value={amenities}
          onChangeText={setAmenities}
          placeholder="wifi, parking"
          className="border border-gray-200 rounded-lg px-3 py-2 mb-4"
        />

        <Text className="text-sm text-gray-600 mb-1">Search Radius (km)</Text>
        <TextInput
          value={radiusKm}
          onChangeText={setRadiusKm}
          keyboardType="numeric"
          placeholder="5"
          className="border border-gray-200 rounded-lg px-3 py-2"
        />

        <View className="flex-row gap-3 mt-6">
          <TouchableOpacity onPress={clearFilters} className="flex-1 border border-gray-200 rounded-lg py-3">
            <Text className="text-center text-gray-700 font-medium">Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={applyFilters} className="flex-1 bg-blue-600 rounded-lg py-3">
            <Text className="text-center text-white font-semibold">Apply</Text>
          </TouchableOpacity>
        </View>
    </View>
  );
}
