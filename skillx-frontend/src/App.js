import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import UserList from './components/Users/UserList';
import UserSearch from './components/Users/UserSearch';
import UserProfile from './components/Users/UserProfile';
import ConnectionRequests from './components/Connections/ConnectionRequests';
import MyConnections from './components/Connections/MyConnections';
import MessageList from './components/Messages/MessageList';
import ChatWindow from './components/Messages/ChatWindow';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      <Route path="/discover" element={
        <ProtectedRoute>
          <UserList />
        </ProtectedRoute>
      } />
      
      <Route path="/search" element={
        <ProtectedRoute>
          <UserSearch />
        </ProtectedRoute>
      } />
      
      <Route path="/users/:userId" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />
      
      <Route path="/requests" element={
        <ProtectedRoute>
          <ConnectionRequests />
        </ProtectedRoute>
      } />
      
      <Route path="/connections" element={
        <ProtectedRoute>
          <MyConnections />
        </ProtectedRoute>
      } />
      
      <Route path="/messages" element={
        <ProtectedRoute>
          <MessageList />
        </ProtectedRoute>
      } />
      
      <Route path="/messages/:userId" element={
        <ProtectedRoute>
          <ChatWindow />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
