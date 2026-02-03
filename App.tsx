
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Home'; // We use Home.tsx as our Dashboard
import ToolsHub from './pages/ToolsHub';
import ToolWorkspace from './pages/ToolWorkspace';
import AIStudio from './pages/AIStudio';
import Pricing from './pages/Pricing';
import ProfilePage from './pages/Profile';
import SettingsPage from './pages/Settings';
import { AuthPage } from './pages/Auth';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Marketing Landing Page (No Workspace Layout) */}
        <Route path="/" element={<Landing />} />
        
        {/* Auth routes (No Workspace Layout) */}
        <Route path="/auth/login" element={<AuthPage type="login" />} />
        <Route path="/auth/signup" element={<AuthPage type="signup" />} />

        {/* Workspace Routes (Wrapped in Sidebar/Navbar Layout) */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/tools" element={<Layout><ToolsHub /></Layout>} />
        <Route path="/tools/:toolId" element={<Layout><ToolWorkspace /></Layout>} />
        <Route path="/ai-studio" element={<Layout><AIStudio /></Layout>} />
        <Route path="/pricing-app" element={<Layout><Pricing /></Layout>} />
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
        <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
        
        {/* Public Pricing (External style) */}
        <Route path="/pricing" element={<Pricing />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;