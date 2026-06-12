import { useState, useContext, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Settings, Users, Copy, CheckCircle, AlertTriangle, Trash2, Edit2, X, Save, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useFamily } from '../hooks/useFamily';
import { useTranslation } from 'react-i18next';

const FamilySettings = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const { family, members, loading, error, updateFamily, deleteFamily } = useFamily();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserName, setEditUserName] = useState('');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [updateUserError, setUpdateUserError] = useState(null);

  useEffect(() => {
    if (family) {
      setEditName(family.name);
    }
    if (user) {
      setEditUserName(user.full_name);
    }
  }, [family, user]);

  const handleCopyCode = () => {
    if (family?.id) {
      navigator.clipboard.writeText(family.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim() || editName === family?.name) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);
    try {
      await updateFamily(editName);
      setIsEditing(false);
    } catch (err) {
      setUpdateError(err.message || 'Failed to update family name');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUserName.trim() || editUserName === user?.full_name) {
      setIsEditingUser(false);
      return;
    }

    setIsUpdatingUser(true);
    setUpdateUserError(null);
    try {
      await updateProfile(editUserName);
      setIsEditingUser(false);
    } catch (err) {
      setUpdateUserError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFamily();
      // user.family_id is cleared in hook, the ProtectedRoute/App might handle the redirect,
      // but to be safe, navigate to onboarding
      navigate('/onboarding');
    } catch (err) {
      setUpdateError(err.message || 'Failed to delete family');
      setShowDeleteConfirm(false);
    }
  };

  // If user doesn't have a family, redirect to onboarding
  if (!user?.family_id) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="p-4 md:p-10 space-y-5 md:space-y-8 max-w-4xl mx-auto">
      <header className="mb-4 md:mb-8">
        <h1 className="text-xl md:text-4xl font-bold text-white mb-1 flex items-center gap-2 md:gap-3">
          <Settings className="text-accent-blue flex-shrink-0" size={24} />
          {t('familySettings')}
        </h1>
        <p className="text-gray-400 text-sm md:text-lg">{t('manageFamilyProfile')}</p>
      </header>

      {error && !updateError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center text-center">
          <AlertTriangle className="text-accent-red mb-2" size={24} />
          <p className="text-accent-red">{error}</p>
        </div>
      )}

      {loading && !family && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin"></div>
        </div>
      )}

      {family && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            
            {/* General Settings */}
            <div className="glass-panel md:col-span-2 flex flex-col space-y-6">
              
              {/* Personal Profile Section */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">{t('personalProfile')}</h2>
                
                {updateUserError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-accent-red text-sm">
                    {updateUserError}
                  </div>
                )}

                {!isEditingUser ? (
                  <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                        {user?.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{t('fullName')}</p>
                        <p className="text-lg font-medium text-white">{user?.full_name}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsEditingUser(true)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                      title={t('edit')}
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateUser} className="flex gap-2">
                    <input 
                      type="text" 
                      className="input-field flex-1"
                      value={editUserName}
                      onChange={(e) => setEditUserName(e.target.value)}
                      placeholder={t('enterFullName')}
                      autoFocus
                    />
                    <button 
                      type="submit" 
                      disabled={isUpdatingUser}
                      className="btn btn-primary"
                    >
                      {isUpdatingUser ? t('saving') : <Save size={18} />}
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsEditingUser(false);
                        setEditUserName(user?.full_name);
                      }}
                      className="btn btn-secondary"
                    >
                      <X size={18} />
                    </button>
                  </form>
                )}
              </div>

              {/* Family Profile Section */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">{t('familyProfile')}</h2>
                
                {updateError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-accent-red text-sm">
                    {updateError}
                  </div>
                )}

                {!isEditing ? (
                  <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{t('familyName')}</p>
                      <p className="text-lg font-medium text-white">{family.name}</p>
                    </div>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                      title={t('edit')}
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdate} className="flex gap-2">
                    <input 
                      type="text" 
                      className="input-field flex-1"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={t('enterFamilyName')}
                      autoFocus
                    />
                    <button 
                      type="submit" 
                      disabled={isUpdating}
                      className="btn btn-primary"
                    >
                      {isUpdating ? t('saving') : <Save size={18} />}
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(family.name);
                      }}
                      className="btn btn-secondary"
                    >
                      <X size={18} />
                    </button>
                  </form>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">{t('inviteMembers')}</h2>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                  <p className="text-sm text-gray-400 mb-3">{t('shareInviteCode')}</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black/50 p-3 rounded-lg text-accent-blue font-mono text-sm overflow-x-auto whitespace-nowrap border border-white/10">
                      {family.id}
                    </code>
                    <button 
                      onClick={handleCopyCode}
                      className="btn btn-secondary shrink-0"
                    >
                      {copied ? <CheckCircle className="text-accent-green" size={18} /> : <Copy size={18} />}
                      <span className="hidden sm:inline">{copied ? t('copied') : t('copy')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="glass-panel flex flex-col">
              <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                <Users size={20} className="text-accent-green" />
                {t('members')}
              </h2>
              
              <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-3">
                {members.length === 0 && loading ? (
                  <div className="text-center py-4 text-gray-500">{t('loadingMembers')}</div>
                ) : (
                  members.map(member => (
                    <div key={member.id} className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                        {member.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{member.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Danger Zone */}
          <div className="mt-12 border border-red-500/20 rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
            <div className="p-6 relative">
              <h2 className="text-xl font-bold text-accent-red mb-2 flex items-center gap-2">
                <AlertTriangle size={20} />
                {t('dangerZone')}
              </h2>
              <p className="text-gray-400 mb-6 text-sm">
                {t('permanentlyDeleteFamily')}
              </p>
              
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-accent-red border border-red-500/50 hover:bg-red-500 hover:text-white transition-all font-medium flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  {t('deleteFamily')}
                </button>
              ) : (
                <div className="bg-black/50 p-4 rounded-xl border border-red-500/30 animate-in fade-in slide-in-from-top-2">
                  <p className="text-white font-medium mb-4">{t('areYouSure')}</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-accent-red hover:bg-red-600 text-white font-medium transition-all"
                    >
                      {loading ? t('deleting') : t('yesDeleteFamily')}
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={loading}
                      className="btn btn-secondary"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FamilySettings;
