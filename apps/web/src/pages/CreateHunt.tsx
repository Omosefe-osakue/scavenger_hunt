import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import './CreateHunt.css';

export const CreateHunt: React.FC = () => {
  const navigate = useNavigate();
  const [giftedName, setGiftedName] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await api.createHunt({
        giftedName: giftedName.trim(),
        welcomeMessage: welcomeMessage.trim(),
      });
      // Store hunt ID in localStorage for dashboard tracking
      const stored = localStorage.getItem('scaven_hunt_ids');
      const huntIds = stored ? JSON.parse(stored) : [];
      if (!huntIds.includes(result.huntId)) {
        huntIds.push(result.huntId);
        localStorage.setItem('scaven_hunt_ids', JSON.stringify(huntIds));
      }
      navigate(`/builder/${result.huntId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create hunt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Create a Scavenger Hunt</h1>
        <p>Start by entering details for the person who will play this hunt</p>
      </div>

      <form onSubmit={handleSubmit} className="create-hunt-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="giftedName">Name of the person playing:</label>
          <input
            id="giftedName"
            type="text"
            value={giftedName}
            onChange={(e) => setGiftedName(e.target.value)}
            placeholder="Enter their name"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="welcomeMessage">Welcome Message:</label>
          <textarea
            id="welcomeMessage"
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="Write a personalized welcome message..."
            rows={5}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Hunt'}
        </button>
      </form>
    </div>
  );
};

