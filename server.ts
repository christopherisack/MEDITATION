import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Gemini initialization with telemetry header as required by guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to check API key
const checkApiKey = (res: Response): boolean => {
  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured in the server environment.',
    });
    return false;
  }
  return true;
};

// 1. Generate Meditation Script & Structure (using gemini-3.5-flash)
app.post('/api/meditation/generate-script', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;

  try {
    const {
      intention = 'Deep Relaxation & Stress Relief',
      durationMinutes = 5,
      voicePersona = 'Maya',
      visualTheme = 'Bioluminescent Sanctuary Forest',
      soundscape = 'Gentle Stream & Rain',
      customPrompt = '',
    } = req.body;

    const wordCount = Math.max(80, Math.min(1200, durationMinutes * 110));

    const systemPrompt = `You are an expert Zen meditation guide and mindfulness teacher.
Create a deeply calming, poetic, and somatic guided meditation script.
Guidelines:
- Include gentle breathing cues, pauses, and grounding mindfulness.
- Write natural meditative vocal markers like "<breath>", "<pause>", and gentle conversational affirmations.
- The script length should match approximately ${wordCount} words for a ${durationMinutes}-minute spoken session.
- Return strictly valid JSON matching the requested structure.`;

    const userPrompt = `Create a guided meditation session with:
- Intention: "${intention}"
- Target Spoken Duration: ${durationMinutes} minutes (~${wordCount} words)
- Voice Persona Guide: "${voicePersona}"
- Visual Environment: "${visualTheme}"
- Background Soundscape: "${soundscape}"
${customPrompt ? `- Additional User Notes: "${customPrompt}"` : ''}

Output strictly valid JSON with:
{
  "title": "A serene, inspiring title",
  "subtitle": "A poetic one-line subtitle",
  "description": "2-3 sentences describing the session experience",
  "durationMinutes": ${durationMinutes},
  "speechStyle": "Descriptive style prompt for TTS (e.g. 'Serene, warm feminine voice with slow grounding cadence and peaceful breaths')",
  "fullScript": "The complete, continuous spoken narrative formatted for speech with natural pauses and '<breath>' cues.",
  "segments": [
    {
      "id": "1",
      "phase": "Centering & Arrival",
      "text": "Script segment text...",
      "breathCue": "inhale" | "hold" | "exhale" | "rest",
      "durationSec": 30
    }
  ],
  "visualPrompt": "A highly detailed, visually stunning photographic / cinematic prompt for an AI image generator depicting this sanctuary scene without any humans or text, ethereal lighting, high depth of field, 8k resolution, serene natural atmosphere."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // Fallback cleanup if markdown formatting is present
      const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
      data = JSON.parse(clean);
    }

    res.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in /api/meditation/generate-script:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate meditation script',
    });
  }
});

// 2. High-Quality Image Generation (using gemini-3-pro-image-preview)
// Affordance for user to specify image size: 1K, 2K, 4K
app.post('/api/meditation/generate-image', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;

  try {
    const {
      prompt,
      imageSize = '1K', // "1K", "2K", "4K"
      aspectRatio = '16:9', // "16:9", "1:1", "9:16", "4:3"
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Validate imageSize
    const validSizes = ['1K', '2K', '4K'];
    const chosenSize = validSizes.includes(imageSize) ? imageSize : '1K';

    // Validate aspectRatio
    const validRatios = ['16:9', '1:1', '9:16', '4:3'];
    const chosenRatio = validRatios.includes(aspectRatio) ? aspectRatio : '16:9';

    const enhancedPrompt = `${prompt}, photorealistic, ultra-serene meditation environment, atmospheric depth, cinematic volumetric lighting, ethereal peaceful colors, masterwork composition, 8k resolution`;

    // Must use gemini-3-pro-image-preview as required
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: enhancedPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: chosenRatio,
          imageSize: chosenSize,
        },
      },
    });

    let imageUrl: string | null = null;
    let mimeType = 'image/png';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'No image data returned from image generation model.',
      });
    }

    res.json({
      success: true,
      imageUrl,
      imageSize: chosenSize,
      aspectRatio: chosenRatio,
      prompt,
    });
  } catch (err: any) {
    console.error('Error in /api/meditation/generate-image:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate visual image',
    });
  }
});

// 3. Text to Speech voiceover (using gemini-3.8-flash-tts)
app.post('/api/meditation/generate-voiceover', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;

  try {
    const {
      text,
      voiceName = 'Kore', // 'Kore', 'Fenrir', 'Puck', 'Charon', 'Zephyr'
      speechStyle = 'Serene, warm meditation guide with gentle calm cadence and peaceful breaths',
    } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS generation' });
    }

    // Clean up text if too long for a single unary TTS call (truncate cleanly or use focused script)
    // Gemini 3.8 flash TTS comfortably handles long narratives up to several minutes
    const trimmedText = text.trim();

    // Must use gemini-3.8-flash-tts as required
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmedText,
              speechMetadata: {
                style: speechStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName,
            },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType ||
      'audio/wav';

    if (!base64Audio) {
      return res.status(500).json({
        error: 'No audio data returned from TTS model.',
      });
    }

    // Unary default is a complete RIFF WAV (24kHz mono 16-bit)
    const audioUrl = `data:${mimeType};base64,${base64Audio}`;

    res.json({
      success: true,
      audioUrl,
      voiceName,
      speechStyle,
    });
  } catch (err: any) {
    console.error('Error in /api/meditation/generate-voiceover:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate voiceover audio',
    });
  }
});

// 4. Multi-turn Chatbot using Gemini
// Requirements:
// - Multi-turn chat interface
// - Maintain conversation history
// - Scrollable thread
// - Specific system instruction roles
// - Use gemini-3.1-pro-preview for particularly complex tasks
// - Use gemini-3.5-flash for general tasks
// - Use gemini-3.1-flash-lite for tasks that should happen fast
app.post('/api/chat', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;

  try {
    const {
      messages = [],
      rolePreset = 'general', // 'complex' | 'general' | 'fast'
      customInstruction = '',
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Map role presets to models and role system instructions as required
    let selectedModel = 'gemini-3.5-flash';
    let roleName = 'Zen Companion & Meditation Coach';
    let systemInstruction = '';

    if (rolePreset === 'complex') {
      selectedModel = 'gemini-3.1-pro-preview';
      roleName = 'Mindful Depth Guide & Somatic Inquiry';
      systemInstruction = `You are the Mindful Depth Guide & Somatic Inquiry Master, an advanced meditation sage specializing in complex emotional processing, somatic exploration, shadow integration, neuroplastic habit formation, and tailored long-term mindfulness curriculums.
Your demeanor is deeply compassionate, wise, articulate, grounded, and psychologically attuned.
Address the user with profound care, helping them untangle deep-seated anxieties, somatic body tension, grief, existential stress, and meditative challenges.
Offer rich, multi-layered guidance and suggest specific breathing or somatic practices when appropriate.`;
    } else if (rolePreset === 'fast') {
      selectedModel = 'gemini-3.1-flash-lite';
      roleName = 'Instant Calming Oracle & Breath Anchor';
      systemInstruction = `You are the Instant Calming Oracle & Breath Anchor. Your role is to deliver ultra-fast, potent, single-breath calming resets, emergency grounding anchors, soothing micro-affirmations, and immediate panic relief.
Keep responses concise, rhythmic, soothing, and immediately actionable (1-3 sentences or a quick 3-step breath cue). Radiate immediate stillness.`;
    } else {
      // Default / general
      selectedModel = 'gemini-3.5-flash';
      roleName = 'Zen Companion & Meditation Coach';
      systemInstruction = `You are Aura, an empathetic Zen Companion and Meditation Teacher.
Your role is to guide everyday mindfulness practice, answer questions about meditation postures, breathwork techniques (Box breathing, 4-7-8, Pranayama), discuss post-meditation experiences, and help users design custom meditation sessions.
Your tone is warm, serene, uplifting, and grounded.
If the user seems interested in practicing right now, offer a clear theme, duration, and imagery suggestion that they can generate in the app.`;
    }

    if (customInstruction) {
      systemInstruction += `\nAdditional user guidance: ${customInstruction}`;
    }

    // Prepare contents array from conversation history
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '') }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        temperature: rolePreset === 'fast' ? 0.4 : 0.7,
      },
    });

    const reply = response.text || '';

    res.json({
      success: true,
      reply,
      modelUsed: selectedModel,
      roleName,
    });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({
      error: err.message || 'Failed to complete chat interaction',
    });
  }
});

// Configure Vite middleware in dev or static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
