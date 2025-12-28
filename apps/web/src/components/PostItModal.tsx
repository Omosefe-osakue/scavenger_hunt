import React, { useState, useEffect } from 'react';
import { PhotoPicker } from './PhotoPicker';
import { OptionPicker } from './OptionPicker';
import type { PostIt, PostItOption } from '../types';
import './PostItModal.css';

interface PostItModalProps {
  postIt: PostIt & { options?: PostItOption[] };
  onSubmit: (data: {
    textAnswer?: string;
    selectedOptionValue?: string;
    photoUrls?: string[];
    wasSkipped?: boolean;
  }) => Promise<void>;
  onClose: () => void;
  disabled?: boolean;
}

export const PostItModal: React.FC<PostItModalProps> = ({
  postIt,
  onSubmit,
  onClose,
  disabled = false,
}) => {
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | undefined>();
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (postIt.type === 'choice' && postIt.options && postIt.options.length > 0) {
      setSelectedOption(undefined);
    }
  }, [postIt.id]);

  const handleSubmit = async (wasSkipped = false) => {
    setError(null);

    if (wasSkipped && !postIt.allowsSkip) {
      setError('Skipping is not allowed for this post-it');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        textAnswer: textAnswer.trim() || undefined,
        selectedOptionValue: selectedOption,
        photoUrls: photos.length > 0 ? photos : undefined,
        wasSkipped,
      });
      onClose();
    } catch (err: any) {
      const reason = err.message || 'Unknown error';
      if (reason === 'WRONG_ANSWER') {
        setError('Incorrect answer. Please try again!');
      } else if (reason === 'PHOTO_REQUIRED') {
        setError('A photo is required for this post-it');
      } else if (reason === 'SKIP_NOT_ALLOWED') {
        setError('Skipping is not allowed for this post-it');
      } else if (reason === 'INVALID_OPTION') {
        setError('Please select a valid option');
      } else {
        setError(reason);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const colorClass = `postit-${postIt.color}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content postit-modal ${colorClass}`} onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} disabled={submitting}>
          ×
        </button>

        <div className="postit-header">
          {postIt.title && <h2>{postIt.title}</h2>}
          <div className="postit-prompt">{postIt.prompt}</div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {postIt.type === 'choice' && postIt.options && (
          <OptionPicker
            options={postIt.options}
            selectedValue={selectedOption}
            onSelect={setSelectedOption}
            disabled={disabled || submitting}
          />
        )}

        {(postIt.type === 'riddle' || postIt.type === 'mixed') && (
          <div className="answer-input">
            <label>Your Answer:</label>
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              disabled={disabled || submitting}
            />
          </div>
        )}

        {(postIt.requiresPhoto || postIt.type === 'photo' || postIt.type === 'mixed') && (
          <PhotoPicker
            photos={photos}
            onPhotosChange={setPhotos}
            disabled={disabled || submitting}
          />
        )}

        <div className="modal-actions">
          {postIt.allowsSkip && (
            <button
              className="btn-secondary"
              onClick={() => handleSubmit(true)}
              disabled={disabled || submitting}
            >
              Skip
            </button>
          )}
          <button
            className="btn-primary"
            onClick={() => handleSubmit(false)}
            disabled={disabled || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

