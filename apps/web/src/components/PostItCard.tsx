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
  onClick: () => void;
}

export const PostItCard: React.FC<PostItCardProps> = ({
  position,
  title,
  color,
  locked,
  completed,
  onClick,
}) => {
  const colorClass = `postit-${color}`;
  
  return (
    <div
      className={`postit-card ${colorClass} ${locked ? 'locked' : ''} ${completed ? 'completed' : ''}`}
      onClick={locked ? undefined : onClick}
    >
      {locked && (
        <div className="lock-overlay">
          <span className="lock-icon">🔒</span>
        </div>
      )}
      {completed && (
        <div className="check-overlay">
          <span className="check-icon">✓</span>
        </div>
      )}
      <div className="postit-number">#{position}</div>
      {title && <div className="postit-title">{title}</div>}
    </div>
  );
};

