import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Answer } from '@/shared/types/qa';
import { COLORS, colors } from '@/shared/constants/colors';
import { qaApi } from '@/features/community/qa/api';
import { toast } from '@/lib/toast';

interface AnswerCardProps {
  answer: Answer;
  canAccept?: boolean;
  onVote?: () => void;
  onAccept?: () => void;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({ 
  answer, 
  canAccept, 
  onVote, 
  onAccept
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const handleVote = async (voteType: 'UPVOTE' | 'DOWNVOTE') => {
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      await qaApi.vote({
        targetType: 'ANSWER',
        targetId: answer.id,
        voteType,
      });
      onVote?.();
    } catch (error) {
      // Error is handled by the API service
    } finally {
      setIsVoting(false);
    }
  };

  const handleAccept = async () => {
    if (isAccepting) return;
    
    setIsAccepting(true);
    try {
      await qaApi.acceptAnswer(answer.id);
      onAccept?.();
    } catch (error) {
      // Error is handled by the API service
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReport = () => {
    if (isReporting) return;
    
    toast.showConfirm(
      'Why are you reporting this answer?',
      () => {},
      undefined,
      'Report Answer'
    );
    
    // Show options
    const options = [
      { text: 'Cancel', style: 'cancel' as const },
      { text: 'Spam', onPress: () => reportContent('SPAM') },
      { text: 'Misinformation', onPress: () => reportContent('MISINFORMATION') },
      { text: 'Harassment', onPress: () => reportContent('HARASSMENT') },
    ];
    
    // This would be better implemented with a custom modal
    // For now, using the existing Alert pattern
  };

  const reportContent = async (reason: 'SPAM' | 'MISINFORMATION' | 'HARASSMENT') => {
    if (isReporting) return;
    
    setIsReporting(true);
    try {
      await qaApi.reportContent({
        contentType: 'ANSWER',
        contentId: answer.id,
        reason,
      });
    } catch (error) {
      // Error is handled by the API service
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <View style={[styles.container, answer.isAccepted && styles.acceptedContainer]}>
      {answer.isAccepted && (
        <View style={styles.acceptedBadge}>
          <Text style={styles.acceptedText}>✓ Accepted Answer</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={styles.author}>{answer.authorName || 'Anonymous'}</Text>
        <Text style={styles.timestamp}>
          {new Date(answer.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.body}>{answer.body}</Text>
      
      <View style={styles.footer}>
        <View style={styles.votes}>
          <TouchableOpacity
            style={[styles.voteButton, answer.userVote === 'UPVOTE' && styles.activeUpvote]}
            onPress={() => handleVote('UPVOTE')}
            disabled={isVoting}
          >
            <Text style={[styles.voteText, answer.userVote === 'UPVOTE' && styles.activeVoteText]}>
              ↑ {answer.upvotes}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.voteButton, answer.userVote === 'DOWNVOTE' && styles.activeDownvote]}
            onPress={() => handleVote('DOWNVOTE')}
            disabled={isVoting}
          >
            <Text style={[styles.voteText, answer.userVote === 'DOWNVOTE' && styles.activeVoteText]}>
              ↓ {answer.downvotes}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actions}>
          {canAccept && !answer.isAccepted && (
            <TouchableOpacity 
              style={[styles.acceptButton, isAccepting && styles.disabledButton]} 
              onPress={handleAccept}
              disabled={isAccepting}
            >
              <Text style={styles.acceptButtonText}>
                {isAccepting ? 'Accepting...' : 'Accept'}
              </Text>
            </TouchableOpacity>
          )}
          
          {!answer.isAuthor && (
            <TouchableOpacity 
              style={[styles.reportButton, isReporting && styles.disabledButton]} 
              onPress={handleReport}
              disabled={isReporting}
            >
              <Text style={styles.reportButtonText}>
                {isReporting ? 'Reporting...' : 'Report'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Community responses are not legal advice.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  acceptedContainer: {
    borderLeftColor: colors.success[500],
    backgroundColor: '#F0FDF4',
  },
  acceptedBadge: {
    backgroundColor: colors.success[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  acceptedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  body: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  votes: {
    flexDirection: 'row',
  },
  voteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  activeUpvote: {
    backgroundColor: colors.success[100],
  },
  activeDownvote: {
    backgroundColor: colors.error[100],
  },
  voteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeVoteText: {
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: colors.success[500],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  reportButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reportButtonText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disclaimer: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#92400E',
    textAlign: 'center',
  },
});