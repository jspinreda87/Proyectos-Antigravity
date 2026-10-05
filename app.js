/**
 * ========================================================
 * IDOL WARRIORS: OPERACIÓN HOGAR
 * Lógica principal del juego táctil para Tablet / iPad
 * Inspirado en Guerreras K-Pop / Star Guardians
 * ========================================================
 */

// --- 1. SINTETIZADOR DE EFECTOS DE SONIDO POP / MÁGICO (WEB AUDIO API) ---
class SpyAudioEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Toque suave con brillo
  playTap() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(784, this.ctx.currentTime); // G5
    osc.frequency.exponentialRampToValueAtTime(392, this.ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // Sonido de Gema Estelar mágica (Chime de Idol)
  playCoin() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [1046.50, 1318.51, 1567.98]; // C6, E6, G6 (Acorde brillante)

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.18, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.25);
    });
  }

  // Sonido de obturador de cámara de fotos
  playShutter() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Chasquido inicial
    const bufferSize = this.ctx.sampleRate * 0.06;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.Q.setValueAtTime(3, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    whiteNoise.start(now);

    // Destello de campana brillante
    setTimeout(() => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.15, this.ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    }, 70);
  }

  // Sello oficial de aprobación de padres
  playStamp() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Fanfarria K-Pop triunfal
  playFanfare() {
    this.init();
    if (!this.ctx) return;
    const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
    const durations = [0.1, 0.1, 0.1, 0.4];
    let startTime = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + durations[idx]);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + durations[idx]);
      startTime += durations[idx] + 0.02;
    });
  }

  // Error (PIN equivocado)
  playError() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Sonido de volteo de carta (Memoria de Idols)
  playCardFlip() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Sonido dulce de respuesta correcta o coincidencia
  playSuccess() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.18, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.22);
    });
  }

  // Sonido suave de intento fallido (amigable y positivo para 6 a 8 años)
  playSoftError() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

const audio = new SpyAudioEngine();

// --- 1.1 SINTETIZADOR DE CANCIÓN POP DE FONDO (30 SEGUNDOS) ---
class PopMusicEngine {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.isPlaying = false;
    this.activeNodes = [];
    this.timer = null;
    this.hasAutoTriggered = false;
  }

  play() {
    this.audioEngine.init();
    const ctx = this.audioEngine.ctx;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (this.isPlaying) {
      this.stop();
    }

    this.isPlaying = true;
    this.updateUI(true);

    const now = ctx.currentTime + 0.05;
    const songDuration = 30.0; // 30 segundos de duración

    // Ganancia maestra con Fade-in y Fade-out suave al final
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.26, now + 0.8);
    // Iniciar desvanecimiento a los 26.5s hasta los 30.0s
    masterGain.gain.setValueAtTime(0.26, now + 26.5);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + songDuration);
    masterGain.connect(ctx.destination);
    this.activeNodes.push(masterGain);

    // Tempo alegre K-Pop: 124 BPM (1 beat = ~0.484s)
    const beatLen = 60 / 124;
    const totalBeats = Math.floor(songDuration / beatLen);

    // 1. BASE RÍTMICA (KICK, SNARE, HI-HAT)
    for (let b = 0; b < totalBeats; b++) {
      const beatTime = now + b * beatLen;
      if (beatTime > now + songDuration - 1.0) break;

      // Kick en cada tiempo
      if (b >= 4) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, beatTime);
        osc.frequency.exponentialRampToValueAtTime(36, beatTime + 0.09);
        g.gain.setValueAtTime(0.38, beatTime);
        g.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.09);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(beatTime);
        osc.stop(beatTime + 0.1);
        this.activeNodes.push(osc, g);
      }

      // Snare en tiempos 2 y 4 (b % 4 === 1 || b % 4 === 3)
      if (b >= 8 && (b % 4 === 1 || b % 4 === 3)) {
        const bufSize = Math.floor(ctx.sampleRate * 0.08);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const out = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) out[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, beatTime);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.24, beatTime);
        g.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.08);
        noise.connect(filter);
        filter.connect(g);
        g.connect(masterGain);
        noise.start(beatTime);
        this.activeNodes.push(noise, filter, g);
      }

      // Hi-Hat en contratiempos
      if (b >= 4) {
        const hatTime = beatTime + beatLen * 0.5;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(8000, hatTime);
        g.gain.setValueAtTime(0.05, hatTime);
        g.gain.exponentialRampToValueAtTime(0.001, hatTime + 0.03);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(hatTime);
        osc.stop(hatTime + 0.03);
        this.activeNodes.push(osc, g);
      }
    }

    // 2. ACORDES Y BAJO POP ENÉRGICO (C - Am - F - G)
    const chords = [
      { root: 130.81, bass: 65.41, notes: [261.63, 329.63, 392.00] }, // C
      { root: 110.00, bass: 55.00, notes: [220.00, 261.63, 329.63] }, // Am
      { root: 87.31,  bass: 43.65, notes: [174.61, 220.00, 261.63] }, // F
      { root: 98.00,  bass: 49.00, notes: [196.00, 246.94, 293.66] }  // G
    ];

    const barLen = beatLen * 4;
    const totalBars = Math.floor(songDuration / barLen);

    for (let bar = 0; bar < totalBars; bar++) {
      const barTime = now + bar * barLen;
      if (barTime > now + songDuration - 1.5) break;

      const chord = chords[bar % chords.length];

      // Bajo Pop
      for (let s = 0; s < 4; s++) {
        const bassTime = barTime + s * beatLen;
        const bOsc = ctx.createOscillator();
        const bGain = ctx.createGain();
        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(chord.bass, bassTime);
        bGain.gain.setValueAtTime(0.28, bassTime);
        bGain.gain.exponentialRampToValueAtTime(0.01, bassTime + beatLen * 0.7);
        bOsc.connect(bGain);
        bGain.connect(masterGain);
        bOsc.start(bassTime);
        bOsc.stop(bassTime + beatLen * 0.7);
        this.activeNodes.push(bOsc, bGain);
      }

      // Campanitas mágicas / Arpegios de idol
      chord.notes.forEach((freq, idx) => {
        for (let rep = 0; rep < 2; rep++) {
          const arpTime = barTime + rep * (barLen / 2) + idx * (beatLen * 0.5);
          const aOsc = ctx.createOscillator();
          const aGain = ctx.createGain();
          aOsc.type = 'sine';
          aOsc.frequency.setValueAtTime(freq * 2, arpTime);
          aGain.gain.setValueAtTime(0.1, arpTime);
          aGain.gain.exponentialRampToValueAtTime(0.001, arpTime + 0.3);
          aOsc.connect(aGain);
          aGain.connect(masterGain);
          aOsc.start(arpTime);
          aOsc.stop(arpTime + 0.3);
          this.activeNodes.push(aOsc, aGain);
        }
      });
    }

    // 3. MELODÍA LEAD PRINCIPAL (Pop / Idol)
    const melodyPattern = [
      { note: 523.25, dur: 0.5 }, { note: 587.33, dur: 0.5 }, { note: 659.25, dur: 0.5 }, { note: 783.99, dur: 0.5 },
      { note: 659.25, dur: 1.0 }, { note: 523.25, dur: 1.0 },
      { note: 880.00, dur: 0.5 }, { note: 783.99, dur: 0.5 }, { note: 659.25, dur: 0.5 }, { note: 523.25, dur: 0.5 },
      { note: 587.33, dur: 1.5 }, { note: 659.25, dur: 0.5 },
      { note: 783.99, dur: 0.5 }, { note: 880.00, dur: 0.5 }, { note: 1046.5, dur: 1.0 },
      { note: 880.00, dur: 0.5 }, { note: 783.99, dur: 0.5 }, { note: 659.25, dur: 1.0 },
      { note: 587.33, dur: 0.5 }, { note: 659.25, dur: 0.5 }, { note: 523.25, dur: 2.0 }
    ];

    let melodyOffset = now + 4 * beatLen;
    while (melodyOffset < now + 26.0) {
      melodyPattern.forEach(m => {
        if (melodyOffset >= now + 26.0) return;
        const mOsc = ctx.createOscillator();
        const mGain = ctx.createGain();
        mOsc.type = 'sine';
        mOsc.frequency.setValueAtTime(m.note, melodyOffset);
        mGain.gain.setValueAtTime(0.16, melodyOffset);
        mGain.gain.exponentialRampToValueAtTime(0.01, melodyOffset + m.dur * beatLen * 0.9);
        mOsc.connect(mGain);
        mGain.connect(masterGain);
        mOsc.start(melodyOffset);
        mOsc.stop(melodyOffset + m.dur * beatLen * 0.9);
        this.activeNodes.push(mOsc, mGain);
        melodyOffset += m.dur * beatLen;
      });
    }

    // Auto-apagar a los 30 segundos exactos
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.stop();
    }, songDuration * 1000);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.isPlaying = false;
    this.updateUI(false);

    try {
      this.activeNodes.forEach(node => {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      });
    } catch (e) {}
    this.activeNodes = [];
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  updateUI(playing) {
    const musicBtn = document.getElementById('musicToggleBtn');
    const musicBtnIcon = document.getElementById('musicBtnIcon');
    const drawerMusicBtn = document.getElementById('drawerMusicBtn');
    const musicStatusText = document.getElementById('musicStatusText');

    if (musicBtn) {
      musicBtn.classList.toggle('playing', playing);
      musicBtn.title = playing ? 'Pausar Canción Pop (30s)' : 'Tocar Canción Pop (30s)';
    }
    if (musicBtnIcon) {
      musicBtnIcon.textContent = playing ? '🎵' : '🔇';
    }
    if (drawerMusicBtn) {
      drawerMusicBtn.textContent = playing ? '⏸️ Pausar' : '▶️ Tocar Música';
    }
    if (musicStatusText) {
      musicStatusText.textContent = playing ? '✨ Sonando tema pop (30s)...' : 'Canción Pop de 30 segundos';
    }
  }

  setupAutoStartOnGesture() {
    const startAudio = () => {
      if (!this.hasAutoTriggered) {
        this.hasAutoTriggered = true;
        this.play();
      }
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
      window.removeEventListener('pointerdown', startAudio);
    };

    window.addEventListener('click', startAudio, { once: true });
    window.addEventListener('touchstart', startAudio, { once: true });
    window.addEventListener('pointerdown', startAudio, { once: true });
  }
}

const music = new PopMusicEngine(audio);

// --- 1.2 CONTROL DEL MENÚ LATERAL (DRAWER HOLOGRÁFICO) ---
function openNavDrawer() {
  audio.playTap();
  syncDrawerProfile();
  const drawer = document.getElementById('navDrawer');
  const backdrop = document.getElementById('navDrawerBackdrop');
  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
}

function closeNavDrawer() {
  const drawer = document.getElementById('navDrawer');
  const backdrop = document.getElementById('navDrawerBackdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
}

function renderAvatarBadge(containerId, avatarVal) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (avatarVal && (avatarVal.startsWith('avatars/') || avatarVal.startsWith('http') || avatarVal.startsWith('data:'))) {
    el.innerHTML = `<img src="${avatarVal}" alt="Idol Avatar" class="avatar-img-fit">`;
    el.classList.add('has-img-avatar');
  } else {
    el.textContent = avatarVal || '🎤';
    el.classList.remove('has-img-avatar');
  }
}

function syncDrawerProfile() {
  const codenameEl = document.getElementById('drawerCodename');
  const rankEl = document.getElementById('drawerRankText');
  const balanceEl = document.getElementById('drawerCoinBalance');
  renderAvatarBadge('drawerAvatar', game.agent.avatar);
  if (codenameEl) codenameEl.textContent = game.agent.codename;
  if (rankEl) {
    const rank = game.getCurrentRank();
    rankEl.textContent = `${rank.title} ${rank.emoji}`;
  }
  if (balanceEl) balanceEl.textContent = game.agent.coins;
}

// --- 2. SISTEMA DE CONFETI Y ESTRELLAS POP ---
class SpyConfetti {
  constructor() {
    this.canvas = document.getElementById('confettiCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 90) {
    if (!this.ctx) return;
    const colors = ['#ff2d8d', '#00f0ff', '#8b5cf6', '#ffd700', '#ffffff', '#e024c3'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 10 - 5,
        opacity: 1,
        life: 1
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.render();
    }
  }

  render() {
    if (!this.animating || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.24;
      p.rotation += p.rotSpeed;
      p.life -= 0.012;
      p.opacity = Math.max(0, p.life);

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();

      if (p.life <= 0 || p.y > this.canvas.height + 20) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.render());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

const confetti = new SpyConfetti();

// --- 3. ESTADO Y DATOS K-POP IDOL WARRIORS ---
const DEFAULT_AGENT = {
  codename: 'Vocalista Cósmica',
  avatar: '🎤',
  idCode: 'IDOL-2026',
  coins: 25,
  totalCoinsEarned: 25,
  completedCases: 0,
  claimedRewards: 0
};

const DEFAULT_MISSIONS = [
  {
    id: 'm1',
    emoji: '🛏️',
    title: 'Operación Escenario Impecable',
    desc: 'Estira las sábanas de tu cama, acomoda tus almohadas y deja tu habitación digna de un camerino de estrella.',
    coins: 10,
    status: 'pending',
    photo: null,
    submittedAt: null
  },
  {
    id: 'm2',
    emoji: '🧸',
    title: 'Rescate de la Zona VIP',
    desc: 'Recoge los juguetes y muñecos del piso y déjalos ordenados en sus estantes de descanso.',
    coins: 15,
    status: 'pending',
    photo: null,
    submittedAt: null
  },
  {
    id: 'm3',
    emoji: '👟',
    title: 'Coreografía de Zapatos en Fila',
    desc: 'Alinea todos tus pares de zapatos en su zapatero listos para la próxima presentación.',
    coins: 10,
    status: 'pending',
    photo: null,
    submittedAt: null
  },
  {
    id: 'm4',
    emoji: '🦷',
    title: 'Protocolo Sonrisa de Idol',
    desc: 'Cepíllate los dientes con brillo durante 2 minutos para lucir una sonrisa estelar.',
    coins: 5,
    status: 'pending',
    photo: null,
    submittedAt: null
  },
  {
    id: 'm5',
    emoji: '🍽️',
    title: 'Backstage Limpio: Recoger la Mesa',
    desc: 'Lleva tu plato, vaso y cubiertos al fregadero de la cocina al terminar de comer.',
    coins: 10,
    status: 'pending',
    photo: null,
    submittedAt: null
  },
  {
    id: 'm6',
    emoji: '🎒',
    title: 'Mochila del Tour Lista',
    desc: 'Revisa que tus cuadernos, cartuchera y útiles escolares estén empacados en tu mochila.',
    coins: 15,
    status: 'pending',
    photo: null,
    submittedAt: null
  }
];

const DEFAULT_REWARDS = [
  {
    id: 'r1',
    emoji: '🎬',
    title: 'Tarde de Película y Palomitas VIP',
    desc: 'Tú eliges la película familiar de la noche acompañada de deliciosas palomitas calientes.',
    cost: 65
  },
  {
    id: 'r2',
    emoji: '🍦',
    title: 'Pase Mágico para Heladería',
    desc: 'Salida especial a la heladería para pedir tu cono o copa con tus sabores favoritos.',
    cost: 95
  },
  {
    id: 'r3',
    emoji: '🎮',
    title: '30 Minutos Extra de Juego o Baile',
    desc: 'Media hora extra de videojuegos, música, baile libre o dibujos animados por la tarde.',
    cost: 50
  },
  {
    id: 'r4',
    emoji: '🍕',
    title: 'Cena Especial del Viernes (Menú Idol)',
    desc: 'Tú tienes el poder supremo de elegir qué cenamos toda la familia el viernes.',
    cost: 120
  },
  {
    id: 'r5',
    emoji: '🎡',
    title: 'Tarde de Parque, Bici o Patines',
    desc: 'Paseo al aire libre con papá y mamá a disfrutar en los columpios y patines.',
    cost: 80
  },
  {
    id: 'r6',
    emoji: '👑',
    title: 'Pase Real: Día Libre de Poner la Mesa',
    desc: 'Un día de descanso donde un adulto pondrá los platos y cubiertos por ti.',
    cost: 35
  }
];

const AVATAR_OPTIONS = [
  { emoji: '🎤', name: 'Vocalista Cósmica' },
  { emoji: '🗡️', name: 'Bailarina Espada-Luz' },
  { emoji: '🎧', name: 'DJ Rítmica' },
  { emoji: '🎀', name: 'Líder Idol Rosa' },
  { emoji: '⚡', name: 'Agente Electro-Pop' },
  { emoji: '🌟', name: 'Princesa Galáctica' },
  { emoji: '🥁', name: 'Guerrera del Ritmo' },
  { emoji: '🦊', name: 'Kitsune Pop Mágica' }
];

const RANKS = [
  { req: 0, title: 'Debutante Pop', emoji: '🌸' },
  { req: 3, title: 'Idol Promesa', emoji: '✨' },
  { req: 7, title: 'Guerrera del Ritmo', emoji: '🗡️' },
  { req: 15, title: 'Super Idol Cósmica', emoji: '👑' },
  { req: 25, title: 'Leyenda del Escenario', emoji: '🌟' }
];

// --- 4. GESTOR DE DATOS / LOCALSTORAGE ---
class GameManager {
  constructor() {
    this.loadState();
  }

  loadState() {
    const savedAgent = localStorage.getItem('kpop_agent');
    this.agent = savedAgent ? JSON.parse(savedAgent) : { ...DEFAULT_AGENT };

    const savedMissions = localStorage.getItem('kpop_missions');
    this.missions = savedMissions ? JSON.parse(savedMissions) : JSON.parse(JSON.stringify(DEFAULT_MISSIONS));

    const savedRewards = localStorage.getItem('kpop_rewards');
    let loadedRewards = savedRewards ? JSON.parse(savedRewards) : JSON.parse(JSON.stringify(DEFAULT_REWARDS));

    // Sincronizar automáticamente nuevos valores de premios en dispositivos existentes
    const REWARDS_VERSION = 'v2_higher_prices';
    if (localStorage.getItem('kpop_rewards_version') !== REWARDS_VERSION) {
      loadedRewards = loadedRewards.map(r => {
        const def = DEFAULT_REWARDS.find(d => d.id === r.id);
        return def ? { ...r, cost: def.cost, title: def.title, desc: def.desc } : r;
      });
      localStorage.setItem('kpop_rewards_version', REWARDS_VERSION);
      localStorage.setItem('kpop_rewards', JSON.stringify(loadedRewards));
    }
    this.rewards = loadedRewards;

    const savedTickets = localStorage.getItem('kpop_tickets');
    this.tickets = savedTickets ? JSON.parse(savedTickets) : [];

    const savedPin = localStorage.getItem('kpop_parent_pin');
    this.parentPin = savedPin || '1234';

    this.currentFilter = 'all';
    this.activeMissionForCamera = null;
    this.cameraStream = null;
    this.capturedPhotoData = null;
    this.cameraFacingMode = 'environment';
    this.pinInput = '';
  }

  saveState() {
    localStorage.setItem('kpop_agent', JSON.stringify(this.agent));
    localStorage.setItem('kpop_missions', JSON.stringify(this.missions));
    localStorage.setItem('kpop_rewards', JSON.stringify(this.rewards));
    localStorage.setItem('kpop_tickets', JSON.stringify(this.tickets));
    localStorage.setItem('kpop_parent_pin', this.parentPin);
  }

  resetDefaults() {
    localStorage.removeItem('kpop_agent');
    localStorage.removeItem('kpop_missions');
    localStorage.removeItem('kpop_rewards');
    localStorage.removeItem('kpop_tickets');
    this.loadState();
    this.saveState();
  }

  getCurrentRank() {
    const completed = this.agent.completedCases || 0;
    let current = RANKS[0];
    for (const r of RANKS) {
      if (completed >= r.req) {
        current = r;
      }
    }
    return current;
  }
}

const game = new GameManager();

// --- 5. RENDERIZADO DE INTERFAZ ---

function updateTopNav() {
  const rank = game.getCurrentRank();
  renderAvatarBadge('navAvatarEmoji', game.agent.avatar);
  document.getElementById('navRankBadge').textContent = `Rango: ${rank.title}`;
  document.getElementById('navCodename').textContent = game.agent.codename;
  document.getElementById('coinBalance').textContent = game.agent.coins;
  document.getElementById('storeAvailableCoins').textContent = game.agent.coins;

  const pendingReviewCount = game.missions.filter(m => m.status === 'review').length;
  const badge = document.getElementById('pendingHqBadge');
  const hqCountSpan = document.getElementById('hqPendingCount');
  
  if (pendingReviewCount > 0) {
    badge.textContent = pendingReviewCount;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
  if (hqCountSpan) {
    hqCountSpan.textContent = pendingReviewCount;
  }
  syncDrawerProfile();
}

function renderMissions() {
  const container = document.getElementById('missionsGrid');
  if (!container) return;
  container.innerHTML = '';

  let list = game.missions;
  if (game.currentFilter === 'pending') {
    list = list.filter(m => m.status === 'pending');
  } else if (game.currentFilter === 'review') {
    list = list.filter(m => m.status === 'review');
  } else if (game.currentFilter === 'done') {
    list = list.filter(m => m.status === 'done');
  }

  const totalMissions = game.missions.length;
  const completedMissions = game.missions.filter(m => m.status === 'done').length;
  const percent = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;
  
  document.getElementById('dailyProgressBar').style.width = `${percent}%`;
  document.getElementById('progressPercentText').textContent = `${percent}%`;
  document.getElementById('missionsCountText').textContent = `${completedMissions} de ${totalMissions} misiones completadas`;

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
        <p style="font-size: 20px;">✨ No hay misiones en esta sección por ahora. ¡Todo en orden!</p>
      </div>
    `;
    return;
  }

  list.forEach(m => {
    const card = document.createElement('div');
    card.className = `mission-card status-${m.status}`;

    let statusPill = '';
    let actionBtn = '';
    let photoThumb = '';

    if (m.status === 'pending') {
      statusPill = `<span class="mission-status-pill">⏳ Por Hacer</span>`;
      actionBtn = `
        <button class="mission-action-btn btn-camera" onclick="openCameraModal('${m.id}')">
          📸 Tomar Foto-Evidencia (+${m.coins} 💎)
        </button>
      `;
    } else if (m.status === 'review') {
      statusPill = `<span class="mission-status-pill">📡 En Backstage (Revisión de Padres)</span>`;
      actionBtn = `
        <button class="mission-action-btn btn-waiting">
          🔍 Esperando Aprobación de Padres
        </button>
      `;
      if (m.photo) {
        photoThumb = `<img src="${m.photo}" class="mission-photo-thumbnail" alt="Evidencia">`;
      }
    } else if (m.status === 'done') {
      statusPill = `<span class="mission-status-pill">✨ ¡Misión Brillante y Aprobada!</span>`;
      actionBtn = `
        <button class="mission-action-btn btn-approved">
          💖 ¡Gemas Estelares Recibidas!
        </button>
      `;
      if (m.photo) {
        photoThumb = `<img src="${m.photo}" class="mission-photo-thumbnail" alt="Evidencia">`;
      }
    }

    card.innerHTML = `
      <div>
        <div class="mission-card-top">
          <div class="mission-emoji-circle">${m.emoji}</div>
          <div class="mission-coin-badge">💎 +${m.coins}</div>
        </div>
        <h3 class="mission-title">${m.title}</h3>
        <p class="mission-desc">${m.desc}</p>
        ${photoThumb}
        ${statusPill}
      </div>
      <div>
        ${actionBtn}
      </div>
    `;

    container.appendChild(card);
  });
}

function renderRewards() {
  const container = document.getElementById('rewardsGrid');
  if (!container) return;
  container.innerHTML = '';

  game.rewards.forEach(r => {
    const canAfford = game.agent.coins >= r.cost;
    const card = document.createElement('div');
    card.className = 'reward-card';

    card.innerHTML = `
      <div>
        <div class="reward-emoji-box">${r.emoji}</div>
        <h3 class="reward-title">${r.title}</h3>
        <p class="reward-desc">${r.desc}</p>
      </div>
      <div>
        <div class="reward-cost-tag">💎 ${r.cost} Gemas</div>
        <button 
          class="claim-reward-btn" 
          onclick="claimReward('${r.id}')"
          ${canAfford ? '' : 'disabled'}
        >
          ${canAfford ? '🎫 Canjear Pase VIP' : `🔒 Te faltan ${r.cost - game.agent.coins} 💎`}
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

function renderProfile() {
  const rank = game.getCurrentRank();
  document.getElementById('cardAgentId').textContent = game.agent.idCode;
  renderAvatarBadge('cardAvatarEmoji', game.agent.avatar);
  document.getElementById('cardCodename').textContent = game.agent.codename;
  document.getElementById('cardRankTag').textContent = `${rank.emoji} ${rank.title}`;

  document.getElementById('statCompletedCases').textContent = game.agent.completedCases || 0;
  document.getElementById('statTotalCoinsEarned').textContent = game.agent.totalCoinsEarned || 0;
  document.getElementById('statRewardsClaimed').textContent = game.agent.claimedRewards || 0;

  const listContainer = document.getElementById('ranksList');
  if (!listContainer) return;
  listContainer.innerHTML = '';

  const completed = game.agent.completedCases || 0;
  RANKS.forEach(r => {
    const isUnlocked = completed >= r.req;
    const isActive = rank.title === r.title;

    const row = document.createElement('div');
    row.className = `rank-item ${isUnlocked ? 'unlocked' : ''} ${isActive ? 'active-rank' : ''}`;

    row.innerHTML = `
      <div class="rank-item-info">
        <span class="rank-emoji">${r.emoji}</span>
        <div>
          <h4 class="rank-name">${r.title}</h4>
          <span class="rank-req">${r.req === 0 ? 'Rango inicial de debut' : `Requiere ${r.req} retos brillantes`}</span>
        </div>
      </div>
      <div>
        <span class="rank-badge-status">${isActive ? 'ACTUAL' : isUnlocked ? 'DESBLOQUEADO' : 'BLOQUEADO'}</span>
      </div>
    `;

    listContainer.appendChild(row);
  });
}

function renderTickets() {
  const container = document.getElementById('ticketsContainer');
  if (!container) return;
  container.innerHTML = '';

  if (game.tickets.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
        <p style="font-size: 20px;">🎫 Aún no has canjeado pases VIP. ¡Completa misiones para ganar Gemas Estelares y canjear premios!</p>
      </div>
    `;
    return;
  }

  game.tickets.slice().reverse().forEach(t => {
    const card = document.createElement('div');
    card.className = 'ticket-mini-card';

    card.innerHTML = `
      <div class="ticket-mini-top">
        <span class="ticket-mini-emoji">${t.emoji}</span>
        <span class="ticket-mini-code">${t.code}</span>
      </div>
      <h3 class="ticket-mini-title">${t.title}</h3>
      <p style="font-size: 14px; color: #f1f5f9;">${t.desc}</p>
      <div class="ticket-mini-footer">
        <span>Guerrera: <b>${game.agent.codename}</b></span>
        <span>Canjeado el: ${t.date}</span>
      </div>
    `;

    container.appendChild(card);
  });
}

// --- 6. CÁMARA DE FOTO-EVIDENCIA ---

window.openCameraModal = function(missionId) {
  audio.playTap();
  game.activeMissionForCamera = game.missions.find(m => m.id === missionId);
  if (!game.activeMissionForCamera) return;

  document.getElementById('cameraMissionTitle').textContent = `Misión: ${game.activeMissionForCamera.title}`;
  document.getElementById('photoPreviewOverlay').style.display = 'none';
  document.getElementById('liveCameraButtons').style.display = 'flex';
  document.getElementById('reviewCameraButtons').style.display = 'none';
  document.getElementById('cameraModal').classList.add('show');

  startCameraStream();
};

async function startCameraStream() {
  stopCameraStream();
  const video = document.getElementById('cameraVideo');

  try {
    const constraints = {
      video: {
        facingMode: game.cameraFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    game.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = game.cameraStream;
    video.play();
  } catch (err) {
    console.warn('Cámara en vivo no disponible, fallback a selector de archivo:', err);
  }
}

function stopCameraStream() {
  if (game.cameraStream) {
    game.cameraStream.getTracks().forEach(track => track.stop());
    game.cameraStream = null;
  }
}

function captureSnapshot() {
  audio.playShutter();
  const video = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvas');
  const imgPreview = document.getElementById('capturedPhotoImg');

  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, w, h);

  ctx.fillStyle = 'rgba(14, 9, 31, 0.55)';
  ctx.fillRect(0, h - 60, w, 60);

  ctx.fillStyle = '#ff2d8d';
  ctx.font = 'bold 20px "Fredoka", sans-serif';
  ctx.fillText(`✨ RETO CUMPLIDO: ${game.activeMissionForCamera ? game.activeMissionForCamera.title : ''}`, 20, h - 35);

  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 16px "Outfit", sans-serif';
  ctx.fillText(`GUERRERA: ${game.agent.codename} • FECHA: ${today}`, 20, h - 14);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  game.capturedPhotoData = dataUrl;

  imgPreview.src = dataUrl;
  document.getElementById('watermarkDate').textContent = today;
  document.getElementById('photoPreviewOverlay').style.display = 'flex';
  document.getElementById('liveCameraButtons').style.display = 'none';
  document.getElementById('reviewCameraButtons').style.display = 'flex';

  stopCameraStream();
}

function handleFallbackFileInput(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    audio.playShutter();
    const dataUrl = event.target.result;
    game.capturedPhotoData = dataUrl;

    const imgPreview = document.getElementById('capturedPhotoImg');
    imgPreview.src = dataUrl;

    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    document.getElementById('watermarkDate').textContent = today;
    document.getElementById('photoPreviewOverlay').style.display = 'flex';
    document.getElementById('liveCameraButtons').style.display = 'none';
    document.getElementById('reviewCameraButtons').style.display = 'flex';

    stopCameraStream();
  };
  reader.readAsDataURL(file);
}

function submitPhotoEvidence() {
  if (!game.activeMissionForCamera || !game.capturedPhotoData) return;

  audio.playFanfare();
  confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 60);

  game.activeMissionForCamera.photo = game.capturedPhotoData;
  game.activeMissionForCamera.status = 'review';
  game.activeMissionForCamera.submittedAt = new Date().toISOString();

  game.saveState();
  closeCameraModal();
  updateTopNav();
  renderMissions();
}

function closeCameraModal() {
  stopCameraStream();
  document.getElementById('cameraModal').classList.remove('show');
  game.capturedPhotoData = null;
  game.activeMissionForCamera = null;
}

// --- 7. TECLADO PIN Y ACCESO PADRES (BACKSTAGE) ---

function openPinModal() {
  audio.playTap();
  game.pinInput = '';
  updatePinDots();
  document.getElementById('pinErrorMsg').textContent = '';
  document.getElementById('parentPinModal').classList.add('show');
}

function closePinModal() {
  document.getElementById('parentPinModal').classList.remove('show');
  game.pinInput = '';
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`pdot-${i}`);
    if (dot) {
      if (i < game.pinInput.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    }
  }
}

function handleKeypadPress(key) {
  audio.playTap();

  if (key === 'clear') {
    game.pinInput = '';
    updatePinDots();
    document.getElementById('pinErrorMsg').textContent = '';
    return;
  }

  if (key === 'backspace') {
    game.pinInput = game.pinInput.slice(0, -1);
    updatePinDots();
    document.getElementById('pinErrorMsg').textContent = '';
    return;
  }

  if (game.pinInput.length < 4) {
    game.pinInput += key;
    updatePinDots();

    if (game.pinInput.length === 4) {
      setTimeout(() => verifyPin(), 150);
    }
  }
}

function verifyPin() {
  if (game.pinInput === game.parentPin) {
    audio.playFanfare();
    closePinModal();
    openParentHq();
  } else {
    audio.playError();
    document.getElementById('pinErrorMsg').textContent = '⚠️ Código PIN incorrecto. Intenta de nuevo.';
    game.pinInput = '';
    updatePinDots();
  }
}

function openParentHq() {
  renderHqPendingReviews();
  renderHqMissionsList();
  renderHqRewardsList();
  document.getElementById('parentHqModal').classList.add('show');
}

function closeParentHq() {
  document.getElementById('parentHqModal').classList.remove('show');
}

// --- 8. PANEL DE CONTROL DE PADRES (PRODUCCIÓN) ---

function renderHqPendingReviews() {
  const container = document.getElementById('pendingReviewsList');
  if (!container) return;
  container.innerHTML = '';

  const pending = game.missions.filter(m => m.status === 'review');

  if (pending.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
        <p style="font-size: 18px;">✨ ¡No hay evidencias pendientes en Backstage! Excelente trabajo.</p>
      </div>
    `;
    return;
  }

  pending.forEach(m => {
    const card = document.createElement('div');
    card.className = 'review-item-card';

    card.innerHTML = `
      <div>
        <img src="${m.photo}" class="review-photo-preview" alt="Evidencia enviada">
      </div>
      <div class="review-details">
        <h4>${m.emoji} ${m.title}</h4>
        <p>${m.desc}</p>
        <div class="review-actions">
          <button class="btn-approve-stamp" onclick="approveMission('${m.id}')">
            ✨ Aprobar Misión (+${m.coins} Gemas 💎)
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

window.approveMission = function(missionId) {
  const mission = game.missions.find(m => m.id === missionId);
  if (!mission) return;

  audio.playStamp();
  setTimeout(() => audio.playCoin(), 200);

  mission.status = 'done';
  game.agent.coins += mission.coins;
  game.agent.totalCoinsEarned += mission.coins;
  game.agent.completedCases += 1;

  confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 70);

  game.saveState();
  updateTopNav();
  renderMissions();
  renderProfile();
  renderHqPendingReviews();
};

function renderHqMissionsList() {
  const container = document.getElementById('hqMissionsList');
  if (!container) return;
  container.innerHTML = '';

  game.missions.forEach(m => {
    const row = document.createElement('div');
    row.className = 'hq-item-row';

    row.innerHTML = `
      <div class="hq-item-info">
        <span class="hq-item-emoji">${m.emoji}</span>
        <div>
          <span class="hq-item-title">${m.title} (+${m.coins} 💎)</span>
          <p class="hq-item-sub">${m.desc}</p>
        </div>
      </div>
      <div class="hq-item-controls">
        <button class="btn-icon-danger" onclick="deleteMission('${m.id}')" title="Eliminar Misión">🗑️</button>
      </div>
    `;

    container.appendChild(row);
  });
}

window.deleteMission = function(id) {
  if (confirm('¿Deseas eliminar esta misión de guerrera?')) {
    audio.playTap();
    game.missions = game.missions.filter(m => m.id !== id);
    game.saveState();
    renderHqMissionsList();
    renderMissions();
  }
};

function renderHqRewardsList() {
  const container = document.getElementById('hqRewardsList');
  if (!container) return;
  container.innerHTML = '';

  game.rewards.forEach(r => {
    const row = document.createElement('div');
    row.className = 'hq-item-row';

    row.innerHTML = `
      <div class="hq-item-info">
        <span class="hq-item-emoji">${r.emoji}</span>
        <div>
          <span class="hq-item-title">${r.title} (${r.cost} 💎)</span>
          <p class="hq-item-sub">${r.desc}</p>
        </div>
      </div>
      <div class="hq-item-controls">
        <button class="btn-icon-danger" onclick="deleteReward('${r.id}')" title="Eliminar Premio">🗑️</button>
      </div>
    `;

    container.appendChild(row);
  });
}

window.deleteReward = function(id) {
  if (confirm('¿Deseas eliminar este premio de la tienda?')) {
    audio.playTap();
    game.rewards = game.rewards.filter(r => r.id !== id);
    game.saveState();
    renderHqRewardsList();
    renderRewards();
  }
};

// --- 9. CANJE DE RECOMPENSAS Y PASE VIP DORADO ---

window.claimReward = function(rewardId) {
  const reward = game.rewards.find(r => r.id === rewardId);
  if (!reward) return;

  if (game.agent.coins < reward.cost) {
    audio.playError();
    alert('¡Te faltan Gemas Estelares para canjear este premio VIP! Cumple más misiones en el hogar.');
    return;
  }

  audio.playFanfare();
  confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 90);

  game.agent.coins -= reward.cost;
  game.agent.claimedRewards += 1;

  const uniqueCode = `#VIP-${Math.floor(1000 + Math.random() * 9000)}`;
  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const newTicket = {
    id: 't_' + Date.now(),
    code: uniqueCode,
    title: reward.title,
    desc: reward.desc,
    emoji: reward.emoji,
    date: today
  };

  game.tickets.push(newTicket);
  game.saveState();

  updateTopNav();
  renderRewards();
  renderProfile();
  renderTickets();

  document.getElementById('ticketEmoji').textContent = reward.emoji;
  document.getElementById('ticketTitle').textContent = reward.title;
  document.getElementById('ticketDesc').textContent = reward.desc;
  document.getElementById('ticketAgentName').textContent = game.agent.codename;
  document.getElementById('ticketUniqueCode').textContent = uniqueCode;
  document.getElementById('ticketDateText').textContent = today;

  document.getElementById('ticketModal').classList.add('show');
};

// --- 10. ESTUDIO DE ESTILO IDOL CON IA ✨🎨 ---

const PRESET_AI_IDOLS = [
  {
    id: 'ai_pink',
    name: 'Aria Estrella',
    title: 'Vocalista Cósmica',
    desc: 'Cabello rosa de ensueño, traje con destellos y micrófono de cristal.',
    img: 'avatars/idol_pink.jpg',
    power: 'Melodía de Cristal 💎'
  },
  {
    id: 'ai_blue',
    name: 'Nova Cyber',
    title: 'Guerrera Electro-Pop',
    desc: 'Look cyberpunk cyan, audífonos luminosos y baile imparable.',
    img: 'avatars/idol_blue.jpg',
    power: 'Ritmo Supersónico ⚡'
  },
  {
    id: 'ai_purple',
    name: 'Luna Mágica',
    title: 'Princesa Galáctica',
    desc: 'Pelo lavanda mágico, vestido estelar y su gatito cósmico neón.',
    img: 'avatars/idol_purple.jpg',
    power: 'Estrellas Purificadoras 🌟'
  }
];

const AI_IDOL_NAMES = [
  'Aria Estrella', 'Nova Sparkle', 'Luna Galáctica', 'Kira Neón',
  'Mía Superstar', 'Estella Pop', 'Rin Centella', 'Zoe Estelar',
  'Yuna Aurora', 'Bella Cósmica', 'Hana Diamante', 'Sakura Glow'
];

const AI_IDOL_POWERS = [
  '✨ Poder: Melodía de Cristal',
  '⚡ Poder: Ritmo Electro-Pop',
  '🌸 Poder: Encanto Floral Mágico',
  '🌟 Poder: Lluvia de Estrellas',
  '💎 Poder: Resplandor de Diamante',
  '🎵 Poder: Acorde Cósmico'
];

let currentAiGenConfig = {
  hair: 'pink',
  hairName: 'Rosa Neón',
  accessory: 'crystal star microphone',
  accessoryName: 'Micrófono de Cristal',
  outfit: 'sparkly K-pop star idol outfit',
  outfitName: 'Pop Star Brillante',
  pet: 'adorable glowing cosmic kitten',
  petName: 'Gatito Cósmico'
};

let currentGeneratedAiResult = null;
let aiLoadingInterval = null;

function openAiStudioModal(initialTab = 'ai-gen') {
  audio.playTap();
  closeNavDrawer();
  const modal = document.getElementById('avatarModal');
  if (!modal) return;
  modal.classList.add('show');
  switchStudioTab(initialTab);
}

function closeAiStudioModal() {
  audio.playTap();
  const modal = document.getElementById('avatarModal');
  if (modal) modal.classList.remove('show');
  if (aiLoadingInterval) clearInterval(aiLoadingInterval);
}

function switchStudioTab(tabId) {
  audio.playTap();
  document.querySelectorAll('.ai-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-studiotab') === tabId);
  });

  const secGen = document.getElementById('studioSecAiGen');
  const secGal = document.getElementById('studioSecGallery');
  const secClassic = document.getElementById('studioSecClassic');

  if (secGen) secGen.style.display = tabId === 'ai-gen' ? 'block' : 'none';
  if (secGal) secGal.style.display = tabId === 'ai-gallery' ? 'block' : 'none';
  if (secClassic) secClassic.style.display = tabId === 'classic' ? 'block' : 'none';

  if (tabId === 'ai-gallery') renderPresetAiGallery();
  if (tabId === 'classic') renderAvatarPicker();
}

function initAiStudioChips() {
  const groups = [
    { rowId: 'chipsHair', labelId: 'selectedHairLabel', prop: 'hair', propName: 'hairName' },
    { rowId: 'chipsAcc', labelId: 'selectedAccLabel', prop: 'accessory', propName: 'accessoryName' },
    { rowId: 'chipsOutfit', labelId: 'selectedOutfitLabel', prop: 'outfit', propName: 'outfitName' },
    { rowId: 'chipsPet', labelId: 'selectedPetLabel', prop: 'pet', propName: 'petName' }
  ];

  groups.forEach(g => {
    const row = document.getElementById(g.rowId);
    const label = document.getElementById(g.labelId);
    if (!row) return;

    row.querySelectorAll('.ai-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        audio.playTap();
        row.querySelectorAll('.ai-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const val = chip.getAttribute('data-val');
        const name = chip.getAttribute('data-name');
        currentAiGenConfig[g.prop] = val;
        currentAiGenConfig[g.propName] = name;
        if (label) label.textContent = name;
      });
    });
  });
}

function generateAiAvatar() {
  const btn = document.getElementById('generateAiAvatarBtn');
  const overlay = document.getElementById('aiLoadingOverlay');
  const statusEl = document.getElementById('aiLoadingStatus');
  const placeholder = document.getElementById('aiPlaceholderContent');
  const resultImg = document.getElementById('aiResultImg');
  const infoEl = document.getElementById('aiResultInfo');
  const frame = document.getElementById('aiPreviewFrame');

  if (!btn || !overlay || !statusEl) return;

  audio.playCoin();
  btn.disabled = true;
  overlay.style.display = 'flex';
  if (placeholder) placeholder.style.display = 'none';
  if (resultImg) resultImg.style.display = 'none';
  if (infoEl) infoEl.style.display = 'none';
  if (frame) frame.classList.remove('has-image');

  const loadingMessages = [
    '🤖 Conectando con la IA de la Academia...',
    `✨ Diseñando cabello ${currentAiGenConfig.hairName}...`,
    `👑 Agregando ${currentAiGenConfig.accessoryName}...`,
    `👗 Confeccionando traje ${currentAiGenConfig.outfitName}...`,
    '🌟 Añadiendo destellos mágicos de escenario...',
    '🎉 ¡Tu Idol única casi está lista!'
  ];

  let msgIdx = 0;
  statusEl.textContent = loadingMessages[0];
  if (aiLoadingInterval) clearInterval(aiLoadingInterval);
  aiLoadingInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % loadingMessages.length;
    statusEl.textContent = loadingMessages[msgIdx];
  }, 1600);

  const petPart = currentAiGenConfig.pet !== 'none' ? `with cute ${currentAiGenConfig.pet}, ` : '';
  const promptText = `adorable cute anime K-pop idol warrior girl with ${currentAiGenConfig.hair} hair, wearing ${currentAiGenConfig.accessory}, ${currentAiGenConfig.outfit}, ${petPart}cheerful bright smile, sparkly stars background, 3D Pixar anime render, vibrant lighting`;

  const seed = Math.floor(1000 + Math.random() * 900000);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?seed=${seed}&nologo=true`;

  const tempImg = new Image();
  let finished = false;

  const finishLoading = (success, finalUrl) => {
    if (finished) return;
    finished = true;
    if (aiLoadingInterval) clearInterval(aiLoadingInterval);
    overlay.style.display = 'none';
    btn.disabled = false;

    if (success && finalUrl) {
      audio.playFanfare();
      if (resultImg) {
        resultImg.src = finalUrl;
        resultImg.style.display = 'block';
      }
      if (frame) frame.classList.add('has-image');

      const randomName = AI_IDOL_NAMES[Math.floor(Math.random() * AI_IDOL_NAMES.length)];
      const randomPower = AI_IDOL_POWERS[Math.floor(Math.random() * AI_IDOL_POWERS.length)];

      currentGeneratedAiResult = {
        url: finalUrl,
        name: randomName,
        power: randomPower
      };

      const nameEl = document.getElementById('aiSuggestedNameText');
      const powerEl = document.getElementById('aiSuggestedPower');
      if (nameEl) nameEl.textContent = randomName;
      if (powerEl) powerEl.textContent = randomPower;
      if (infoEl) infoEl.style.display = 'flex';
    } else {
      // Fallback a un preset local si hay problema de red
      const fallbackPreset = PRESET_AI_IDOLS[Math.floor(Math.random() * PRESET_AI_IDOLS.length)];
      if (resultImg) {
        resultImg.src = fallbackPreset.img;
        resultImg.style.display = 'block';
      }
      if (frame) frame.classList.add('has-image');

      currentGeneratedAiResult = {
        url: fallbackPreset.img,
        name: fallbackPreset.name,
        power: fallbackPreset.power
      };

      const nameEl = document.getElementById('aiSuggestedNameText');
      const powerEl = document.getElementById('aiSuggestedPower');
      if (nameEl) nameEl.textContent = fallbackPreset.name;
      if (powerEl) powerEl.textContent = fallbackPreset.power;
      if (infoEl) infoEl.style.display = 'flex';

      alert('¡Estilo Idol listo! (Activamos el modo seguro de alta definición para tu diversión ✨)');
    }
  };

  const timeoutId = setTimeout(() => {
    finishLoading(false);
  }, 16000);

  tempImg.onload = () => {
    clearTimeout(timeoutId);
    finishLoading(true, imageUrl);
  };

  tempImg.onerror = () => {
    clearTimeout(timeoutId);
    finishLoading(false);
  };

  tempImg.src = imageUrl;
}

function adoptGeneratedAiAvatar() {
  if (!currentGeneratedAiResult || !currentGeneratedAiResult.url) return;
  audio.playFanfare();
  confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 90);

  game.agent.avatar = currentGeneratedAiResult.url;
  game.saveState();
  updateTopNav();
  renderProfile();

  document.getElementById('avatarModal').classList.remove('show');
}

function adoptGeneratedAiName() {
  if (!currentGeneratedAiResult || !currentGeneratedAiResult.name) return;
  audio.playCoin();
  game.agent.codename = currentGeneratedAiResult.name;
  game.saveState();
  updateTopNav();
  renderProfile();

  const btn = document.getElementById('btnUseAiName');
  if (btn) {
    btn.textContent = '¡Aplicado! ✅';
    setTimeout(() => { btn.textContent = 'Usar Nombre ✨'; }, 2000);
  }
}

function renderPresetAiGallery() {
  const container = document.getElementById('galleryCardsGrid');
  if (!container) return;
  container.innerHTML = '';

  PRESET_AI_IDOLS.forEach(idol => {
    const isCurrent = game.agent.avatar === idol.img;
    const card = document.createElement('div');
    card.className = `gallery-idol-card ${isCurrent ? 'active-selected' : ''}`;

    card.innerHTML = `
      <div class="gallery-idol-thumb">
        <img src="${idol.img}" alt="${idol.name}">
      </div>
      <h4 class="gallery-idol-title">${idol.name}</h4>
      <p class="gallery-idol-desc">${idol.desc}</p>
      <button class="gallery-idol-btn" type="button">
        ${isCurrent ? '¡Estilo Activo! 💖' : '💖 Elegir este Estilo'}
      </button>
    `;

    card.querySelector('.gallery-idol-btn').addEventListener('click', () => {
      audio.playFanfare();
      confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 80);
      game.agent.avatar = idol.img;
      game.saveState();
      updateTopNav();
      renderProfile();
      document.getElementById('avatarModal').classList.remove('show');
    });

    container.appendChild(card);
  });
}

function renderAvatarPicker() {
  const grid = document.getElementById('avatarChoicesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  AVATAR_OPTIONS.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = `avatar-choice-btn ${game.agent.avatar === opt.emoji ? 'selected' : ''}`;
    btn.innerHTML = `
      <span class="avatar-choice-emoji">${opt.emoji}</span>
      <span class="avatar-choice-name">${opt.name}</span>
    `;

    btn.addEventListener('click', () => {
      audio.playTap();
      game.agent.avatar = opt.emoji;
      game.saveState();
      updateTopNav();
      renderProfile();
      document.getElementById('avatarModal').classList.remove('show');
    });

    grid.appendChild(btn);
  });
}

function promptEditName() {
  audio.playTap();
  const current = game.agent.codename;
  const newName = prompt('¿Cuál es tu nombre artístico de Idol Guerrera?', current);
  if (newName && newName.trim() !== '') {
    game.agent.codename = newName.trim();
    game.saveState();
    updateTopNav();
    renderProfile();
  }
}

// --- 11. INICIALIZACIÓN DE EVENTOS ---

document.addEventListener('DOMContentLoaded', () => {
  updateTopNav();
  renderMissions();
  renderRewards();
  renderProfile();
  renderTickets();
  renderAvatarPicker();

  // Control de Apertura y Cierre del Menú Lateral (Drawer)
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const navDrawerBackdrop = document.getElementById('navDrawerBackdrop');

  if (menuToggleBtn) menuToggleBtn.addEventListener('click', openNavDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeNavDrawer);
  if (navDrawerBackdrop) navDrawerBackdrop.addEventListener('click', closeNavDrawer);

  // Navegación táctil en el Drawer
  document.querySelectorAll('.drawer-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.playTap();
      document.querySelectorAll('.drawer-nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
      closeNavDrawer();
    });
  });

  // Botón de Canción Pop (30s) en Header y en Drawer
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const drawerMusicBtn = document.getElementById('drawerMusicBtn');
  if (musicToggleBtn) musicToggleBtn.addEventListener('click', () => music.toggle());
  if (drawerMusicBtn) drawerMusicBtn.addEventListener('click', () => music.toggle());

  // Iniciar canción pop automáticamente con el primer toque en pantalla
  music.setupAutoStartOnGesture();

  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      audio.playTap();
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      game.currentFilter = pill.getAttribute('data-filter');
      renderMissions();
    });
  });

  document.getElementById('agentBadgeBtn').addEventListener('click', () => {
    audio.playTap();
    document.querySelectorAll('.drawer-nav-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === 'tab-profile');
    });
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const profileTab = document.getElementById('tab-profile');
    if (profileTab) profileTab.classList.add('active');
  });

  document.getElementById('openParentHqBtn').addEventListener('click', openPinModal);
  document.getElementById('closePinModalBtn').addEventListener('click', closePinModal);
  document.getElementById('closeHqModalBtn').addEventListener('click', closeParentHq);

  document.querySelectorAll('.keypad-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      handleKeypadPress(key);
    });
  });

  document.querySelectorAll('.hq-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.playTap();
      document.querySelectorAll('.hq-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.hq-tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.getAttribute('data-hqtab');
      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');
    });
  });

  document.getElementById('closeCameraModalBtn').addEventListener('click', closeCameraModal);
  document.getElementById('shutterBtn').addEventListener('click', captureSnapshot);
  document.getElementById('fileFallbackInput').addEventListener('change', handleFallbackFileInput);
  document.getElementById('switchCameraBtn').addEventListener('click', () => {
    audio.playTap();
    game.cameraFacingMode = game.cameraFacingMode === 'environment' ? 'user' : 'environment';
    startCameraStream();
  });
  document.getElementById('retakePhotoBtn').addEventListener('click', () => {
    audio.playTap();
    document.getElementById('photoPreviewOverlay').style.display = 'none';
    document.getElementById('liveCameraButtons').style.display = 'flex';
    document.getElementById('reviewCameraButtons').style.display = 'none';
    startCameraStream();
  });
  document.getElementById('sendEvidenceBtn').addEventListener('click', submitPhotoEvidence);

  const openNewMissionBtn = document.getElementById('openNewMissionFormBtn');
  const newMissionForm = document.getElementById('newMissionForm');
  openNewMissionBtn.addEventListener('click', () => {
    audio.playTap();
    newMissionForm.style.display = newMissionForm.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('cancelNewMissionBtn').addEventListener('click', () => {
    newMissionForm.style.display = 'none';
  });
  document.getElementById('saveNewMissionBtn').addEventListener('click', () => {
    const emoji = document.getElementById('newMissionEmoji').value || '✨';
    const title = document.getElementById('newMissionTitle').value.trim();
    const coins = parseInt(document.getElementById('newMissionCoins').value) || 10;
    const desc = document.getElementById('newMissionDesc').value.trim();

    if (!title) {
      alert('Por favor escribe un nombre para la misión.');
      return;
    }

    audio.playCoin();
    game.missions.push({
      id: 'm_' + Date.now(),
      emoji: emoji,
      title: title,
      coins: coins,
      desc: desc || 'Misión especial de guerrera.',
      status: 'pending',
      photo: null
    });

    game.saveState();
    newMissionForm.style.display = 'none';
    document.getElementById('newMissionTitle').value = '';
    document.getElementById('newMissionDesc').value = '';

    renderHqMissionsList();
    renderMissions();
  });

  const openNewRewardBtn = document.getElementById('openNewRewardFormBtn');
  const newRewardForm = document.getElementById('newRewardForm');
  openNewRewardBtn.addEventListener('click', () => {
    audio.playTap();
    newRewardForm.style.display = newRewardForm.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('cancelNewRewardBtn').addEventListener('click', () => {
    newRewardForm.style.display = 'none';
  });
  document.getElementById('saveNewRewardBtn').addEventListener('click', () => {
    const emoji = document.getElementById('newRewardEmoji').value || '🎁';
    const title = document.getElementById('newRewardTitle').value.trim();
    const cost = parseInt(document.getElementById('newRewardCost').value) || 20;
    const desc = document.getElementById('newRewardDesc').value.trim();

    if (!title) {
      alert('Por favor escribe un nombre para el premio.');
      return;
    }

    audio.playFanfare();
    game.rewards.push({
      id: 'r_' + Date.now(),
      emoji: emoji,
      title: title,
      cost: cost,
      desc: desc || 'Premio VIP acordado con los padres.'
    });

    game.saveState();
    newRewardForm.style.display = 'none';
    document.getElementById('newRewardTitle').value = '';
    document.getElementById('newRewardDesc').value = '';

    renderHqRewardsList();
    renderRewards();
  });

  document.getElementById('saveNewPinBtn').addEventListener('click', () => {
    const newPin = document.getElementById('newPinInput').value.trim();
    if (newPin.length === 4 && /^\d{4}$/.test(newPin)) {
      audio.playCoin();
      game.parentPin = newPin;
      game.saveState();
      alert('¡Código PIN de padres actualizado con éxito!');
      document.getElementById('newPinInput').value = '';
    } else {
      audio.playError();
      alert('El PIN debe tener exactamente 4 dígitos numéricos.');
    }
  });

  document.getElementById('resetDefaultsBtn').addEventListener('click', () => {
    if (confirm('¿Estás seguro de restaurar todas las misiones y premios originales?')) {
      audio.playTap();
      game.resetDefaults();
      updateTopNav();
      renderMissions();
      renderRewards();
      renderProfile();
      renderTickets();
      renderHqPendingReviews();
      renderHqMissionsList();
      renderHqRewardsList();
      alert('Datos restaurados correctamente.');
    }
  });

  document.getElementById('closeTicketModalBtn').addEventListener('click', () => {
    audio.playTap();
    document.getElementById('ticketModal').classList.remove('show');
  });

  // Botón de Estudio de Idol con IA (en Pase de Idol y en Drawer)
  const openAvatarPickerBtn = document.getElementById('openAvatarPickerBtn');
  const drawerOpenAiStudioBtn = document.getElementById('drawerOpenAiStudioBtn');
  const closeAvatarModalBtn = document.getElementById('closeAvatarModalBtn');

  if (openAvatarPickerBtn) openAvatarPickerBtn.addEventListener('click', () => openAiStudioModal('ai-gen'));
  if (drawerOpenAiStudioBtn) drawerOpenAiStudioBtn.addEventListener('click', () => openAiStudioModal('ai-gen'));
  if (closeAvatarModalBtn) closeAvatarModalBtn.addEventListener('click', closeAiStudioModal);

  // Pestañas del Estudio de IA
  const btnStudioTabAi = document.getElementById('btnStudioTabAi');
  const btnStudioTabPre = document.getElementById('btnStudioTabPre');
  const btnStudioTabClassic = document.getElementById('btnStudioTabClassic');

  if (btnStudioTabAi) btnStudioTabAi.addEventListener('click', () => switchStudioTab('ai-gen'));
  if (btnStudioTabPre) btnStudioTabPre.addEventListener('click', () => switchStudioTab('ai-gallery'));
  if (btnStudioTabClassic) btnStudioTabClassic.addEventListener('click', () => switchStudioTab('classic'));

  // Generador IA botones
  const generateAiAvatarBtn = document.getElementById('generateAiAvatarBtn');
  const btnAdoptAiAvatar = document.getElementById('btnAdoptAiAvatar');
  const btnUseAiName = document.getElementById('btnUseAiName');

  if (generateAiAvatarBtn) generateAiAvatarBtn.addEventListener('click', generateAiAvatar);
  if (btnAdoptAiAvatar) btnAdoptAiAvatar.addEventListener('click', adoptGeneratedAiAvatar);
  if (btnUseAiName) btnUseAiName.addEventListener('click', adoptGeneratedAiName);

  initAiStudioChips();
  renderPresetAiGallery();

  document.getElementById('editNameBtn').addEventListener('click', promptEditName);

  // Inicializar Minijuegos
  initMemoryGame();
});

// ========================================================
// 12. SALA DE MINIJUEGOS MÁGICOS (PARA 6 A 8 AÑOS)
// ========================================================

// --- A. CAMBIAR ENTRE MINIJUEGOS ---
window.switchArcadeGame = function(gameType) {
  audio.playTap();
  
  const pills = {
    memory: document.getElementById('pillMemory'),
    catch: document.getElementById('pillCatch')
  };

  const views = {
    memory: document.getElementById('gameViewMemory'),
    catch: document.getElementById('gameViewCatch')
  };

  Object.keys(pills).forEach(key => {
    if (pills[key]) pills[key].classList.toggle('active', key === gameType);
    if (views[key]) {
      views[key].style.display = (key === gameType) ? 'block' : 'none';
      if (key === gameType) views[key].classList.add('active');
    }
  });

  if (gameType === 'memory' && (!window.memoryInitialized || window.matchedPairs === 6)) {
    initMemoryGame();
  }
};


// --- C. MINIJUEGO 2: MEMORIA DE IDOLS (PAREJAS) ---
const MEMORY_ICONS = ['🎤', '💎', '👑', '🐱', '⭐', '🎀'];
let memoryCardsData = [];
let memoryFlipped = [];
let memoryMatches = 0;
let memoryAttempts = 0;
let memoryLocked = false;
window.memoryInitialized = false;

window.initMemoryGame = function() {
  window.memoryInitialized = true;
  memoryMatches = 0;
  memoryAttempts = 0;
  memoryFlipped = [];
  memoryLocked = false;

  document.getElementById('memoryFlipsText').textContent = '0';
  document.getElementById('memoryMatchesText').textContent = '0 / 6';

  // Duplicar y mezclar 6 parejas = 12 cartas
  memoryCardsData = [...MEMORY_ICONS, ...MEMORY_ICONS].sort(() => Math.random() - 0.5);

  const grid = document.getElementById('memoryGrid');
  if (!grid) return;
  grid.innerHTML = '';

  memoryCardsData.forEach((icon, index) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.index = index;
    card.dataset.icon = icon;

    card.innerHTML = `
      <div class="memory-card-face memory-card-back">✨</div>
      <div class="memory-card-face memory-card-front">${icon}</div>
    `;

    card.addEventListener('click', () => handleMemoryCardClick(card, icon));
    grid.appendChild(card);
  });
};

function handleMemoryCardClick(card, icon) {
  if (memoryLocked) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  audio.playCardFlip();
  card.classList.add('flipped');
  memoryFlipped.push({ card, icon });

  if (memoryFlipped.length === 2) {
    memoryAttempts++;
    document.getElementById('memoryFlipsText').textContent = memoryAttempts;

    const [first, second] = memoryFlipped;

    if (first.icon === second.icon) {
      // Coincidencia
      audio.playCoin();
      first.card.classList.add('matched');
      second.card.classList.add('matched');
      memoryMatches++;
      document.getElementById('memoryMatchesText').textContent = `${memoryMatches} / 6`;
      memoryFlipped = [];

      if (memoryMatches === 6) {
        // Victoria completa
        setTimeout(() => {
          audio.playFanfare();
          confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 100);

          // Premio especial: +15 Gemas Estelares
          game.agent.coins += 15;
          game.agent.totalCoinsEarned += 15;
          game.saveState();
          updateTopNav();
          renderRewards();

          alert('🎉 ¡EXTRAORDINARIO! ¡Has encontrado todas las parejas y ganado +15 Gemas Estelares 💎!');
        }, 500);
      }
    } else {
      // No coinciden
      memoryLocked = true;
      audio.playSoftError();
      setTimeout(() => {
        first.card.classList.remove('flipped');
        second.card.classList.remove('flipped');
        memoryFlipped = [];
        memoryLocked = false;
      }, 850);
    }
  }
}


// --- D. MINIJUEGO 3: ATRAPA-GEMAS ESTELAR (20 SEGUNDOS) ---
let catchTimer = null;
let catchSpawnInterval = null;
let catchScore = 0;
let catchTimeRemaining = 20;
let catchRunning = false;

window.startCatchGame = function() {
  audio.playTap();
  const stage = document.getElementById('catchStage');
  if (!stage) return;

  catchScore = 0;
  catchTimeRemaining = 20;
  catchRunning = true;

  document.getElementById('catchScoreText').textContent = '0';
  document.getElementById('catchTimerText').textContent = '20s';

  // Limpiar escenario
  stage.innerHTML = '';

  // Timer regresivo
  if (catchTimer) clearInterval(catchTimer);
  catchTimer = setInterval(() => {
    catchTimeRemaining--;
    document.getElementById('catchTimerText').textContent = `${catchTimeRemaining}s`;

    if (catchTimeRemaining <= 0) {
      endCatchGame();
    }
  }, 1000);

  // Generador de gemas y elementos mágicos
  const items = ['💎', '⭐', '✨', '💖', '🎵', '🌸', '👑'];
  if (catchSpawnInterval) clearInterval(catchSpawnInterval);

  catchSpawnInterval = setInterval(() => {
    if (!catchRunning) return;

    const item = document.createElement('div');
    item.className = 'catch-spawn-item';
    item.textContent = items[Math.floor(Math.random() * items.length)];

    // Posición aleatoria dentro del stage (dejando márgenes)
    const maxX = stage.clientWidth - 70;
    const maxY = stage.clientHeight - 70;
    const posX = Math.max(15, Math.floor(Math.random() * maxX));
    const posY = Math.max(15, Math.floor(Math.random() * maxY));

    item.style.left = `${posX}px`;
    item.style.top = `${posY}px`;

    // Toque o clic sobre el elemento
    const onItemCatch = (e) => {
      e.stopPropagation();
      if (!item.parentElement) return;
      catchScore++;
      audio.playTap();
      document.getElementById('catchScoreText').textContent = catchScore;

      // Efecto de desvanecimiento
      item.style.transform = 'scale(1.4)';
      item.style.opacity = '0';
      setTimeout(() => item.remove(), 150);
    };

    item.addEventListener('touchstart', onItemCatch, { passive: false });
    item.addEventListener('mousedown', onItemCatch);

    stage.appendChild(item);

    // Auto-remover si no lo atrapa tras 1.4 segundos
    setTimeout(() => {
      if (item.parentElement) item.remove();
    }, 1400);
  }, 500);
};

function endCatchGame() {
  catchRunning = false;
  if (catchTimer) clearInterval(catchTimer);
  if (catchSpawnInterval) clearInterval(catchSpawnInterval);

  const stage = document.getElementById('catchStage');
  if (!stage) return;
  stage.innerHTML = '';

  // Recompensa real: 1 gema cada 4 atrapadas (mínimo 1 gema si atrapó al menos una)
  const earnedCoins = catchScore > 0 ? Math.max(1, Math.floor(catchScore / 4)) : 0;

  if (earnedCoins > 0) {
    audio.playFanfare();
    confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 90);
    game.agent.coins += earnedCoins;
    game.agent.totalCoinsEarned += earnedCoins;
    game.saveState();
    updateTopNav();
    renderRewards();
  } else {
    audio.playSoftError();
  }

  const gameOverScreen = document.createElement('div');
  gameOverScreen.className = 'catch-game-over-screen';
  gameOverScreen.innerHTML = `
    <span class="stage-big-emoji">🏆</span>
    <h3>¡Tiempo Terminado!</h3>
    <p>¡Atrapaste <b>${catchScore}</b> elementos mágicos en 20 segundos!<br>
    Te llevas <b>+${earnedCoins} Gemas Estelares 💎</b> reales para canjear en tus Vales VIP.</p>
    <button class="btn btn-primary-glow" onclick="startCatchGame()">🚀 ¡Jugar Otra Partida! (20s)</button>
  `;

  stage.appendChild(gameOverScreen);
}

