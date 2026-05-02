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
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  
  if (loading) return <div className="auth-container">Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  
  if (loading) return <div className="auth-container">Loading...</div>;
  if (token) return <Navigate to="/dashboard" />;
  
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

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
