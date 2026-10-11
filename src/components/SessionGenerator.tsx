import React, { useState } from 'react';
import {
  Sparkles,
  Mic,
  Image as ImageIcon,
  Clock,
  Layers,
  Wand2,
  Play,
  RotateCcw,
  Check,
  AlertCircle,
  Loader2,
  Download,
  Info,
  Sliders,
  Compass,
  Radio,
  Volume2,
} from 'lucide-react';
import {
  MeditationSession,
  ImageResolution,
  AspectRatioType,
  VoicePersonaKey,
  SoundscapeType,
  ScriptSegment,
} from '../types/meditation';

interface SessionGeneratorProps {
  onSessionCreated: (session: MeditationSession) => void;
  initialPrompt?: string;
  initialIntention?: string;
}

export const SessionGenerator: React.FC<SessionGeneratorProps> = ({
  onSessionCreated,
  initialPrompt = '',
  initialIntention = '',
}) => {
  // Intentions & Themes
  const INTENTION_PRESETS = [
    { id: 'stress', title: 'Work Stress & Burnout Relief', desc: 'Somatic grounding, tension release, soft nervous system reset' },
    { id: 'sleep', title: 'Deep Slumber & Insomnia Melt', desc: 'Hypnotic cadence, slowing breath, drift into heavy tranquility' },
    { id: 'morning', title: 'Morning Awakening & Vitality', desc: 'Invigorating breath, radiant optimism, clear laser focus' },
    { id: 'anxiety', title: 'Panic & Racing Thoughts Calm', desc: 'Rapid grounding anchors, Box breathing, physical stabilization' },
    { id: 'gratitude', title: 'Heart Center & Emotional Healing', desc: 'Loving kindness, self-compassion, open chest warmth' },
    { id: 'forest', title: 'Ancient Forest Sanctuary Walk', desc: 'Lush bioluminescence, damp earth smells, gentle rain' },
    { id: 'cosmic', title: 'Cosmic Perspective & Starlight', desc: 'Weightless expansion, infinite horizon, ego dissolution' },
  ];

  // Visual Atmosphere Themes
  const VISUAL_THEMES = [
    { id: 'bioluminescent', title: 'Bioluminescent Sanctuary Forest', prompt: 'An enchanting bioluminescent ancient moss forest with glowing turquoise and emerald willow tendrils, soft volumetric fog, peaceful starlit reflecting pool' },
    { id: 'cosmic', title: 'Cosmic Starlight & Violet Nebula', prompt: 'A vast celestial ocean of deep indigo and soft violet nebulae, floating stardust filaments, cinematic tranquility, tranquil planetary horizon' },
    { id: 'sunrise', title: 'Misty Mountain Temple Dawn', prompt: 'A majestic sacred mountain peak bathed in rose-gold morning light, floating clouds below, serene stone meditation pagoda, serene timelessness' },
    { id: 'water', title: 'Japanese Zen Lotus Pond', prompt: 'A pristine Japanese Zen rock and water garden at twilight, floating pink lotus blossoms, smooth river pebbles, glass-like water reflections' },
    { id: 'dunes', title: 'Golden Hour Coastal Dunes', prompt: 'Endless rolling desert sand dunes kissed by low amber sunlight, subtle wind ripples, vast quiet horizon, serene warm solitude' },
    { id: 'aurora', title: 'Glacial Lagoon Under Northern Lights', prompt: 'A still glacial mirror lagoon beneath waving green and violet aurora borealis, crystalline ice formations, starry silent night' },
  ];

  // Voice Personas (Using Gemini 3.8 Flash TTS prebuilt voices)
  const VOICE_PERSONAS = [
    { key: 'Maya' as VoicePersonaKey, voiceName: 'Kore' as const, title: 'Maya (Nurturing & Warm)', desc: 'Gentle, maternal presence with deep grounding pauses' },
    { key: 'Daniel' as VoicePersonaKey, voiceName: 'Fenrir' as const, title: 'Daniel (Deep & Resonant)', desc: 'Low, steady, rhythmic anchor with masculine cadence' },
    { key: 'Zephyr' as VoicePersonaKey, voiceName: 'Zephyr' as const, title: 'Zephyr (Ethereal & Whispering)', desc: 'Soft, mystical, contemplative breathwork guide' },
    { key: 'Puck' as VoicePersonaKey, voiceName: 'Puck' as const, title: 'Puck (Uplifting & Bright)', desc: 'Clear, crisp, motivating guide for morning focus' },
    { key: 'Charon' as VoicePersonaKey, voiceName: 'Charon' as const, title: 'Charon (Hypnotic & Slow)', desc: 'Deep, sleepy, trance-like guide for bedtime stillness' },
  ];

  // Form State
  const [selectedIntention, setSelectedIntention] = useState(
    initialIntention || INTENTION_PRESETS[0].title
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [selectedVoice, setSelectedVoice] = useState<VoicePersonaKey>('Maya');
  const [speechStylePrompt, setSpeechStylePrompt] = useState(
    'Serene, warm meditation guide with gentle calm cadence and peaceful breaths'
  );
  const [selectedVisualTheme, setSelectedVisualTheme] = useState(VISUAL_THEMES[0].title);
  const [customVisualPrompt, setCustomVisualPrompt] = useState(VISUAL_THEMES[0].prompt);

  // Feature 2 Requirement: AFFORDANCE FOR IMAGE SIZE (1K, 2K, 4K)
  const [imageSize, setImageSize] = useState<ImageResolution>('2K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');

  const [soundscape, setSoundscape] = useState<SoundscapeType>('rain');
  const [userNotes, setUserNotes] = useState(initialPrompt);

  // Generation Steps & States
  const [generationStep, setGenerationStep] = useState<
    'idle' | 'scripting' | 'imaging' | 'voicing' | 'completed' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Generated Assets
  const [generatedScriptData, setGeneratedScriptData] = useState<{
    title: string;
    subtitle: string;
    description: string;
    fullScript: string;
    segments: ScriptSegment[];
    visualPrompt?: string;
  } | null>(null);

  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);

  // Handle Visual Theme change
  const handleVisualThemeSelect = (themeTitle: string) => {
    setSelectedVisualTheme(themeTitle);
    const found = VISUAL_THEMES.find((t) => t.title === themeTitle);
    if (found) {
      setCustomVisualPrompt(found.prompt);
    }
  };

  // Main Orchestrator: Generate Full Session
  const handleGenerateFullSession = async () => {
    setErrorMessage('');
    setGenerationStep('scripting');
    setStatusMessage('Channeling meditative mindfulness script with gemini-3.5-flash...');

    try {
      // 1. Script Generation
      const scriptRes = await fetch('/api/meditation/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intention: selectedIntention,
          durationMinutes,
          voicePersona: selectedVoice,
          visualTheme: selectedVisualTheme,
          soundscape,
          customPrompt: userNotes,
        }),
      });

      const scriptJson = await scriptRes.json();
      if (!scriptRes.ok || !scriptJson.success) {
        throw new Error(scriptJson.error || 'Failed to generate meditation script');
      }

      const scriptData = scriptJson.data;
      setGeneratedScriptData(scriptData);

      // 2. High-Quality Image Generation (gemini-3-pro-image-preview)
      setGenerationStep('imaging');
      setStatusMessage(
        `Synthesizing ${imageSize} visual artwork with gemini-3-pro-image-preview...`
      );

      const promptToUse = scriptData.visualPrompt || customVisualPrompt;

      const imgRes = await fetch('/api/meditation/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          imageSize, // 1K, 2K, 4K affordance
          aspectRatio, // 16:9, 1:1, etc.
        }),
      });

      const imgJson = await imgRes.json();
      if (!imgRes.ok || !imgJson.success) {
        throw new Error(imgJson.error || 'Failed to generate visual artwork');
      }

      const finalImageUrl = imgJson.imageUrl;
      setGeneratedImageUrl(finalImageUrl);

      // 3. Spoken Voiceover Synthesis (gemini-3.8-flash-tts)
      setGenerationStep('voicing');
      setStatusMessage(
        `Synthesizing vocal guidance with model gemini-3.8-flash-tts (${selectedVoice})...`
      );

      const voicePersonaObj = VOICE_PERSONAS.find((v) => v.key === selectedVoice) || VOICE_PERSONAS[0];

      const voiceRes = await fetch('/api/meditation/generate-voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scriptData.fullScript,
          voiceName: voicePersonaObj.voiceName,
          speechStyle: scriptData.speechStyle || speechStylePrompt,
        }),
      });

      const voiceJson = await voiceRes.json();
      if (!voiceRes.ok || !voiceJson.success) {
        throw new Error(voiceJson.error || 'Failed to synthesize voiceover audio');
      }

      const finalAudioUrl = voiceJson.audioUrl;
      setGeneratedAudioUrl(finalAudioUrl);

      setGenerationStep('completed');
      setStatusMessage('Your bespoke sanctuary session is ready to experience.');

      // Build session object
      const newSession: MeditationSession = {
        id: `custom-${Date.now()}`,
        title: scriptData.title || selectedIntention,
        subtitle: scriptData.subtitle || `A bespoke ${durationMinutes}-minute journey with ${selectedVoice}`,
        description: scriptData.description || 'Custom generated guided mindfulness session.',
        durationMinutes,
        voicePersona: selectedVoice,
        voiceName: voicePersonaObj.voiceName,
        speechStyle: scriptData.speechStyle || speechStylePrompt,
        visualTheme: selectedVisualTheme,
        visualPrompt: promptToUse,
        imageSize,
        aspectRatio,
        imageUrl: finalImageUrl,
        soundscape,
        fullScript: scriptData.fullScript,
        audioUrl: finalAudioUrl,
        createdAt: new Date().toISOString(),
        isCustom: true,
        segments: scriptData.segments || [],
      };

      // Save to localStorage
      try {
        const stored = localStorage.getItem('aurazen_custom_sessions');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(newSession);
        localStorage.setItem('aurazen_custom_sessions', JSON.stringify(list));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }

      // Auto launch in player
      onSessionCreated(newSession);
    } catch (err: any) {
      console.error('Generation pipeline error:', err);
      setGenerationStep('error');
      setErrorMessage(err.message || 'An unexpected error occurred during generation.');
    }
  };

  // Standalone Step: Regenerate Visual Only (e.g. user toggles 1K to 4K)
  const handleRegenerateImageOnly = async () => {
    if (!generatedScriptData && !customVisualPrompt) return;
    setGenerationStep('imaging');
    setStatusMessage(`Synthesizing new ${imageSize} visual with gemini-3-pro-image-preview...`);
    setErrorMessage('');

    try {
      const promptToUse = generatedScriptData?.visualPrompt || customVisualPrompt;
      const imgRes = await fetch('/api/meditation/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          imageSize,
          aspectRatio,
        }),
      });

      const imgJson = await imgRes.json();
      if (!imgRes.ok || !imgJson.success) {
        throw new Error(imgJson.error || 'Failed to regenerate visual');
      }

      setGeneratedImageUrl(imgJson.imageUrl);
      setGenerationStep('completed');
      setStatusMessage(`New ${imageSize} artwork generated.`);
    } catch (err: any) {
      setGenerationStep('error');
      setErrorMessage(err.message || 'Failed to generate visual');
    }
  };

  // Standalone Step: Regenerate Voiceover Only (e.g. user changes voice to Daniel)
  const handleRegenerateAudioOnly = async () => {
    if (!generatedScriptData?.fullScript) return;
    setGenerationStep('voicing');
    setStatusMessage(`Re-synthesizing voiceover with gemini-3.8-flash-tts (${selectedVoice})...`);
    setErrorMessage('');

    try {
      const voicePersonaObj = VOICE_PERSONAS.find((v) => v.key === selectedVoice) || VOICE_PERSONAS[0];
      const voiceRes = await fetch('/api/meditation/generate-voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: generatedScriptData.fullScript,
          voiceName: voicePersonaObj.voiceName,
          speechStyle: speechStylePrompt,
        }),
      });

      const voiceJson = await voiceRes.json();
      if (!voiceRes.ok || !voiceJson.success) {
        throw new Error(voiceJson.error || 'Failed to synthesize voiceover');
      }

      setGeneratedAudioUrl(voiceJson.audioUrl);
      setGenerationStep('completed');
      setStatusMessage('New voiceover synthesized successfully.');
    } catch (err: any) {
      setGenerationStep('error');
      setErrorMessage(err.message || 'Failed to synthesize voiceover');
    }
  };

  const isBusy = generationStep === 'scripting' || generationStep === 'imaging' || generationStep === 'voicing';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Studio Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Meditation Session Studio</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-white tracking-wide mb-3">
            Craft Your Bespoke Sanctuary Session
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
            Generate custom guided mindfulness with <strong className="text-emerald-300 font-normal">gemini-3-pro-image-preview</strong> high-resolution visuals (1K, 2K, 4K), studio voiceovers powered by <strong className="text-teal-300 font-normal">gemini-3.8-flash-tts</strong>, and personalized somatic scripts.
          </p>
        </div>
      </div>

      {/* Progress / Status Alert */}
      {isBusy && (
        <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-xl shadow-2xl flex items-center gap-4 text-emerald-200 animate-in fade-in zoom-in-95">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <Sparkles className="w-4 h-4 text-teal-300 absolute" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-white uppercase tracking-wider">
                {generationStep === 'scripting' && 'Step 1/3: Crafting Mindful Script'}
                {generationStep === 'imaging' && 'Step 2/3: Generating High-Resolution Artwork'}
                {generationStep === 'voicing' && 'Step 3/3: Synthesizing Vocal Expression'}
              </span>
              <span className="text-xs text-emerald-300">
                {generationStep === 'scripting' && 'gemini-3.5-flash'}
                {generationStep === 'imaging' && `gemini-3-pro-image-preview (${imageSize})`}
                {generationStep === 'voicing' && 'gemini-3.8-flash-tts'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-light">{statusMessage}</p>
            {/* Visual Step Progress Bar */}
            <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-700 ${
                  generationStep === 'scripting'
                    ? 'w-1/3'
                    : generationStep === 'imaging'
                    ? 'w-2/3'
                    : 'w-full'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-white">Generation Error</h4>
            <p className="text-xs text-rose-200 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Studio Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Core Session Parameters (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Intention & Duration */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4 text-emerald-400 text-sm font-semibold">
              <Compass className="w-4 h-4" />
              <span>1. Session Intention & Duration</span>
            </div>

            {/* Intention Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
              {INTENTION_PRESETS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIntention(item.title)}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    selectedIntention === item.title
                      ? 'bg-emerald-500/15 border-emerald-400/50 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">{item.title}</span>
                    {selectedIntention === item.title && (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                </button>
              ))}
            </div>

            {/* Custom or additional prompt notes */}
            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-medium text-slate-300">
                Custom Intention or Specific Somatic Requests (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Focus on releasing tension in my tight neck and shoulders..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500/50 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            {/* Duration Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Session Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { m: 2, label: '2 min', tag: 'Micro Reset' },
                  { m: 5, label: '5 min', tag: 'Balanced' },
                  { m: 10, label: '10 min', tag: 'Deep Dive' },
                  { m: 15, label: '15 min', tag: 'Extended' },
                ].map((item) => (
                  <button
                    key={item.m}
                    type="button"
                    onClick={() => setDurationMinutes(item.m)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      durationMinutes === item.m
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-white shadow-md'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-[10px] text-emerald-400/80 mt-0.5">{item.tag}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Visual Ambiance & High-Resolution Affordances */}
          {/* Requirement: Must use gemini-3-pro-image-preview and provide affordance for 1K, 2K, 4K */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold">
                <ImageIcon className="w-4 h-4" />
                <span>2. Bespoke Visual Artwork (gemini-3-pro-image-preview)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold uppercase tracking-wider">
                Model: gemini-3-pro-image-preview
              </span>
            </div>

            {/* Visual Environment Theme Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
              {VISUAL_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleVisualThemeSelect(theme.title)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedVisualTheme === theme.title
                      ? 'bg-cyan-500/15 border-cyan-400/50 text-white shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-semibold mb-0.5">{theme.title}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">
                    {theme.prompt}
                  </div>
                </button>
              ))}
            </div>

            {/* Image Prompt editor */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Artwork Scene Description Prompt
              </label>
              <textarea
                rows={2}
                value={customVisualPrompt}
                onChange={(e) => setCustomVisualPrompt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500/50 text-xs text-white placeholder-slate-500 outline-none resize-none"
              />
            </div>

            {/* CRITICAL AFFORDANCE: Image Size (1K, 2K, 4K) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  <span className="text-cyan-300 font-semibold">Image Resolution Affordance</span> (gemini-3-pro-image-preview)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1K', '2K', '4K'] as ImageResolution[]).map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setImageSize(res)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all ${
                        imageSize === res
                          ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 font-bold shadow-md shadow-cyan-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-sm">{res}</div>
                      <div className="text-[9px] text-slate-400 font-normal">
                        {res === '1K' && 'Standard'}
                        {res === '2K' && 'High-Def'}
                        {res === '4K' && 'Ultra 8K'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Affordance */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['16:9', '1:1', '9:16', '4:3'] as AspectRatioType[]).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all ${
                        aspectRatio === ratio
                          ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-medium">{ratio}</div>
                      <div className="text-[8px] text-slate-500">
                        {ratio === '16:9' && 'Cinema'}
                        {ratio === '1:1' && 'Mandala'}
                        {ratio === '9:16' && 'Phone'}
                        {ratio === '4:3' && 'Window'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Voiceover Persona & gemini-3.8-flash-tts */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold">
                <Mic className="w-4 h-4" />
                <span>3. Voiceover Persona (gemini-3.8-flash-tts)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-semibold uppercase tracking-wider">
                Model: gemini-3.8-flash-tts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-4">
              {VOICE_PERSONAS.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => setSelectedVoice(v.key)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedVoice === v.key
                      ? 'bg-teal-500/15 border-teal-400/50 text-white shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{v.title}</span>
                    {selectedVoice === v.key && (
                      <Check className="w-3.5 h-3.5 text-teal-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">{v.desc}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Vocal Expressive Style Prompt
              </label>
              <input
                type="text"
                value={speechStylePrompt}
                onChange={(e) => setSpeechStylePrompt(e.target.value)}
                placeholder="e.g. Serene, slow hypnotic cadence with gentle vocal breaths..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500/50 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Generation Action (1 Col) */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl backdrop-blur-xl">
            <h3 className="font-serif text-lg font-light text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Sanctuary Blueprint</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Intention:</span>
                <span className="text-white font-medium text-right max-w-[160px] truncate">
                  {selectedIntention}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Duration:</span>
                <span className="text-emerald-300 font-semibold">{durationMinutes} minutes</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Image Resolution:</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                  {imageSize} ({aspectRatio})
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Voiceover Guide:</span>
                <span className="text-teal-300 font-medium">
                  {selectedVoice} (Gemini 3.8 Flash TTS)
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Ambient Sound:</span>
                <span className="text-slate-200 capitalize">{soundscape}</span>
              </div>
            </div>

            {/* Launch Generation Button */}
            <div className="mt-6 pt-2">
              <button
                type="button"
                onClick={handleGenerateFullSession}
                disabled={isBusy}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all hover:scale-102 active:scale-98 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Synthesizing Session...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>Generate Complete Session</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Asset Preview Section (if generated) */}
          {(generatedImageUrl || generatedAudioUrl || generatedScriptData) && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Generated Session Assets</span>
              </h4>

              {/* Generated Image Preview */}
              {generatedImageUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 group">
                  <img
                    src={generatedImageUrl}
                    alt="Generated Visual"
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] text-cyan-300 border border-cyan-500/30">
                    {imageSize}
                  </div>
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={handleRegenerateImageOnly}
                      disabled={isBusy}
                      className="p-2 rounded-xl bg-slate-900/80 text-white hover:bg-slate-800 text-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Regenerate {imageSize}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Audio Player Preview */}
              {generatedAudioUrl && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-teal-400" />
                    <span className="text-xs text-slate-200">Voiceover Ready</span>
                  </div>
                  <audio controls src={generatedAudioUrl} className="h-8 w-44" />
                </div>
              )}

              {/* Script Title Preview */}
              {generatedScriptData && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <h5 className="text-xs font-semibold text-white">
                    {generatedScriptData.title}
                  </h5>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                    {generatedScriptData.subtitle}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
