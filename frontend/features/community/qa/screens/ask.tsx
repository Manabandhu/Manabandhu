import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TagSelector } from '@/features/community/qa/components/TagSelector';
import { qaApi } from '@/features/community/qa/api';
import { toast } from '@/lib/toast';
import { COLORS } from '@/shared/constants/colors';
import { XIcon } from '@/shared/components/ui/Icons';

export default function AskQuestionScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (title.trim().length > 255) {
      newErrors.title = 'Title must not exceed 255 characters';
    }

    if (!body.trim()) {
      newErrors.body = 'Question details are required';
    } else if (body.trim().length < 20) {
      newErrors.body = 'Question details must be at least 20 characters';
    }

    if (selectedTags.length === 0) {
      newErrors.tags = 'Please select at least one tag';
    } else if (selectedTags.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await qaApi.createQuestion({
        title: title.trim(),
        body: body.trim(),
        tags: selectedTags,
      });

      router.back();
    } catch (error) {
      // Error is handled by the API service
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title || body || selectedTags.length > 0) {
      toast.showConfirm(
        'Are you sure you want to discard your question?',
        () => router.back(),
        undefined,
        'Discard Question?'
      );
    } else {
      router.back();
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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
            style={[styles.postButton, (isSubmitting || !title || !body || selectedTags.length === 0) && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting || !title || !body || selectedTags.length === 0}
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
              style={[styles.titleInput, errors.title && styles.inputError]}
              placeholder="What's your question? Be specific and clear..."
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                clearError('title');
              }}
              maxLength={255}
              multiline
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            <Text style={styles.charCount}>{title.length}/255</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Question Details *</Text>
            <TextInput
              style={[styles.bodyInput, errors.body && styles.inputError]}
              placeholder="Provide more details about your question. Include relevant context, what you've tried, and what specific help you need..."
              value={body}
              onChangeText={(text) => {
                setBody(text);
                clearError('body');
              }}
              multiline
              textAlignVertical="top"
            />
            {errors.body && <Text style={styles.errorText}>{errors.body}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags * (Required)</Text>
            <TagSelector
              selectedTags={selectedTags}
              onTagsChange={(tags) => {
                setSelectedTags(tags);
                clearError('tags');
              }}
              maxTags={5}
            />
            {errors.tags && <Text style={styles.errorText}>{errors.tags}</Text>}
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
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
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