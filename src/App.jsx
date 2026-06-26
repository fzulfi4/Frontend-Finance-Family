import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, lazy, Suspense } from 'react';
import { AuthContext } from './context/AuthContext';

// Lazy load semua pages — hanya dimuat saat dibutuhkan
const Login           = lazy(() => import('./pages/Login'));
const Register        = lazy(() => import('./pages/Register'));
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const Onboarding      = lazy(() => import('./pages/Onboarding'));
const Debts           = lazy(() => import('./pages/Debts'));
const Goals           = lazy(() => import('./pages/Goals'));
const Transactions    = lazy(() => import('./pages/Transactions'));
const Categories      = lazy(() => import('./pages/Categories'));
const MonthlyExpenses = lazy(() => import('./pages/MonthlyExpenses'));
const FamilySettings  = lazy(() => import('./pages/FamilySettings'));
const ResetPassword   = lazy(() => import('./pages/ResetPassword'));
const Reports         = lazy(() => import('./pages/Reports'));
const Layout          = lazy(() => import('./components/Layout'));

const PageLoader = () => (
  <div className="min-h-screen bg-dark-bg flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  
  if (loading) return <PageLoader />;
  if (!token) return <Navigate to="/login" />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { token, user, loading } = useContext(AuthContext);
  
  if (loading) return <PageLoader />;
  if (token) {
    return <Navigate to={user?.family_id ? "/dashboard" : "/onboarding"} />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
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
            <Route path="/dashboard"        element={<Dashboard />} />
            <Route path="/transactions"     element={<Transactions />} />
            <Route path="/categories"       element={<Categories />} />
            <Route path="/debts"            element={<Debts />} />
            <Route path="/goals"            element={<Goals />} />
            <Route path="/monthly-expenses" element={<MonthlyExpenses />} />
            <Route path="/family"           element={<FamilySettings />} />
            <Route path="/reports"          element={<Reports />} />
          </Route>

          <Route path="/" element={
            <ProtectedRoute>
              <HomeRedirect />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

const HomeRedirect = () => {
  const { user } = useContext(AuthContext);
  return <Navigate to={user?.family_id ? "/dashboard" : "/onboarding"} replace />;
};

export default App;
