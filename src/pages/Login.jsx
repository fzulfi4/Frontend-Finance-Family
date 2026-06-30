import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LogIn, UserPlus, Lock, Mail, ArrowRight, Sparkles,
  Shield, TrendingUp, Users, Eye, EyeOff, ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/* ── Feature bullet ────────────────────────────────────────── */
const Feature = ({ icon: Icon, text, accent }) => (
  <div className="flex items-center gap-3 group">
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-200"
      style={{ background: `${accent}18`, border: `1px solid ${accent}25` }}
    >
      <Icon size={16} style={{ color: accent }} />
    </div>
    <span className="text-sm text-white/65 group-hover:text-white/85 transition-colors">{text}</span>
  </div>
);

/* ── Stat pill ─────────────────────────────────────────────── */
const StatPill = ({ value, label }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-[11px] text-white/40 mt-0.5">{label}</p>
  </div>
);

/* ─────────────────────────────────────────────────────────── */
const Login = () => {
  const [isLogin,         setIsLogin]         = useState(true);
  const [isForgotPwd,     setIsForgotPwd]     = useState(false);
  const [formData,        setFormData]        = useState({ email: '', password: '', full_name: '' });
  const [showPwd,         setShowPwd]         = useState(false);
  const [successMessage,  setSuccessMessage]  = useState('');
  const [rememberMe,      setRememberMe]      = useState(false);

  const { login, register, forgotPassword, error, setError, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t }    = useTranslation();

  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) {
      navigate('/reset-password' + window.location.hash);
    }
  }, [navigate]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    if (savedRememberMe && savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    try {
      if (isForgotPwd) {
        await forgotPassword(formData.email);
        setSuccessMessage('Reset link sent! Please check your email.');
      } else if (isLogin) {
        await login(formData.email, formData.password);
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberMe');
        }
      } else {
        await register(formData.email, formData.password, formData.full_name);
      }
    } catch { /* handled by AuthContext */ }
  };

  const switchMode = (mode) => {
    setError(null); setSuccessMessage('');
    if (mode === 'login')    { setIsLogin(true);  setIsForgotPwd(false); }
    if (mode === 'register') { setIsLogin(false); setIsForgotPwd(false); }
    if (mode === 'forgot')   { setIsForgotPwd(true); }
  };

  const formTitle = isForgotPwd ? 'Reset Password' : isLogin ? t('welcomeBackTitle') : t('createAnAccount');
  const formSub   = isForgotPwd ? 'Enter your email to receive a password reset link'
    : isLogin ? t('loginToManage') : t('signUpToStart');

  return (
    <div className="min-h-screen bg-dark-bg flex overflow-hidden">

      {/* ══ LEFT PANEL — Branding ══════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] xl:w-[55%] relative p-12 xl:p-16 overflow-hidden">

        {/* BG layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/18 via-accent-violet/8 to-accent-green/12" />
        <div className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] bg-accent-blue/20 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-25%] right-[-15%] w-[500px] h-[500px] bg-accent-violet/18 rounded-full blur-[110px]" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)',
          backgroundSize: '44px 44px'
        }} />
        {/* Decorative rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/3 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center shadow-glow-blue">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gradient-brand">FamFinance</span>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-xs text-white/60 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              Sistem keuangan keluarga modern
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Kelola keuangan keluarga dengan{' '}
              <span className="text-gradient-blue">lebih cerdas</span>
            </h1>
            <p className="text-base text-white/50 leading-relaxed max-w-sm">
              Pantau pengeluaran, capai target tabungan, dan rencanakan masa depan finansial bersama keluarga.
            </p>
          </div>

          <div className="space-y-3">
            <Feature icon={TrendingUp} text="Lacak pemasukan & pengeluaran real-time" accent="#3b82f6" />
            <Feature icon={Shield}     text="Data aman dan terenkripsi end-to-end"      accent="#8b5cf6" />
            <Feature icon={Users}      text="Kelola keuangan bersama anggota keluarga"  accent="#10b981" />
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-8 pt-6 border-t border-white/8">
            <StatPill value="10K+" label="Keluarga aktif" />
            <div className="w-px h-8 bg-white/10" />
            <StatPill value="99.9%" label="Uptime" />
            <div className="w-px h-8 bg-white/10" />
            <StatPill value="4.9★" label="Rating" />
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-white/25">© 2025 FamFinance. All rights reserved.</p>
      </div>

      {/* ══ RIGHT PANEL — Form ════════════════════════════════= */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 relative overflow-auto">

        {/* Mobile BG */}
        <div className="lg:hidden absolute top-[-10%] left-[-20%] w-80 h-80 bg-accent-blue/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="lg:hidden absolute bottom-[-10%] right-[-20%] w-72 h-72 bg-accent-violet/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center shadow-glow-blue">
            <Sparkles size={17} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gradient-brand">FamFinance</span>
        </div>

        {/* ── Form card ─────────────────────────────────────── */}
        <div className="w-full max-w-[380px] relative z-10 animate-fade-in">

          {/* Tab switcher (login/register) */}
          {!isForgotPwd && (
            <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-dark-border mb-7">
              {[
                { key: 'login',    label: t('signIn') || 'Masuk' },
                { key: 'register', label: t('createAccount') || 'Daftar' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchMode(key)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${(key === 'login' ? isLogin : !isLogin)
                      ? 'bg-gradient-to-r from-accent-blue to-accent-violet text-white shadow-glow-blue'
                      : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">{formTitle}</h2>
            <p className="text-sm text-gray-400">{formSub}</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-accent-red/8 text-accent-red px-4 py-3 rounded-xl mb-5 text-sm border border-accent-red/20 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-red flex-shrink-0" />
              {t(error)}
            </div>
          )}
          {successMessage && (
            <div className="bg-accent-green/8 text-accent-greenLt px-4 py-3 rounded-xl mb-5 text-sm border border-accent-green/20 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green flex-shrink-0" />
              {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name (register only) */}
            {!isLogin && !isForgotPwd && (
              <div>
                <label className="input-label">{t('fullName')}</label>
                <div className="relative">
                  <UserPlus size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <input
                    type="text"
                    name="full_name"
                    className="input-field pl-10"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="input-label">{t('emailAddress')}</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            {!isForgotPwd && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="input-label mb-0">{t('password')}</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[11px] text-accent-blue hover:text-accent-blueLt transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    name="password"
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required={!isForgotPwd}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me Checkbox */}
            {isLogin && !isForgotPwd && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-600 bg-white/5 text-accent-blue focus:ring-accent-blue focus:ring-offset-dark-bg w-4 h-4 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-gray-400 select-none cursor-pointer hover:text-gray-300">
                  Ingat Saya (Remember Me)
                </label>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full btn-lg mt-5"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('pleaseWaitAuth')}
                </span>
              ) : (
                <>
                  {isForgotPwd ? <Mail size={17} /> : isLogin ? <LogIn size={17} /> : <UserPlus size={17} />}
                  <span>{isForgotPwd ? 'Send Reset Link' : isLogin ? t('signIn') : t('createAccount')}</span>
                  <ChevronRight size={15} className="ml-auto opacity-50" />
                </>
              )}
            </button>
          </form>

          {/* Forgot password back link */}
          {isForgotPwd && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-sm text-accent-blue hover:text-accent-blueLt font-medium transition-colors flex items-center gap-1 mx-auto"
              >
                ← Back to Login
              </button>
            </div>
          )}

          {/* Divider / extra info */}
          {!isForgotPwd && (
            <p className="mt-6 text-center text-xs text-gray-600">
              {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => isLogin ? switchMode('register') : switchMode('login')}
                className="text-accent-blue hover:text-accent-blueLt font-semibold transition-colors"
              >
                {isLogin ? t('registerHere') : t('signInHere')}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
