import React, { useEffect, useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, TextInput, Modal, Image } from "react-native";
import { useRouter } from "expo-router";
import { roomsApi } from "@/lib/api/rooms";
import { ListingStatus, RoomListingSummary } from '@/shared/types";
import { formatRoomStatus } from '@/features/travel/rooms/format";
import { useCurrency } from "@/lib/currency";
import { HomeIcon, EditIcon, TrashIcon, ShareIcon, SearchIcon, FilterIcon, PlusIcon, XIcon, MapPinIcon } from '@/shared/components/ui/Icons";

const TABS: { label: string; statuses: ListingStatus[]; color: string }[] = [
  { label: "All", statuses: ["AVAILABLE", "IN_TALKS", "HIDDEN", "ARCHIVED"], color: "#6366F1" },
  { label: "Active", statuses: ["AVAILABLE"], color: "#10B981" },
  { label: "In Talks", statuses: ["IN_TALKS"], color: "#F59E0B" },
  { label: "Hidden", statuses: ["HIDDEN"], color: "#6B7280" },
  { label: "Archived", statuses: ["ARCHIVED"], color: "#9CA3AF" },
];

type SortOption = "recent" | "rent_high" | "rent_low" | "title";

export default function MyListings() {
  const router = useRouter();
  const [listings, setListings] = useState<RoomListingSummary[]>([]);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showSortModal, setShowSortModal] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const { format } = useCurrency();

  const loadListings = async () => {
    try {
      const response = await roomsApi.getMyListings();
      setListings(response.content || []);
    } catch (err) {
      Alert.alert("Unable to load listings", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  useEffect(() => {
    loadListings();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = listings.length;
    const active = listings.filter(l => l.status === "AVAILABLE").length;
    const inTalks = listings.filter(l => l.status === "IN_TALKS").length;
    const hidden = listings.filter(l => l.status === "HIDDEN").length;
    const archived = listings.filter(l => l.status === "ARCHIVED").length;
    const totalRent = listings.reduce((sum, l) => sum + l.rentMonthly, 0);
    
    return { total, active, inTalks, hidden, archived, totalRent };
  }, [listings]);

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    let filtered = listings.filter((listing) => {
      // Status filter
      const statusMatch = activeTab.statuses.includes(listing.status);
      
      // Search filter
      const searchMatch = !searchQuery || 
        listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.approxAreaLabel?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return statusMatch && searchMatch;
    });

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "rent_high":
          return b.rentMonthly - a.rentMonthly;
        case "rent_low":
          return a.rentMonthly - b.rentMonthly;
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "recent":
        default:
          return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
      }
    });

    return filtered;
  }, [listings, activeTab, searchQuery, sortBy]);

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      "Delete Listing",
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await roomsApi.deleteListing(id);
              await loadListings();
              Alert.alert("Success", "Listing deleted successfully.");
            } catch (err) {
              Alert.alert("Error", "Unable to delete listing. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleArchive = async (id: string) => {
    try {
      await roomsApi.updateStatus(id, "ARCHIVED");
      await loadListings();
      setActionMenuId(null);
    } catch (err) {
      Alert.alert("Error", "Unable to archive listing. Please try again.");
    }
  };

  const handleRepost = async (id: string) => {
    try {
      await roomsApi.repostListing(id);
      await loadListings();
      setActionMenuId(null);
      Alert.alert("Success", "Listing reposted successfully!");
    } catch (err) {
      Alert.alert("Error", "Unable to repost listing. Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 shadow-sm">
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-gray-900">My Listings</Text>
              <Text className="text-sm text-gray-500 mt-1">Manage and track your room listings</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/rooms/create")}
              className="bg-indigo-600 px-5 py-3 rounded-xl shadow-md flex-row items-center"
            >
              <PlusIcon size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">New</Text>
            </TouchableOpacity>
          </View>

          {/* Statistics Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-3">
              <View className="bg-indigo-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#4F46E5" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Total Listings</Text>
                <Text className="text-white text-3xl font-bold">{stats.total}</Text>
              </View>
              <View className="bg-green-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#10B981" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Active</Text>
                <Text className="text-white text-3xl font-bold">{stats.active}</Text>
              </View>
              <View className="bg-amber-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#F59E0B" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">In Talks</Text>
                <Text className="text-white text-3xl font-bold">{stats.inTalks}</Text>
              </View>
              <View className="bg-purple-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#9333EA" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Total Value</Text>
                <Text className="text-white text-xl font-bold">{format(stats.totalRent)}</Text>
                <Text className="text-white/80 text-xs mt-1">per month</Text>
              </View>
            </View>
          </ScrollView>

          {/* Search Bar */}
          <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center mb-4 border border-gray-200">
            <SearchIcon size={18} color="#6B7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search listings..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-gray-900"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <XIcon size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            <View className="flex-row gap-2">
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.label}
                  onPress={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-full ${
                    activeTab.label === tab.label 
                      ? "bg-indigo-600 shadow-md" 
                      : "bg-gray-100"
                  }`}
                >
                  <Text className={`font-semibold text-sm ${
                    activeTab.label === tab.label ? "text-white" : "text-gray-700"
                  }`}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Sort Button */}
          <View className="flex-row items-center justify-between mt-3">
            <Text className="text-sm text-gray-600">
              {filteredAndSortedListings.length} {filteredAndSortedListings.length === 1 ? "listing" : "listings"}
            </Text>
            <TouchableOpacity
              onPress={() => setShowSortModal(true)}
              className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg"
            >
              <FilterIcon size={16} color="#6B7280" />
              <Text className="text-sm text-gray-700 ml-2 font-medium">
                Sort: {sortBy === "recent" ? "Recent" : sortBy === "rent_high" ? "Rent (High)" : sortBy === "rent_low" ? "Rent (Low)" : "Title"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Listings */}
      <ScrollView
        className="flex-1 px-6 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && (
          <View className="items-center py-20">
            <Text className="text-gray-500 text-base">Loading listings...</Text>
          </View>
        )}

        {!loading && filteredAndSortedListings.length === 0 && (
          <View className="items-center py-20 px-4">
            <View className="bg-indigo-100 rounded-full p-6 mb-4">
              <HomeIcon size={48} color="#4F46E5" />
            </View>
            <Text className="text-gray-700 text-xl font-semibold mt-4">No listings found</Text>
            <Text className="text-gray-500 mt-2 text-center text-sm">
              {searchQuery 
                ? "Try adjusting your search or filters"
                : activeTab.label !== "All"
                ? `No ${activeTab.label.toLowerCase()} listings yet.`
                : "Post your first room listing to get started."}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/rooms/create")}
              className="mt-6 bg-indigo-600 px-6 py-3 rounded-xl shadow-md"
            >
              <Text className="text-white font-semibold">+ Create New Listing</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && filteredAndSortedListings.map((listing) => {
          const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
            AVAILABLE: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
            IN_TALKS: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
            HIDDEN: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" },
            ARCHIVED: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
            BOOKED: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
            DELETED: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
          };
          const statusStyle = statusColors[listing.status] || statusColors.HIDDEN;
          const hasImage = listing.imageUrls && listing.imageUrls.length > 0;

          return (
            <View
              key={listing.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-md border border-gray-100"
            >
              <TouchableOpacity
                onPress={() => router.push(`/rooms/detail?id=${listing.id}`)}
                activeOpacity={0.7}
              >
                <View className="flex-row">
                  {/* Image */}
                  <View className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 mr-4">
                    {hasImage ? (
                      <Image
                        source={{ uri: listing.imageUrls[0] }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <HomeIcon size={32} color="#9CA3AF" />
                      </View>
                    )}
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1 pr-2">
                        <Text className="text-lg font-bold text-gray-900 mb-1" numberOfLines={2}>
                          {listing.title}
                        </Text>
                        <View className="flex-row items-center mb-2">
                          <MapPinIcon size={14} color="#6B7280" />
                          <Text className="text-sm text-gray-600 ml-1" numberOfLines={1}>
                            {listing.approxAreaLabel}
                          </Text>
                        </View>
                      </View>
                      <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
                        <View className="flex-row items-center">
                          <View className={`w-2 h-2 rounded-full ${statusStyle.dot} mr-1.5`} />
                          <Text className={`text-xs font-semibold ${statusStyle.text}`}>
                            {formatRoomStatus(listing.status)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="flex-row items-baseline justify-between">
                      <View>
                        <Text className="text-2xl font-bold text-indigo-600">{format(listing.rentMonthly)}</Text>
                        <Text className="text-xs text-gray-500">per month</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <TouchableOpacity
                  onPress={() => router.push(`/rooms/edit?id=${listing.id}`)}
                  className="flex-row items-center bg-indigo-50 px-4 py-2 rounded-lg flex-1 mr-2"
                >
                  <EditIcon size={16} color="#4F46E5" />
                  <Text className="text-indigo-600 font-medium text-sm ml-2">Edit</Text>
                </TouchableOpacity>
                
                {listing.status === "HIDDEN" && (
                  <TouchableOpacity
                    onPress={() => handleRepost(listing.id)}
                    className="flex-row items-center bg-green-50 px-4 py-2 rounded-lg flex-1 mr-2"
                  >
                    <Text className="text-green-600 font-medium text-sm">Repost</Text>
                  </TouchableOpacity>
                )}

                {listing.status !== "ARCHIVED" && (
                  <TouchableOpacity
                    onPress={() => handleArchive(listing.id)}
                    className="flex-row items-center bg-gray-50 px-4 py-2 rounded-lg flex-1 mr-2"
                  >
                    <Text className="text-gray-600 font-medium text-sm">Archive</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => handleDelete(listing.id, listing.title)}
                  className="flex-row items-center bg-red-50 px-4 py-2 rounded-lg"
                >
                  <TrashIcon size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {listing.status === "HIDDEN" && (
                <View className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <Text className="text-sm text-amber-800 font-medium">This listing is hidden</Text>
                  <Text className="text-xs text-amber-700 mt-1">It was hidden due to inactivity. Repost it to make it visible again.</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <XIcon size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {(["recent", "rent_high", "rent_low", "title"] as SortOption[]).map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setSortBy(option);
                  setShowSortModal(false);
                }}
                className={`py-4 px-4 rounded-xl mb-2 ${
                  sortBy === option ? "bg-indigo-50" : "bg-gray-50"
                }`}
              >
                <Text className={`font-semibold ${
                  sortBy === option ? "text-indigo-600" : "text-gray-700"
                }`}>
                  {option === "recent" ? "Most Recent" : 
                   option === "rent_high" ? "Rent: High to Low" :
                   option === "rent_low" ? "Rent: Low to High" :
                   "Title: A to Z"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
