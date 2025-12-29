import React, { useMemo, useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Image, Animated, KeyboardAvoidingView, Platform, Modal } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ListingFor, RoomListing, RoomType, VisitType } from "@/types";
import { formatRoomType, formatListingFor } from "@/lib/rooms/format";
import { AmenityIcon, UtilityIcon } from "./AmenityIcon";
import { CheckIcon } from "@/components/ui/Icons";
import { useCurrency } from "@/lib/currency";

export interface RoomListingFormValues {
  title: string;
  listingFor: ListingFor;
  roomType: RoomType;
  peopleAllowed: string;
  rentMonthly: string;
  deposit: string;
  leaseStartDate: string;
  leaseEndDate: string;
  leaseExtendable: boolean;
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
  const { symbol } = useCurrency();
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initialImages = useMemo(() => {
    if (!initialValues?.imageUrls?.length) return [];
    return initialValues.imageUrls.map((uri) => ({ uri, isRemote: true }));
  }, [initialValues]);

  // Helper to parse date string to Date object
  const parseDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  // Helper to format date to YYYY-MM-DD
  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const initialStartDate = parseDate(initialValues?.leaseStartDate) || new Date();
  const initialEndDate = parseDate(initialValues?.leaseEndDate) || new Date();

  const [form, setForm] = useState<RoomListingFormValues>({
    title: initialValues?.title ?? "",
    listingFor: initialValues?.listingFor ?? "STUDENT",
    roomType: initialValues?.roomType ?? "PRIVATE",
    peopleAllowed: initialValues?.peopleAllowed?.toString() ?? "1",
    rentMonthly: initialValues?.rentMonthly?.toString() ?? "",
    deposit: initialValues?.deposit?.toString() ?? "",
    leaseStartDate: initialValues?.leaseStartDate ?? "",
    leaseEndDate: initialValues?.leaseEndDate ?? "",
    leaseExtendable: (initialValues as any)?.leaseExtendable ?? false,
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

  const [startDate, setStartDate] = useState<Date>(initialStartDate);
  const [endDate, setEndDate] = useState<Date>(initialEndDate);

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

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <View className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <Text className="text-red-800 font-semibold mb-2">Please fix the following errors:</Text>
          {Object.entries(errors).map(([field, message]) => (
            <Text key={field} className="text-red-600 text-sm">• {message}</Text>
          ))}
        </View>
      )}

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
                onChangeText={(value) => {
                  updateField("title", value);
                  if (errors.title) {
                    setErrors(prev => ({ ...prev, title: "" }));
                  }
                }}
                onFocus={handleInputFocus}
                placeholder="e.g., Spacious 2BHK with balcony"
                className={`border rounded-xl px-4 py-3 text-base bg-white ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholderTextColor="#9CA3AF"
              />
              {errors.title && (
                <Text className="text-red-500 text-sm mt-1">{errors.title}</Text>
              )}
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
                  onChangeText={(value) => {
                    updateField("rentMonthly", value);
                    if (errors.rentMonthly) {
                      setErrors(prev => ({ ...prev, rentMonthly: "" }));
                    }
                  }}
                  onFocus={handleInputFocus}
                  keyboardType="numeric"
                  className={`border rounded-xl px-4 py-3 text-base bg-white ${
                    errors.rentMonthly ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={symbol}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.rentMonthly && (
                  <Text className="text-red-500 text-sm mt-1">{errors.rentMonthly}</Text>
                )}
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
                  placeholder={symbol}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-2">Lease Start</Text>
                {Platform.OS === "web" ? (
                  // Web: Use native HTML5 date input (browser date picker)
                  // @ts-ignore - Web-specific HTML input element
                  <input
                    type="date"
                    value={form.leaseStartDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateField("leaseStartDate", value);
                      if (value) {
                        setStartDate(new Date(value));
                      }
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #D1D5DB",
                      borderRadius: "12px",
                      fontSize: "16px",
                      backgroundColor: "white",
                      fontFamily: "inherit",
                    }}
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker(true)}
                      className="border border-gray-300 rounded-xl px-4 py-3 bg-white"
                    >
                      <Text className={`text-base ${form.leaseStartDate ? "text-gray-900" : "text-gray-400"}`}>
                        {form.leaseStartDate || "Select start date"}
                      </Text>
                    </TouchableOpacity>
                    {Platform.OS === "ios" ? (
                      <Modal
                        visible={showStartDatePicker}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setShowStartDatePicker(false)}
                      >
                        <View className="flex-1 justify-end bg-black/50">
                          <View className="bg-white rounded-t-3xl" style={{ backgroundColor: '#FFFFFF' }}>
                            <View className="flex-row justify-between items-center px-4 pt-4 pb-3 border-b border-gray-200">
                              <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                                <Text className="text-blue-600 text-lg font-semibold">Cancel</Text>
                              </TouchableOpacity>
                              <Text className="text-lg font-semibold text-gray-900">Select Start Date</Text>
                              <TouchableOpacity
                                onPress={() => {
                                  updateField("leaseStartDate", formatDate(startDate));
                                  setShowStartDatePicker(false);
                                }}
                              >
                                <Text className="text-blue-600 text-lg font-semibold">Done</Text>
                              </TouchableOpacity>
                            </View>
                            <View style={{ backgroundColor: '#FFFFFF', paddingVertical: 12 }}>
                              <DateTimePicker
                                value={startDate}
                                mode="date"
                                display="spinner"
                                onChange={(event, selectedDate) => {
                                  if (selectedDate) {
                                    setStartDate(selectedDate);
                                  }
                                }}
                                minimumDate={new Date()}
                                style={{ backgroundColor: '#FFFFFF', height: 200 }}
                              />
                            </View>
                          </View>
                        </View>
                      </Modal>
                    ) : (
                      showStartDatePicker && (
                        <DateTimePicker
                          value={startDate}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowStartDatePicker(false);
                            if (selectedDate) {
                              setStartDate(selectedDate);
                              updateField("leaseStartDate", formatDate(selectedDate));
                            }
                          }}
                          minimumDate={new Date()}
                        />
                      )
                    )}
                  </>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-2">Lease End</Text>
                {Platform.OS === "web" ? (
                  // Web: Use native HTML5 date input (browser date picker)
                  // @ts-ignore - Web-specific HTML input element
                  <input
                    type="date"
                    value={form.leaseEndDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateField("leaseEndDate", value);
                      if (value) {
                        const newEndDate = new Date(value);
                        setEndDate(newEndDate);
                        // Ensure end date is after start date
                        if (form.leaseStartDate && newEndDate < new Date(form.leaseStartDate)) {
                          setStartDate(newEndDate);
                          updateField("leaseStartDate", value);
                        }
                      }
                    }}
                    min={form.leaseStartDate || new Date().toISOString().split("T")[0]}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #D1D5DB",
                      borderRadius: "12px",
                      fontSize: "16px",
                      backgroundColor: "white",
                      fontFamily: "inherit",
                    }}
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => setShowEndDatePicker(true)}
                      className="border border-gray-300 rounded-xl px-4 py-3 bg-white"
                    >
                      <Text className={`text-base ${form.leaseEndDate ? "text-gray-900" : "text-gray-400"}`}>
                        {form.leaseEndDate || "Select end date"}
                      </Text>
                    </TouchableOpacity>
                    {Platform.OS === "ios" ? (
                      <Modal
                        visible={showEndDatePicker}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setShowEndDatePicker(false)}
                      >
                        <View className="flex-1 justify-end bg-black/50">
                          <View className="bg-white rounded-t-3xl" style={{ backgroundColor: '#FFFFFF' }}>
                            <View className="flex-row justify-between items-center px-4 pt-4 pb-3 border-b border-gray-200">
                              <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                                <Text className="text-blue-600 text-lg font-semibold">Cancel</Text>
                              </TouchableOpacity>
                              <Text className="text-lg font-semibold text-gray-900">Select End Date</Text>
                              <TouchableOpacity
                                onPress={() => {
                                  updateField("leaseEndDate", formatDate(endDate));
                                  // Ensure end date is after start date
                                  if (endDate < startDate) {
                                    setStartDate(endDate);
                                    updateField("leaseStartDate", formatDate(endDate));
                                  }
                                  setShowEndDatePicker(false);
                                }}
                              >
                                <Text className="text-blue-600 text-lg font-semibold">Done</Text>
                              </TouchableOpacity>
                            </View>
                            <View style={{ backgroundColor: '#FFFFFF', paddingVertical: 12 }}>
                              <DateTimePicker
                                value={endDate}
                                mode="date"
                                display="spinner"
                                onChange={(event, selectedDate) => {
                                  if (selectedDate) {
                                    setEndDate(selectedDate);
                                  }
                                }}
                                minimumDate={startDate || new Date()}
                                style={{ backgroundColor: '#FFFFFF', height: 200 }}
                              />
                            </View>
                          </View>
                        </View>
                      </Modal>
                    ) : (
                      showEndDatePicker && (
                        <DateTimePicker
                          value={endDate}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowEndDatePicker(false);
                            if (selectedDate) {
                              setEndDate(selectedDate);
                              updateField("leaseEndDate", formatDate(selectedDate));
                              // Ensure end date is after start date
                              if (selectedDate < startDate) {
                                setStartDate(selectedDate);
                                updateField("leaseStartDate", formatDate(selectedDate));
                              }
                            }
                          }}
                          minimumDate={startDate || new Date()}
                        />
                      )
                    )}
                  </>
                )}
              </View>
            </View>
            <View className="bg-gray-50 p-4 rounded-xl">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">Lease Can Be Extended</Text>
                  <Text className="text-sm text-gray-500 mt-1">Allow tenants to extend the lease period</Text>
                </View>
                <Switch
                  value={form.leaseExtendable}
                  onValueChange={(value) => updateField("leaseExtendable", value)}
                  trackColor={{ false: "#D1D5DB", true: "#4F46E5" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          <View className="gap-5">
            <View>
              <Text className="text-base font-semibold text-gray-900 mb-2">Area / Location *</Text>
              <TextInput
                value={form.approxAreaLabel}
                onChangeText={(value) => {
                  updateField("approxAreaLabel", value);
                  if (errors.approxAreaLabel) {
                    setErrors(prev => ({ ...prev, approxAreaLabel: "" }));
                  }
                }}
                onFocus={handleInputFocus}
                placeholder="e.g., Indiranagar, Bengaluru"
                className={`border rounded-xl px-4 py-3 text-base bg-white ${
                  errors.approxAreaLabel ? "border-red-500" : "border-gray-300"
                }`}
                placeholderTextColor="#9CA3AF"
              />
              {errors.approxAreaLabel && (
                <Text className="text-red-500 text-sm mt-1">{errors.approxAreaLabel}</Text>
              )}
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-2">Latitude *</Text>
                <TextInput
                  value={form.latApprox}
                  onChangeText={(value) => {
                    updateField("latApprox", value);
                    if (errors.latApprox) {
                      setErrors(prev => ({ ...prev, latApprox: "" }));
                    }
                  }}
                  onFocus={handleInputFocus}
                  keyboardType="numeric"
                  className={`border rounded-xl px-4 py-3 text-base bg-white ${
                    errors.latApprox ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.latApprox && (
                  <Text className="text-red-500 text-sm mt-1">{errors.latApprox}</Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-2">Longitude *</Text>
                <TextInput
                  value={form.lngApprox}
                  onChangeText={(value) => {
                    updateField("lngApprox", value);
                    if (errors.lngApprox) {
                      setErrors(prev => ({ ...prev, lngApprox: "" }));
                    }
                  }}
                  onFocus={handleInputFocus}
                  keyboardType="numeric"
                  className={`border rounded-xl px-4 py-3 text-base bg-white ${
                    errors.lngApprox ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.lngApprox && (
                  <Text className="text-red-500 text-sm mt-1">{errors.lngApprox}</Text>
                )}
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
                  <Text className="text-base font-semibold text-gray-900 mb-2">Exact Latitude *</Text>
                  <TextInput
                    value={form.latExact}
                    onChangeText={(value) => {
                      updateField("latExact", value);
                      if (errors.latExact) {
                        setErrors(prev => ({ ...prev, latExact: "" }));
                      }
                    }}
                    onFocus={handleInputFocus}
                    keyboardType="numeric"
                    className={`border rounded-xl px-4 py-3 text-base bg-white ${
                      errors.latExact ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholderTextColor="#9CA3AF"
                  />
                  {errors.latExact && (
                    <Text className="text-red-500 text-sm mt-1">{errors.latExact}</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-2">Exact Longitude *</Text>
                  <TextInput
                    value={form.lngExact}
                    onChangeText={(value) => {
                      updateField("lngExact", value);
                      if (errors.lngExact) {
                        setErrors(prev => ({ ...prev, lngExact: "" }));
                      }
                    }}
                    onFocus={handleInputFocus}
                    keyboardType="numeric"
                    className={`border rounded-xl px-4 py-3 text-base bg-white ${
                      errors.lngExact ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholderTextColor="#9CA3AF"
                  />
                  {errors.lngExact && (
                    <Text className="text-red-500 text-sm mt-1">{errors.lngExact}</Text>
                  )}
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
              // Validate form before submitting
              const validationErrors: Record<string, string> = {};
              
              if (!form.title.trim()) {
                validationErrors.title = "Title is required";
              }
              if (!form.rentMonthly.trim() || isNaN(Number(form.rentMonthly)) || Number(form.rentMonthly) <= 0) {
                validationErrors.rentMonthly = "Valid rent amount is required";
              }
              if (!form.latApprox.trim() || isNaN(Number(form.latApprox))) {
                validationErrors.latApprox = "Approximate location is required";
              }
              if (!form.lngApprox.trim() || isNaN(Number(form.lngApprox))) {
                validationErrors.lngApprox = "Approximate location is required";
              }
              if (!form.approxAreaLabel.trim()) {
                validationErrors.approxAreaLabel = "Area label is required";
              }
              if (form.locationExactEnabled) {
                if (!form.latExact.trim() || isNaN(Number(form.latExact))) {
                  validationErrors.latExact = "Exact latitude is required";
                }
                if (!form.lngExact.trim() || isNaN(Number(form.lngExact))) {
                  validationErrors.lngExact = "Exact longitude is required";
                }
              }
              
              setErrors(validationErrors);
              
              // If there are errors, scroll to first error or show alert
              if (Object.keys(validationErrors).length > 0) {
                const firstErrorField = Object.keys(validationErrors)[0];
                const errorMessages = Object.values(validationErrors).join("\n");
                
                // Scroll to top to show errors
                // You could also implement field-level scrolling here
                return;
              }
              
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


