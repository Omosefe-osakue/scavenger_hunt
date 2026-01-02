import React, { useState, useEffect, useCallback } from 'react';
import { PhotoPicker } from './PhotoPicker';
import { OptionPicker } from './OptionPicker';
import type { PostIt, PostItOption, PostItType } from '../types';
import './PostItModal.css';
import * as FiIcons from 'react-icons/fi';

type ExtendedPostIt = PostIt & {
  options?: PostItOption[];
  hints?: string[];
  photoMin?: number;
  photoMax?: number;
  allowsSkip?: boolean;
  requiresPhoto?: boolean;
  type: PostItType;
};

interface PostItModalProps {
  postIt: ExtendedPostIt;
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
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (postIt.type === 'choice' && postIt.options && postIt.options.length > 0) {
      setSelectedOption(undefined);
    }
  }, [postIt.id, postIt.type, postIt.options]);

  const handleSubmit = useCallback(async (wasSkipped = false) => {
    if (isSubmitting) return;

    setError(null);
    setShowHint(false);

    if (wasSkipped && !postIt.allowsSkip) {
      setError('Skipping is not allowed for this post-it');
      return;
    }

    // Basic validation
    if (!wasSkipped) {
      if (postIt.requiresPhoto && photos.length === 0) {
        setError('Please upload at least one photo');
        return;
      }

      if (postIt.type === 'text' && !textAnswer.trim()) {
        setError('Please enter your answer');
        return;
      }

      if (postIt.type === 'choice' && !selectedOption) {
        setError('Please select an option');
        return;
      }

      if (postIt.photoMin && photos.length < postIt.photoMin) {
        setError(`Please upload at least ${postIt.photoMin} photo${postIt.photoMin !== 1 ? 's' : ''}`);
        return;
      }

      if (postIt.photoMax && photos.length > postIt.photoMax) {
        setError(`Maximum ${postIt.photoMax} photo${postIt.photoMax !== 1 ? 's' : ''} allowed`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        textAnswer: textAnswer.trim() || undefined,
        selectedOptionValue: selectedOption,
        photoUrls: photos.length > 0 ? photos : undefined,
        wasSkipped,
      });
      setAttempts(0);
    } catch (err: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (postIt.hints && postIt.hints.length > 0 && newAttempts > 0) {
        setShowHint(true);
      }

      setError(err.message || 'Incorrect answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, postIt, photos, textAnswer, selectedOption, attempts, onSubmit]);

  // Get current hint based on number of attempts
  const getCurrentHint = useCallback(() => {
    if (!postIt.hints || postIt.hints.length === 0) return null;

    // Show first hint after 1 failed attempt, second after 2, etc.
    const hintIndex = Math.min(attempts - 1, postIt.hints.length - 1);
    return hintIndex >= 0 ? postIt.hints[hintIndex] : null;
  }, [postIt.hints, attempts]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">
            {postIt.title || `Challenge #${postIt.position + 1}`}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <FiIcons.FiX size={24} />
          </button>
        </div>

        <div className="modal-content">
          <div className="challenge-prompt">
            <p>{postIt.prompt}</p>
          </div>

          {showHint && getCurrentHint() && (
            <div className={`hint-container hint-attempt-${Math.min(attempts, postIt.hints?.length || 0)}`}>
              <div className="hint-header">
                <FiIcons.FiAlertTriangle className="hint-icon" />
                <span>Hint {Math.min(attempts, postIt.hints?.length || 0)}/{postIt.hints?.length || 0}</span>
              </div>
              <div className="hint-content">
                {getCurrentHint()}
              </div>
            </div>
          )}

          {error && (
            <div className="error-banner">
              <FiIcons.FiAlertTriangle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          {postIt.type === 'text' && (
            <div className="form-group">
              <label htmlFor="answer">Your Answer</label>
              <input
                id="answer"
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                disabled={disabled || isSubmitting}
                placeholder="Type your answer here..."
                className={error && !textAnswer.trim() ? 'error' : ''}
              />
            </div>
          )}

          {postIt.type === 'choice' && postIt.options && (
            <div className="form-group">
              <label className="form-label">Select an option</label>
              <OptionPicker
                options={postIt.options}
                selectedValue={selectedOption}
                onSelect={setSelectedOption}
                disabled={disabled || isSubmitting}
              />
            </div>
          )}

          {(postIt.type === 'photo' || postIt.requiresPhoto) && (
            <div className="form-group">
              <label className="form-label">
                {postIt.type === 'photo' ? 'Upload Photos' : 'Additional Photos'}
                {postIt.photoMin && (
                  <span className="photo-requirement">
                    (Min: {postIt.photoMin} {postIt.photoMax ? `- Max: ${postIt.photoMax}` : '+'})
                  </span>
                )}
              </label>
              <PhotoPicker
                photos={photos}
                onPhotosChange={setPhotos}
                disabled={disabled || isSubmitting}
                maxPhotos={postIt.photoMax || 1}
                minPhotos={postIt.photoMin || 0}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="attempts-counter">
            {attempts > 0 && (
              <span className="attempts-text">
                Attempts: <strong>{attempts}</strong>
              </span>
            )}
          </div>

          <div className="action-buttons">
            {postIt.allowsSkip && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting || disabled}
              >
                <FiIcons.FiSkipForward className="btn-icon" />
                Skip
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSubmit()}
              disabled={isSubmitting || disabled}
            >
              {isSubmitting ? (
                <>
                  <FiIcons.FiLoader className="btn-icon spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FiIcons.FiCheck className="btn-icon" />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
