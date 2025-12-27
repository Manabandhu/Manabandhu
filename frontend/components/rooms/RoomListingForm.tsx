import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Image } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { ListingFor, RoomListing, RoomType, VisitType } from "@/types";
import { formatRoomType, formatListingFor } from "@/lib/rooms/format";

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

  const updateField = <K extends keyof RoomListingFormValues>(key: K, value: RoomListingFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-sm text-gray-500">Step {step} of 3</Text>
        <View className="flex-row gap-2">
          {step > 1 && (
            <TouchableOpacity onPress={prevStep} className="px-3 py-2 border border-gray-200 rounded-full">
              <Text className="text-gray-600">Back</Text>
            </TouchableOpacity>
          )}
          {step < 3 && (
            <TouchableOpacity onPress={nextStep} className="px-3 py-2 bg-blue-600 rounded-full">
              <Text className="text-white">Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View className="gap-4">
            <View>
              <Text className="text-sm text-gray-600 mb-1">Title</Text>
              <TextInput
                value={form.title}
                onChangeText={(value) => updateField("title", value)}
                placeholder="Spacious 2BHK with balcony"
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
            </View>
            <View>
              <Text className="text-sm text-gray-600 mb-1">Listing For</Text>
              <View className="flex-row flex-wrap gap-2">
                {LISTING_FOR.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => updateField("listingFor", type)}
                    className={`px-3 py-2 rounded-full border ${
                      form.listingFor === type ? "bg-blue-600 border-blue-600" : "border-gray-200"
                    }`}
                  >
                    <Text className={`${form.listingFor === type ? "text-white" : "text-gray-600"}`}>{formatListingFor(type)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <Text className="text-sm text-gray-600 mb-1">Room Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {ROOM_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => updateField("roomType", type)}
                    className={`px-3 py-2 rounded-full border ${
                      form.roomType === type ? "bg-blue-600 border-blue-600" : "border-gray-200"
                    }`}
                  >
                    <Text className={`${form.roomType === type ? "text-white" : "text-gray-600"}`}>{formatRoomType(type)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-1">People Allowed</Text>
                <TextInput
                  value={form.peopleAllowed}
                  onChangeText={(value) => updateField("peopleAllowed", value)}
                  keyboardType="numeric"
                  className="border border-gray-200 rounded-lg px-3 py-2"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-1">Rent / month</Text>
                <TextInput
                  value={form.rentMonthly}
                  onChangeText={(value) => updateField("rentMonthly", value)}
                  keyboardType="numeric"
                  className="border border-gray-200 rounded-lg px-3 py-2"
                />
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-1">Deposit</Text>
                <TextInput
                  value={form.deposit}
                  onChangeText={(value) => updateField("deposit", value)}
                  keyboardType="numeric"
                  className="border border-gray-200 rounded-lg px-3 py-2"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-1">Lease Start</Text>
                <TextInput
                  value={form.leaseStartDate}
                  onChangeText={(value) => updateField("leaseStartDate", value)}
                  placeholder="YYYY-MM-DD"
                  className="border border-gray-200 rounded-lg px-3 py-2"
                />
              </View>
            </View>
            <View>
              <Text className="text-sm text-gray-600 mb-1">Lease End</Text>
              <TextInput
                value={form.leaseEndDate}
                onChangeText={(value) => updateField("leaseEndDate", value)}
                placeholder="YYYY-MM-DD"
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View className="gap-4">
            <View>
              <Text className="text-sm text-gray-600 mb-1">Approx Area Label</Text>
              <TextInput
                value={form.approxAreaLabel}
                onChangeText={(value) => updateField("approxAreaLabel", value)}
                placeholder="Indiranagar, Bengaluru"
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-1">Approx Latitude</Text>
                <TextInput
                  value={form.latApprox}
                  onChangeText={(value) => updateField("latApprox", value)}
                  keyboardType="numeric"
                  className="border border-gray-200 rounded-lg px-3 py-2"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-1">Approx Longitude</Text>
                <TextInput
                  value={form.lngApprox}
                  onChangeText={(value) => updateField("lngApprox", value)}
                  keyboardType="numeric"
                  className="border border-gray-200 rounded-lg px-3 py-2"
                />
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Show Exact Location</Text>
              <Switch value={form.locationExactEnabled} onValueChange={(value) => updateField("locationExactEnabled", value)} />
            </View>
            {form.locationExactEnabled && (
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-sm text-gray-600 mb-1">Exact Latitude</Text>
                  <TextInput
                    value={form.latExact}
                    onChangeText={(value) => updateField("latExact", value)}
                    keyboardType="numeric"
                    className="border border-gray-200 rounded-lg px-3 py-2"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-600 mb-1">Exact Longitude</Text>
                  <TextInput
                    value={form.lngExact}
                    onChangeText={(value) => updateField("lngExact", value)}
                    keyboardType="numeric"
                    className="border border-gray-200 rounded-lg px-3 py-2"
                  />
                </View>
              </View>
            )}
            <View>
              <Text className="text-sm text-gray-600 mb-1">Nearby Localities</Text>
              <TextInput
                value={form.nearbyLocalities}
                onChangeText={(value) => updateField("nearbyLocalities", value)}
                placeholder="HSR, Koramangala"
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
            </View>
            <View>
              <Text className="text-sm text-gray-600 mb-1">Nearby Schools</Text>
              <TextInput
                value={form.nearbySchools}
                onChangeText={(value) => updateField("nearbySchools", value)}
                placeholder="National Public School"
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
            </View>
            <View>
              <Text className="text-sm text-gray-600 mb-1">Nearby Companies</Text>
              <TextInput
                value={form.nearbyCompanies}
                onChangeText={(value) => updateField("nearbyCompanies", value)}
                placeholder="Google, Amazon"
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Utilities Included</Text>
              <Switch value={form.utilitiesIncluded} onValueChange={(value) => updateField("utilitiesIncluded", value)} />
            </View>
            <View>
              <Text className="text-sm text-gray-600 mb-1">Utilities</Text>
              <TextInput
                value={form.utilities}
                onChangeText={(value) => updateField("utilities", value)}
                placeholder="electricity, wifi"
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
            </View>
            <View>
              <Text className="text-sm text-gray-600 mb-1">Amenities</Text>
              <TextInput
                value={form.amenities}
                onChangeText={(value) => updateField("amenities", value)}
                placeholder="parking, security"
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
            </View>
            <View>
              <Text className="text-sm text-gray-600 mb-1">Visit Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {VISIT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => updateField("visitType", type)}
                    className={`px-3 py-2 rounded-full border ${
                      form.visitType === type ? "bg-blue-600 border-blue-600" : "border-gray-200"
                    }`}
                  >
                    <Text className={`${form.visitType === type ? "text-white" : "text-gray-600"}`}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <Text className="text-sm text-gray-600 mb-1">Contact Preference</Text>
              <TextInput
                value={form.contactPreference}
                onChangeText={(value) => updateField("contactPreference", value)}
                placeholder='{"chatOnly": true, "timings": "9am-6pm"}'
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
            </View>
            <View>
              <Text className="text-sm text-gray-600 mb-1">Description</Text>
              <TextInput
                value={form.description}
                onChangeText={(value) => updateField("description", value)}
                placeholder="Share details about the room"
                multiline
                numberOfLines={4}
                className="border border-gray-200 rounded-lg px-3 py-2 h-24"
              />
            </View>
            <View>
              <Text className="text-sm text-gray-600 mb-2">Listing Images</Text>
              <View className="flex-row flex-wrap gap-3">
                {form.images.map((image) => (
                  <View key={image.uri} className="relative">
                    <Image source={{ uri: image.uri }} className="h-20 w-20 rounded-lg" />
                    <TouchableOpacity
                      onPress={() => removeImage(image.uri)}
                      className="absolute -top-2 -right-2 bg-black/70 rounded-full px-2 py-1"
                    >
                      <Text className="text-white text-xs">X</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={pickImages}
                  className="h-20 w-20 rounded-lg border border-dashed border-gray-300 items-center justify-center"
                >
                  <Text className="text-gray-400">+ Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {step === 3 && (
        <TouchableOpacity
          onPress={() => onSubmit(form)}
          disabled={loading}
          className={`mt-4 rounded-lg py-3 ${loading ? "bg-gray-300" : "bg-blue-600"}`}
        >
          <Text className={`text-center font-semibold ${loading ? "text-gray-600" : "text-white"}`}>
            {loading ? "Saving..." : submitLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
