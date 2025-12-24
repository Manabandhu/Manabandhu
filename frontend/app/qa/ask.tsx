import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TagSelector } from '@/components/qa/TagSelector';
import { qaApi } from '@/lib/api/qa';
import { COLORS } from '@/constants/colors';
import { XIcon } from '@/components/ui/Icons';

export default function AskQuestionScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your question');
      return;
    }

    if (!body.trim()) {
      Alert.alert('Error', 'Please enter the question details');
      return;
    }

    if (selectedTags.length === 0) {
      Alert.alert('Error', 'Please select at least one tag');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Get user token from auth store
      const userToken = 'dummy-token'; // Replace with actual token
      
      await qaApi.createQuestion({
        title: title.trim(),
        body: body.trim(),
        tags: selectedTags,
      }, userToken);

      Alert.alert('Success', 'Your question has been posted!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to post question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title || body || selectedTags.length > 0) {
      Alert.alert(
        'Discard Question?',
        'Are you sure you want to discard your question?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <XIcon size={24} color={COLORS.gray[600]} />
          </TouchableOpacity>
          <Text style={styles.title}>Ask a Question</Text>
          <TouchableOpacity
            style={[styles.postButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.postButtonText}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              ⚠️ Community responses are not legal advice. For official guidance, consult qualified professionals.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Question Title *</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="What's your question? Be specific and clear..."
              value={title}
              onChangeText={setTitle}
              maxLength={255}
              multiline
            />
            <Text style={styles.charCount}>{title.length}/255</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Question Details *</Text>
            <TextInput
              style={styles.bodyInput}
              placeholder="Provide more details about your question. Include relevant context, what you've tried, and what specific help you need..."
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags * (Required)</Text>
            <TagSelector
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              maxTags={5}
            />
          </View>

          <View style={styles.guidelines}>
            <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
            <Text style={styles.guidelinesText}>
              • Be respectful and helpful{'\n'}
              • No spam or promotional content{'\n'}
              • Don't share personal information{'\n'}
              • Search existing questions first{'\n'}
              • Use appropriate tags
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
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
  cancelButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  postButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  disclaimer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 60,
  },
  charCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  bodyInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 120,
  },
  guidelines: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
});