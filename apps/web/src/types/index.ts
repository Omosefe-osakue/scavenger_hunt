export type HuntStatus = 'draft' | 'published' | 'completed';
export type PostItType = 'text' | 'photo' | 'choice';

export interface Option {
  id: string;
  value: string;
  label: string;
  isCorrect?: boolean;
  nextPostItId?: string;
}

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
  type: PostItType;
  color: string;
  answer?: string;
  options?: PostItOption[];
  correctAnswer?: string | string[];
  hints?: string[];
  photoMin?: number;
  photoMax?: number;
  allowsSkip?: boolean;
  requiresPhoto?: boolean;
  isComplete?: boolean;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PostItOption = Option;

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

