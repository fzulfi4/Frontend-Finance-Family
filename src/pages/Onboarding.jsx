import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/ui/Card';
import { useTranslation } from 'react-i18next';

const Onboarding = () => {
  const [mode, setMode] = useState(''); // 'create' or 'join'
  const [familyName, setFamilyName] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // If user already has a family, redirect them to dashboard
  useEffect(() => {
    if (user?.family_id) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    setLoading(true);
    setError('');

    try {
      await api.post('/families', { name: familyName });
      await fetchUser(); // Refresh user data to get the new family_id
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create family');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    if (!familyCode.trim()) return;

    setLoading(true);
    setError('');

    try {
      await api.post(`/users/${user.id}/join-family`, { family_id: familyCode.trim().toLowerCase() });
      await fetchUser(); // Refresh user data
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join family. Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-accent-blue/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">{t('welcomeToFamFinance')}</h1>
          <p className="text-gray-400">{t('setUpWorkspace')}</p>
        </div>

        <Card className="p-8">
          {error && (
            <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">
              {error}
            </div>
          )}

          {!mode ? (
            <div className="space-y-4">
              <button 
                onClick={() => setMode('create')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-blue transition-all group text-left"
              >
                <div className="p-3 bg-blue-500/10 text-accent-blue rounded-lg group-hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{t('createNewFamily')}</h3>
                  <p className="text-sm text-gray-400">{t('beTheAdmin')}</p>
                </div>
              </button>

              <button 
                onClick={() => setMode('join')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-green transition-all group text-left"
              >
                <div className="p-3 bg-green-500/10 text-accent-green rounded-lg group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{t('joinExistingFamily')}</h3>
                  <p className="text-sm text-gray-400">{t('enterCodeFromMember')}</p>
                </div>
              </button>
            </div>
          ) : mode === 'create' ? (
            <form onSubmit={handleCreateFamily} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <button 
                type="button" 
                onClick={() => { setMode(''); setError(''); }}
                className="text-sm text-gray-400 hover:text-white mb-4 block"
              >
                ← {t('back')}
              </button>
              
              <div>
                <label className="input-label">{t('familyName')}</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder={t('egSmithFamily')}
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                {loading ? t('creating') : <><CheckCircle size={18} /> {t('createFamily')}</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinFamily} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <button 
                type="button" 
                onClick={() => { setMode(''); setError(''); }}
                className="text-sm text-gray-400 hover:text-white mb-4 block"
              >
                ← {t('back')}
              </button>
              
              <div>
                <label className="input-label">{t('familyInviteCode')}</label>
                <input 
                  type="text" 
                  className="input-field text-center tracking-widest font-mono" 
                  placeholder={t('enterCode')}
                  value={familyCode}
                  onChange={(e) => setFamilyCode(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-2 text-center">{t('askAdminForCode')}</p>
              </div>
              
              <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                {loading ? t('joining') : <><Users size={18} /> {t('joinFamily')}</>}
              </button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
