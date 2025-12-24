export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: SourceType;
  publishedAt: string;
  visaCategories: string[];
  countriesAffected: string[];
  tags: string[];
  impactLevel: ImpactLevel;
  isBreaking: boolean;
  isVerified: boolean;
  verificationNotes?: string;
  createdAt: string;
  isBookmarked: boolean;
}

export type SourceType = 'OFFICIAL' | 'LAW_FIRM' | 'NEWS_MEDIA';
export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface NewsFilters {
  visaCategory?: string;
  country?: string;
  impactLevel?: string;
  sourceType?: string;
  isBreaking?: boolean;
  page?: number;
  size?: number;
}

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  OFFICIAL: 'Official',
  LAW_FIRM: 'Law Firm',
  NEWS_MEDIA: 'News Media'
};

export const IMPACT_LEVEL_COLORS: Record<ImpactLevel, string> = {
  LOW: '#6B7280',
  MEDIUM: '#3B82F6',
  HIGH: '#F59E0B',
  CRITICAL: '#EF4444'
};

export const IMPACT_LEVEL_LABELS: Record<ImpactLevel, string> = {
  LOW: 'Low Impact',
  MEDIUM: 'Medium Impact',
  HIGH: 'High Impact',
  CRITICAL: 'Critical'
};

export const VISA_CATEGORIES = [
  'H1B', 'F1', 'OPT', 'STEM', 'H4', 'L1', 'B1', 'B2', 'Green Card', 'I140', 'I485'
];

export const COUNTRIES = [
  'India', 'China', 'Mexico', 'Philippines', 'Vietnam', 'South Korea', 'Canada', 'UK', 'Germany', 'France'
];