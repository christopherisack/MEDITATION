import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  Zap,
  Brain,
  Smile,
  Compass,
  ArrowRight,
  Loader2,
  RefreshCw,
  Heart,
  Wind,
  ShieldCheck,
} from 'lucide-react';
import { ChatMessage, ChatRolePreset } from '../types/meditation';

interface MindfulChatGuideProps {
  onBuildSessionFromChat: (intention: string, promptNotes: string) => void;
}

export const MindfulChatGuide: React.FC<MindfulChatGuideProps> = ({
  onBuildSessionFromChat,
}) => {
  // Roles matching the exact requirements:
  // - gemini-3.1-pro-preview for complex tasks
  // - gemini-3.5-flash for general tasks
  // - gemini-3.1-flash-lite for tasks that should happen fast
  const ROLE_CONFIGS: Record<
    ChatRolePreset,
    {
      name: string;
      model: string;
      icon: any;
      badgeColor: string;
      desc: string;
      roleTitle: string;
      suggestedQuestions: string[];
    }
  > = {
    complex: {
      name: 'Deep Somatic Inquiry & Mindfulness Sage',
      model: 'gemini-3.1-pro-preview',
      icon: Brain,
      badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
      roleTitle: 'Complex Tasks (gemini-3.1-pro-preview)',
      desc: 'In-depth emotional deconstruction, somatic nervous system tension, existential mindfulness, and custom tailored 7-day meditation curricula.',
      suggestedQuestions: [
        'How can I untangle chronic chest tension and subconscious work anxiety?',
        'Design a tailored 7-day somatic mindfulness routine for burnout recovery.',
        'Why do deep emotional surges or tears arise during silent meditation?',
      ],
    },
    general: {
      name: 'Zen Companion & Everyday Coach',
      model: 'gemini-3.5-flash',
      icon: Smile,
      badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      roleTitle: 'General Tasks (gemini-3.5-flash)',
      desc: 'Daily meditation practice, posture, breathing technique exploration, mindfulness reflections, and session planning.',
      suggestedQuestions: [
        'How do I gently refocus when my mind wanders every 10 seconds?',
        'What is the physiological difference between Box Breathing and 4-7-8?',
        'Suggest a 5-minute mid-afternoon reset session for screen fatigue.',
      ],
    },
    fast: {
      name: 'Instant Calming Oracle & Breath Anchor',
      model: 'gemini-3.1-flash-lite',
      icon: Zap,
      badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
      roleTitle: 'Fast Tasks (gemini-3.1-flash-lite)',
      desc: 'Ultra-fast emergency panic reset, single-breath somatic anchors, and rapid calming mantras.',
      suggestedQuestions: [
        'Emergency reset: I feel a panic spike coming on right now.',
        'Give me a 1-sentence grounding mantra for difficult meetings.',
        'Quick 30-second breath anchor before my presentation.',
      ],
    },
  };

  const [activeRole, setActiveRole] = useState<ChatRolePreset>('general');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem('aurazen_chat_history');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Peace and stillness to you. I am Aura, your mindful companion.
Whether you seek deep somatic inquiry with **gemini-3.1-pro-preview**, everyday meditation guidance with **gemini-3.5-flash**, or an instant calming breath check with **gemini-3.1-flash-lite**, I am here to support your awareness.

How does your mind and body feel in this present moment?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash',
        roleName: 'Zen Companion & Everyday Coach',
      },
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aurazen_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat history:', e);
    }
  }, [messages]);

  // Auto scroll to bottom of thread
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send entire history for multi-turn conversational context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          rolePreset: activeRole,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get guide reply');
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
        roleName: data.roleName,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        content: `I encountered a momentary stillness disruption: ${
          err.message || 'Please try again in a moment.'
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const initial: ChatMessage[] = [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `A fresh breath. The slate is clear. How may I guide your meditation practice today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: ROLE_CONFIGS[activeRole].model,
        roleName: ROLE_CONFIGS[activeRole].name,
      },
    ];
    setMessages(initial);
    localStorage.removeItem('aurazen_chat_history');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentRoleConfig = ROLE_CONFIGS[activeRole];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Chat Header & Role Switcher */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bot className="w-5 h-5 text-emerald-400" />
              <h2 className="font-serif text-2xl font-light text-white">
                Mindful AI Meditation Guide
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Multi-turn conversational companion with role-specific Gemini intelligence.
            </p>
          </div>

          <button
            onClick={handleClearHistory}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-rose-300 transition-all"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Thread</span>
          </button>
        </div>

        {/* Model & Role Selection Bar */}
        <div className="pt-4">
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Select Chatbot Role & Gemini Model:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {(['complex', 'general', 'fast'] as ChatRolePreset[]).map((key) => {
              const r = ROLE_CONFIGS[key];
              const Icon = r.icon;
              const isSelected = activeRole === key;

              return (
                <button
                  key={key}
                  onClick={() => setActiveRole(key)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-400/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {key === 'complex' && 'Complex Tasks'}
                        {key === 'general' && 'General Tasks'}
                        {key === 'fast' && 'Fast Tasks'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-emerald-300/80 mb-1">
                    {r.model}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                    {r.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Scrollable Chat Thread Container */}
      <div className="rounded-3xl bg-slate-950/80 border border-slate-800/80 shadow-2xl backdrop-blur-xl flex flex-col h-[540px] overflow-hidden">
        {/* Scrollable Message History Area */}
        <div
          ref={scrollRef}
          className="flex-1 p-6 overflow-y-auto space-y-5 scroll-smooth"
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-lg transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/40 text-slate-100 rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Meta Bar on Assistant messages */}
                  {!isUser && (
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 mb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-400">
                          {msg.roleName || currentRoleConfig.name}
                        </span>
                        {msg.modelUsed && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {msg.modelUsed}
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500">{msg.timestamp}</span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-light">
                    {msg.content}
                  </div>

                  {/* Actions for Assistant replies */}
                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      {/* Copy message button */}
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {/* Convert this advice into a Custom Session in Studio */}
                      <button
                        onClick={() =>
                          onBuildSessionFromChat(
                            'Guided Meditation based on AI Consultation',
                            msg.content.slice(0, 300)
                          )
                        }
                        className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 font-medium hover:underline"
                      >
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Build Session From Advice</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {isUser && (
                    <div className="text-right text-[10px] text-emerald-300/60 mt-1">
                      {msg.timestamp}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3.5 justify-start animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>
                  Channeling response via <strong className="text-emerald-300 font-mono">{currentRoleConfig.model}</strong>...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Starter Prompts */}
        <div className="px-6 py-2 bg-slate-950 border-t border-slate-900 overflow-x-auto flex gap-2 no-scrollbar">
          {currentRoleConfig.suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-emerald-300 transition-all shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask the ${currentRoleConfig.name} (${currentRoleConfig.model})...`}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-emerald-500/50 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
