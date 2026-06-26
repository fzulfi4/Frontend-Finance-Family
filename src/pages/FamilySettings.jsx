import { useState, useContext, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Settings, Users, Copy, CheckCircle, AlertTriangle, Trash2, Edit2,
  X, Save, LogOut, Crown, Shield, UserCircle2, Hash, Sparkles
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useFamily } from '../hooks/useFamily';
import { useTranslation } from 'react-i18next';

/* ─── tiny helper ──────────────────────────────────────────────── */
const AVATAR_COLORS = [
  'from-accent-blue to-accent-violet',
  'from-accent-green to-accent-cyan',
  'from-accent-pink to-accent-violet',
  'from-accent-amber to-accent-red',
  'from-accent-cyan to-accent-blue',
];
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.length % AVATAR_COLORS.length];

const initials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

/* ─── Section label ────────────────────────────────────────────── */
const SectionLabel = ({ icon: Icon, label, accent = 'text-accent-blue' }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon size={13} className={accent} />
    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">{label}</span>
  </div>
);

/* ─── Inline editable row ──────────────────────────────────────── */
const EditableRow = ({ label, value, onSave, disabled }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!draft.trim() || draft === value) { setEditing(false); return; }
    setSaving(true); setErr('');
    try { await onSave(draft); setEditing(false); }
    catch (ex) { setErr(ex.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      {err && <p className="text-accent-red text-xs mb-2">{err}</p>}
      {!editing ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="font-semibold text-white text-sm">{value}</p>
          </div>
          {!disabled && (
            <button
              onClick={() => { setDraft(value); setEditing(true); }}
              className="p-2 rounded-lg hover:bg-white/8 text-gray-500 hover:text-white transition-all"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="flex gap-2">
          <input
            autoFocus
            type="text"
            className="input-field flex-1 text-sm h-9"
            value={draft}
            onChange={e => setDraft(e.target.value)}
          />
          <button type="submit" disabled={saving} className="btn btn-primary h-9 px-3 text-xs">
            {saving ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={13} />}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary h-9 px-3">
            <X size={13} />
          </button>
        </form>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
const FamilySettings = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const { family, members, loading, error, updateFamily, deleteFamily, leaveFamily } = useFamily();
  const navigate  = useNavigate();
  const { t }     = useTranslation();
  const isCreator = family?.creator_id ? family.creator_id === user?.id : user?.role === 'admin';

  const [copied,            setCopied]            = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm,  setShowLeaveConfirm]  = useState(false);
  const [dangerError,       setDangerError]       = useState('');

  // redirect if no family
  if (!user?.family_id) return <Navigate to="/onboarding" replace />;

  const handleCopy = () => {
    if (family?.id) {
      navigator.clipboard.writeText(family.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    try   { await deleteFamily(); navigate('/onboarding'); }
    catch (ex) { setDangerError(ex.message || 'Failed to delete family'); setShowDeleteConfirm(false); }
  };

  const handleLeave = async () => {
    try   { await leaveFamily(); navigate('/onboarding'); }
    catch (ex) { setDangerError(ex.message || 'Failed to leave family'); setShowLeaveConfirm(false); }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Settings size={20} className="text-accent-blue" />
            {t('familySettings')}
          </h1>
          <p className="page-subtitle">{t('manageFamilyProfile')}</p>
        </div>
      </header>

      {/* Global load/error */}
      {error && (
        <div className="p-4 rounded-xl bg-accent-red/8 border border-accent-red/20 flex items-center gap-3 text-accent-red text-sm">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {loading && !family && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-dark-border border-t-accent-blue rounded-full animate-spin" />
        </div>
      )}

      {family && (
        <>
          {/* ── Main grid ────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left col: Profile + Invite */}
            <div className="lg:col-span-2 space-y-5">

              {/* Personal Profile card */}
              <div className="card p-5 space-y-4">
                <SectionLabel icon={UserCircle2} label={t('personalProfile')} accent="text-accent-violet" />

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/3 border border-dark-border">
                  {/* Avatar */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColor(user?.full_name)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-glow-violet`}>
                    {initials(user?.full_name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <EditableRow
                      label={t('fullName')}
                      value={user?.full_name || ''}
                      onSave={(v) => updateProfile(v)}
                    />
                    <p className="text-xs text-gray-500 mt-1 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Family Profile card */}
              <div className="card p-5 space-y-4">
                <SectionLabel icon={Sparkles} label={t('familyProfile')} accent="text-accent-blue" />

                <div className="p-4 rounded-2xl bg-white/3 border border-dark-border">
                  <EditableRow
                    label={t('familyName')}
                    value={family.name}
                    onSave={(v) => updateFamily(v)}
                    disabled={!isCreator}
                  />
                </div>
              </div>

              {/* Invite Code card */}
              <div className="card p-5 space-y-3">
                <SectionLabel icon={Hash} label={t('inviteMembers')} accent="text-accent-green" />
                <p className="text-xs text-gray-400">{t('shareInviteCode')}</p>

                <div className="relative group">
                  {/* glow ring on hover */}
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-accent-green/30 to-accent-cyan/30 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                  <div className="relative flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-dark-border">
                    <code className="flex-1 text-accent-green font-mono text-sm tracking-[0.15em] overflow-x-auto whitespace-nowrap">
                      {family.id}
                    </code>
                    <button
                      onClick={handleCopy}
                      className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                        ${copied
                          ? 'bg-accent-green/20 text-accent-green border border-accent-green/30'
                          : 'bg-white/6 text-gray-300 border border-dark-border hover:border-accent-green/30 hover:text-white'
                        }`}
                    >
                      {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
                      <span className="hidden sm:inline">{copied ? t('copied') : t('copy')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right col: Members list */}
            <div className="card overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-dark-border">
                <Users size={14} className="text-accent-cyan" />
                <h2 className="text-sm font-semibold text-white">{t('members')}</h2>
                <span className="ml-auto badge badge-blue">{members.length}</span>
              </div>

              <div className="flex-1 divide-y divide-dark-border overflow-y-auto">
                {members.length === 0 && loading ? (
                  <p className="p-8 text-center text-xs text-gray-500">{t('loadingMembers')}</p>
                ) : (
                  members.map(member => {
                    const isMe   = member.id === user?.id;
                    const isAdmin = family.creator_id === member.id;
                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition-colors"
                      >
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColor(member.full_name)} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                          {initials(member.full_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                            {member.full_name}
                            {isAdmin && <Crown size={10} className="text-accent-amber flex-shrink-0" />}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">{member.email}</p>
                        </div>
                        {isMe && (
                          <span className="badge badge-blue text-[9px] uppercase tracking-wider flex-shrink-0">You</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Member count footer */}
              <div className="px-5 py-3 border-t border-dark-border bg-white/2">
                <p className="text-[10px] text-gray-600 text-center">
                  {members.length} {members.length === 1 ? 'member' : 'members'} in this family
                </p>
              </div>
            </div>
          </div>

          {/* ── Danger Zone ────────────────────────────────────── */}
          <div className="relative rounded-2xl border border-accent-red/20 overflow-hidden">
            {/* subtle red glow bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-red/4 to-transparent pointer-events-none" />

            <div className="relative p-6 space-y-5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-accent-red" />
                <h2 className="font-bold text-accent-red text-base">{t('dangerZone')}</h2>
              </div>
              <p className="text-xs text-gray-500">
                Tindakan di bawah bersifat permanen dan tidak bisa dibatalkan. Pastikan Anda sudah mempertimbangkannya.
              </p>

              {dangerError && (
                <div className="p-3 rounded-xl bg-accent-red/8 border border-accent-red/20 text-accent-red text-xs">
                  {dangerError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/8">

                {/* Leave Family */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <LogOut size={13} className="text-orange-400" />
                    <h3 className="text-sm font-bold text-white">Keluar dari Keluarga</h3>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Anda tidak bisa mengakses ruang kerja keluarga ini lagi. Data finansial pribadi tidak terhapus.
                  </p>
                  {!showLeaveConfirm ? (
                    <button
                      onClick={() => setShowLeaveConfirm(true)}
                      className="mt-2 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all font-medium flex items-center gap-2 text-xs"
                    >
                      <LogOut size={13} /> Keluar Keluarga
                    </button>
                  ) : (
                    <div className="mt-2 p-4 rounded-xl bg-black/40 border border-orange-500/30 animate-fade-in space-y-3">
                      <p className="text-white text-xs font-medium">Yakin ingin keluar?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleLeave}
                          disabled={loading}
                          className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium transition-all"
                        >
                          {loading ? t('processing') : 'Ya, Keluar'}
                        </button>
                        <button
                          onClick={() => setShowLeaveConfirm(false)}
                          disabled={loading}
                          className="btn btn-secondary text-xs py-1.5"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete Family (creator only) */}
                {isCreator && (
                  <div className="space-y-2 md:border-l md:border-white/8 md:pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Trash2 size={13} className="text-accent-red" />
                      <h3 className="text-sm font-bold text-accent-red">Hapus Keluarga</h3>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      {t('permanentlyDeleteFamily')}
                    </p>
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="mt-2 px-4 py-2 rounded-xl bg-accent-red/10 text-accent-red border border-accent-red/30 hover:bg-accent-red hover:text-white hover:border-accent-red transition-all font-medium flex items-center gap-2 text-xs"
                      >
                        <Trash2 size={13} /> {t('deleteFamily')}
                      </button>
                    ) : (
                      <div className="mt-2 p-4 rounded-xl bg-black/40 border border-accent-red/30 animate-fade-in space-y-3">
                        <p className="text-white text-xs font-medium">{t('areYouSure')}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="px-4 py-1.5 rounded-lg bg-accent-red hover:bg-red-600 text-white text-xs font-medium transition-all"
                          >
                            {loading ? t('deleting') : t('yesDeleteFamily')}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={loading}
                            className="btn btn-secondary text-xs py-1.5"
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FamilySettings;
