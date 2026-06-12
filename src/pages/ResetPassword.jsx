import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const { updatePassword, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase returns the token in the hash after clicking recovery link
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = params.get('access_token');
      const type = params.get('type');

      if (type === 'recovery' && accessToken) {
        // Save token to localStorage temporarily so axios can use it
        localStorage.setItem('access_token', accessToken);
        setToken(accessToken);
      }
    } else {
        // If no token in hash, maybe it's already in localStorage or user just visited manually
        const token = localStorage.getItem('access_token');
        if (!token) {
            setStatus('error');
            setErrorMessage('Invalid or expired reset link.');
        }
    }
  }, [setToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await updatePassword(password);
      setStatus('success');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.error || 'Failed to update password');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center text-accent-green">
              <CheckCircle size={40} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Password Updated!</h2>
          <p className="text-gray-400 mb-6">Your password has been successfully changed. Redirecting you to login page...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent-blue/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-1 text-white">Set New Password</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your new secure password below.</p>

          {errorMessage && (
            <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20 flex items-center gap-2">
              <AlertCircle size={16} />
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="password" 
                  className="input-field pl-10" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Confirm New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="password" 
                  className="input-field pl-10" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-6" disabled={status === 'loading'}>
              {status === 'loading' ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
