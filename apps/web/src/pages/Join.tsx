import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import './Join.css';

export const Join: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await api.getHuntByCode(code.toUpperCase().trim());
      navigate(`/play/${result.huntId}`);
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Join a Scavenger Hunt</h1>
        <p>Enter the code you received</p>
      </div>

      <form onSubmit={handleSubmit} className="join-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="code">Enter Code:</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            required
            disabled={loading}
            maxLength={10}
            style={{ textAlign: 'center', fontSize: '1.5em', letterSpacing: '4px', fontFamily: 'monospace' }}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Joining...' : 'Join Hunt'}
        </button>
      </form>
    </div>
  );
};

