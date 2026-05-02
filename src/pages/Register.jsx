import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
      // Check if access token is present (Auto Confirm OFF)
      if (res.data.access_token) {
        navigate('/dashboard');
      } else {
        // Auto Confirm ON (Email verification required)
        setSuccess(t('registrationSuccessful'));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h1 className="page-title text-gradient">{t('createAccount')}</h1>
        <p className="page-subtitle">{t('joinUs')}</p>

        {error && <div style={{ color: 'var(--accent-red)', marginBottom: '15px' }}>{error}</div>}
        {success && <div style={{ color: 'var(--accent-green)', marginBottom: '15px' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">{t('fullName')}</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                name="full_name"
                className="input-field" 
                style={{ width: '100%', paddingLeft: '40px' }}
                placeholder="John Doe" 
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t('emailAddress')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-secondary)' }} />
              <input 
                type="email" 
                name="email"
                className="input-field" 
                style={{ width: '100%', paddingLeft: '40px' }}
                placeholder="you@example.com" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t('password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                name="password"
                className="input-field" 
                style={{ width: '100%', paddingLeft: '40px' }}
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? t('creatingAccount') : (
              <>
                <UserPlus size={18} /> {t('signUp')}
              </>
            )}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {t('alreadyHaveAccount')} <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>{t('signInHere')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
