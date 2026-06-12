import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Debts from './pages/Debts';
import Goals from './pages/Goals';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import MonthlyExpenses from './pages/MonthlyExpenses';
import FamilySettings from './pages/FamilySettings';
import ResetPassword from './pages/ResetPassword';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  
  if (loading) return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
    </div>
  );
  if (!token) return <Navigate to="/login" />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { token, user, loading } = useContext(AuthContext);
  
  if (loading) return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
    </div>
  );
  if (token) {
    return <Navigate to={user?.family_id ? "/dashboard" : "/onboarding"} />;
  }
  
  return children;
};



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        <Route path="/reset-password" element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } />
        
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />

        {/* Protected Routes wrapped in Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/debts" element={<Debts />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/monthly-expenses" element={<MonthlyExpenses />} />
          <Route path="/family" element={<FamilySettings />} />
        </Route>

        <Route path="/" element={
          <ProtectedRoute>
            <HomeRedirect />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

const HomeRedirect = () => {
  const { user } = useContext(AuthContext);
  return <Navigate to={user?.family_id ? "/dashboard" : "/onboarding"} replace />;
};

export default App;
