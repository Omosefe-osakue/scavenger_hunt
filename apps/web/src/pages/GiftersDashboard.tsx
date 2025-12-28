import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Hunt } from '../types';
import './GiftersDashboard.css';

interface HuntSummary {
  id: string;
  code: string;
  shareSlug: string;
  giftedName: string;
  welcomeMessage: string;
  status: 'draft' | 'published' | 'completed';
  createdAt: string;
  publishedAt?: string;
  postItCount?: number;
}

const STORAGE_KEY = 'scaven_hunt_ids';

export const GiftersDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [hunts, setHunts] = useState<HuntSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHunts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStoredHuntIds = (): string[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const addHuntId = (huntId: string) => {
    const ids = getStoredHuntIds();
    if (!ids.includes(huntId)) {
      ids.push(huntId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }
  };

  const loadHunts = async () => {
    setLoading(true);
    setError(null);
    try {
      const huntIds = getStoredHuntIds();
      
      if (huntIds.length === 0) {
        setHunts([]);
        setLoading(false);
        return;
      }

      const huntPromises = huntIds.map(async (id) => {
        try {
          const hunt = await api.getHunt(id);
          return {
            id: hunt.id,
            code: hunt.code,
            shareSlug: hunt.shareSlug,
            giftedName: hunt.giftedName,
            welcomeMessage: hunt.welcomeMessage || '',
            status: hunt.status,
            createdAt: hunt.createdAt,
            publishedAt: hunt.publishedAt,
            postItCount: hunt.postIts?.length || 0,
          };
        } catch (err: any) {
          console.warn(`Failed to load hunt ${id}:`, err);
          return null;
        }
      });

      const loadedHunts = (await Promise.all(huntPromises)).filter(
        (h): h is HuntSummary => h !== null
      );

      // Sort by created date (newest first)
      loadedHunts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHunts(loadedHunts);
    } catch (err: any) {
      console.error('Error loading hunts:', err);
      setError(err.message || 'Failed to load hunts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHunt = () => {
    navigate('/create');
  };

  const handleEditHunt = (huntId: string) => {
    navigate(`/builder/${huntId}`);
  };

  const handleShareHunt = (huntId: string) => {
    navigate(`/share/${huntId}`);
  };

  const handlePublishHunt = async (huntId: string) => {
    try {
      await api.publishHunt(huntId);
      await loadHunts(); // Reload to update status
    } catch (err: any) {
      alert(err.message || 'Failed to publish hunt');
    }
  };

  const handleDeleteHunt = async (huntId: string) => {
    if (!confirm('Are you sure you want to remove this hunt from your dashboard? (This does not delete the hunt from the server)')) {
      return;
    }
    try {
      const ids = getStoredHuntIds();
      const updatedIds = ids.filter((id) => id !== huntId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIds));
      await loadHunts();
    } catch (err: any) {
      alert(err.message || 'Failed to remove hunt');
    }
  };

  const filteredHunts = hunts.filter((hunt) => {
    const matchesFilter = filter === 'all' || hunt.status === filter;
    const matchesSearch =
      searchQuery === '' ||
      hunt.giftedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hunt.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return '#f59e0b';
      case 'published':
        return '#10b981';
      case 'completed':
        return '#6366f1';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'published':
        return 'Published';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Auto-add hunt ID when navigating from create
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const newHuntId = urlParams.get('huntId');
    if (newHuntId) {
      addHuntId(newHuntId);
      loadHunts();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your hunts...</p>
        </div>
      </div>
    );
  }

  // Debug: Log current state
  if (process.env.NODE_ENV === 'development') {
    console.log('Dashboard state:', { hunts: hunts.length, filter, searchQuery, error });
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1>My Scavenger Hunts</h1>
          <p className="dashboard-subtitle">Create and manage your personalized scavenger hunts</p>
        </div>
        <button className="btn-create-hunt" onClick={handleCreateHunt}>
          <span className="btn-icon">+</span>
          Create New Hunt
        </button>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {hunts.length === 0 ? (
        <div className="dashboard-empty">
          <div className="empty-icon">🎯</div>
          <h2>No hunts yet</h2>
          <p>Create your first scavenger hunt to get started!</p>
          <button className="btn-primary" onClick={handleCreateHunt}>
            Create Your First Hunt
          </button>
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#f3f4f6', borderRadius: '8px', fontSize: '0.9em', color: '#666' }}>
              <p><strong>Debug Info:</strong></p>
              <p>Stored hunt IDs: {getStoredHuntIds().length}</p>
              <p>API Base: /api</p>
              <p>Check browser console for errors</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="dashboard-controls">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({hunts.length})
              </button>
              <button
                className={`filter-tab ${filter === 'draft' ? 'active' : ''}`}
                onClick={() => setFilter('draft')}
              >
                Draft ({hunts.filter((h) => h.status === 'draft').length})
              </button>
              <button
                className={`filter-tab ${filter === 'published' ? 'active' : ''}`}
                onClick={() => setFilter('published')}
              >
                Published ({hunts.filter((h) => h.status === 'published').length})
              </button>
              <button
                className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed ({hunts.filter((h) => h.status === 'completed').length})
              </button>
            </div>
          </div>

          <div className="hunts-grid">
            {filteredHunts.length === 0 ? (
              <div className="no-results">
                <p>No hunts found matching your search.</p>
              </div>
            ) : (
              filteredHunts.map((hunt) => (
                <div key={hunt.id} className="hunt-card">
                  <div className="hunt-card-header">
                    <div className="hunt-status-badge" style={{ backgroundColor: getStatusColor(hunt.status) }}>
                      {getStatusLabel(hunt.status)}
                    </div>
                    <button
                      className="hunt-delete-btn"
                      onClick={() => handleDeleteHunt(hunt.id)}
                      title="Remove from dashboard"
                    >
                      ×
                    </button>
                  </div>

                  <div className="hunt-card-body">
                    <h3 className="hunt-gifted-name">{hunt.giftedName}</h3>
                    <p className="hunt-welcome-preview">
                      {hunt.welcomeMessage && hunt.welcomeMessage.length > 100
                        ? `${hunt.welcomeMessage.substring(0, 100)}...`
                        : hunt.welcomeMessage || 'No welcome message'}
                    </p>
                    <div className="hunt-meta">
                      <div className="hunt-meta-item">
                        <span className="meta-icon">📝</span>
                        <span>{hunt.postItCount} Post-its</span>
                      </div>
                      <div className="hunt-meta-item">
                        <span className="meta-icon">🔑</span>
                        <span className="hunt-code">{hunt.code}</span>
                      </div>
                      <div className="hunt-meta-item">
                        <span className="meta-icon">📅</span>
                        <span>{new Date(hunt.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="hunt-card-actions">
                    <button
                      className="action-btn action-edit"
                      onClick={() => handleEditHunt(hunt.id)}
                      title="Edit hunt"
                    >
                      ✏️ Edit
                    </button>
                    {hunt.status === 'draft' && (
                      <button
                        className="action-btn action-publish"
                        onClick={() => handlePublishHunt(hunt.id)}
                        title="Publish hunt"
                      >
                        🚀 Publish
                      </button>
                    )}
                    {hunt.status === 'published' && (
                      <button
                        className="action-btn action-share"
                        onClick={() => handleShareHunt(hunt.id)}
                        title="Share hunt"
                      >
                        🔗 Share
                      </button>
                    )}
                    {hunt.status === 'completed' && (
                      <button
                        className="action-btn action-view"
                        onClick={() => navigate(`/play/${hunt.id}`)}
                        title="View hunt"
                      >
                        👁️ View
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

