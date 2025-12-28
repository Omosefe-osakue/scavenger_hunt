import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { Hunt } from '../types';
import './Share.css';

export const Share: React.FC = () => {
  const { huntId } = useParams<{ huntId: string }>();
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (huntId) {
      loadHunt();
    }
  }, [huntId]);

  const loadHunt = async () => {
    if (!huntId) return;
    try {
      const data = await api.getHunt(huntId);
      setHunt(data);
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/h/${data.shareSlug}`);
    } catch (err) {
      console.error('Failed to load hunt:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!hunt) return <div className="container">Hunt not found</div>;

  return (
    <div className="container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div>
            <h1>Your Hunt is Ready! 🎉</h1>
            <p>Share this with {hunt.giftedName}</p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => window.location.href = '/dashboard'}
            style={{ fontSize: '0.9em', padding: '8px 16px' }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="share-card">
        <div className="share-section">
          <h3>Share Link</h3>
          <div className="share-input-group">
            <input type="text" value={shareUrl} readOnly />
            <button className="btn-primary" onClick={() => copyToClipboard(shareUrl)}>
              Copy
            </button>
          </div>
        </div>

        <div className="share-section">
          <h3>Short Code</h3>
          <div className="code-display">
            <span className="code-text">{hunt.code}</span>
            <button className="btn-secondary" onClick={() => copyToClipboard(hunt.code)}>
              Copy
            </button>
          </div>
          <p className="code-hint">They can enter this code at /join</p>
        </div>
      </div>
    </div>
  );
};

