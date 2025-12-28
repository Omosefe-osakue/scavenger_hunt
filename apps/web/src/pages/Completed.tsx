import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { HuntState } from '../types';
import './Completed.css';

export const Completed: React.FC = () => {
  const { huntId } = useParams<{ huntId: string }>();
  const [state, setState] = useState<HuntState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (huntId) {
      loadState();
    }
  }, [huntId]);

  const loadState = async () => {
    if (!huntId) return;
    try {
      const data = await api.getHuntState(huntId);
      setState(data);
    } catch (err) {
      console.error('Failed to load state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (huntId) {
      api.exportHunt(huntId);
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!state) return <div className="container">Hunt not found</div>;

  return (
    <div className="container">
      <div className="completed-header">
        <h1>🎉 Congratulations! 🎉</h1>
        <p>You've completed the scavenger hunt, {state.giftedName}!</p>
      </div>

      <div className="completed-actions">
        <button className="btn-primary" onClick={handleExport}>
          Download Memory Book
        </button>
      </div>

      <div className="completion-stats">
        <p>You completed {state.progress.completedCount} out of {state.progress.totalCount} post-its!</p>
      </div>
    </div>
  );
};

