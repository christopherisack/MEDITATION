import { MeditationSession } from '../types/meditation';

export const DEFAULT_SESSIONS: MeditationSession[] = [
  {
    id: 'session-bioluminescent-forest',
    title: 'Bioluminescent Sanctuary Forest',
    subtitle: 'Dissolve mental static in a radiant ancient woodland',
    description: 'Immerse your consciousness in an enchanted moss-covered forest glowing with ethereal turquoise and emerald light. Release heavy thoughts to the forest floor.',
    durationMinutes: 5,
    voicePersona: 'Maya',
    voiceName: 'Kore',
    speechStyle: 'Serene, warm feminine presence with slow meditative breaths and gentle grounding pauses',
    visualTheme: 'Bioluminescent Sanctuary Forest',
    visualPrompt: 'A breathtaking bioluminescent ancient woodland at twilight, luminous emerald moss, glowing turquoise flora and floating willow tendrils, soft volumetric fog, peaceful stream reflecting starlight, 8k resolution, serene meditation wallpaper',
    imageSize: '2K',
    aspectRatio: '16:9',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=2000&q=85',
    soundscape: 'rain',
    fullScript: `Welcome to this sacred space. <breath> Allow your eyes to soften, or gently close them completely.
Feel the weight of your body resting upon the earth, supported and held.
Take a slow, deep breath in through your nose... <breath>
And exhale completely, releasing any tension stored in your shoulders, your jaw, your forehead.
Imagine yourself standing at the edge of an ancient sanctuary forest.
The twilight air is cool and fragrant with pine and damp cedar.
Beneath your feet, soft velvet moss glows with gentle, soothing turquoise light.
With every inhale, draw that cool, healing luminescence into your chest. <breath>
And with every exhale, let whatever is heavy sink down into the damp earth, effortlessly recycled.
You are safe here. You are present. Rest in this still, radiant silence.`,
    createdAt: new Date().toISOString(),
    isCustom: false,
    segments: [
      { id: '1', phase: 'Centering', text: 'Welcome to this sacred space. Allow your eyes to soften, or gently close them completely.', breathCue: 'rest', durationSec: 15 },
      { id: '2', phase: 'Arrival', text: 'Feel the weight of your body resting upon the earth, supported and held.', breathCue: 'inhale', durationSec: 15 },
      { id: '3', phase: 'Breath Grounding', text: 'Take a slow, deep breath in through your nose... and exhale completely.', breathCue: 'exhale', durationSec: 20 },
      { id: '4', phase: 'Forest Visualization', text: 'Imagine standing at the edge of an ancient sanctuary forest where twilight velvet moss glows with soothing turquoise light.', breathCue: 'rest', durationSec: 25 },
      { id: '5', phase: 'Somatic Release', text: 'With every breath, release heavy thoughts to the earth. Rest in this still, radiant silence.', breathCue: 'exhale', durationSec: 25 },
    ],
  },
  {
    id: 'session-cosmic-starlight',
    title: 'Cosmic Starlight Stillness',
    subtitle: 'Expand your perspective into timeless galactic peace',
    description: 'Drift beyond earthly worries into an ocean of indigo stardust, nebular auroras, and timeless tranquility.',
    durationMinutes: 7,
    voicePersona: 'Daniel',
    voiceName: 'Fenrir',
    speechStyle: 'Deep, resonant, grounding voice with slow rhythmic cadence',
    visualTheme: 'Cosmic Starlight Nebula',
    visualPrompt: 'A vast cosmic expanse with deep indigo and violet nebulae, diamond starlight dust drifting peacefully, serene celestial horizon, cinematic scale, high contrast, 8k resolution',
    imageSize: '4K',
    aspectRatio: '16:9',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2000&q=85',
    soundscape: 'alphaDrone',
    fullScript: `Breathe in deeply. Expand your ribcage like the expanding universe. <breath>
And release. Let go of every small hurry, every appointment, every judgment.
Imagine your awareness floating weightless among quiet stars.
Distances fade. The silence of deep space is not empty—it is full of profound peace.
You are composed of the same stardust that formed the galaxies.
Feel the steady rhythm of your heartbeat aligning with the slow pulse of the cosmos. <breath>
Nothing to fix. Nothing to force. Just pure, unblemished presence.`,
    createdAt: new Date().toISOString(),
    isCustom: false,
    segments: [
      { id: '1', phase: 'Cosmic Awakening', text: 'Breathe in deeply. Expand your ribcage like the expanding universe.', breathCue: 'inhale', durationSec: 15 },
      { id: '2', phase: 'Letting Go', text: 'And release. Let go of every small hurry, every appointment, every judgment.', breathCue: 'exhale', durationSec: 20 },
      { id: '3', phase: 'Weightless Drift', text: 'Imagine your awareness floating weightless among quiet stars in deep indigo nebulae.', breathCue: 'rest', durationSec: 25 },
      { id: '4', phase: 'Celestial Alignment', text: 'Feel your heartbeat aligning with the slow pulse of the cosmos. Pure unblemished presence.', breathCue: 'hold', durationSec: 25 },
    ],
  },
  {
    id: 'session-golden-dunes',
    title: 'Golden Sunset Solitude',
    subtitle: 'Warmth and stillness on whispering desert dunes',
    description: 'Bask in the radiant amber glow of a setting sun across endless undulating dunes, warming your core and melting somatic tension.',
    durationMinutes: 5,
    voicePersona: 'Zephyr',
    voiceName: 'Zephyr',
    speechStyle: 'Whispering, soft meditative cadence with gentle rhythmic breathing',
    visualTheme: 'Golden Hour Coastal Dunes',
    visualPrompt: 'Endless serene sand dunes at golden hour, warm amber sun low on the horizon, delicate wind ripples in the sand, soft warm haze, cinematic minimalism, peaceful solitude, 8k resolution',
    imageSize: '2K',
    aspectRatio: '16:9',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2000&q=85',
    soundscape: 'singingBowl',
    fullScript: `Feel the warm golden sun touching your face. <breath>
A gentle breeze whispers across the golden dunes, carrying away the noise of the day.
Inhale the radiant warmth into your center.
Hold that warmth... feel it relaxing every muscle.
And exhale softly, like warm sand slipping gently between your fingers.
Here, time slows down. The horizon is vast and unbroken.
You are grounded. You are at peace.`,
    createdAt: new Date().toISOString(),
    isCustom: false,
    segments: [
      { id: '1', phase: 'Solar Arrival', text: 'Feel the warm golden sun touching your face.', breathCue: 'inhale', durationSec: 15 },
      { id: '2', phase: 'Wind Release', text: 'A gentle breeze whispers across golden dunes, carrying away the noise of the day.', breathCue: 'exhale', durationSec: 20 },
      { id: '3', phase: 'Core Warming', text: 'Inhale radiant warmth into your center... hold... and exhale softly like warm sand.', breathCue: 'hold', durationSec: 25 },
      { id: '4', phase: 'Grounding Stillness', text: 'Here, time slows down. The horizon is vast and unbroken. You are at peace.', breathCue: 'rest', durationSec: 25 },
    ],
  },
  {
    id: 'session-zen-water-garden',
    title: 'Misty Lotus Water Garden',
    subtitle: 'Clarity, purification, and flowing awareness',
    description: 'Listen to the droplet rhythms of a serene temple pond surrounded by blooming water lilies and smooth river stones.',
    durationMinutes: 4,
    voicePersona: 'Maya',
    voiceName: 'Kore',
    speechStyle: 'Serene, peaceful, crystalline tone with natural meditative spacing',
    visualTheme: 'Misty Lotus Temple Pond',
    visualPrompt: 'A serene Japanese Zen water garden at dawn with blooming pink water lilies, smooth river pebbles underwater, gentle morning mist swirling over glass-like water, bamboo fountain, 8k resolution',
    imageSize: '1K',
    aspectRatio: '16:9',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85',
    soundscape: 'ocean',
    fullScript: `Notice how water never fights the stone—it simply flows around it. <breath>
Inhale clarity.
Exhale resistance.
Imagine a single ripple on the surface of a crystal pond, slowly expanding, smoothing out until the surface is still like glass.
Allow your mind to become that glass surface.
Every thought that arises is simply a leaf floating past. You do not need to grab it.
Just watch it drift on the current, and return to your breath.`,
    createdAt: new Date().toISOString(),
    isCustom: false,
    segments: [
      { id: '1', phase: 'Water Wisdom', text: 'Notice how water never fights the stone—it simply flows around it.', breathCue: 'inhale', durationSec: 15 },
      { id: '2', phase: 'Purifying Breath', text: 'Inhale clarity. Exhale resistance.', breathCue: 'exhale', durationSec: 20 },
      { id: '3', phase: 'Glass Surface', text: 'Allow your mind to become still like glass, watching thoughts drift like fallen leaves.', breathCue: 'rest', durationSec: 30 },
    ],
  },
];
