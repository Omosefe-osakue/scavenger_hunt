import React from 'react';
import type { PostItType } from '../types';
import './PostItCard.css';

interface PostItCardProps {
  id: string;
  position: number;
  title?: string;
  color: string;
  type: PostItType;
  locked: boolean;
  completed: boolean;
  failedAttempts?: number;
  hints?: string[];
  onClick: () => void;
}

export const PostItCard: React.FC<PostItCardProps> = ({
  position,
  title,
  color,
  type,
  locked,
  completed,
  failedAttempts = 0,
  hints = [],
  onClick,
}) => {
  const colorClass = `postit-${color}`;
  const showHint = failedAttempts > 0 && hints.length > 0 && !completed;
  const hintToShow = hints[Math.min(failedAttempts - 1, hints.length - 1)];
  
  return (
    <div className="postit-container">
      <div
        className={`postit-card ${colorClass} ${locked ? 'locked' : ''} ${
          completed ? 'completed' : ''
        } ${showHint ? 'has-hint' : ''}`}
        onClick={!locked && !completed ? onClick : undefined}
      >
        {locked && !completed && (
          <div className="postit-overlay lock-overlay">
            <span className="postit-icon">🔒</span>
          </div>
        )}
        {completed && (
          <div className="postit-overlay check-overlay">
            <span className="postit-icon">✓</span>
          </div>
        )}
        <div className="postit-header">
          <span className="postit-number">#{position}</span>
          <span className="postit-type">{type}</span>
        </div>
        {title && <div className="postit-title">{title}</div>}
        
        {showHint && (
          <div className="postit-hint">
            <div className="hint-indicator">
              <span className="hint-icon">💡</span>
              <span className="hint-text">Hint: {hintToShow}</span>
            </div>
          </div>
        )}
        
        {failedAttempts > 0 && !completed && (
          <div className="attempts-indicator">
            {Array(failedAttempts).fill(0).map((_, i) => (
              <span key={i} className="attempt-dot" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

