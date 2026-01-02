export type PostItType = 'text' | 'choice' | 'photo' | 'location' | 'qr';

export interface PostItOption {
  id: string;
  value: string;
  label: string;
}

export interface PostIt {
  id: string;
  position: number;
  title?: string;
  prompt: string;
  type: PostItType;
  color: string;
  hints?: string[];
  options?: PostItOption[];
  correctAnswer?: string;
  requiresPhoto?: boolean;
  allowsSkip?: boolean;
  photoMin?: number;
  photoMax?: number;
  completed?: boolean;
  locked?: boolean;
  failedAttempts?: number;
  unlockAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Hunt {
  id: string;
  title: string;
  description?: string;
  postIts: PostIt[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  startDate?: string;
  endDate?: string;
  isPublic: boolean;
  shareSlug?: string;
  userId: string;
}

export interface HuntState {
  hunt: Hunt;
  currentPostItIndex: number;
  completedPostIts: string[];
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
  score?: number;
  totalPossibleScore?: number;
}
