import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Editor from './components/Editor';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
  return user ? children : <Navigate to="/auth" />;
};

function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
        
        {/* Dashboard handles the root path now */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Editor requires a document ID */}
        <Route path="/document/:id" element={
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}