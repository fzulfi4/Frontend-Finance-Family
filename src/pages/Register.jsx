import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const res = await register(formData.email, formData.password, formData.full_name);
      if (res.data.access_token) {
        navigate('/dashboard');
      } else {
        setSuccess(t('registrationSuccessful'));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-72 md:w-96 h-72 md:h-96 bg-accent-blue/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-72 md:w-96 h-72 md:h-96 bg-accent-green/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent mb-2">
            FamFinance
          </h1>
          <p className="text-gray-400 text-sm">{t('financialCommandCenter')}</p>
        </div>

        <Card className="p-5 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-1 text-white">{t('createAnAccount')}</h2>
          <p className="text-gray-400 text-sm mb-6">{t('signUpToStart')}</p>

          {error && (
            <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-4 text-sm border border-red-500/20">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 text-accent-green px-4 py-3 rounded-lg mb-4 text-sm border border-green-500/20">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">{t('fullName')}</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  name="full_name"
                  className="input-field pl-10" 
                  placeholder="John Doe" 
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">{t('emailAddress')}</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
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

            <div>
              <label className="input-label">{t('password')}</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="password" 
                  name="password"
                  className="input-field pl-10" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  minLength="6"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full mt-2" 
              disabled={loading}
            >
              {loading ? (
                <span className="opacity-70">{t('creatingAccount')}</span>
              ) : (
                <>
                  <UserPlus size={18} /> {t('createAccount')}
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            {t('alreadyHaveAccount')}{' '}
            <Link 
              to="/login" 
              className="text-accent-blue hover:text-blue-400 font-medium transition-colors"
            >
              {t('signInHere')}
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Register;
