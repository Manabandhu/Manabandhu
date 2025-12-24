import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch } from "react-native";
import { PricingMode, RidePost, RidePostType, RideRequirements } from "@/types";
import { validatePerMile } from "@/lib/rides/pricing";

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

export default function RidePostForm({ type, initial, onSubmit, submitLabel }: RidePostFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [pickupLabel, setPickupLabel] = useState(initial?.pickupLabel ?? "");
  const [pickupLat, setPickupLat] = useState(initial?.pickupLat?.toString() ?? "");
  const [pickupLng, setPickupLng] = useState(initial?.pickupLng?.toString() ?? "");
  const [dropLabel, setDropLabel] = useState(initial?.dropLabel ?? "");
  const [dropLat, setDropLat] = useState(initial?.dropLat?.toString() ?? "");
  const [dropLng, setDropLng] = useState(initial?.dropLng?.toString() ?? "");
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

  const distancePreview = useMemo(
    () =>
      haversineMiles(
        toNumber(pickupLat),
        toNumber(pickupLng),
        toNumber(dropLat),
        toNumber(dropLng)
      ),
    [pickupLat, pickupLng, dropLat, dropLng]
  );

  const submit = async () => {
    setError(null);
    const seatValue = toNumber(seats);
    if (!pickupLabel || !dropLabel) {
      setError("Pickup and drop locations are required.");
      return;
    }
    if (!pickupLat || !pickupLng || !dropLat || !dropLng) {
      setError("Pickup and drop coordinates are required.");
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
      pickupLabel,
      pickupLat: toNumber(pickupLat),
      pickupLng: toNumber(pickupLng),
      dropLabel,
      dropLat: toNumber(dropLat),
      dropLng: toNumber(dropLng),
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
      <View>
        <Text className="text-sm text-gray-600 mb-2">Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Morning commute"
          className="border border-gray-200 rounded-xl px-3 py-2"
        />
      </View>

      <View>
        <Text className="text-sm text-gray-600 mb-2">Pickup label</Text>
        <TextInput
          value={pickupLabel}
          onChangeText={setPickupLabel}
          placeholder="Downtown station"
          className="border border-gray-200 rounded-xl px-3 py-2"
        />
      </View>
      <View className="flex-row space-x-3">
        <View className="flex-1">
          <Text className="text-sm text-gray-600 mb-2">Pickup lat</Text>
          <TextInput
            value={pickupLat}
            onChangeText={setPickupLat}
            keyboardType="numeric"
            placeholder="37.7749"
            className="border border-gray-200 rounded-xl px-3 py-2"
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-600 mb-2">Pickup lng</Text>
          <TextInput
            value={pickupLng}
            onChangeText={setPickupLng}
            keyboardType="numeric"
            placeholder="-122.4194"
            className="border border-gray-200 rounded-xl px-3 py-2"
          />
        </View>
      </View>

      <View>
        <Text className="text-sm text-gray-600 mb-2">Drop label</Text>
        <TextInput
          value={dropLabel}
          onChangeText={setDropLabel}
          placeholder="Airport terminal"
          className="border border-gray-200 rounded-xl px-3 py-2"
        />
      </View>
      <View className="flex-row space-x-3">
        <View className="flex-1">
          <Text className="text-sm text-gray-600 mb-2">Drop lat</Text>
          <TextInput
            value={dropLat}
            onChangeText={setDropLat}
            keyboardType="numeric"
            placeholder="37.6152"
            className="border border-gray-200 rounded-xl px-3 py-2"
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-600 mb-2">Drop lng</Text>
          <TextInput
            value={dropLng}
            onChangeText={setDropLng}
            keyboardType="numeric"
            placeholder="-122.3899"
            className="border border-gray-200 rounded-xl px-3 py-2"
          />
        </View>
      </View>

      <View>
        <Text className="text-sm text-gray-600 mb-2">Depart at (ISO)</Text>
        <TextInput
          value={departAt}
          onChangeText={setDepartAt}
          placeholder="2024-06-01T18:00:00"
          className="border border-gray-200 rounded-xl px-3 py-2"
        />
      </View>

      <View>
        <Text className="text-sm text-gray-600 mb-2">Seats {type === "OFFER" ? "available" : "needed"}</Text>
        <TextInput
          value={seats}
          onChangeText={setSeats}
          keyboardType="numeric"
          placeholder="2"
          className="border border-gray-200 rounded-xl px-3 py-2"
        />
      </View>

      <View className="bg-gray-50 rounded-2xl p-4">
        <Text className="text-sm font-semibold text-gray-700 mb-3">Requirements</Text>
        <View>
          <Text className="text-sm text-gray-600 mb-2">People count</Text>
          <TextInput
            value={peopleCount}
            onChangeText={setPeopleCount}
            keyboardType="numeric"
            className="border border-gray-200 rounded-xl px-3 py-2 bg-white"
          />
        </View>
        <View className="flex-row justify-between items-center mt-3">
          <Text className="text-sm text-gray-700">Luggage allowed</Text>
          <Switch value={luggage} onValueChange={setLuggage} />
        </View>
        <View className="flex-row justify-between items-center mt-3">
          <Text className="text-sm text-gray-700">Pets allowed</Text>
          <Switch value={pets} onValueChange={setPets} />
        </View>
        <View className="mt-3">
          <Text className="text-sm text-gray-600 mb-2">Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special requirements"
            className="border border-gray-200 rounded-xl px-3 py-2 bg-white"
          />
        </View>
      </View>

      <View className="bg-gray-50 rounded-2xl p-4">
        <Text className="text-sm font-semibold text-gray-700 mb-3">Pricing</Text>
        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-full mr-2 ${pricingMode === "FIXED" ? "bg-blue-600" : "bg-white"}`}
            onPress={() => setPricingMode("FIXED")}
          >
            <Text
              className={`text-center text-sm font-semibold ${pricingMode === "FIXED" ? "text-white" : "text-gray-600"}`}
            >
              Fixed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-full ${pricingMode === "PER_MILE" ? "bg-blue-600" : "bg-white"}`}
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
            <Text className="text-sm text-gray-600 mb-2">Fixed price</Text>
            <TextInput
              value={priceFixed}
              onChangeText={setPriceFixed}
              keyboardType="numeric"
              placeholder="$20"
              className="border border-gray-200 rounded-xl px-3 py-2 bg-white"
            />
          </View>
        ) : (
          <View>
            <Text className="text-sm text-gray-600 mb-2">Price per mile</Text>
            <TextInput
              value={pricePerMile}
              onChangeText={setPricePerMile}
              keyboardType="numeric"
              placeholder="$1.25"
              className="border border-gray-200 rounded-xl px-3 py-2 bg-white"
            />
          </View>
        )}

        {distancePreview ? (
          <Text className="text-xs text-gray-500 mt-3">
            Estimated distance: {distancePreview.toFixed(1)} miles. Final price will be confirmed by the backend.
          </Text>
        ) : (
          <Text className="text-xs text-gray-500 mt-3">
            Enter coordinates to preview distance. Final price will be confirmed by the backend.
          </Text>
        )}
      </View>

      {error ? (
        <View className="bg-red-50 border border-red-100 rounded-xl p-3">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        className={`rounded-xl py-3 ${saving ? "bg-gray-300" : "bg-blue-600"}`}
        onPress={submit}
        disabled={saving}
      >
        <Text className="text-white text-center font-semibold">{submitLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
