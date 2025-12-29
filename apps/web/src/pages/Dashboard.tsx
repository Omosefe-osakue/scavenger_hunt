import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { WelcomeModal } from '../components/WelcomeModal';
import { PostItCard } from '../components/PostItCard';
import { PostItModal } from '../components/PostItModal';
import { Toast } from '../components/Toast';
import type { HuntState, PostIt, PostItOption } from '../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { huntId } = useParams<{ huntId: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<HuntState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedPostIt, setSelectedPostIt] = useState<PostIt | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (huntId) {
      loadState();
      checkWelcomeShown();
    }
  }, [huntId]);

  const checkWelcomeShown = () => {
    if (!huntId) return;
    const key = `welcome_shown_${huntId}`;
    const shown = localStorage.getItem(key);
    if (!shown && state) {
      setShowWelcome(true);
      localStorage.setItem(key, 'true');
    }
  };

  const loadState = async () => {
    if (!huntId) return;
    try {
      const data = await api.getHuntState(huntId);
      setState(data);
      if (data.status === 'completed') {
        navigate(`/complete/${huntId}`);
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to load hunt', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state && !showWelcome) {
      checkWelcomeShown();
    }
  }, [state]);

  const handlePostItClick = (postItId: string) => {
    if (!state) return;

    const postIt = state.postIts.find((p) => p.id === postItId);
    if (postIt) {
      // Convert state post-it to full PostIt type
      setSelectedPostIt({
        id: postIt.id,
        huntId: state.huntId,
        position: postIt.position,
        title: postIt.title,
        prompt: postIt.prompt,
        color: postIt.color,
        type: postIt.type,
        correctAnswer: postIt.correctAnswer,
        requiresPhoto: postIt.requiresPhoto,
        allowsSkip: postIt.allowsSkip,
        createdAt: '',
        options: postIt.options,
      } as PostIt);
    }
  };

  const handleSubmit = async (data: {
    textAnswer?: string;
    selectedOptionValue?: string;
    photoUrls?: string[];
    wasSkipped?: boolean;
    bypassCode?: string;
  }) => {
    if (!huntId || !selectedPostIt) return;

    try {
      const result = await api.submitPostIt(huntId, selectedPostIt.id, data);
      if (result.ok) {
        setToast({ message: result.huntCompleted ? 'Hunt completed! 🎉' : 'Great job!', type: 'success' });
        await loadState();
        if (result.huntCompleted) {
          setTimeout(() => navigate(`/complete/${huntId}`), 1500);
        }
        return {code: 'OK'};
      }
      const code = ('code' in result ? (result as any).code : undefined) ?? ('reason' in result ? (result as any).reason : undefined);

      if ('hints' in result && (result as any).hints.length) return { hints: result.hints };
      
      if (code === 'TRY_AGAIN') return { code: 'TRY_AGAIN' };
      if (code === 'TIME_LOCKED') return { code: 'TIME_LOCKED', unlockAt: (result as any).unlockAt ?? null };
      throw new Error(result.message ?? 'Submission failed');
    } catch (err: any) {
      const data = err?.response?.data;

      if (data?.hints?.length) {
        return { hints: data.hints };
      }
      const code = data?.code ?? data?.reason;

      if (code=== 'TRY_AGAIN') {
        return { code: 'TRY_AGAIN' };
      }

      if (code === 'TIME_LOCKED') {
        return { code: 'TIME_LOCKED', unlockAt: data.unlockAt ?? null };
      }
      throw new Error(data?.message ?? 'Submission failed');
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!state) return <div className="container">Hunt not found</div>;

  const currentPostIt = state.postIts.find((p) => p.id === state.progress.currentPostItId);

  return (
    <div className="container">
      {showWelcome && (
        <WelcomeModal
          giftedName={state.giftedName}
          welcomeMessage={state.welcomeMessage}
          onClose={() => setShowWelcome(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="page-header">
        <h1>Your Scavenger Hunt</h1>
        <p>Progress: {state.progress.completedCount} / {state.progress.totalCount}</p>
      </div>

      <div className="postits-grid">
        {state.postIts.map((postIt) => (
          <PostItCard
            key={postIt.id}
            id={postIt.id}
            position={postIt.position + 1}
            title={postIt.title}
            color={postIt.color}
            type={postIt.type}
            locked={postIt.locked}
            completed={postIt.completed}
            onClick={() => handlePostItClick(postIt.id)}
          />
        ))}
      </div>

      {selectedPostIt && (
        <PostItModal
          postIt={selectedPostIt}
          onSubmit={handleSubmit}
          onClose={() => setSelectedPostIt(null)}
        />
      )}
    </div>
  );
};

