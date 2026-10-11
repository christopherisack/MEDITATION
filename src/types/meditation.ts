export type ImageResolution = '1K' | '2K' | '4K';
export type AspectRatioType = '16:9' | '1:1' | '9:16' | '4:3';
export type VoicePersonaKey = 'Maya' | 'Daniel' | 'Zephyr' | 'Puck' | 'Charon';
export type SoundscapeType = 'none' | 'rain' | 'ocean' | 'singingBowl' | 'alphaDrone' | 'cosmicOm';

export interface ScriptSegment {
  id: string;
  phase: string;
  text: string;
  breathCue?: 'inhale' | 'hold' | 'exhale' | 'rest' | 'none';
  durationSec?: number;
}

export interface MeditationSession {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  durationMinutes: number;
  voicePersona: VoicePersonaKey;
  voiceName: 'Kore' | 'Fenrir' | 'Puck' | 'Charon' | 'Zephyr';
  speechStyle: string;
  visualTheme: string;
  visualPrompt: string;
  imageSize: ImageResolution;
  aspectRatio: AspectRatioType;
  imageUrl: string;
  soundscape: SoundscapeType;
  fullScript: string;
  audioUrl?: string;
  createdAt: string;
  isCustom?: boolean;
  segments: ScriptSegment[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  roleName?: string;
  suggestedSession?: Partial<MeditationSession>;
}

export type ChatRolePreset = 'complex' | 'general' | 'fast';
