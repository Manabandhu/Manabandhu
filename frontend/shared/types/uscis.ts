export interface UscisCase {
  id: string;
  receiptNumber: string;
  formType: FormType;
  serviceCenter: ServiceCenter;
  caseStatus: string;
  caseStatusCode: CaseStatusCode;
  statusDescription: string;
  lastStatusDate: string;
  receivedDate?: string;
  lastCheckedAt: string;
  createdAt: string;
  daysPending?: number;
}

export type FormType = 'I129' | 'I130' | 'I140' | 'I485' | 'I765' | 'I539' | 'I131' | 'OTHER';

export type ServiceCenter = 'SRC' | 'LIN' | 'WAC' | 'EAC' | 'IOE' | 'NBC' | 'OTHER';

export type CaseStatusCode = 
  | 'RECEIVED'
  | 'INITIAL_REVIEW'
  | 'RFE_SENT'
  | 'RFE_RESPONSE_RECEIVED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_COMPLETED'
  | 'DECISION_PENDING'
  | 'APPROVED'
  | 'DENIED'
  | 'CARD_PRODUCED'
  | 'CARD_MAILED'
  | 'CASE_CLOSED'
  | 'TRANSFERRED'
  | 'REOPENED'
  | 'OTHER';

export interface TimelineEntry {
  id: string;
  statusTitle: string;
  statusDescription: string;
  statusDate: string;
  createdAt: string;
}

export const FORM_TYPE_LABELS: Record<FormType, string> = {
  I129: 'I-129 (Nonimmigrant Worker)',
  I130: 'I-130 (Family-based)',
  I140: 'I-140 (Employment-based)',
  I485: 'I-485 (Adjust Status)',
  I765: 'I-765 (Work Authorization)',
  I539: 'I-539 (Change/Extend Status)',
  I131: 'I-131 (Travel Document)',
  OTHER: 'Other Form'
};

export const STATUS_COLORS: Record<string, string> = {
  RECEIVED: '#6B7280',
  INITIAL_REVIEW: '#3B82F6',
  RFE_SENT: '#F59E0B',
  RFE_RESPONSE_RECEIVED: '#3B82F6',
  INTERVIEW_SCHEDULED: '#8B5CF6',
  INTERVIEW_COMPLETED: '#8B5CF6',
  DECISION_PENDING: '#F59E0B',
  APPROVED: '#10B981',
  DENIED: '#EF4444',
  CARD_PRODUCED: '#10B981',
  CARD_MAILED: '#10B981',
  CASE_CLOSED: '#6B7280',
  TRANSFERRED: '#F59E0B',
  REOPENED: '#3B82F6',
  OTHER: '#6B7280'
};