import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Hunt, PostIt } from '../types';
import './Builder.css';

export const Builder: React.FC = () => {
  const { huntId } = useParams<{ huntId: string }>();
  const navigate = useNavigate();
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPostIt, setEditingPostIt] = useState<PostIt | null>(null);
  const [showPostItForm, setShowPostItForm] = useState(false);

  useEffect(() => {
    if (huntId) {
      loadHunt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [huntId]);

  const loadHunt = async () => {
    if (!huntId) return;
    try {
      const data = await api.getHunt(huntId);
      setHunt(data);
      // Ensure hunt is tracked in localStorage for dashboard
      const stored = localStorage.getItem('scaven_hunt_ids');
      const huntIds = stored ? JSON.parse(stored) : [];
      if (!huntIds.includes(huntId)) {
        huntIds.push(huntId);
        localStorage.setItem('scaven_hunt_ids', JSON.stringify(huntIds));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load hunt');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePostIt = async (data: Partial<PostIt>) => {
    if (!huntId) return;
    try {
      await api.createPostIt(huntId, {
        ...data,
        position: hunt?.postIts?.length || 0,
      } as Partial<PostIt>);
      await loadHunt();
      setShowPostItForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create post-it');
    }
  };

  const handleUpdatePostIt = async (postItId: string, data: Partial<PostIt>) => {
    try {
      await api.updatePostIt(postItId, data);
      await loadHunt();
      setEditingPostIt(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update post-it');
    }
  };

  const handleDeletePostIt = async (postItId: string) => {
    if (!confirm('Are you sure you want to delete this post-it?')) return;
    try {
      await api.deletePostIt(postItId);
      await loadHunt();
    } catch (err: any) {
      alert(err.message || 'Failed to delete post-it');
    }
  };

  const handlePublish = async () => {
    if (!huntId) return;
    if (!hunt?.postIts || hunt.postIts.length === 0) {
      alert('Please add at least one post-it before publishing');
      return;
    }
    try {
      await api.publishHunt(huntId);
      navigate(`/share/${huntId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to publish hunt');
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;
  if (!hunt) return <div className="container">Hunt not found</div>;

  return (
    <div className="container">
      <div className="page-header">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '10px',
          }}
        >
          <div>
            <h1>Build Your Hunt</h1>
            <p>For: {hunt.giftedName}</p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => navigate('/dashboard')}
            style={{ fontSize: '0.9em', padding: '8px 16px' }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="builder-actions">
        <button className="btn-primary" onClick={() => setShowPostItForm(true)}>
          + Add Post-it
        </button>
        <button
          className="btn-secondary"
          onClick={handlePublish}
          disabled={!hunt.postIts || hunt.postIts.length === 0}
        >
          Publish Hunt
        </button>
      </div>

      {showPostItForm && (
        <PostItForm onSave={(data) => handleCreatePostIt(data)} onCancel={() => setShowPostItForm(false)} />
      )}

      {editingPostIt && (
        <PostItForm
          postIt={editingPostIt}
          onSave={(data) => handleUpdatePostIt(editingPostIt.id, data)}
          onCancel={() => setEditingPostIt(null)}
        />
      )}

      <div className="postits-grid">
        {hunt.postIts?.map((postIt) => (
          <div key={postIt.id} className="postit-builder-card">
            <div className={`postit-preview postit-${postIt.color}`}>
              <div className="postit-number">#{postIt.position + 1}</div>
              {postIt.title && <div className="postit-title">{postIt.title}</div>}
              <div className="postit-prompt">{postIt.prompt}</div>
            </div>
            <div className="postit-actions">
              <button className="btn-secondary" onClick={() => setEditingPostIt(postIt)}>
                Edit
              </button>
              <button className="btn-secondary" onClick={() => handleDeletePostIt(postIt.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PostItFormProps {
  postIt?: PostIt;
  onSave: (data: Partial<PostIt>) => void;
  onCancel: () => void;
}

const PostItForm: React.FC<PostItFormProps> = ({ postIt, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<PostIt>>({
    title: postIt?.title || '',
    prompt: postIt?.prompt || '',
    color: postIt?.color || 'yellow',
    type: postIt?.type || 'riddle',
    correctAnswer: postIt?.correctAnswer || '',

    requiresPhoto: postIt?.requiresPhoto || false,

    allowsSkip: postIt?.allowsSkip || false,
    hints: postIt?.hints || ['', '', ''],
    unlockAt: postIt?.unlockAt || null,
    photoRule: postIt?.photoRule ?? (postIt?.requiresPhoto ? 'required' : 'none'),
    photoMin: postIt?.photoMin ?? 1,
    photoMax: (postIt as any)?.photoMax ?? 3,
  });

  const handleUnlockAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setFormData((prev) => ({ ...prev, unlockAt: v ? new Date(v).toISOString() : null }));
  };

  const updateHint = (index: number, value: string) => {
    setFormData((prev) => {
      const prevHints = Array.isArray((prev as any).hints) ? ((prev as any).hints as string[]) : ['', '', ''];
      const nextHints = [...prevHints];
      nextHints[index] = value;
      return { ...prev, hints: nextHints };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rawHints = Array.isArray(formData.hints) ? ((formData as any).hints as string[]) : [];
    const cleanedHints = rawHints.map((h) => h.trim()).filter(Boolean);

    const rule = (formData as any).photoRule ?? 'none';
    const requiresPhoto = rule === 'required' || formData.type === 'photo';

    onSave({
      ...formData,
      hints: cleanedHints,
      requiresPhoto,
      photoRule: rule,
      photoMin: rule === 'required' || formData.type === 'photo' ? Number((formData as any).photoMin ?? 1) : undefined,
      photoMax: rule === 'none' ? 0 : Number((formData as any).photoMax ?? 3),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="postit-form">
      <h3>{postIt ? 'Edit Post-it' : 'New Post-it'}</h3>

      <div className="form-group">
        <label>Title (optional):</label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Prompt:</label>
        <textarea
          value={formData.prompt || ''}
          onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
          required
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Color:</label>
        <select value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })}>
          <option value="yellow">Yellow</option>
          <option value="red">Red</option>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="pink">Pink</option>
          <option value="orange">Orange</option>
          <option value="purple">Purple</option>
        </select>
      </div>

      <div className="form-group">
        <label>Type:</label>
        <select
          value={formData.type}
          onChange={(e) => {
            const nextType = e.target.value as PostIt['type'];
            setFormData((prev) => {
              // if type is photo, force required photo rule
              if (nextType === 'photo') {
                return {
                  ...prev,
                  type: nextType,
                  photoRule: 'required',
                  requiresPhoto: true,
                  photoMin: prev.photoMin ?? 1,
                  photoMax: (prev as any).photoMax ?? 3,
                };
              }
              return { ...prev, type: nextType };
            });
          }}
        >
          <option value="riddle">Riddle (text answer)</option>
          <option value="photo">Photo (photo required)</option>
          <option value="mixed">Mixed (text + photo)</option>
          <option value="choice">Choice (branching)</option>
        </select>
      </div>

      {(formData.type === 'riddle' || formData.type === 'mixed') && (
        <>
          <div className="form-group">
            <label>Correct Answer:</label>
            <input
              type="text"
              value={formData.correctAnswer || ''}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Hints (up to 3):</label>
            <input
              type="text"
              value={Array.isArray(formData.hints) ? formData.hints[0] || '' : ''}
              onChange={(e) => updateHint(0, e.target.value)}
              placeholder="Hint 1 (shown after 1st wrong attempt)"
            />
            <input
              type="text"
              value={Array.isArray(formData.hints) ? formData.hints[1] || '' : ''}
              onChange={(e) => updateHint(1, e.target.value)}
              placeholder="Hint 2 (shown after 2nd wrong attempt)"
            />
            <input
              type="text"
              value={Array.isArray(formData.hints) ? formData.hints[2] || '' : ''}
              onChange={(e) => updateHint(2, e.target.value)}
              placeholder="Hint 3 (shown after 3rd wrong attempt)"
            />

            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
              Tip: leave blank if you don’t want hints.
            </div>
          </div>

          <div className="form-group">
            <label>Unlock at (optional):</label>
            <input
              type="datetime-local"
              value={formData.unlockAt ? new Date(formData.unlockAt).toISOString().slice(0, 16) : ''}
              onChange={handleUnlockAtChange}
            />
          </div>
        </>
      )}

      <div className="form-group">
        <label>Photo requirement:</label>

        <select
          value={((formData as any).photoRule ?? 'none') as any}
          onChange={(e) => {
            const nextRule = e.target.value as any;

            setFormData((prev) => ({
              ...prev,
              photoRule: nextRule,
              requiresPhoto: nextRule === 'required',
              photoMin: nextRule === 'required' ? Number((prev as any).photoMin ?? 1) : (prev as any).photoMin,
              photoMax: nextRule === 'none' ? 0 : Number((prev as any).photoMax ?? 3),
            }));
          }}
          disabled={formData.type === 'photo'} // type photo forces required
        >
          <option value="none">No photo</option>
          <option value="optional">Optional photo</option>
          <option value="required">Required photo</option>
        </select>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            type="number"
            min={1}
            max={5}
            value={Number((formData as any).photoMin ?? 1)}
            disabled={((formData as any).photoRule ?? 'none') !== 'required' && formData.type !== 'photo'}
            onChange={(e) => setFormData((prev) => ({ ...prev, photoMin: Number(e.target.value) }))}
            placeholder="Min photos"
          />

          <input
            type="number"
            min={1}
            max={10}
            value={Number((formData as any).photoMax ?? 3)}
            disabled={((formData as any).photoRule ?? 'none') === 'none'}
            onChange={(e) => setFormData((prev) => ({ ...prev, photoMax: Number(e.target.value) }))}
            placeholder="Max photos"
          />
        </div>

        {(((formData as any).photoRule ?? 'none') === 'required' || formData.type === 'photo') && (
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
            This card will require at least {Number((formData as any).photoMin ?? 1)} photo(s) before it can be submitted.
          </div>
        )}
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.allowsSkip || false}
            onChange={(e) => setFormData({ ...formData, allowsSkip: e.target.checked })}
          />
          Allows Skip
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
    </form>
  );
};
