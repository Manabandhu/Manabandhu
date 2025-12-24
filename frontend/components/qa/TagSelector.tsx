import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Tag } from '@/types/qa';
import { COLORS, colors } from '@/constants/colors';
import { qaApi } from '@/lib/api/qa';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ 
  selectedTags, 
  onTagsChange, 
  maxTags = 5 
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const data = await qaApi.getTags();
      setTags(data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(t => t !== tagName));
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'IMMIGRATION': return colors.primary[500];
      case 'INSURANCE': return colors.success[500];
      case 'HOUSING': return '#8B5CF6';
      case 'TRAVEL': return colors.accent[500];
      case 'TAX': return colors.error[500];
      default: return colors.gray[500];
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading tags...</Text>
      </View>
    );
  }

  const groupedTags = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Tags ({selectedTags.length}/{maxTags})</Text>
        <Text style={styles.subtitle}>Choose relevant tags for your question</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedTags).map(([category, categoryTags]) => (
          <View key={category} style={styles.category}>
            <Text style={[styles.categoryTitle, { color: getCategoryColor(category) }]}>
              {category.replace('_', ' ')}
            </Text>
            <View style={styles.tagsRow}>
              {categoryTags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tag,
                    selectedTags.includes(tag.name) && styles.selectedTag,
                    selectedTags.length >= maxTags && !selectedTags.includes(tag.name) && styles.disabledTag,
                  ]}
                  onPress={() => toggleTag(tag.name)}
                  disabled={selectedTags.length >= maxTags && !selectedTags.includes(tag.name)}
                >
                  <Text style={[
                    styles.tagText,
                    selectedTags.includes(tag.name) && styles.selectedTagText,
                  ]}>
                    {tag.name.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  category: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedTag: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  disabledTag: {
    opacity: 0.5,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  selectedTagText: {
    color: '#FFFFFF',
  },
});