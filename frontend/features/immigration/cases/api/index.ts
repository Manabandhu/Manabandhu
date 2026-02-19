import { API_BASE_URL } from '@/shared/constants/api';
import { getAuthToken } from '@/lib/firebase';

export interface UscisCase {
  id: string;
  receiptNumber: string;
  formType: 'I129' | 'I130' | 'I140' | 'I485' | 'I765' | 'I539' | 'I131' | 'OTHER';
  serviceCenter: 'SRC' | 'LIN' | 'WAC' | 'EAC' | 'IOE' | 'NBC' | 'OTHER';
  caseStatus: string;
  caseStatusCode: string;
  statusDescription: string;
  lastStatusDate: string;
  receivedDate?: string;
  lastCheckedAt: string;
  createdAt: string;
  daysPending?: number;
}

export interface TimelineEntry {
  id: string;
  statusTitle: string;
  statusDescription: string;
  statusDate: string;
  createdAt: string;
}

export interface AddCaseRequest {
  receiptNumber: string;
}

class UscisApiService {
  private async getHeaders() {
    const token = await getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async addCase(request: AddCaseRequest): Promise<UscisCase> {
    const response = await fetch(`${API_BASE_URL}/api/uscis/cases`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to add case');
    }

    return response.json();
  }

  async getUserCases(): Promise<UscisCase[]> {
    const response = await fetch(`${API_BASE_URL}/api/uscis/cases`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cases');
    }

    return response.json();
  }

  async getCaseDetails(caseId: string): Promise<UscisCase> {
    const response = await fetch(`${API_BASE_URL}/api/uscis/cases/${caseId}`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch case details');
    }

    return response.json();
  }

  async removeCase(caseId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/uscis/cases/${caseId}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to remove case');
    }
  }

  async refreshCase(caseId: string): Promise<UscisCase> {
    const response = await fetch(`${API_BASE_URL}/api/uscis/cases/${caseId}/refresh`, {
      method: 'POST',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh case');
    }

    return response.json();
  }

  async getCaseTimeline(caseId: string): Promise<TimelineEntry[]> {
    const response = await fetch(`${API_BASE_URL}/api/uscis/cases/${caseId}/timeline`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch case timeline');
    }

    return response.json();
  }
}

export const uscisApi = new UscisApiService();