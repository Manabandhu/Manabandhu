import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Question, Answer } from '@/types/qa';
import { AnswerCard } from '@/components/qa/AnswerCard';
import { qaApi } from '@/lib/api/qa';
import { COLORS, colors } from '@/constants/colors';
import { ArrowLeftIcon, ShareIcon } from '@/components/ui/Icons';

export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuestionAndAnswers();
    }
  }, [id]);

  const loadQuestionAndAnswers = async () => {
    try {
      // TODO: Get user token from auth store
      const userToken = 'dummy-token'; // Replace with actual token
      
      const [questionData, answersData] = await Promise.all([
        qaApi.getQuestion(id!, userToken),
        qaApi.getAnswers(id!, userToken),
      ]);
      
      setQuestion(questionData);
      setAnswers(answersData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load question');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadQuestionAndAnswers();
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      Alert.alert('Error', 'Please enter your answer');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Get user token from auth store
      const userToken = 'dummy-token'; // Replace with actual token
      
      await qaApi.createAnswer(id!, { body: answerText.trim() }, userToken);
      setAnswerText('');
      loadQuestionAndAnswers();
      Alert.alert('Success', 'Your answer has been posted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to post answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Report Question',
      'Why are you reporting this question?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Spam', onPress: () => reportContent('SPAM') },
        { text: 'Misinformation', onPress: () => reportContent('MISINFORMATION') },
        { text: 'Harassment', onPress: () => reportContent('HARASSMENT') },
      ]
    );
  };

  const reportContent = async (reason: 'SPAM' | 'MISINFORMATION' | 'HARASSMENT') => {
    try {
      // TODO: Get user token from auth store
      const userToken = 'dummy-token'; // Replace with actual token
      
      await qaApi.reportContent({
        contentType: 'QUESTION',
        contentId: id!,
        reason,
      }, userToken);
      Alert.alert('Success', 'Question reported successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to report question');
    }
  };

  if (loading || !question) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading question...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ANSWERED': return colors.success[500];
      case 'CLOSED': return colors.gray[500];
      default: return colors.primary[500];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeftIcon size={24} color={COLORS.gray[600]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Question</Text>
        <TouchableOpacity style={styles.shareButton}>
          <ShareIcon size={20} color={COLORS.gray[600]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionContainer}>
          <View style={styles.questionHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(question.status) }]}>
              <Text style={styles.statusText}>{question.status}</Text>
            </View>
            {!question.isAuthor && (
              <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
                <Text style={styles.reportButtonText}>Report</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.questionTitle}>{question.title}</Text>
          <Text style={styles.questionBody}>{question.body}</Text>

          <View style={styles.tags}>
            {question.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag.replace('_', ' ')}</Text>
              </View>
            ))}
          </View>

          <View style={styles.questionFooter}>
            <Text style={styles.author}>Asked by {question.authorName || 'Anonymous'}</Text>
            <View style={styles.stats}>
              <Text style={styles.stat}>{question.viewsCount} views</Text>
              <Text style={styles.stat}>{question.answersCount} answers</Text>
            </View>
          </View>

          <Text style={styles.timestamp}>
            {new Date(question.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Community responses are not legal advice. For official guidance, consult qualified professionals.
          </Text>
        </View>

        <View style={styles.answersSection}>
          <Text style={styles.answersTitle}>
            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
          </Text>
          
          {answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              canAccept={question.isAuthor && !answer.isAccepted && question.status !== 'CLOSED'}
              onVote={loadQuestionAndAnswers}
              onAccept={loadQuestionAndAnswers}
              userToken="dummy-token" // TODO: Replace with actual token
            />
          ))}
        </View>

        <View style={styles.answerForm}>
          <Text style={styles.answerFormTitle}>Your Answer</Text>
          <TextInput
            style={styles.answerInput}
            placeholder="Share your knowledge and help the community..."
            value={answerText}
            onChangeText={setAnswerText}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmitAnswer}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Posting...' : 'Post Answer'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  shareButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reportButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reportButtonText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 28,
  },
  questionBody: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
  },
  stat: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  disclaimer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
  },
  answersSection: {
    marginBottom: 16,
  },
  answersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  answerForm: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
  },
  answerFormTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});