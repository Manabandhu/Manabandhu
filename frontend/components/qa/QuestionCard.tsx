import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Question } from '@/types/qa';
import { COLORS, colors } from '@/constants/colors';
import { useRouter } from 'expo-router';

interface QuestionCardProps {
  question: Question;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/qa/question/${question.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ANSWERED': return colors.success[500];
      case 'CLOSED': return colors.gray[500];
      default: return colors.primary[500];
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {question.title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(question.status) }]}>
          <Text style={styles.statusText}>{question.status}</Text>
        </View>
      </View>
      
      <Text style={styles.body} numberOfLines={3}>
        {question.body}
      </Text>
      
      <View style={styles.tags}>
        {question.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {question.tags.length > 3 && (
          <Text style={styles.moreText}>+{question.tags.length - 3} more</Text>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.author}>{question.authorName || 'Anonymous'}</Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>{question.viewsCount} views</Text>
          <Text style={styles.stat}>{question.answersCount} answers</Text>
        </View>
      </View>
      
      <Text style={styles.timestamp}>
        {new Date(question.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  body: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: '#6B7280',
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
  },
  stat: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 12,
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});