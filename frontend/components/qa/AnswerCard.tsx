import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Answer } from '@/types/qa';
import { COLORS, colors } from '@/constants/colors';
import { qaApi } from '@/lib/api/qa';

interface AnswerCardProps {
  answer: Answer;
  canAccept?: boolean;
  onVote?: () => void;
  onAccept?: () => void;
  userToken?: string;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({ 
  answer, 
  canAccept, 
  onVote, 
  onAccept,
  userToken 
}) => {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType: 'UPVOTE' | 'DOWNVOTE') => {
    if (!userToken || isVoting) return;
    
    setIsVoting(true);
    try {
      await qaApi.vote({
        targetType: 'ANSWER',
        targetId: answer.id,
        voteType,
      }, userToken);
      onVote?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleAccept = async () => {
    if (!userToken) return;
    
    try {
      await qaApi.acceptAnswer(answer.id, userToken);
      onAccept?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept answer');
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Report Answer',
      'Why are you reporting this answer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Spam', onPress: () => reportContent('SPAM') },
        { text: 'Misinformation', onPress: () => reportContent('MISINFORMATION') },
        { text: 'Harassment', onPress: () => reportContent('HARASSMENT') },
      ]
    );
  };

  const reportContent = async (reason: 'SPAM' | 'MISINFORMATION' | 'HARASSMENT') => {
    if (!userToken) return;
    
    try {
      await qaApi.reportContent({
        contentType: 'ANSWER',
        contentId: answer.id,
        reason,
      }, userToken);
      Alert.alert('Success', 'Answer reported successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to report answer');
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
            disabled={isVoting || !userToken}
          >
            <Text style={[styles.voteText, answer.userVote === 'UPVOTE' && styles.activeVoteText]}>
              ↑ {answer.upvotes}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.voteButton, answer.userVote === 'DOWNVOTE' && styles.activeDownvote]}
            onPress={() => handleVote('DOWNVOTE')}
            disabled={isVoting || !userToken}
          >
            <Text style={[styles.voteText, answer.userVote === 'DOWNVOTE' && styles.activeVoteText]}>
              ↓ {answer.downvotes}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actions}>
          {canAccept && !answer.isAccepted && (
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          )}
          
          {!answer.isAuthor && (
            <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
              <Text style={styles.reportButtonText}>Report</Text>
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