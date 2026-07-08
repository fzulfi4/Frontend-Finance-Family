import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, X, Send, Trash2, Bot, User, Loader2, ChevronDown } from 'lucide-react';
import { useAIChat } from '../hooks/useAI';
import i18n from '../i18n';

// ─── Markdown-lite renderer (bold, bullet, numbered list) ───────────────────
const renderMarkdown = (text) => {
  const lines = text.split('\n');
  const result = [];
  let listItems = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      result.push(
        <ul key={`ul-${key}`} className="list-none space-y-1 my-1">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="text-accent-blue mt-0.5 flex-shrink-0">•</span>
              <span>{parseBold(item)}</span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const parseBold = (str) => {
    const parts = str.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1
        ? <strong key={i} className="text-white font-semibold">{part}</strong>
        : part
    );
  };

  lines.forEach((line, idx) => {
    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    const numberedMatch = line.match(/^\d+\.\s+(.+)/);

    if (bulletMatch || numberedMatch) {
      listItems.push(bulletMatch ? bulletMatch[1] : numberedMatch[1]);
    } else {
      flushList(idx);
      if (line.trim() === '') {
        if (result.length > 0) result.push(<br key={`br-${idx}`} />);
      } else {
        result.push(<p key={idx} className="leading-relaxed">{parseBold(line)}</p>);
      }
    }
  });

  flushList('end');
  return result;
};

// ─── Suggestion chips ────────────────────────────────────────────────────────
const SUGGESTIONS_ID = [
  'Bulan ini saya boros di mana?',
  'Berapa total saldo saya?',
  'Tips hemat pengeluaran saya',
  'Analisis hutang saya',
];
const SUGGESTIONS_EN = [
  'Where did I overspend this month?',
  'What is my total balance?',
  'Tips to reduce my expenses',
  'Analyze my debts',
];

// ─── Main Component ──────────────────────────────────────────────────────────
const AIChatWidget = () => {
  const { t } = useTranslation();
  const lang = i18n.language || 'id';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]); // [{role: 'user'|'model', content: string}]
  const [input, setInput] = useState('');
  const [hasWelcomed, setHasWelcomed] = useState(false);

  const { sendMessage, loading } = useAIChat();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const suggestions = lang === 'en' ? SUGGESTIONS_EN : SUGGESTIONS_ID;

  // Auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Fokus ke input saat panel dibuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      // Tampilkan pesan selamat datang sekali
      if (!hasWelcomed) {
        setMessages([{ role: 'model', content: t('aiChatWelcome') }]);
        setHasWelcomed(true);
      }
    }
  }, [isOpen, hasWelcomed, t]);

  const handleSend = useCallback(async (text) => {
    const messageText = (text || input).trim();
    if (!messageText || loading) return;

    // Tambahkan pesan user ke tampilan
    const userMsg = { role: 'user', content: messageText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');

    // Buat history untuk API (kecuali pesan welcome)
    const apiHistory = updatedMessages
      .slice(0, -1) // semua kecuali yg baru ditambahkan
      .filter(m => m.role === 'user' || m.role === 'model')
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const reply = await sendMessage(messageText, apiHistory, lang);
      setMessages(prev => [...prev, { role: 'model', content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'error',
        content: t('aiChatError'),
      }]);
    }
  }, [input, loading, messages, sendMessage, lang, t]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([{ role: 'model', content: t('aiChatWelcome') }]);
  };

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────────────────── */}
      <button
        id="ai-chat-toggle"
        onClick={() => setIsOpen(v => !v)}
        aria-label="AI Financial Assistant"
        className={`
          fixed bottom-24 right-5 z-50 md:bottom-6 md:right-6
          w-14 h-14 rounded-full shadow-2xl
          flex items-center justify-center
          transition-all duration-300 ease-out
          bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700
          hover:scale-110 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]
          active:scale-95
          ${isOpen ? 'rotate-12' : ''}
        `}
      >
        {isOpen
          ? <ChevronDown size={22} className="text-white" />
          : (
            <span className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-40 animate-ping" />
              <Sparkles size={22} className="text-white relative" />
            </span>
          )
        }
      </button>

      {/* ── Chat Panel ──────────────────────────────────────────────────── */}
      <div
        className={`
          fixed z-50
          bottom-44 right-5 md:bottom-24 md:right-6
          w-[calc(100vw-2.5rem)] max-w-[400px]
          flex flex-col
          rounded-2xl overflow-hidden
          border border-white/10
          bg-[#0c0e1a]/90 backdrop-blur-2xl
          shadow-[0_25px_60px_rgba(0,0,0,0.6)]
          transition-all duration-300 ease-out origin-bottom-right
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
          }
        `}
        style={{ height: '520px' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8 bg-gradient-to-r from-indigo-950/60 to-violet-950/40 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight truncate">{t('aiChatTitle')}</p>
            <p className="text-[10px] text-gray-400 leading-tight truncate">{t('aiChatSubtitle')}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {messages.length > 1 && (
              <button
                onClick={handleClear}
                title={t('aiChatClear')}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/8 transition-all"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/8 transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 items-start ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700'
                  : msg.role === 'error'
                    ? 'bg-red-900/50 border border-red-700/50'
                    : 'bg-gradient-to-br from-violet-700 to-indigo-800'
                }
              `}>
                {msg.role === 'user'
                  ? <User size={13} className="text-white" />
                  : <Bot size={13} className="text-white" />
                }
              </div>

              {/* Bubble */}
              <div className={`
                max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-sm'
                  : msg.role === 'error'
                    ? 'bg-red-900/30 border border-red-700/30 text-red-300 rounded-tl-sm'
                    : 'bg-white/6 border border-white/8 text-gray-200 rounded-tl-sm'
                }
              `}>
                {msg.role === 'user'
                  ? <span>{msg.content}</span>
                  : <div className="space-y-1">{renderMarkdown(msg.content)}</div>
                }
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-700 to-indigo-800 flex items-center justify-center flex-shrink-0">
                <Bot size={13} className="text-white" />
              </div>
              <div className="bg-white/6 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="text-indigo-400 animate-spin" />
                <span className="text-xs text-gray-400">FinAI sedang berpikir...</span>
              </div>
            </div>
          )}

          {/* Suggestion Chips (hanya muncul saat baru 1 pesan = welcome) */}
          {messages.length === 1 && !loading && (
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400/50 transition-all duration-200 text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 px-3 py-3 border-t border-white/8 bg-[#0a0c18]/60">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('aiChatPlaceholder')}
              rows={1}
              disabled={loading}
              className="
                flex-1 resize-none rounded-xl px-3.5 py-2.5
                bg-white/6 border border-white/10
                text-sm placeholder-gray-500
                focus:outline-none focus:border-indigo-500/50 focus:bg-white/8
                transition-all duration-200
                min-h-[40px] max-h-[100px]
                scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10
                disabled:opacity-50
              "
              style={{ lineHeight: '1.4', color: '#f1f5f9', caretColor: '#818cf8', background: 'rgba(255,255,255,0.07)' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="
                w-10 h-10 rounded-xl flex-shrink-0
                bg-gradient-to-br from-blue-600 to-indigo-700
                flex items-center justify-center
                hover:from-blue-500 hover:to-indigo-600
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200 active:scale-95
                shadow-lg hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]
              "
            >
              {loading
                ? <Loader2 size={16} className="text-white animate-spin" />
                : <Send size={16} className="text-white" />
              }
            </button>
          </div>
          {/* Powered by */}
          <p className="text-center text-[10px] text-gray-600 mt-2">
            ✨ {t('aiChatPoweredBy')}
          </p>
        </div>
      </div>
    </>
  );
};

export default AIChatWidget;
