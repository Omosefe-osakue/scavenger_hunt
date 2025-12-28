export type HuntStatus = 'draft' | 'published' | 'completed';
export type PostItType = 'riddle' | 'photo' | 'mixed' | 'choice';

export interface Hunt {
  id: string;
  code: string;
  shareSlug: string;
  giftedName: string;
  welcomeMessage: string;
  status: HuntStatus;
  createdAt: string;
  publishedAt?: string;
  postIts?: PostIt[];
}

export interface PostIt {
  id: string;
  huntId: string;
  position: number;
  title?: string;
  prompt: string;
  color: string;
  type: PostItType;
  correctAnswer?: string;
  requiresPhoto: boolean;
  allowsSkip: boolean;
  nextPostItId?: string;
  createdAt: string;
  options?: PostItOption[];
}

export interface PostItOption {
  id: string;
  postItId: string;
  label: string;
  value: string;
  nextPostItId: string;
}

export interface HuntState {
  huntId: string;
  giftedName: string;
  welcomeMessage: string;
  status: HuntStatus;
  progress: {
    completedCount: number;
    totalCount: number;
    currentPostItId: string | null;
    completedAt: string | null;
  };
  postIts: Array<{
    id: string;
    position: number;
    title?: string;
    prompt: string;
    color: string;
    type: PostItType;
    correctAnswer?: string;
    requiresPhoto: boolean;
    allowsSkip: boolean;
    options?: PostItOption[];
    locked: boolean;
    completed: boolean;
  }>;
}

export interface SubmissionResult {
  ok: boolean;
  isCorrect?: boolean;
  wasSkipped?: boolean;
  nextPostItId?: string | null;
  huntCompleted?: boolean;
  reason?: 'LOCKED' | 'WRONG_ANSWER' | 'PHOTO_REQUIRED' | 'SKIP_NOT_ALLOWED' | 'INVALID_OPTION';
}

