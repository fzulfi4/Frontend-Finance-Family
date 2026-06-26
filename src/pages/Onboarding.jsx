import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, CheckCircle, LogOut, Sparkles, ArrowRight, Hash, Home } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

/* ── Option Card ─────────────────────────────────────────────── */
const OptionCard = ({ icon: Icon, title, subtitle, accent, onClick, delay = '0ms' }) => (
  <button
    onClick={onClick}
    className="group w-full flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden"
    style={{
      background: `${accent}06`,
      borderColor: `${accent}20`,
      animationDelay: delay,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = `${accent}12`;
      e.currentTarget.style.borderColor = `${accent}40`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = `${accent}06`;
      e.currentTarget.style.borderColor = `${accent}20`;
    }}
  >
    {/* Subtle corner glow */}
    <div
      className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"
      style={{ background: accent, transform: 'translate(30%, -30%)' }}
    />

    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
      style={{ background: `linear-gradient(135deg, ${accent}80, ${accent}40)`, boxShadow: `0 0 20px ${accent}30` }}
    >
      <Icon size={22} className="text-white" />
    </div>

    <div className="flex-1 relative z-10">
      <p className="font-semibold text-white text-sm mb-0.5">{title}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>

    <ArrowRight
      size={16}
      className="flex-shrink-0 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300"
    />
  </button>
);

/* ─────────────────────────────────────────────────────────────── */
const Onboarding = () => {
  const [mode,       setMode]       = useState('');
  const [familyName, setFamilyName] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const { user, fetchUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t }    = useTranslation();

  useEffect(() => {
    if (user?.family_id) navigate('/dashboard');
  }, [user, navigate]);

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    if (!familyName.trim()) return;
    setLoading(true); setError('');
    try {
      await api.post('/families', { name: familyName });
      await fetchUser();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create family');
    } finally { setLoading(false); }
  };

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    if (!familyCode.trim()) return;
    setLoading(true); setError('');
    try {
      await api.post(`/users/${user.id}/join-family`, { family_id: familyCode.trim().toLowerCase() });
      await fetchUser();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join family. Invalid code.');
    } finally { setLoading(false); }
  };

  const goBack = () => { setMode(''); setError(''); };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Background ──────────────────────────────────────────── */}
      <div className="absolute top-[-20%] right-[-10%] w-[560px] h-[560px] bg-accent-blue/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[440px] h-[440px] bg-accent-violet/12 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)',
        backgroundSize: '48px 48px'
      }} />

      <div className="w-full max-w-md relative z-10 animate-fade-in">

        {/* ── Logo / branding ─────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-accent-blue to-accent-violet shadow-glow-blue mb-4 relative">
            <Sparkles size={28} className="text-white" />
            {/* Orbit ring */}
            <div className="absolute -inset-1.5 rounded-full border border-accent-blue/20 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <h1 className="text-3xl font-bold text-gradient-brand mb-2">{t('welcomeToFamFinance')}</h1>
          <p className="text-sm text-gray-400">{t('setUpWorkspace')}</p>
        </div>

        {/* ── Main card ───────────────────────────────────────── */}
        <div className="card p-6 md:p-8 space-y-5">

          {/* Error */}
          {error && (
            <div className="bg-accent-red/8 text-accent-red px-4 py-3 rounded-xl text-sm border border-accent-red/20 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-red flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── Mode: pick ─────────────────────────────────── */}
          {!mode && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-4">Pilih opsi</p>

              <OptionCard
                icon={Plus}
                title={t('createNewFamily')}
                subtitle={t('beTheAdmin')}
                accent="#3b82f6"
                onClick={() => setMode('create')}
                delay="0ms"
              />

              <OptionCard
                icon={Users}
                title={t('joinExistingFamily')}
                subtitle={t('enterCodeFromMember')}
                accent="#10b981"
                onClick={() => setMode('join')}
                delay="60ms"
              />

              <div className="pt-4 border-t border-dark-border flex justify-center">
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-accent-red transition-colors py-2"
                >
                  <LogOut size={13} />
                  {t('logout') || 'Log out'}
                </button>
              </div>
            </div>
          )}

          {/* ── Mode: create ───────────────────────────────── */}
          {mode === 'create' && (
            <form onSubmit={handleCreateFamily} className="space-y-5 animate-fade-in">
              {/* Back */}
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
              >
                ← {t('back')}
              </button>

              {/* Icon header */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent-blue/6 border border-accent-blue/15">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-blue/60 flex items-center justify-center flex-shrink-0 shadow-glow-blue">
                  <Home size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t('createNewFamily')}</p>
                  <p className="text-xs text-gray-400">{t('beTheAdmin')}</p>
                </div>
              </div>

              <div>
                <label className="input-label">{t('familyName')}</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={t('egSmithFamily')}
                  value={familyName}
                  onChange={e => setFamilyName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('creating')}
                  </span>
                ) : (
                  <><CheckCircle size={17} /> {t('createFamily')}</>
                )}
              </button>
            </form>
          )}

          {/* ── Mode: join ─────────────────────────────────── */}
          {mode === 'join' && (
            <form onSubmit={handleJoinFamily} className="space-y-5 animate-fade-in">
              {/* Back */}
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
              >
                ← {t('back')}
              </button>

              {/* Icon header */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent-green/6 border border-accent-green/15">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green to-accent-green/60 flex items-center justify-center flex-shrink-0 shadow-glow-green">
                  <Hash size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t('joinExistingFamily')}</p>
                  <p className="text-xs text-gray-400">{t('enterCodeFromMember')}</p>
                </div>
              </div>

              <div>
                <label className="input-label">{t('familyInviteCode')}</label>
                <input
                  type="text"
                  className="input-field text-center tracking-[0.35em] font-mono text-lg"
                  placeholder={t('enterCode')}
                  value={familyCode}
                  onChange={e => setFamilyCode(e.target.value)}
                  required
                  autoFocus
                />
                <p className="text-[11px] text-gray-500 mt-2 text-center">{t('askAdminForCode')}</p>
              </div>

              <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}
                style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('joining')}
                  </span>
                ) : (
                  <><Users size={17} /> {t('joinFamily')}</>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-600 mt-6">
          © 2025 FamFinance · Kelola keuangan keluarga bersama
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
