import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';

/* ── Strength indicator ─────────────────────────────────────── */
const strength = (pwd) => {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8)         s++;
  if (/[A-Z]/.test(pwd))       s++;
  if (/[0-9]/.test(pwd))       s++;
  if (/[^a-zA-Z0-9]/.test(pwd)) s++;
  return s;
};
const strengthLabel = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

/* ─────────────────────────────────────────────────────────── */
const ResetPassword = () => {
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd,         setShowPwd]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [status,          setStatus]          = useState('idle');
  const [errorMessage,    setErrorMessage]    = useState('');
  const { updatePassword, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = params.get('access_token');
      const type        = params.get('type');
      if (type === 'recovery' && accessToken) {
        localStorage.setItem('access_token', accessToken);
        setToken(accessToken);
      }
    } else {
      const token = localStorage.getItem('access_token');
      if (!token) { setStatus('error'); setErrorMessage('Invalid or expired reset link.'); }
    }
  }, [setToken]);

  const pwdStrength  = strength(password);
  const pwdMatch     = password && confirmPassword && password === confirmPassword;
  const pwdMismatch  = confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setErrorMessage('Passwords do not match'); return; }
    if (password.length < 6)          { setErrorMessage('Password must be at least 6 characters'); return; }
    setStatus('loading'); setErrorMessage('');
    try {
      await updatePassword(password);
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.error || 'Failed to update password');
    }
  };

  /* ── Success screen ────────────────────────────────────── */
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-accent-green/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-80 h-80 bg-accent-blue/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-sm relative z-10 text-center animate-fade-in">
          <div className="card p-10">
            {/* Animated success icon */}
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full bg-accent-green/20 animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="relative w-20 h-20 rounded-full bg-accent-green/15 border border-accent-green/30 flex items-center justify-center">
                <CheckCircle size={36} className="text-accent-green" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Password Updated!</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Password Anda berhasil diperbarui.<br />
              Mengalihkan ke halaman login…
            </p>

            {/* Progress bar */}
            <div className="w-full h-1 bg-dark-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-green to-accent-cyan rounded-full"
                style={{ animation: 'progress-shrink 3s linear forwards' }}
              />
            </div>
            <style>{`@keyframes progress-shrink { from { width: 100%; } to { width: 0%; } }`}</style>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main form ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-blue/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-accent-violet/12 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)',
        backgroundSize: '48px 48px'
      }} />

      <div className="w-full max-w-md relative z-10 animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet shadow-glow-blue mb-4">
            <Sparkles size={24} className="text-white" />
          </div>
          <p className="text-sm text-gray-500">FamFinance</p>
        </div>

        <div className="card p-7 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={18} className="text-accent-blue" />
              <h2 className="text-xl font-bold text-white">Set New Password</h2>
            </div>
            <p className="text-sm text-gray-400">Enter a new secure password for your account.</p>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="bg-accent-red/8 text-accent-red px-4 py-3 rounded-xl text-sm border border-accent-red/20 flex items-center gap-2">
              <AlertCircle size={15} />
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New password */}
            <div>
              <label className="input-label">New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Strength meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i <= pwdStrength ? strengthColor[pwdStrength] : 'rgba(255,255,255,0.08)' }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px]" style={{ color: strengthColor[pwdStrength] }}>
                    {strengthLabel[pwdStrength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="input-label">Confirm New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className={`input-field pl-10 pr-10 transition-all ${
                    pwdMatch    ? 'border-accent-green/40 bg-accent-green/5' :
                    pwdMismatch ? 'border-accent-red/40 bg-accent-red/5'    : ''
                  }`}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                {/* Match indicator */}
                {pwdMatch && (
                  <CheckCircle size={14} className="absolute right-9 top-1/2 -translate-y-1/2 text-accent-green" />
                )}
              </div>
              {pwdMismatch && (
                <p className="text-[11px] text-accent-red mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full btn-lg mt-2"
              disabled={status === 'loading' || pwdMismatch}
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating…
                </span>
              ) : (
                <><ShieldCheck size={17} /> Update Password</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
