import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CreateHunt } from './pages/CreateHunt';
import { Builder } from './pages/Builder';
import { Share } from './pages/Share';
import { Join } from './pages/Join';
import { Dashboard } from './pages/Dashboard';
import { Completed } from './pages/Completed';
import { GiftersDashboard } from './pages/GiftersDashboard';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<GiftersDashboard />} />
        <Route path="/create" element={<CreateHunt />} />
        <Route path="/builder/:huntId" element={<Builder />} />
        <Route path="/share/:huntId" element={<Share />} />
        <Route path="/join" element={<Join />} />
        <Route path="/h/:shareSlug" element={<SlugRedirect />} />
        <Route path="/play/:huntId" element={<Dashboard />} />
        <Route path="/complete/:huntId" element={<Completed />} />
      </Routes>
    </BrowserRouter>
  );
}

function SlugRedirect() {
  const slug = window.location.pathname.split('/h/')[1];
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (slug) {
      fetch(`/api/hunts/by-slug/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.huntId) {
            window.location.href = `/play/${data.huntId}`;
          } else {
            setLoading(false);
          }
        })
        .catch(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return <div className="container">Loading...</div>;
  return <div className="container">Hunt not found</div>;
}

export default App;

