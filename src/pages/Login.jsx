import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, UserPlus, Lock, Mail } from 'lucide-react';
import Card from '../components/ui/Card';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '' // Only for register
  });
  const [successMessage, setSuccessMessage] = useState('');
  const { login, register, forgotPassword, error, setError, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) {
      navigate('/reset-password' + window.location.hash);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    try {
      if (isForgotPassword) {
        await forgotPassword(formData.email);
        setSuccessMessage('Reset link sent! Please check your email.');
      } else if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.full_name);
      }
    } catch {
      // Error is handled by AuthContext
    }
  };

  const switchMode = (mode) => {
    setError(null);
    setSuccessMessage('');
    if (mode === 'login') {
      setIsLogin(true);
      setIsForgotPassword(false);
    } else if (mode === 'register') {
      setIsLogin(false);
      setIsForgotPassword(false);
    } else if (mode === 'forgot') {
      setIsForgotPassword(true);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-72 md:w-96 h-72 md:h-96 bg-accent-blue/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-72 md:w-96 h-72 md:h-96 bg-accent-green/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent mb-2">FamFinance</h1>
          <p className="text-gray-400 text-sm">{t('financialCommandCenter')}</p>
        </div>

        <Card className="p-5 md:p-8">
          <h2 className="text-2xl font-bold mb-1 text-white">
            {isForgotPassword ? 'Reset Password' : (isLogin ? t('welcomeBackTitle') : t('createAnAccount'))}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {isForgotPassword ? 'Enter your email to receive a reset link' : (isLogin ? t('loginToManage') : t('signUpToStart'))}
          </p>

          {error && (
            <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">
              {t(error)}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/10 text-accent-green px-4 py-3 rounded-lg mb-6 text-sm border border-green-500/20">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isForgotPassword && (
              <div>
                <label className="input-label">{t('fullName')}</label>
                <div className="relative">
                  <UserPlus size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
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

            {!isForgotPassword && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="input-label mb-0">{t('password')}</label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-accent-blue hover:text-blue-400"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="password" 
                    name="password" 
                    className="input-field pl-10" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={handleChange}
                    required={!isForgotPassword}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full mt-6" disabled={loading}>
              {loading ? (
                <span className="opacity-70">{t('pleaseWaitAuth')}</span>
              ) : (
                <>
                  {isForgotPassword ? <Mail size={18} /> : (isLogin ? <LogIn size={18} /> : <UserPlus size={18} />)}
                  <span>{isForgotPassword ? 'Send Reset Link' : (isLogin ? t('signIn') : t('createAccount'))}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {isForgotPassword ? (
              <button 
                type="button" 
                onClick={() => switchMode('login')}
                className="text-accent-blue hover:text-blue-400 font-medium transition-colors"
              >
                Back to Login
              </button>
            ) : (
              <>
                {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
                <button 
                  type="button" 
                  onClick={() => isLogin ? switchMode('register') : switchMode('login')}
                  className="text-accent-blue hover:text-blue-400 font-medium transition-colors ml-1"
                >
                  {isLogin ? t('registerHere') : t('signInHere')}
                </button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
