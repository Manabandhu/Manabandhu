import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, Alert, Modal, Image } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "@/shared/components/ui/Header";
import { 
  CreditCardIcon, 
  UsersIcon, 
  DollarSignIcon, 
  SplitIcon, 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  EditIcon, 
  TrashIcon, 
  XIcon,
  CalendarIcon,
  UtensilsIcon,
  BusIcon,
  ActivityIcon,
  ShoppingBagIcon,
  SettingsIcon
} from "@/shared/components/ui/Icons";
import AddExpenseBottomSheet from "@/components/AddExpenseBottomSheet";
import { useCurrency } from "@/lib/currency";
import { expensesAPI, Expense, ExpenseCategory } from "@/shared/api/expenses";
import { useThemeStore } from "@/store/theme.store";

// Expense interface is imported from API

const categories = [
  { id: ExpenseCategory.FOOD, label: 'Food', icon: UtensilsIcon, color: '#F59E0B' },
  { id: ExpenseCategory.TRANSPORT, label: 'Transport', icon: BusIcon, color: '#3B82F6' },
  { id: ExpenseCategory.UTILITIES, label: 'Utilities', icon: SettingsIcon, color: '#10B981' },
  { id: ExpenseCategory.ENTERTAINMENT, label: 'Entertainment', icon: ActivityIcon, color: '#8B5CF6' },
  { id: ExpenseCategory.HEALTHCARE, label: 'Healthcare', icon: ActivityIcon, color: '#EC4899' },
  { id: ExpenseCategory.OTHER, label: 'Other', icon: CreditCardIcon, color: '#6B7280' },
];

type PeriodFilter = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';
type SortOption = 'recent' | 'amount_high' | 'amount_low' | 'category' | 'date';

export default function ExpensesDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { format, symbol } = useCurrency();
  const { isDarkMode } = useThemeStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('all');
  const [showAddExpenseSheet, setShowAddExpenseSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showSortModal, setShowSortModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await expensesAPI.getAllExpenses(0, 100);
      setExpenses(response.content);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      Alert.alert('Error', 'Failed to load expenses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate statistics based on period
  const stats = useMemo(() => {
    const now = new Date();
    let periodExpenses = expenses;

      // Filter by period
      if (selectedPeriod !== 'all') {
        const periodStart = new Date();
        switch (selectedPeriod) {
          case 'daily':
            periodStart.setHours(0, 0, 0, 0);
            break;
          case 'weekly':
            periodStart.setDate(now.getDate() - now.getDay());
            periodStart.setHours(0, 0, 0, 0);
            break;
          case 'monthly':
            periodStart.setDate(1);
            periodStart.setHours(0, 0, 0, 0);
            break;
          case 'yearly':
            periodStart.setMonth(0, 1);
            periodStart.setHours(0, 0, 0, 0);
            break;
        }
        periodExpenses = expenses.filter(e => new Date(e.expenseDate) >= periodStart);
      }

    const total = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const yourExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0); // All expenses are user's
    const yourShare = total; // For personal expenses, share equals total
    const recurring = 0; // Not tracking recurring in current model
    const categoryBreakdown = categories.reduce((acc, cat) => {
      acc[cat.id] = periodExpenses.filter(e => e.category === cat.id).reduce((sum, e) => sum + e.amount, 0);
      return acc;
    }, {} as Record<string, number>);
    const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

    return { total, yourExpenses, othersExpenses: 0, yourShare, recurring, topCategory: topCategory?.[0] || 'None' };
  }, [expenses, selectedPeriod]);

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter((expense) => {
      // Category filter
      const categoryMatch = selectedCategory === 'All' || expense.category === selectedCategory;
      
      // Search filter
      const searchMatch = !searchQuery || 
        expense.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCategoryLabel(expense.category)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Period filter
      if (selectedPeriod !== 'all') {
        const expenseDate = new Date(expense.expenseDate);
        const now = new Date();
        const periodStart = new Date();
        
        switch (selectedPeriod) {
          case 'daily':
            periodStart.setHours(0, 0, 0, 0);
            break;
          case 'weekly':
            periodStart.setDate(now.getDate() - now.getDay());
            periodStart.setHours(0, 0, 0, 0);
            break;
          case 'monthly':
            periodStart.setDate(1);
            periodStart.setHours(0, 0, 0, 0);
            break;
          case 'yearly':
            periodStart.setMonth(0, 1);
            periodStart.setHours(0, 0, 0, 0);
            break;
        }
        
        if (expenseDate < periodStart) return false;
      }
      
      return categoryMatch && searchMatch;
    });

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'amount_high':
          return b.amount - a.amount;
        case 'amount_low':
          return a.amount - b.amount;
        case 'category':
          return getCategoryLabel(a.category).localeCompare(getCategoryLabel(b.category));
        case 'date':
          return new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime();
        case 'recent':
        default:
          return new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime();
      }
    });

    return filtered;
  }, [expenses, selectedCategory, searchQuery, selectedPeriod, sortBy]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
  };

  const handleDelete = async (id: number, title: string) => {
    Alert.alert(
      "Delete Expense",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await expensesAPI.deleteExpense(id);
              setExpenses(expenses.filter(e => e.id !== id));
              Alert.alert("Success", "Expense deleted successfully.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete expense");
            }
          },
        },
      ]
    );
  };

  const getCategoryIcon = (categoryId: ExpenseCategory | string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || CreditCardIcon;
  };

  const getCategoryColor = (categoryId: ExpenseCategory | string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  const getCategoryLabel = (categoryId: ExpenseCategory | string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.label || categoryId;
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Header title="Expenses" />
      
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <View className="px-6 pt-4 pb-4">
          <View className="flex-row items-center justify-end mb-4">
            <TouchableOpacity
              onPress={() => setShowAddExpenseSheet(true)}
              className="bg-indigo-600 px-5 py-3 rounded-xl shadow-md flex-row items-center"
            >
              <PlusIcon size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">Add</Text>
            </TouchableOpacity>
          </View>

          {/* Period Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              {(['all', 'daily', 'weekly', 'monthly', 'yearly'] as PeriodFilter[]).map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => setSelectedPeriod(period)}
                  className={`px-4 py-2.5 rounded-full ${
                    selectedPeriod === period 
                      ? "bg-indigo-600 shadow-md" 
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <Text className={`font-semibold text-sm ${
                    selectedPeriod === period ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }`}>
                    {period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Statistics Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-3">
              <View className="bg-indigo-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#4F46E5" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Total Expenses</Text>
                <Text className="text-white text-2xl font-bold">{format(stats.total)}</Text>
              </View>
              <View className="bg-green-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#10B981" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">You Paid</Text>
                <Text className="text-white text-2xl font-bold">{format(stats.yourExpenses)}</Text>
              </View>
              <View className="bg-amber-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#F59E0B" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Your Share</Text>
                <Text className="text-white text-2xl font-bold">{format(stats.yourShare)}</Text>
              </View>
              <View className="bg-purple-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#9333EA" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Recurring</Text>
                <Text className="text-white text-3xl font-bold">{stats.recurring}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Search Bar */}
          <View className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 flex-row items-center mb-4 border border-gray-200 dark:border-gray-600">
            <SearchIcon size={18} color="#6B7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search expenses..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-gray-900 dark:text-white"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <XIcon size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setSelectedCategory('All')}
                className={`px-4 py-2.5 rounded-full flex-row items-center ${
                  selectedCategory === 'All' ? 'bg-indigo-600' : 'bg-gray-100'
                }`}
              >
                <Text className={`font-semibold text-sm ${
                  selectedCategory === 'All' ? 'text-white' : 'text-gray-700'
                }`}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                className={`px-4 py-2.5 rounded-full flex-row items-center ${
                  isSelected ? 'bg-indigo-600' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
                  >
                    <Icon size={16} color={isSelected ? "#FFFFFF" : category.color} />
                    <Text className={`font-semibold text-sm ml-2 ${
                      isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Sort Button */}
          <View className="flex-row items-center justify-between mt-3">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {filteredAndSortedExpenses.length} {filteredAndSortedExpenses.length === 1 ? "expense" : "expenses"}
            </Text>
            <TouchableOpacity
              onPress={() => setShowSortModal(true)}
              className="flex-row items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg"
            >
              <FilterIcon size={16} color="#6B7280" />
              <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2 font-medium">
                Sort: {sortBy === 'recent' ? 'Recent' : 
                       sortBy === 'amount_high' ? 'Amount (High)' : 
                       sortBy === 'amount_low' ? 'Amount (Low)' :
                       sortBy === 'category' ? 'Category' : 'Date'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Expenses List */}
      <ScrollView
        className="flex-1 px-6 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredAndSortedExpenses.length === 0 ? (
          <View className="items-center py-20 px-4">
            <View className="bg-indigo-100 rounded-full p-6 mb-4">
              <CreditCardIcon size={48} color="#4F46E5" />
            </View>
            <Text className="text-gray-700 dark:text-gray-300 text-xl font-semibold mt-4">No expenses found</Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center text-sm">
              {searchQuery 
                ? "Try adjusting your search or filters"
                : "Add your first expense to get started."}
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddExpenseSheet(true)}
              className="mt-6 bg-indigo-600 px-6 py-3 rounded-xl shadow-md"
            >
              <Text className="text-white font-semibold">+ Add Expense</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredAndSortedExpenses.map((expense) => {
            const CategoryIcon = getCategoryIcon(expense.category);
            const categoryColor = getCategoryColor(expense.category);

            return (
              <View
                key={expense.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-md border border-gray-100 dark:border-gray-700"
              >
                <View className="flex-row items-start">
                  {/* Category Icon */}
                  <View 
                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${categoryColor}15` }}
                  >
                    <CategoryIcon size={24} color={categoryColor} />
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1 pr-2">
                        <View className="flex-row items-center mb-1">
                          <Text className="text-lg font-bold text-gray-900 dark:text-white mr-2">
                            {expense.title}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <View 
                            className="px-2 py-1 rounded-md mr-2"
                            style={{ backgroundColor: `${categoryColor}20` }}
                          >
                            <Text className="text-xs font-medium" style={{ color: categoryColor }}>
                              {getCategoryLabel(expense.category)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text className="text-2xl font-bold text-indigo-600">
                        {format(expense.amount)}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <View className="flex-row items-center">
                        <CalendarIcon size={14} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                        <Text className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                          {new Date(expense.expenseDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </Text>
                      </View>
                      
                      {/* Action Buttons */}
                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                          onPress={() => {
                            if (router) {
                              router.push(`/expenses/edit/${expense.id}` as any);
                            }
                          }}
                          className="bg-indigo-50 px-3 py-1.5 rounded-lg"
                        >
                          <EditIcon size={14} color="#4F46E5" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDelete(expense.id as number, expense.title)}
                          className="bg-red-50 px-3 py-1.5 rounded-lg"
                        >
                          <TrashIcon size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Quick Actions */}
        <View className="mt-6 mb-8">
          <TouchableOpacity 
            className="bg-green-600 rounded-xl p-4 flex-row items-center justify-center mb-3 shadow-md"
            onPress={() => {
              if (router) {
                router.push('/splitly');
              }
            }}
          >
            <SplitIcon size={20} color="#FFFFFF" />
            <Text className="text-white font-semibold ml-2">Split with Splitly</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <Text className="text-gray-900 text-center font-semibold">
              📊 View Detailed Reports
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <XIcon size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {(['recent', 'amount_high', 'amount_low', 'category', 'date'] as SortOption[]).map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setSortBy(option);
                  setShowSortModal(false);
                }}
                className={`py-4 px-4 rounded-xl mb-2 ${
                  sortBy === option ? "bg-indigo-50 dark:bg-indigo-900/30" : "bg-gray-50 dark:bg-gray-700"
                }`}
              >
                <Text className={`font-semibold ${
                  sortBy === option ? "text-indigo-600 dark:text-indigo-400" : "text-gray-700 dark:text-gray-300"
                }`}>
                  {option === 'recent' ? 'Most Recent' : 
                   option === 'amount_high' ? 'Amount: High to Low' :
                   option === 'amount_low' ? 'Amount: Low to High' :
                   option === 'category' ? 'Category: A to Z' :
                   'Date: Oldest First'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <AddExpenseBottomSheet 
        visible={showAddExpenseSheet}
        onClose={() => setShowAddExpenseSheet(false)}
        onExpenseAdded={() => {
          loadExpenses();
          setShowAddExpenseSheet(false);
        }}
      />
    </View>
  );
}


