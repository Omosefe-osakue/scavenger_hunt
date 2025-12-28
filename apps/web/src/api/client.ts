import type { Hunt, HuntState, PostIt, PostItOption, SubmissionResult } from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let error: any;
    try {
      error = await response.json();
    } catch {
      error = { error: 'Unknown error', message: `HTTP ${response.status}: ${response.statusText}` };
    }
    const errorMessage = error.message || error.error || `HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Health
  health: () => fetchJson<{ ok: boolean }>('/health'),

  // Hunts
  createHunt: (data: { giftedName: string; welcomeMessage: string }) =>
    fetchJson<{ huntId: string; code: string; shareSlug: string; status: string }>('/hunts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  publishHunt: (huntId: string) =>
    fetchJson<{ shareUrl: string; code: string; status: string }>(`/hunts/${huntId}/publish`, {
      method: 'POST',
    }),

  getHunt: (huntId: string) => fetchJson<Hunt>(`/hunts/${huntId}`),

  updateHunt: (huntId: string, data: { giftedName?: string; welcomeMessage?: string }) =>
    fetchJson<Hunt>(`/hunts/${huntId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getHuntByCode: (code: string) =>
    fetchJson<{ huntId: string; shareSlug: string; giftedName: string; welcomeMessage: string; status: string }>(
      `/hunts/by-code/${code}`
    ),

  getHuntBySlug: (shareSlug: string) =>
    fetchJson<{ huntId: string; shareSlug: string; giftedName: string; welcomeMessage: string; status: string }>(
      `/hunts/by-slug/${shareSlug}`
    ),

  // Post-its
  createPostIt: (huntId: string, data: Partial<PostIt>) =>
    fetchJson<PostIt>(`/hunts/${huntId}/post-its`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePostIt: (postItId: string, data: Partial<PostIt>) =>
    fetchJson<PostIt>(`/post-its/${postItId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePostIt: (postItId: string) =>
    fetchJson<{ ok: boolean }>(`/post-its/${postItId}`, {
      method: 'DELETE',
    }),

  createPostItOption: (postItId: string, data: { label: string; value: string; nextPostItId: string }) =>
    fetchJson<PostItOption>(`/post-its/${postItId}/options`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deletePostItOption: (optionId: string) =>
    fetchJson<{ ok: boolean }>(`/post-it-options/${optionId}`, {
      method: 'DELETE',
    }),

  // State
  getHuntState: (huntId: string) => fetchJson<HuntState>(`/hunts/${huntId}/state`),

  // Submissions
  submitPostIt: (
    huntId: string,
    postItId: string,
    data: {
      textAnswer?: string;
      selectedOptionValue?: string;
      photoUrls?: string[];
      wasSkipped?: boolean;
    }
  ) =>
    fetchJson<SubmissionResult>(`/hunts/${huntId}/post-its/${postItId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Uploads
  signUpload: (fileName: string, mimeType: string) =>
    fetchJson<{ uploadUrl: string; fileUrl: string }>('/uploads/sign', {
      method: 'POST',
      body: JSON.stringify({ fileName, mimeType }),
    }),

  // Export
  exportHunt: (huntId: string) => {
    const url = `${API_BASE}/hunts/${huntId}/export`;
    window.open(url, '_blank');
  },
};

