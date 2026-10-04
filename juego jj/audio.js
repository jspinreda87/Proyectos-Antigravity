/**
 * ========================================================
 * AUDIO ENGINE - WEB AUDIO API
 * Sintetizador Chiptune / Retro Arcade en Tiempo Real
 * Cero dependencias de archivos externos, latencia cero.
 * ========================================================
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    
    // Música procedural
    this.musicInterval = null;
    this.isPlayingMusic = false;
    this.currentBeat = 0;
    this.currentLevelIndex = 0;
    
    // Configuración musical por nivel
    this.levelTracks = [
      {
        bpm: 130,
        scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25], // C Major Pentatonic
        bassNotes: [130.81, 130.81, 146.83, 164.81],
        leadWave: 'square',
        bassWave: 'sawtooth'
      },
      {
        bpm: 140,
        scale: [220.00, 246.94, 261.63, 293.66, 329.63, 392.00, 440.00], // A Minor
        bassNotes: [110.00, 110.00, 130.81, 146.83],
        leadWave: 'sawtooth',
        bassWave: 'triangle'
      },
      {
        bpm: 152,
        scale: [293.66, 329.63, 349.23, 392.00, 440.00, 523.25, 587.33], // D Minor synth
        bassNotes: [146.83, 130.81, 116.54, 146.83],
        leadWave: 'square',
        bassWave: 'sawtooth'
      },
      {
        bpm: 165,
        scale: [196.00, 207.65, 233.08, 261.63, 277.18, 311.13, 392.00], // Cyber Phrygian
        bassNotes: [98.00, 103.83, 116.54, 98.00],
        leadWave: 'sawtooth',
        bassWave: 'square'
      }
    ];
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    } catch (e) {
      console.warn("AudioContext no soportado o bloqueado:", e);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.5, this.ctx.currentTime);
    }
    return !this.isMuted;
  }

  // ==========================================
  // EFECTOS DE SONIDO (SFX)
  // ==========================================

  playJump() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    const now = this.ctx.currentTime;
    
    // Barrido de frecuencia ascendente estilo 8-bit
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playPadBounce() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.18);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  playOrbTap() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc2.type = 'square';
    const now = this.ctx.currentTime;
    
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15);
    
    osc2.frequency.setValueAtTime(1046.50, now);
    osc2.frequency.exponentialRampToValueAtTime(2093.00, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.22);
    osc2.stop(now + 0.22);
  }

  playCrash() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Buffer de ruido blanco
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Filtro pasa-bajos que cae
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    // Onda de impacto baja (rumble)
    const rumble = this.ctx.createOscillator();
    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(110, now);
    rumble.frequency.exponentialRampToValueAtTime(30, now + 0.3);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.4, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

    rumble.connect(rumbleGain);
    rumbleGain.connect(this.sfxGain);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    rumble.start(now);
    noise.stop(now + 0.36);
    rumble.stop(now + 0.36);
  }

  playVictory() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    // Fanfarria arpegiada estilo triunfo arcade
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    const now = this.ctx.currentTime;
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startT = now + (idx * 0.08);
      const dur = 0.28;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.3, startT);
      gain.gain.exponentialRampToValueAtTime(0.01, startT + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startT);
      osc.stop(startT + dur);
    });
  }

  playPortal() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  playCheckpoint() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.setValueAtTime(880.00, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  playTransform() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.12);
    osc.frequency.linearRampToValueAtTime(440, now + 0.22);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  playLanding() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  playClick() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // ==========================================
  // MOTOR DE MÚSICA CHIPTUNE PROCEDURAL
  // ==========================================

  startMusic(levelIdx = 0) {
    this.stopMusic();
    this.ensureContext();
    this.currentLevelIndex = levelIdx % this.levelTracks.length;
    this.isPlayingMusic = true;
    this.currentBeat = 0;

    const track = this.levelTracks[this.currentLevelIndex];
    const beatIntervalMs = (60 / track.bpm) * 1000 / 2; // Semicorcheas (8th notes)

    this.musicInterval = setInterval(() => {
      if (!this.isPlayingMusic || this.isMuted || !this.ctx) return;
      this.playMusicStep(track);
      this.currentBeat = (this.currentBeat + 1) % 16;
    }, beatIntervalMs);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  playMusicStep(track) {
    const now = this.ctx.currentTime;
    const b = this.currentBeat;

    // 1. Bombo (Kick) en compás 0, 4, 8, 12 (Four-on-the-floor ritmo arcade)
    if (b % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.09);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.11);
    }

    // 2. Caja / Hi-Hat en compás 2, 6, 10, 14
    if (b % 4 === 2) {
      const bSize = this.ctx.sampleRate * 0.05;
      const buf = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bSize; i++) d[i] = Math.random() * 2 - 1;

      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.18, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      src.connect(g);
      g.connect(this.musicGain);
      src.start(now);
      src.stop(now + 0.06);
    }

    // 3. Bajo rítmico (Bassline)
    const bassIdx = Math.floor(b / 4) % track.bassNotes.length;
    const bassFreq = track.bassNotes[bassIdx];
    const bOsc = this.ctx.createOscillator();
    const bGain = this.ctx.createGain();
    
    bOsc.type = track.bassWave || 'sawtooth';
    bOsc.frequency.setValueAtTime(bassFreq, now);

    bGain.gain.setValueAtTime(0.18, now);
    bGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    bOsc.connect(bGain);
    bGain.connect(this.musicGain);
    bOsc.start(now);
    bOsc.stop(now + 0.13);

    // 4. Melodía / Arpegio
    // Patrón pseudoaleatorio determinista para cada nivel
    const melPattern = [0, 2, 4, 3, 5, 2, 4, 1, 0, 3, 5, 4, 2, 4, 3, 1];
    const noteIdx = melPattern[b] % track.scale.length;
    const leadFreq = track.scale[noteIdx];

    const lOsc = this.ctx.createOscillator();
    const lGain = this.ctx.createGain();

    lOsc.type = track.leadWave || 'square';
    lOsc.frequency.setValueAtTime(leadFreq, now);

    lGain.gain.setValueAtTime(0.12, now);
    lGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    lOsc.connect(lGain);
    lGain.connect(this.musicGain);
    lOsc.start(now);
    lOsc.stop(now + 0.11);
  }
}

// Instancia global
window.soundEngine = new SoundEngine();
