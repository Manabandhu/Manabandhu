import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch, Modal, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { PricingMode, RidePost, RidePostType, RideRequirements } from "@/shared/types";
import { validatePerMile } from "@/features/travel/rides/api/pricing";
import { MapPinIcon, CalendarIcon, UsersIcon, DollarSignIcon, TypeIcon, NavigationIcon } from "@/shared/components/ui/Icons";
import LocationPicker from "./LocationPicker";

interface RidePostFormProps {
  type: RidePostType;
  initial?: Partial<RidePost>;
  onSubmit: (payload: Partial<RidePost>) => Promise<void>;
  submitLabel: string;
}

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const haversineMiles = (lat1?: number, lng1?: number, lat2?: number, lng2?: number) => {
  if (lat1 === undefined || lng1 === undefined || lat2 === undefined || lng2 === undefined) {
    return null;
  }
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDateTime = (date: Date): string => {
  return date.toISOString();
};

const formatDisplayDateTime = (isoString: string): string => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return `${dateStr} at ${timeStr}`;
  } catch {
    return isoString;
  }
};

export default function RidePostForm({ type, initial, onSubmit, submitLabel }: RidePostFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [pickupLocation, setPickupLocation] = useState({
    label: initial?.pickupLabel ?? "",
    lat: initial?.pickupLat,
    lng: initial?.pickupLng,
  });
  const [dropLocation, setDropLocation] = useState({
    label: initial?.dropLabel ?? "",
    lat: initial?.dropLat,
    lng: initial?.dropLng,
  });
  const [departAt, setDepartAt] = useState(initial?.departAt ?? "");
  const [seats, setSeats] = useState(
    type === "OFFER" ? String(initial?.seatsTotal ?? "") : String(initial?.seatsNeeded ?? "")
  );
  const [peopleCount, setPeopleCount] = useState(String(initial?.requirements?.peopleCount ?? 1));
  const [luggage, setLuggage] = useState(Boolean(initial?.requirements?.luggage));
  const [pets, setPets] = useState(Boolean(initial?.requirements?.pets));
  const [notes, setNotes] = useState(initial?.requirements?.notes ?? "");
  const [pricingMode, setPricingMode] = useState<PricingMode>(initial?.pricingMode ?? "FIXED");
  const [priceFixed, setPriceFixed] = useState(initial?.priceFixed?.toString() ?? "");
  const [pricePerMile, setPricePerMile] = useState(initial?.pricePerMile?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (initial?.departAt) {
      try {
        return new Date(initial.departAt);
      } catch {
        return new Date();
      }
    }
    return new Date();
  });

  const distancePreview = useMemo(
    () =>
      haversineMiles(
        pickupLocation.lat,
        pickupLocation.lng,
        dropLocation.lat,
        dropLocation.lng
      ),
    [pickupLocation, dropLocation]
  );

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      const updated = new Date(date);
      if (departAt) {
        try {
          const existing = new Date(departAt);
          updated.setHours(existing.getHours());
          updated.setMinutes(existing.getMinutes());
        } catch {}
      }
      setDepartAt(formatDateTime(updated));
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (date) {
      const updated = selectedDate;
      updated.setHours(date.getHours());
      updated.setMinutes(date.getMinutes());
      setSelectedDate(new Date(updated));
      setDepartAt(formatDateTime(updated));
    }
  };

  const submit = async () => {
    setError(null);
    const seatValue = toNumber(seats);
    if (!pickupLocation.label || !dropLocation.label) {
      setError("Pickup and drop locations are required.");
      return;
    }
    if (!pickupLocation.lat || !pickupLocation.lng || !dropLocation.lat || !dropLocation.lng) {
      setError("Please select valid pickup and drop locations using the map picker.");
      return;
    }
    if (!departAt) {
      setError("Departure time is required.");
      return;
    }
    if (!seatValue) {
      setError("Seat count is required.");
      return;
    }
    if (pricingMode === "PER_MILE") {
      const validation = validatePerMile(toNumber(pricePerMile));
      if (validation) {
        setError(validation);
        return;
      }
    } else if (!priceFixed) {
      setError("Fixed price is required.");
      return;
    }

    const requirements: RideRequirements = {
      peopleCount: toNumber(peopleCount),
      luggage,
      pets,
      notes: notes || undefined,
    };

    const payload: Partial<RidePost> = {
      postType: type,
      title: title || undefined,
      pickupLabel: pickupLocation.label,
      pickupLat: pickupLocation.lat,
      pickupLng: pickupLocation.lng,
      dropLabel: dropLocation.label,
      dropLat: dropLocation.lat,
      dropLng: dropLocation.lng,
      departAt,
      pricingMode,
      priceFixed: pricingMode === "FIXED" ? toNumber(priceFixed) : undefined,
      pricePerMile: pricingMode === "PER_MILE" ? toNumber(pricePerMile) : undefined,
      requirements,
      seatsTotal: type === "OFFER" ? seatValue : undefined,
      seatsNeeded: type === "REQUEST" ? seatValue : undefined,
    };

    setSaving(true);
    try {
      await onSubmit(payload);
    } catch {
      setError("Unable to save ride. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="space-y-5">
      {/* Title Section */}
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center mb-3">
          <TypeIcon size={18} color="#6B7280" />
          <Text className="text-base font-semibold text-gray-900 ml-2">Title (Optional)</Text>
        </View>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Morning commute, Weekend trip"
          placeholderTextColor="#9CA3AF"
          className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
        />
      </View>

      {/* Pickup Location Section */}
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center mb-3">
          <MapPinIcon size={18} color="#2563EB" />
          <Text className="text-base font-semibold text-gray-900 ml-2">Pickup Location</Text>
        </View>
        <LocationPicker
          label=""
          placeholder="e.g., Downtown station, Airport"
          value={pickupLocation}
          onChange={setPickupLocation}
          required
        />
      </View>

      {/* Drop Location Section */}
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center mb-3">
          <NavigationIcon size={18} color="#10B981" />
          <Text className="text-base font-semibold text-gray-900 ml-2">Drop-off Location</Text>
        </View>
        <LocationPicker
          label=""
          placeholder="e.g., Airport terminal, City center"
          value={dropLocation}
          onChange={setDropLocation}
          required
        />
      </View>

      {/* Departure Time Section */}
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center mb-3">
          <CalendarIcon size={18} color="#F59E0B" />
          <Text className="text-base font-semibold text-gray-900 ml-2">Departure Time *</Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50"
          >
            <Text className="text-xs text-gray-500 mb-1">Date</Text>
            <Text className="text-base text-gray-900">
              {departAt ? formatDisplayDateTime(departAt).split(" at ")[0] : "Select date"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50"
          >
            <Text className="text-xs text-gray-500 mb-1">Time</Text>
            <Text className="text-base text-gray-900">
              {departAt ? formatDisplayDateTime(departAt).split(" at ")[1] : "Select time"}
            </Text>
          </TouchableOpacity>
        </View>
        {Platform.OS === "ios" && (
          <>
            <Modal visible={showDatePicker} transparent animationType="slide">
              <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl" style={{ backgroundColor: '#FFFFFF' }}>
                  <View className="flex-row justify-between items-center px-4 pt-4 pb-3 border-b border-gray-200">
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text className="text-blue-600 text-lg font-semibold">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold text-gray-900">Select Date</Text>
                    <TouchableOpacity
                      onPress={() => {
                        handleDateChange(null, selectedDate);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text className="text-blue-600 text-lg font-semibold">Done</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ backgroundColor: '#FFFFFF', paddingVertical: 12 }}>
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                      style={{ backgroundColor: '#FFFFFF', height: 200 }}
                    />
                  </View>
                </View>
              </View>
            </Modal>
            <Modal visible={showTimePicker} transparent animationType="slide">
              <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl" style={{ backgroundColor: '#FFFFFF' }}>
                  <View className="flex-row justify-between items-center px-4 pt-4 pb-3 border-b border-gray-200">
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <Text className="text-blue-600 text-lg font-semibold">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold text-gray-900">Select Time</Text>
                    <TouchableOpacity
                      onPress={() => {
                        handleTimeChange(null, selectedDate);
                        setShowTimePicker(false);
                      }}
                    >
                      <Text className="text-blue-600 text-lg font-semibold">Done</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ backgroundColor: '#FFFFFF', paddingVertical: 12 }}>
                    <DateTimePicker
                      value={selectedDate}
                      mode="time"
                      display="spinner"
                      onChange={handleTimeChange}
                      style={{ backgroundColor: '#FFFFFF', height: 200 }}
                    />
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}
        {Platform.OS === "android" && (
          <>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </>
        )}
      </View>

      {/* Seats Section */}
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center mb-3">
          <UsersIcon size={18} color="#8B5CF6" />
          <Text className="text-base font-semibold text-gray-900 ml-2">
            Seats {type === "OFFER" ? "Available" : "Needed"} *
          </Text>
        </View>
        <TextInput
          value={seats}
          onChangeText={setSeats}
          keyboardType="numeric"
          placeholder="2"
          placeholderTextColor="#9CA3AF"
          className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
        />
      </View>

      {/* Requirements Section */}
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <Text className="text-base font-semibold text-gray-900 mb-4">Requirements</Text>
        <View className="mb-3">
          <Text className="text-sm text-gray-600 mb-2">Number of People</Text>
          <TextInput
            value={peopleCount}
            onChangeText={setPeopleCount}
            keyboardType="numeric"
            placeholder="1"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
          />
        </View>
        <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
          <Text className="text-base text-gray-900">Luggage Allowed</Text>
          <Switch
            value={luggage}
            onValueChange={setLuggage}
            trackColor={{ false: "#D1D5DB", true: "#2563EB" }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
          <Text className="text-base text-gray-900">Pets Allowed</Text>
          <Switch
            value={pets}
            onValueChange={setPets}
            trackColor={{ false: "#D1D5DB", true: "#2563EB" }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View className="mt-3">
          <Text className="text-sm text-gray-600 mb-2">Additional Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special requirements or preferences"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
            style={{ textAlignVertical: "top" }}
          />
        </View>
      </View>

      {/* Pricing Section */}
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center mb-4">
          <DollarSignIcon size={18} color="#059669" />
          <Text className="text-base font-semibold text-gray-900 ml-2">Pricing *</Text>
        </View>
        <View className="flex-row gap-2 mb-4 bg-gray-100 rounded-xl p-1">
          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-lg ${pricingMode === "FIXED" ? "bg-blue-600 shadow-sm" : ""}`}
            onPress={() => setPricingMode("FIXED")}
          >
            <Text
              className={`text-center text-sm font-semibold ${pricingMode === "FIXED" ? "text-white" : "text-gray-600"}`}
            >
              Fixed Price
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-lg ${pricingMode === "PER_MILE" ? "bg-blue-600 shadow-sm" : ""}`}
            onPress={() => setPricingMode("PER_MILE")}
          >
            <Text
              className={`text-center text-sm font-semibold ${pricingMode === "PER_MILE" ? "text-white" : "text-gray-600"}`}
            >
              Per Mile
            </Text>
          </TouchableOpacity>
        </View>

        {pricingMode === "FIXED" ? (
          <View>
            <Text className="text-sm text-gray-600 mb-2">Fixed Price ($) *</Text>
            <TextInput
              value={priceFixed}
              onChangeText={setPriceFixed}
              keyboardType="numeric"
              placeholder="20.00"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
            />
          </View>
        ) : (
          <View>
            <Text className="text-sm text-gray-600 mb-2">Price Per Mile ($) *</Text>
            <TextInput
              value={pricePerMile}
              onChangeText={setPricePerMile}
              keyboardType="numeric"
              placeholder="1.25"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
            />
          </View>
        )}

        {distancePreview ? (
          <View className="mt-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
            <Text className="text-xs text-blue-700">
              Estimated distance: <Text className="font-semibold">{distancePreview.toFixed(1)} miles</Text>
            </Text>
            <Text className="text-xs text-blue-600 mt-1">
              Final price will be confirmed by the backend.
            </Text>
          </View>
        ) : (
          <View className="mt-3 bg-gray-50 rounded-xl p-3">
            <Text className="text-xs text-gray-600">
              Enter coordinates to preview distance. Final price will be confirmed by the backend.
            </Text>
          </View>
        )}
      </View>

      {/* Error Message */}
      {error ? (
        <View className="bg-red-50 border border-red-200 rounded-xl p-4">
          <Text className="text-red-600 text-sm font-medium">{error}</Text>
        </View>
      ) : null}

      {/* Submit Button */}
      <TouchableOpacity
        className={`rounded-xl py-4 shadow-lg ${saving ? "bg-gray-400" : type === "OFFER" ? "bg-blue-600" : "bg-indigo-600"}`}
        onPress={submit}
        disabled={saving}
        activeOpacity={0.8}
      >
        <Text className="text-white text-center font-bold text-base">
          {saving ? "Publishing..." : submitLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
