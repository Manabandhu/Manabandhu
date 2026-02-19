export interface Question {
  id: string;
  authorUserId: string;
  authorName?: string;
  title: string;
  body: string;
  tags: string[];
  status: 'OPEN' | 'ANSWERED' | 'CLOSED';
  viewsCount: number;
  answersCount: number;
  acceptedAnswerId?: string;
  createdAt: string;
  updatedAt: string;
  isAuthor?: boolean;
}

export interface Answer {
  id: string;
  questionId: string;
  authorUserId: string;
  authorName?: string;
  body: string;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  isAuthor?: boolean;
  userVote?: 'UPVOTE' | 'DOWNVOTE' | null;
}

export interface Tag {
  id: string;
  name: string;
  category: 'IMMIGRATION' | 'INSURANCE' | 'HOUSING' | 'TRAVEL' | 'TAX' | 'GENERAL';
  isSystemTag: boolean;
}

export interface QuestionRequest {
  title: string;
  body: string;
  tags: string[];
}

export interface AnswerRequest {
  body: string;
}

export interface VoteRequest {
  targetType: 'QUESTION' | 'ANSWER';
  targetId: string;
  voteType: 'UPVOTE' | 'DOWNVOTE';
}

export interface ReportRequest {
  contentType: 'QUESTION' | 'ANSWER';
  contentId: string;
  reason: 'SPAM' | 'MISINFORMATION' | 'HARASSMENT';
}

export interface QuestionsFilter {
  search?: string;
  tags?: string[];
  status?: 'OPEN' | 'ANSWERED' | 'CLOSED';
  sortBy?: 'RECENT' | 'VIEWS';
  page?: number;
  size?: number;
}