import React, { useMemo, useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Image, Animated, KeyboardAvoidingView, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { ListingFor, RoomListing, RoomType, VisitType } from "@/types";
import { formatRoomType, formatListingFor } from "@/lib/rooms/format";
import { AmenityIcon, UtilityIcon } from "./AmenityIcon";
import { CheckIcon } from "@/components/ui/Icons";

export interface RoomListingFormValues {
  title: string;
  listingFor: ListingFor;
  roomType: RoomType;
  peopleAllowed: string;
  rentMonthly: string;
  deposit: string;
  leaseStartDate: string;
  leaseEndDate: string;
  utilitiesIncluded: boolean;
  utilities: string;
  amenities: string;
  visitType: VisitType;
  contactPreference: string;
  description: string;
  locationExactEnabled: boolean;
  latExact: string;
  lngExact: string;
  latApprox: string;
  lngApprox: string;
  approxAreaLabel: string;
  nearbyLocalities: string;
  nearbySchools: string;
  nearbyCompanies: string;
  images: { uri: string; isRemote: boolean }[];
}

interface RoomListingFormProps {
  initialValues?: Partial<RoomListing>;
  onSubmit: (values: RoomListingFormValues) => void;
  submitLabel: string;
  loading?: boolean;
}

const LISTING_FOR: ListingFor[] = ["STUDENT", "COUPLE", "PROFESSIONAL", "FAMILY"];
const ROOM_TYPES: RoomType[] = ["PRIVATE", "SHARED", "ENTIRE_UNIT"];
const VISIT_TYPES: VisitType[] = ["VIDEO_CALL", "IN_PERSON", "BOTH"];

const AMENITIES = [
  { id: "parking", label: "Parking" },
  { id: "security", label: "Security" },
  { id: "wifi", label: "WiFi" },
  { id: "ac", label: "AC" },
  { id: "gym", label: "Gym" },
  { id: "pool", label: "Pool" },
  { id: "laundry", label: "Laundry" },
  { id: "elevator", label: "Elevator" },
  { id: "balcony", label: "Balcony" },
  { id: "furnished", label: "Furnished" },
];

const UTILITIES = [
  { id: "electricity", label: "Electricity" },
  { id: "water", label: "Water" },
  { id: "gas", label: "Gas" },
  { id: "internet", label: "Internet" },
  { id: "maintenance", label: "Maintenance" },
];

export default function RoomListingForm({ initialValues, onSubmit, submitLabel, loading }: RoomListingFormProps) {
  const [step, setStep] = useState(1);

  const initialImages = useMemo(() => {
    if (!initialValues?.imageUrls?.length) return [];
    return initialValues.imageUrls.map((uri) => ({ uri, isRemote: true }));
  }, [initialValues]);

  const [form, setForm] = useState<RoomListingFormValues>({
    title: initialValues?.title ?? "",
    listingFor: initialValues?.listingFor ?? "STUDENT",
    roomType: initialValues?.roomType ?? "PRIVATE",
    peopleAllowed: initialValues?.peopleAllowed?.toString() ?? "1",
    rentMonthly: initialValues?.rentMonthly?.toString() ?? "",
    deposit: initialValues?.deposit?.toString() ?? "",
    leaseStartDate: initialValues?.leaseStartDate ?? "",
    leaseEndDate: initialValues?.leaseEndDate ?? "",
    utilitiesIncluded: initialValues?.utilitiesIncluded ?? false,
    utilities: initialValues?.utilities?.join(", ") ?? "",
    amenities: initialValues?.amenities?.join(", ") ?? "",
    visitType: initialValues?.visitType ?? "BOTH",
    contactPreference: initialValues?.contactPreference
      ? JSON.stringify(initialValues.contactPreference)
      : "",
    description: initialValues?.description ?? "",
    locationExactEnabled: initialValues?.locationExactEnabled ?? false,
    latExact: initialValues?.latExact?.toString() ?? "",
    lngExact: initialValues?.lngExact?.toString() ?? "",
    latApprox: initialValues?.latApprox?.toString() ?? "",
    lngApprox: initialValues?.lngApprox?.toString() ?? "",
    approxAreaLabel: initialValues?.approxAreaLabel ?? "",
    nearbyLocalities: initialValues?.nearbyLocalities?.join(", ") ?? "",
    nearbySchools: initialValues?.nearbySchools?.join(", ") ?? "",
    nearbyCompanies: initialValues?.nearbyCompanies?.join(", ") ?? "",
    images: initialImages,
  });

  // Separate icon-based selections from manual entries
  const [manualAmenities, setManualAmenities] = useState("");
  const [manualUtilities, setManualUtilities] = useState("");

  // Extract icon-based selections from form.amenities
  const selectedAmenities = useMemo(() => {
    if (!form.amenities) return [];
    const items = form.amenities.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean);
    // Match against both IDs and labels
    return items.filter(item => {
      return AMENITIES.some(a => 
        a.id === item || 
        a.label.toLowerCase() === item ||
        a.id.toLowerCase() === item
      );
    });
  }, [form.amenities]);

  // Extract icon-based selections from form.utilities
  const selectedUtilities = useMemo(() => {
    if (!form.utilities) return [];
    const items = form.utilities.split(",").map((u) => u.trim().toLowerCase()).filter(Boolean);
    // Match against both IDs and labels
    return items.filter(item => {
      return UTILITIES.some(u => 
        u.id === item || 
        u.label.toLowerCase() === item ||
        u.id.toLowerCase() === item
      );
    });
  }, [form.utilities]);

  const updateField = <K extends keyof RoomListingFormValues>(key: K, value: RoomListingFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenityId: string) => {
    const current = selectedAmenities;
    const newAmenities = current.includes(amenityId)
      ? current.filter((a) => a !== amenityId)
      : [...current, amenityId];
    updateField("amenities", newAmenities.join(", "));
  };

  const toggleUtility = (utilityId: string) => {
    const current = selectedUtilities;
    const newUtilities = current.includes(utilityId)
      ? current.filter((u) => u !== utilityId)
      : [...current, utilityId];
    updateField("utilities", newUtilities.join(", "));
  };

  // Combine selected icons with manual entries
  const getCombinedAmenities = () => {
    const iconAmenities = selectedAmenities.map(id => {
      const amenity = AMENITIES.find(a => a.id === id || a.id.toLowerCase() === id || a.label.toLowerCase() === id);
      return amenity ? amenity.label : id;
    });
    const manualList = manualAmenities.split(",").map(a => a.trim()).filter(Boolean);
    const combined = [...iconAmenities, ...manualList];
    return combined.length > 0 ? combined.join(", ") : "";
  };

  const getCombinedUtilities = () => {
    const iconUtilities = selectedUtilities.map(id => {
      const utility = UTILITIES.find(u => u.id === id || u.id.toLowerCase() === id || u.label.toLowerCase() === id);
      return utility ? utility.label : id;
    });
    const manualList = manualUtilities.split(",").map(u => u.trim()).filter(Boolean);
    const combined = [...iconUtilities, ...manualList];
    return combined.length > 0 ? combined.join(", ") : "";
  };

  const pickImages = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;
    const assets = result.assets ?? [];
    const newImages = assets.map((asset) => ({ uri: asset.uri, isRemote: false }));
    if (newImages.length) {
      updateField("images", [...form.images, ...newImages]);
    }
  };

  const removeImage = (uri: string) => {
    updateField(
      "images",
      form.images.filter((image) => image.uri !== uri)
    );
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const progress = (step / 3) * 100;

  const scrollViewRef = useRef<ScrollView>(null);

  const handleInputFocus = () => {
    // Small delay to ensure keyboard is shown, then scroll to end
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      enabled={Platform.OS === "ios"}
    >
      <View className="flex-1">
        {/* Progress Bar */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-semibold text-gray-700">Step {step} of 3</Text>
          <Text className="text-xs text-gray-500">{Math.round(progress)}% Complete</Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-indigo-600 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      {/* Step Indicators */}
      <View className="flex-row justify-between mb-6">
        {[1, 2, 3].map((s) => (
          <View key={s} className="flex-1 items-center">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                s <= step ? "bg-indigo-600" : "bg-gray-200"
              }`}
            >
              {s < step ? (
                <CheckIcon size={16} color="#FFFFFF" />
              ) : (
                <Text className={`text-sm font-semibold ${s <= step ? "text-white" : "text-gray-500"}`}>
                  {s}
                </Text>
              )}
            </View>
            <Text className={`text-xs mt-1 ${s <= step ? "text-indigo-600 font-semibold" : "text-gray-400"}`}>
              {s === 1 ? "Basic Info" : s === 2 ? "Location" : "Details"}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 150 }}
        keyboardDismissMode="interactive"
      >
        {step === 1 && (
          <View className="gap-5">
            <View>
              <Text className="text-base font-semibold text-gray-900 mb-2">Title *</Text>
              <TextInput
                value={form.title}
                onChangeText={(value) => updateField("title", value)}
                onFocus={handleInputFocus}
                placeholder="e.g., Spacious 2BHK with balcony"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View>
              <Text className="text-base font-semibold text-gray-900 mb-2">Listing For *</Text>
              <View className="flex-row flex-wrap gap-2">
                {LISTING_FOR.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => updateField("listingFor", type)}
                    className={`px-4 py-3 rounded-xl border-2 ${
                      form.listingFor === type
                        ? "bg-indigo-600 border-indigo-600"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text className={`font-medium ${form.listingFor === type ? "text-white" : "text-gray-700"}`}>
                      {formatListingFor(type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <Text className="text-base font-semibold text-gray-900 mb-2">Room Type *</Text>
              <View className="flex-row flex-wrap gap-2">
                {ROOM_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => updateField("roomType", type)}
                    className={`px-4 py-3 rounded-xl border-2 ${
                      form.roomType === type
                        ? "bg-indigo-600 border-indigo-600"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text className={`font-medium ${form.roomType === type ? "text-white" : "text-gray-700"}`}>
                      {formatRoomType(type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-2">People Allowed *</Text>
                <TextInput
                  value={form.peopleAllowed}
                  onChangeText={(value) => updateField("peopleAllowed", value)}
                  onFocus={handleInputFocus}
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-2">Rent / month *</Text>
                <TextInput
                  value={form.rentMonthly}
                  onChangeText={(value) => updateField("rentMonthly", value)}
                  onFocus={handleInputFocus}
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                  placeholder="₹"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-2">Deposit</Text>
                <TextInput
                  value={form.deposit}
                  onChangeText={(value) => updateField("deposit", value)}
                  onFocus={handleInputFocus}
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                  placeholder="₹"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-2">Lease Start</Text>
                <TextInput
                  value={form.leaseStartDate}
                  onChangeText={(value) => updateField("leaseStartDate", value)}
                  onFocus={handleInputFocus}
                  placeholder="YYYY-MM-DD"
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            <View>
              <Text className="text-base font-semibold text-gray-900 mb-2">Lease End</Text>
              <TextInput
                value={form.leaseEndDate}
                onChangeText={(value) => updateField("leaseEndDate", value)}
                onFocus={handleInputFocus}
                placeholder="YYYY-MM-DD"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View className="gap-5">
            <View>
              <Text className="text-base font-semibold text-gray-900 mb-2">Area / Location *</Text>
              <TextInput
                value={form.approxAreaLabel}
                onChangeText={(value) => updateField("approxAreaLabel", value)}
                onFocus={handleInputFocus}
                placeholder="e.g., Indiranagar, Bengaluru"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-2">Latitude *</Text>
                <TextInput
                  value={form.latApprox}
                  onChangeText={(value) => updateField("latApprox", value)}
                  onFocus={handleInputFocus}
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-2">Longitude *</Text>
                <TextInput
                  value={form.lngApprox}
                  onChangeText={(value) => updateField("lngApprox", value)}
                  onFocus={handleInputFocus}
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">Show Exact Location</Text>
                <Text className="text-sm text-gray-500 mt-1">Enable for precise map display</Text>
              </View>
              <Switch
                value={form.locationExactEnabled}
                onValueChange={(value) => updateField("locationExactEnabled", value)}
                trackColor={{ false: "#D1D5DB", true: "#4F46E5" }}
                thumbColor="#FFFFFF"
              />
            </View>
            {form.locationExactEnabled && (
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-2">Exact Latitude</Text>
                  <TextInput
                    value={form.latExact}
                    onChangeText={(value) => updateField("latExact", value)}
                    onFocus={handleInputFocus}
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-2">Exact Longitude</Text>
                  <TextInput
                    value={form.lngExact}
                    onChangeText={(value) => updateField("lngExact", value)}
                    onFocus={handleInputFocus}
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            )}
            <View>
              <Text className="text-base font-semibold text-gray-900 mb-2">Nearby Localities</Text>
              <TextInput
                value={form.nearbyLocalities}
                onChangeText={(value) => updateField("nearbyLocalities", value)}
                onFocus={handleInputFocus}
                placeholder="e.g., HSR, Koramangala"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View>
              <Text className="text-base font-semibold text-gray-900 mb-2">Nearby Schools</Text>
              <TextInput
                value={form.nearbySchools}
                onChangeText={(value) => updateField("nearbySchools", value)}
                onFocus={handleInputFocus}
                placeholder="e.g., National Public School"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View>
              <Text className="text-base font-semibold text-gray-900 mb-2">Nearby Companies</Text>
              <TextInput
                value={form.nearbyCompanies}
                onChangeText={(value) => updateField("nearbyCompanies", value)}
                onFocus={handleInputFocus}
                placeholder="e.g., Google, Amazon"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View className="gap-5">
            <View className="bg-gray-50 p-4 rounded-xl">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">Utilities Included</Text>
                  <Text className="text-sm text-gray-500 mt-1">All utilities covered in rent</Text>
                </View>
                <Switch
                  value={form.utilitiesIncluded}
                  onValueChange={(value) => updateField("utilitiesIncluded", value)}
                  trackColor={{ false: "#D1D5DB", true: "#4F46E5" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View>
              <Text className="text-base font-semibold text-gray-900 mb-3">Utilities</Text>
              <View className="flex-row flex-wrap gap-3 mb-4">
                {UTILITIES.map((utility) => {
                  const isSelected = selectedUtilities.includes(utility.id);
                  return (
                    <TouchableOpacity
                      key={utility.id}
                      onPress={() => toggleUtility(utility.id)}
                      className={`items-center justify-center p-4 rounded-xl border-2 ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-600"
                          : "bg-white border-gray-300"
                      }`}
                      style={{ width: "30%" }}
                    >
                      <UtilityIcon name={utility.id} size={32} color={isSelected ? "#4F46E5" : "#6B7280"} />
                      <Text
                        className={`text-xs mt-2 font-medium ${
                          isSelected ? "text-indigo-600" : "text-gray-600"
                        }`}
                      >
                        {utility.label}
                      </Text>
                      {isSelected && (
                        <View className="absolute top-1 right-1 bg-indigo-600 rounded-full p-1">
                          <CheckIcon size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View>
                <Text className="text-sm text-gray-600 mb-2">Or add custom utilities (optional)</Text>
                <TextInput
                  value={manualUtilities}
                  onChangeText={setManualUtilities}
                  onFocus={handleInputFocus}
                  placeholder="e.g., cable TV, heating"
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                  placeholderTextColor="#9CA3AF"
                />
                <Text className="text-xs text-gray-500 mt-1">Separate multiple with commas</Text>
              </View>
            </View>

            <View>
              <Text className="text-base font-semibold text-gray-900 mb-3">Amenities</Text>
              <View className="flex-row flex-wrap gap-3 mb-4">
                {AMENITIES.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity.id);
                  return (
                    <TouchableOpacity
                      key={amenity.id}
                      onPress={() => toggleAmenity(amenity.id)}
                      className={`items-center justify-center p-4 rounded-xl border-2 ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-600"
                          : "bg-white border-gray-300"
                      }`}
                      style={{ width: "30%" }}
                    >
                      <AmenityIcon name={amenity.id} size={32} color={isSelected ? "#4F46E5" : "#6B7280"} />
                      <Text
                        className={`text-xs mt-2 font-medium ${
                          isSelected ? "text-indigo-600" : "text-gray-600"
                        }`}
                      >
                        {amenity.label}
                      </Text>
                      {isSelected && (
                        <View className="absolute top-1 right-1 bg-indigo-600 rounded-full p-1">
                          <CheckIcon size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View>
                <Text className="text-sm text-gray-600 mb-2">Or add custom amenities (optional)</Text>
                <TextInput
                  value={manualAmenities}
                  onChangeText={setManualAmenities}
                  onFocus={handleInputFocus}
                  placeholder="e.g., rooftop access, garden"
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                  placeholderTextColor="#9CA3AF"
                />
                <Text className="text-xs text-gray-500 mt-1">Separate multiple with commas</Text>
              </View>
            </View>

            <View>
              <Text className="text-base font-semibold text-gray-900 mb-2">Visit Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {VISIT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => updateField("visitType", type)}
                    className={`px-4 py-3 rounded-xl border-2 ${
                      form.visitType === type
                        ? "bg-indigo-600 border-indigo-600"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text className={`font-medium ${form.visitType === type ? "text-white" : "text-gray-700"}`}>
                      {type.replace("_", " ")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-base font-semibold text-gray-900 mb-2">Description</Text>
                <TextInput
                  value={form.description}
                  onChangeText={(value) => updateField("description", value)}
                  onFocus={handleInputFocus}
                  placeholder="Share details about the room, neighborhood, and what makes it special..."
                  multiline
                  numberOfLines={5}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white h-32"
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
            </View>

            <View>
              <Text className="text-base font-semibold text-gray-900 mb-3">Listing Images</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                <View className="flex-row gap-3">
                  {form.images.map((image) => (
                    <View key={image.uri} className="relative">
                      <Image source={{ uri: image.uri }} className="h-24 w-24 rounded-xl" resizeMode="cover" />
                      <TouchableOpacity
                        onPress={() => removeImage(image.uri)}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                      >
                        <Text className="text-white text-xs font-bold">×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={pickImages}
                    className="h-24 w-24 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50"
                  >
                    <Text className="text-2xl text-gray-400 mb-1">+</Text>
                    <Text className="text-xs text-gray-400">Add Photo</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
              <Text className="text-xs text-gray-500">Add up to 10 photos of your room</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="flex-row gap-3 mt-4 pt-4 border-t border-gray-200">
        {step > 1 && (
          <TouchableOpacity
            onPress={prevStep}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl"
          >
            <Text className="text-center font-semibold text-gray-700">Back</Text>
          </TouchableOpacity>
        )}
        {step < 3 ? (
          <TouchableOpacity
            onPress={nextStep}
            className="flex-1 px-4 py-3 bg-indigo-600 rounded-xl"
          >
            <Text className="text-center font-semibold text-white">Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              // Combine selected icons with manual entries before submitting
              const combinedForm = {
                ...form,
                amenities: getCombinedAmenities(),
                utilities: getCombinedUtilities(),
              };
              onSubmit(combinedForm);
            }}
            disabled={loading}
            className={`flex-1 px-4 py-3 rounded-xl ${loading ? "bg-gray-300" : "bg-indigo-600"}`}
          >
            <Text className={`text-center font-semibold ${loading ? "text-gray-600" : "text-white"}`}>
              {loading ? "Publishing..." : submitLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      </View>
    </KeyboardAvoidingView>
  );
}
