/**
 * Web Audio API synthesizer for ambient meditation soundscapes.
 * Completely self-contained, no external audio file dependencies.
 */

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private currentType: string = 'none';
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private isMuted: boolean = false;
  private volume: number = 0.35;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public stop() {
    this.currentType = 'none';
    this.activeNodes.forEach((node) => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          if ('stop' in node && typeof (node as any).stop === 'function') {
            (node as any).stop();
          }
          node.disconnect();
        } catch {
          // Ignore
        }
      }
    });
    this.activeNodes = [];
  }

  public play(type: 'none' | 'rain' | 'ocean' | 'singingBowl' | 'alphaDrone' | 'cosmicOm') {
    this.initContext();
    this.stop();
    this.currentType = type;

    if (!this.ctx || !this.masterGain || type === 'none') return;

    switch (type) {
      case 'rain':
        this.startRain();
        break;
      case 'ocean':
        this.startOcean();
        break;
      case 'singingBowl':
        this.startSingingBowl();
        break;
      case 'alphaDrone':
        this.startAlphaDrone();
        break;
      case 'cosmicOm':
        this.startCosmicOm();
        break;
    }
  }

  // Pink noise generator for soothing rain
  private createNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No audio context');
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private startRain() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer();
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Gentle low-pass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.activeNodes.push(noise, filter, gain);
  }

  private startOcean() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer();
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    // LFO for wave swelling
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8 second wave cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterGain);

    lfo.start();
    noise.start();
    this.activeNodes.push(noise, filter, lfo, lfoGain, waveGain);
  }

  private startAlphaDrone() {
    if (!this.ctx || !this.masterGain) return;
    // 432 Hz base carrier with 8 Hz alpha binaural difference
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const oscSub = this.ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(216, this.ctx.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(224, this.ctx.currentTime); // 8Hz alpha wave beat

    oscSub.type = 'triangle';
    oscSub.frequency.setValueAtTime(108, this.ctx.currentTime);

    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();
    const gainSub = this.ctx.createGain();

    gain1.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain2.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gainSub.gain.setValueAtTime(0.08, this.ctx.currentTime);

    osc1.connect(gain1);
    osc2.connect(gain2);
    oscSub.connect(gainSub);

    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);
    gainSub.connect(this.masterGain);

    osc1.start();
    osc2.start();
    oscSub.start();
    this.activeNodes.push(osc1, osc2, oscSub, gain1, gain2, gainSub);
  }

  private startCosmicOm() {
    if (!this.ctx || !this.masterGain) return;
    // 136.1 Hz (Earth Om frequency)
    const baseFreq = 136.1;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 2, this.ctx.currentTime);

    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(baseFreq * 0.5, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    osc3.start();
    this.activeNodes.push(osc1, osc2, osc3, filter, gain);
  }

  private startSingingBowl() {
    if (!this.ctx || !this.masterGain) return;
    // Continuous periodic gentle singing bowl chime strike every 14 seconds
    this.strikeBowl();
    const intervalId = window.setInterval(() => {
      this.strikeBowl();
    }, 14000);
    this.activeNodes.push(intervalId);
  }

  public strikeBowl() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const fundamental = 261.63; // C4 Tibetan bell
    const harmonics = [fundamental, fundamental * 2.76, fundamental * 4.75, fundamental * 5.4];
    const decays = [8.0, 6.0, 4.0, 3.0];
    const gains = [0.3, 0.15, 0.08, 0.04];

    harmonics.forEach((freq, index) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(gains[index], this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + decays[index]);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + decays[index]);
    });
  }

  public getCurrentType() {
    return this.currentType;
  }
}

export const soundscapes = new SoundscapeEngine();
