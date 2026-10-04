/**
 * ========================================================
 * GAME ENGINE - CUBIC DASH (EDICIÓN PC & NAVE ESPACIAL)
 * Soporte de Nave Espacial (Rocket Ship Mode), Pantalla Completa,
 * Controles de Teclado PC, Portales y Físicas Avanzadas
 * ========================================================
 */

// Constantes de configuración
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
const FLOOR_HEIGHT = 90;
const FLOOR_Y = CANVAS_HEIGHT - FLOOR_HEIGHT;
const CEILING_Y = 65;
const CUBE_SIZE = 36;

// Físicas del Cubo (Gravedad reducida y salto más flotante)
const BASE_GRAVITY = 1150;  // Reducido de 1850 para que el cubo flote suavemente
const JUMP_FORCE = 530;     // Impulso calibrado para un salto amplio y cómodo
const PAD_JUMP_FORCE = 740;
const ORB_JUMP_FORCE = 590;

// Físicas de la Nave Espacial (Vuelo suave y estable)
const SHIP_GRAVITY = 850;   // Caída suave
const SHIP_THRUST = 1850;   // Propulsión equilibrada
const SHIP_MAX_SPEED = 380; // Velocidad de vuelo controlable

class CubicDashGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Canvas de vista previa de skins
    this.skinCanvas = document.getElementById('skinPreviewCanvas');
    this.skinCtx = this.skinCanvas ? this.skinCanvas.getContext('2d') : null;

    // Estados
    this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'DYING' | 'VICTORY'
    this.currentLevelIndex = 0;
    this.currentLevel = LEVELS[0];
    
    // Intentos y estadísticas
    this.attempts = 1;
    this.starsCollected = 0;
    this.starsThisRun = 0;
    this.highestPercentages = [0, 0, 0, 0, 0];
    this.unlockedLevels = [true, false, false, false, false];

    // Modo Práctica y Checkpoints
    this.isPracticeMode = false;
    this.checkpoints = [];

    // Físicas y Velocidad Dinámica
    this.gravityDir = 1;
    this.speedMultiplier = 1.0;
    this.passedPortals = new Set();

    // Jugador (Vehículo actual: 'CUBE' o 'SHIP')
    this.player = {
      mode: 'CUBE', // 'CUBE' | 'SHIP'
      x: 0,
      y: FLOOR_Y - CUBE_SIZE,
      screenX: 200,
      vy: 0,
      width: CUBE_SIZE,
      height: CUBE_SIZE,
      rotation: 0,
      targetRotation: 0,
      scaleX: 1.0,
      scaleY: 1.0,
      isGrounded: true,
      currentPlatform: null,
      alive: true
    };

    // Personalización seleccionada
    this.skin = {
      face: 'normal',
      color: '#00f0ff'
    };

    // Controles e input
    this.input = {
      jumpPressed: false,
      jumpBuffered: false,
      bufferTimer: 0
    };

    // Partículas y efectos
    this.particles = [];
    this.ghostTrails = [];
    this.screenShake = 0;
    this.collectedItems = new Set();

    // Bucle
    this.lastTime = 0;
    this.animFrameId = null;

    this.loadSaveData();
    this.initDOM();
    this.setupInputs();
    this.renderSkinPreview();
    this.renderLevelSelectGrid();

    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  // ==========================================
  // PERSISTENCIA
  // ==========================================
  loadSaveData() {
    try {
      const saved = localStorage.getItem('cubic_dash_save');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.percentages) this.highestPercentages = data.percentages;
        if (data.unlocked) this.unlockedLevels = data.unlocked;
        if (data.stars) this.starsCollected = data.stars;
        if (data.skin) this.skin = data.skin;
      }
    } catch (e) {
      console.warn("Error al cargar datos:", e);
    }
  }

  saveData() {
    try {
      const data = {
        percentages: this.highestPercentages,
        unlocked: this.unlockedLevels,
        stars: this.starsCollected,
        skin: this.skin
      };
      localStorage.setItem('cubic_dash_save', JSON.stringify(data));
    } catch (e) {
      console.warn("Error al guardar:", e);
    }
  }

  // ==========================================
  // CONTROLES DE TECLADO Y RATÓN (OPTIMIZADO PC)
  // ==========================================
  setupInputs() {
    const isJumpKey = (e) => {
      return e.code === 'Space' || 
             e.key === ' ' || 
             e.key === 'Spacebar' || 
             e.keyCode === 32 ||
             e.code === 'ArrowUp' || 
             e.key === 'ArrowUp' || 
             e.code === 'KeyW' || 
             e.key === 'w' || 
             e.key === 'W';
    };

    const handlePress = (e) => {
      // Si estamos en el Menú Principal y pulsa Espacio, iniciar partida inmediatamente
      if (this.state === 'MENU') {
        window.soundEngine.playClick();
        this.startLevel(this.getFirstUnlockedIncompleteLevel());
        return;
      }

      // Si está en Pausa y pulsa Espacio, reanudar
      if (this.state === 'PAUSED') {
        this.resumeGame();
        return;
      }

      // Si está en pantalla de Victoria y pulsa Espacio, avanzar al siguiente nivel
      if (this.state === 'VICTORY') {
        window.soundEngine.playClick();
        const nextIdx = this.currentLevelIndex + 1;
        if (nextIdx < LEVELS.length) {
          this.startLevel(nextIdx);
        } else {
          this.returnToMenu();
        }
        return;
      }

      if (this.state === 'PLAYING') {
        // Evitar que botones con foco interfieran con el juego
        if (document.activeElement && document.activeElement !== document.body && document.activeElement.blur) {
          document.activeElement.blur();
        }

        this.input.jumpPressed = true;
        this.input.jumpBuffered = true;
        this.input.bufferTimer = 0.18;

        // Feedback visual en la barra de controles inferior
        const spaceKbd = document.querySelector('#pc-controls-bar kbd');
        if (spaceKbd) spaceKbd.classList.add('pressed');

        // En modo cubo, activar orbe si está en rango
        if (this.player.mode === 'CUBE') {
          this.checkOrbTrigger();
        }
      }
    };

    const handleRelease = (e) => {
      this.input.jumpPressed = false;
      const spaceKbd = document.querySelector('#pc-controls-bar kbd');
      if (spaceKbd) spaceKbd.classList.remove('pressed');
    };

    // Eventos de teclado globales
    window.addEventListener('keydown', (e) => {
      // Tecla Espacio / W / Flecha Arriba
      if (isJumpKey(e)) {
        e.preventDefault(); // Previene scroll de la página con Espacio
        handlePress(e);
      }
      // Pausa: Esc o P
      if (['Escape', 'KeyP'].includes(e.code) && this.state === 'PLAYING') {
        e.preventDefault();
        this.pauseGame();
      }
      // Pantalla Completa: F
      if (e.code === 'KeyF') {
        e.preventDefault();
        this.toggleFullscreen();
      }
      // Modo Práctica: Z (Poner checkpoint) y X (Borrar)
      if (e.code === 'KeyZ' && this.state === 'PLAYING' && this.isPracticeMode) {
        e.preventDefault();
        this.addCheckpoint();
      }
      if (e.code === 'KeyX' && this.state === 'PLAYING' && this.isPracticeMode) {
        e.preventDefault();
        this.deleteLastCheckpoint();
      }
    }, { passive: false });

    window.addEventListener('keyup', (e) => {
      if (isJumpKey(e)) {
        e.preventDefault();
        handleRelease(e);
      }
    }, { passive: false });

    // Ratón en Canvas y ventana
    this.canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handlePress(e);
    });
    window.addEventListener('mouseup', handleRelease);

    // Evitar que la nave quede acelerando si la ventana pierde el foco
    window.addEventListener('blur', () => {
      this.input.jumpPressed = false;
      this.input.jumpBuffered = false;
      const spaceKbd = document.querySelector('#pc-controls-bar kbd');
      if (spaceKbd) spaceKbd.classList.remove('pressed');
    });

    // Soporte táctil
    const wrapper = document.getElementById('game-wrapper');
    wrapper.addEventListener('touchstart', (e) => {
      if (this.state === 'PLAYING') {
        e.preventDefault();
        handlePress(e);
      }
    }, { passive: false });

    wrapper.addEventListener('touchend', (e) => {
      if (this.state === 'PLAYING') {
        e.preventDefault();
        handleRelease(e);
      }
    }, { passive: false });
  }

  toggleFullscreen() {
    const wrapper = document.getElementById('game-wrapper');
    if (!document.fullscreenElement) {
      if (wrapper.requestFullscreen) {
        wrapper.requestFullscreen().catch(err => console.log(err));
      } else if (wrapper.webkitRequestFullscreen) {
        wrapper.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // ==========================================
  // GESTIÓN DEL DOM Y MENÚS
  // ==========================================
  initDOM() {
    document.getElementById('btn-play-quick').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.startLevel(this.getFirstUnlockedIncompleteLevel());
    });

    document.getElementById('btn-select-level').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openScreen('screen-level-select');
    });

    document.getElementById('btn-open-skins').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openSkinCustomizer();
    });

    document.getElementById('btn-how-to-play').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openScreen('screen-how-to-play');
    });

    document.getElementById('btn-close-levels').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openScreen('screen-main-menu');
    });

    document.getElementById('btn-back-to-menu-from-levels').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openScreen('screen-main-menu');
    });

    document.getElementById('btn-close-how').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openScreen('screen-main-menu');
    });

    document.getElementById('btn-close-how-btn').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openScreen('screen-main-menu');
    });

    document.getElementById('btn-close-skins').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.openScreen('screen-main-menu');
    });

    document.getElementById('btn-save-skin').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.saveData();
      this.openScreen('screen-main-menu');
    });

    // Botón Pantalla Completa
    const btnFs = document.getElementById('btn-fullscreen');
    if (btnFs) {
      btnFs.addEventListener('click', () => {
        window.soundEngine.playClick();
        this.toggleFullscreen();
      });
    }

    // Toggle de Sonido
    const toggleSound = () => {
      const active = window.soundEngine.toggleMute();
      const txt = active ? '🔊 Sonido: ON' : '🔇 Sonido: OFF';
      const icon = active ? '🔊' : '🔇';
      document.getElementById('btn-toggle-sound-menu').textContent = txt;
      document.getElementById('btn-audio-hud').textContent = icon;
    };

    document.getElementById('btn-toggle-sound-menu').addEventListener('click', toggleSound);
    document.getElementById('btn-audio-hud').addEventListener('click', toggleSound);

    // Controles de Pausa
    document.getElementById('btn-pause').addEventListener('click', () => this.pauseGame());
    document.getElementById('btn-resume').addEventListener('click', () => this.resumeGame());
    document.getElementById('btn-restart-pause').addEventListener('click', () => {
      this.closeOverlays();
      this.startLevel(this.currentLevelIndex);
    });
    document.getElementById('btn-quit-to-menu').addEventListener('click', () => {
      this.returnToMenu();
    });

    // Modo Práctica
    const practiceBtn = document.getElementById('btn-practice-toggle');
    const practiceControls = document.getElementById('practice-controls');

    practiceBtn.addEventListener('click', () => {
      window.soundEngine.playClick();
      this.isPracticeMode = !this.isPracticeMode;
      if (this.isPracticeMode) {
        practiceBtn.classList.add('active');
        practiceControls.classList.remove('hidden');
        this.addCheckpoint();
      } else {
        practiceBtn.classList.remove('active');
        practiceControls.classList.add('hidden');
        this.checkpoints = [];
      }
    });

    document.getElementById('btn-add-checkpoint').addEventListener('click', () => this.addCheckpoint());
    document.getElementById('btn-del-checkpoint').addEventListener('click', () => this.deleteLastCheckpoint());

    // Botones de Victoria
    document.getElementById('btn-next-level').addEventListener('click', () => {
      window.soundEngine.playClick();
      const nextIdx = this.currentLevelIndex + 1;
      if (nextIdx < LEVELS.length) {
        this.startLevel(nextIdx);
      } else {
        this.returnToMenu();
      }
    });

    document.getElementById('btn-replay-level').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.startLevel(this.currentLevelIndex);
    });

    document.getElementById('btn-victory-menu').addEventListener('click', () => {
      window.soundEngine.playClick();
      this.returnToMenu();
    });
  }

  // ==========================================
  // CHECKPOINTS (MODO PRÁCTICA)
  // ==========================================
  addCheckpoint() {
    if (!this.isPracticeMode || !this.player.alive) return;
    window.soundEngine.playCheckpoint();
    this.checkpoints.push({
      x: this.player.x,
      y: this.player.y,
      vy: 0,
      mode: this.player.mode,
      gravityDir: this.gravityDir,
      speedMultiplier: this.speedMultiplier,
      rotation: this.player.rotation,
      isGrounded: this.player.isGrounded
    });
    this.spawnStarSparkles(this.player.screenX + 18, this.player.y + 18);
  }

  deleteLastCheckpoint() {
    if (!this.isPracticeMode || this.checkpoints.length === 0) return;
    window.soundEngine.playClick();
    this.checkpoints.pop();
  }

  getFirstUnlockedIncompleteLevel() {
    for (let i = 0; i < LEVELS.length; i++) {
      if (this.unlockedLevels[i] && this.highestPercentages[i] < 100) {
        return i;
      }
    }
    return 0;
  }

  openScreen(screenId) {
    document.querySelectorAll('.screen-overlay').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active');
    }
  }

  closeOverlays() {
    document.querySelectorAll('.screen-overlay').forEach(el => {
      el.classList.add('hidden');
      el.classList.remove('active');
    });
  }

  // ==========================================
  // CUSTOMIZADOR DE SKINS
  // ==========================================
  openSkinCustomizer() {
    this.openScreen('screen-skins');

    const facesContainer = document.getElementById('faces-selector-container');
    facesContainer.innerHTML = '';
    CUBE_SKINS.faces.forEach(face => {
      const btn = document.createElement('button');
      btn.className = `skin-face-btn ${this.skin.face === face.id ? 'active' : ''}`;
      btn.textContent = face.emoji;
      btn.title = face.name;
      btn.addEventListener('click', () => {
        window.soundEngine.playClick();
        this.skin.face = face.id;
        document.querySelectorAll('.skin-face-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('skin-name-display').textContent = face.name;
        this.renderSkinPreview();
      });
      facesContainer.appendChild(btn);
    });

    const colorsContainer = document.getElementById('colors-selector-container');
    colorsContainer.innerHTML = '';
    CUBE_SKINS.colors.forEach(col => {
      const btn = document.createElement('button');
      btn.className = `color-swatch-btn ${this.skin.color === col.hex ? 'active' : ''}`;
      btn.style.backgroundColor = col.hex;
      btn.title = col.name;
      btn.addEventListener('click', () => {
        window.soundEngine.playClick();
        this.skin.color = col.hex;
        document.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderSkinPreview();
      });
      colorsContainer.appendChild(btn);
    });

    this.renderSkinPreview();
  }

  renderSkinPreview() {
    if (!this.skinCtx) return;
    const ctx = this.skinCtx;
    ctx.clearRect(0, 0, 160, 160);

    const cx = 80;
    const cy = 80;
    const size = 70;

    ctx.save();
    ctx.shadowColor = this.skin.color;
    ctx.shadowBlur = 18;

    ctx.fillStyle = this.skin.color;
    this.roundRect(ctx, cx - size / 2, cy - size / 2, size, size, 12);
    ctx.fill();

    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.roundRect(ctx, cx - size / 2 + 8, cy - size / 2 + 8, size - 16, size - 16, 8);
    ctx.fill();

    const faceObj = CUBE_SKINS.faces.find(f => f.id === this.skin.face) || CUBE_SKINS.faces[0];
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(faceObj.emoji, cx, cy + 2);
  }

  // ==========================================
  // SELECTOR DE NIVELES UI
  // ==========================================
  renderLevelSelectGrid() {
    const grid = document.getElementById('levels-grid-container');
    if (!grid) return;
    grid.innerHTML = '';

    LEVELS.forEach((level, idx) => {
      const isUnlocked = this.unlockedLevels[idx];
      const best = this.highestPercentages[idx] || 0;

      const card = document.createElement('div');
      card.className = `level-card ${isUnlocked ? '' : 'locked'}`;
      card.style.setProperty('--card-accent', level.theme.accent);
      card.style.setProperty('--card-glow', level.theme.accentGlow);

      card.innerHTML = `
        <div class="level-card-header">
          <span class="level-number">NIVEL 0${level.id}</span>
          <span class="level-stars">${'⭐'.repeat(level.stars)}</span>
        </div>
        <div class="level-name">${level.name}</div>
        <div class="level-difficulty-badge">${level.difficulty}</div>
        <div class="level-best-progress">
          <span>Récord:</span>
          <span class="val">${best}%</span>
        </div>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          window.soundEngine.playClick();
          this.startLevel(idx);
        });
      }

      grid.appendChild(card);
    });
  }

  // ==========================================
  // GESTIÓN DE PARTIDAS
  // ==========================================
  startLevel(levelIndex) {
    this.currentLevelIndex = levelIndex;
    this.currentLevel = LEVELS[levelIndex];
    this.attempts = 1;
    this.starsThisRun = 0;
    this.collectedItems.clear();
    this.checkpoints = [];
    this.passedPortals.clear();

    document.getElementById('game-hud').classList.remove('hidden');
    document.getElementById('hud-level-name').textContent = `NIVEL 0${this.currentLevel.id}: ${this.currentLevel.name}`;
    document.getElementById('hud-attempts').textContent = `Intento ${this.attempts}`;
    document.getElementById('progress-bar-fill').style.width = '0%';
    document.getElementById('progress-percentage').textContent = '0%';
    document.getElementById('stars-count-val').textContent = this.starsCollected;

    this.updateVehicleHUD('CUBE');
    this.closeOverlays();
    this.resetPlayerToStart();
    this.state = 'PLAYING';

    if (document.activeElement && document.activeElement !== document.body && document.activeElement.blur) {
      document.activeElement.blur();
    }
    if (this.canvas && this.canvas.focus) {
      this.canvas.focus();
    }

    window.soundEngine.startMusic(this.currentLevelIndex);
  }

  updateVehicleHUD(mode) {
    const indicator = document.getElementById('hud-vehicle-indicator');
    const icon = document.getElementById('hud-vehicle-icon');
    const text = document.getElementById('hud-vehicle-text');
    if (!indicator) return;

    if (mode === 'SHIP') {
      indicator.className = 'vehicle-indicator ship-mode';
      icon.textContent = '🚀';
      text.textContent = 'NAVE';
    } else {
      indicator.className = 'vehicle-indicator cube-mode';
      icon.textContent = '🟩';
      text.textContent = 'CUBO';
    }
  }

  showVehicleHint(message) {
    const hint = document.getElementById('vehicle-hint');
    if (!hint) return;
    hint.querySelector('span').textContent = message;
    hint.classList.remove('hidden');
    setTimeout(() => {
      hint.classList.add('hidden');
    }, 2800);
  }

  resetPlayerToStart() {
    this.player.mode = 'CUBE';
    this.updateVehicleHUD('CUBE');
    this.gravityDir = 1;
    this.speedMultiplier = 1.0;
    this.passedPortals.clear();

    this.player.x = 0;
    this.player.y = FLOOR_Y - CUBE_SIZE;
    this.player.vy = 0;
    this.player.rotation = 0;
    this.player.isGrounded = true;
    this.player.currentPlatform = null;
    this.player.alive = true;
    this.particles = [];
    this.ghostTrails = [];
  }

  respawn() {
    this.attempts++;
    document.getElementById('hud-attempts').textContent = `Intento ${this.attempts}`;
    this.starsThisRun = 0;

    if (this.isPracticeMode && this.checkpoints.length > 0) {
      const cp = this.checkpoints[this.checkpoints.length - 1];
      this.player.x = cp.x;
      this.player.y = cp.y;
      this.player.vy = 0;
      this.player.mode = cp.mode || 'CUBE';
      this.updateVehicleHUD(this.player.mode);
      this.gravityDir = cp.gravityDir;
      this.speedMultiplier = cp.speedMultiplier;
      this.player.rotation = cp.rotation;
      this.player.isGrounded = cp.isGrounded;
      this.player.alive = true;
      this.particles = [];
      this.ghostTrails = [];
    } else {
      this.resetPlayerToStart();
    }

    this.state = 'PLAYING';
    window.soundEngine.startMusic(this.currentLevelIndex);
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    window.soundEngine.stopMusic();
    this.openScreen('modal-pause');
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.closeOverlays();
    this.state = 'PLAYING';
    window.soundEngine.startMusic(this.currentLevelIndex);
  }

  returnToMenu() {
    this.state = 'MENU';
    window.soundEngine.stopMusic();
    document.getElementById('game-hud').classList.add('hidden');
    this.renderLevelSelectGrid();
    this.openScreen('screen-main-menu');
  }

  triggerVictory() {
    this.state = 'VICTORY';
    window.soundEngine.stopMusic();
    window.soundEngine.playVictory();

    this.highestPercentages[this.currentLevelIndex] = 100;
    this.starsCollected += this.starsThisRun;

    if (this.currentLevelIndex + 1 < LEVELS.length) {
      this.unlockedLevels[this.currentLevelIndex + 1] = true;
    }
    this.saveData();

    document.getElementById('victory-level-title').textContent = `${this.currentLevel.name} completado`;
    document.getElementById('victory-attempts-val').textContent = this.attempts;
    document.getElementById('victory-stars-val').textContent = '⭐'.repeat(this.currentLevel.stars);
    
    const nextBtn = document.getElementById('btn-next-level');
    if (this.currentLevelIndex + 1 >= LEVELS.length) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.style.display = 'flex';
    }

    this.spawnVictoryConfetti();
    this.openScreen('modal-victory');
  }

  // ==========================================
  // FÍSICAS DE CUBO Y NAVE ESPACIAL
  // ==========================================
  update(dt) {
    if (this.state !== 'PLAYING' && this.state !== 'DYING') return;

    if (this.state === 'DYING') {
      this.updateParticles(dt);
      if (this.particles.length === 0 || this.deathTimer <= 0) {
        this.respawn();
      } else {
        this.deathTimer -= dt;
      }
      return;
    }

    const level = this.currentLevel;
    const currentSpeed = (level.baseSpeed || 360) * this.speedMultiplier;

    // 1. Avance constante
    this.player.x += currentSpeed * dt;

    // 2. Progreso
    const progress = Math.min(100, Math.floor((this.player.x / level.length) * 100));
    document.getElementById('progress-bar-fill').style.width = `${progress}%`;
    document.getElementById('progress-percentage').textContent = `${progress}%`;

    if (progress > this.highestPercentages[this.currentLevelIndex]) {
      this.highestPercentages[this.currentLevelIndex] = progress;
    }

    if (this.player.x >= level.length) {
      this.triggerVictory();
      return;
    }

    // 3. FÍSICAS ESPECÍFICAS SEGÚN EL MODO (CUBO VS NAVE)
    if (this.player.mode === 'SHIP') {
      this.updateShipPhysics(dt);
    } else {
      this.updateCubePhysics(dt);
    }

    // 4. Colisiones con obstáculos, bloques y portales
    this.handleObjectCollisions();

    // 5. Emisión de partículas y estelas fantasma
    if (this.player.mode === 'SHIP') {
      this.spawnShipThrusterFlames();
    } else {
      if (this.player.isGrounded && Math.random() < 0.6) {
        this.spawnTrailParticle();
      }
    }

    if (Math.random() < 0.35 || this.speedMultiplier > 1.1) {
      this.spawnGhostTrail();
    }

    this.updateParticles(dt);
    this.updateGhostTrails(dt);

    if (this.screenShake > 0) {
      this.screenShake -= dt * 25;
      if (this.screenShake < 0) this.screenShake = 0;
    }
  }

  // --- FÍSICAS DEL CUBO (SALTO Y ATERRIZAJE NATURAL) ---
  updateCubePhysics(dt) {
    this.player.vy += BASE_GRAVITY * this.gravityDir * dt;
    this.player.y += this.player.vy * dt;

    if (this.input.jumpBuffered) {
      this.input.bufferTimer -= dt;
      if (this.input.bufferTimer <= 0) {
        this.input.jumpBuffered = false;
      }
    }

    if ((this.input.jumpPressed || this.input.jumpBuffered) && this.player.isGrounded) {
      this.performJump(JUMP_FORCE);
      this.input.jumpBuffered = false;
    }

    // Rotación y deformación elástica natural
    if (!this.player.isGrounded) {
      this.player.rotation += Math.PI * 2.15 * this.gravityDir * dt;
      // En el aire el cubo recupera su forma normal gradualmente
      this.player.scaleX += (1.0 - this.player.scaleX) * 6 * dt;
      this.player.scaleY += (1.0 - this.player.scaleY) * 6 * dt;
    } else {
      // En el suelo se recupera del impacto y alinea el ángulo suavemente
      this.player.scaleX += (1.0 - this.player.scaleX) * 16 * dt;
      this.player.scaleY += (1.0 - this.player.scaleY) * 16 * dt;
      this.player.rotation += (this.player.targetRotation - this.player.rotation) * 24 * dt;
    }

    // Suelo y techo para cubo
    if (this.gravityDir === 1) {
      if (this.player.y >= FLOOR_Y - this.player.height) {
        // Solo aterrizar si está cayendo hacia abajo
        if (this.player.vy >= 0) {
          if (!this.player.isGrounded) {
            this.triggerLandingImpact(FLOOR_Y);
          }
          this.player.y = FLOOR_Y - this.player.height;
          this.player.vy = 0;
          this.player.isGrounded = true;
          this.player.currentPlatform = null;
        }
      } else {
        this.player.isGrounded = false;
      }
    } else {
      if (this.player.y <= CEILING_Y) {
        // En gravedad invertida, solo aterrizar si está subiendo
        if (this.player.vy <= 0) {
          if (!this.player.isGrounded) {
            this.triggerLandingImpact(CEILING_Y);
          }
          this.player.y = CEILING_Y;
          this.player.vy = 0;
          this.player.isGrounded = true;
          this.player.currentPlatform = null;
        }
      } else {
        this.player.isGrounded = false;
      }
    }
  }

  triggerLandingImpact(surfaceY) {
    // Aplastamiento elástico en aterrizaje (Squash natural)
    this.player.scaleX = 1.30;
    this.player.scaleY = 0.72;
    this.player.targetRotation = Math.round(this.player.rotation / (Math.PI / 2)) * (Math.PI / 2);
    this.spawnLandingDust(this.player.x + this.player.width / 2, surfaceY);
    window.soundEngine.playLanding();
  }

  // --- FÍSICAS DE LA NAVE ESPACIAL ---
  updateShipPhysics(dt) {
    // Si mantienes pulsada la barra espaciadora -> Propulsión a reacción hacia arriba
    if (this.input.jumpPressed) {
      this.player.vy -= SHIP_THRUST * dt;
    } else {
      // Si sueltas -> Caída suave por gravedad
      this.player.vy += SHIP_GRAVITY * dt;
    }

    // Limitar velocidad vertical máxima
    this.player.vy = Math.max(-SHIP_MAX_SPEED, Math.min(SHIP_MAX_SPEED, this.player.vy));
    this.player.y += this.player.vy * dt;

    // Inclinación aerodinámica de la nave según su trayectoria
    const targetAngle = Math.max(-0.65, Math.min(0.65, this.player.vy * 0.0016));
    this.player.rotation += (targetAngle - this.player.rotation) * 12 * dt;

    // Límites de techo y suelo para la nave
    if (this.player.y <= CEILING_Y) {
      this.player.y = CEILING_Y;
      if (this.player.vy < 0) this.player.vy = 0;
    }
    if (this.player.y >= FLOOR_Y - this.player.height) {
      this.player.y = FLOOR_Y - this.player.height;
      if (this.player.vy > 0) this.player.vy = 0;
    }
    this.player.isGrounded = false;
  }

  performJump(forceMagnitude) {
    this.player.vy = -forceMagnitude * this.gravityDir;
    this.player.y -= 4 * this.gravityDir; // Despegar inmediatamente del suelo
    this.player.isGrounded = false;
    // Estiramiento vertical natural al saltar (Stretch)
    this.player.scaleX = 0.82;
    this.player.scaleY = 1.26;
    window.soundEngine.playJump();
    this.spawnJumpParticles();
  }

  checkOrbTrigger() {
    const pX = this.player.x + this.player.width / 2;
    const pY = this.player.y + this.player.height / 2;

    for (const obj of this.currentLevel.objects) {
      if (obj.type === 'orb') {
        const oX = obj.x + 20;
        const oY = FLOOR_Y - obj.y - 20;
        const dist = Math.hypot(pX - oX, pY - oY);

        if (dist < 60) {
          this.player.vy = -ORB_JUMP_FORCE * this.gravityDir;
          this.player.isGrounded = false;
          window.soundEngine.playOrbTap();
          this.spawnOrbBurst(oX, oY);
          this.input.jumpBuffered = false;
          break;
        }
      }
    }
  }

  handleObjectCollisions() {
    const px = this.player.x;
    const py = this.player.y;
    const pw = this.player.width;
    const ph = this.player.height;

    const visibleObjects = this.currentLevel.objects.filter(obj => 
      obj.x >= px - 120 && obj.x <= px + 220
    );

    for (const obj of visibleObjects) {
      const ow = obj.w || GRID_SIZE;
      const oh = obj.h || GRID_SIZE;
      let ox = obj.x;
      let oy = 0;

      if (obj.type === 'spike_hanging' || obj.type === 'block_ceiling') {
        oy = CEILING_Y + obj.y;
      } else {
        oy = FLOOR_Y - obj.y - oh;
      }

      // 1. PINCHOS DE SUELO
      if (obj.type === 'spike') {
        const spikeHitbox = { x: ox + 8, y: oy + 8, w: ow - 16, h: oh - 8 };
        if (this.checkAABB(px, py, pw, ph, spikeHitbox.x, spikeHitbox.y, spikeHitbox.w, spikeHitbox.h)) {
          this.killPlayer();
          return;
        }
      }

      // 2. PINCHOS COLGANTES DEL TECHO
      else if (obj.type === 'spike_hanging') {
        const spikeHitbox = { x: ox + 8, y: oy, w: ow - 16, h: oh - 8 };
        if (this.checkAABB(px, py, pw, ph, spikeHitbox.x, spikeHitbox.y, spikeHitbox.w, spikeHitbox.h)) {
          this.killPlayer();
          return;
        }
      }

      // 3. BLOQUES Y PILARES
      else if (obj.type === 'block' || obj.type === 'block_ceiling') {
        if (this.checkAABB(px, py, pw, ph, ox, oy, ow, oh)) {
          // Si estamos en modo NAVE, cualquier colisión con un bloque es choque mortal
          if (this.player.mode === 'SHIP') {
            this.killPlayer();
            return;
          }

          // Si estamos en modo CUBO, permite aterrizar
          if (this.gravityDir === 1) {
            const prevY = py - this.player.vy * 0.016;
            const isLanding = (prevY + ph <= oy + 14) && (this.player.vy >= 0);
            if (isLanding) {
              if (!this.player.isGrounded) {
                this.triggerLandingImpact(oy);
              }
              this.player.y = oy - ph;
              this.player.vy = 0;
              this.player.isGrounded = true;
              this.player.currentPlatform = obj;
            } else {
              this.killPlayer();
              return;
            }
          } else {
            const prevY = py - this.player.vy * 0.016;
            const isLandingCeiling = (prevY >= oy + oh - 14) && (this.player.vy <= 0);
            if (isLandingCeiling) {
              if (!this.player.isGrounded) {
                this.triggerLandingImpact(oy + oh);
              }
              this.player.y = oy + oh;
              this.player.vy = 0;
              this.player.isGrounded = true;
              this.player.currentPlatform = obj;
            } else {
              this.killPlayer();
              return;
            }
          }
        }
      }

      // 4. TRAMPOLINES (PADS)
      else if (obj.type === 'pad') {
        const padY = FLOOR_Y - obj.y - 12;
        if (this.checkAABB(px, py, pw, ph, ox, padY, ow, 14)) {
          this.player.vy = -PAD_JUMP_FORCE * this.gravityDir;
          this.player.isGrounded = false;
          window.soundEngine.playPadBounce();
          this.spawnPadBurst(ox + ow / 2, padY);
        }
      }

      // 5. ¡PORTAL DE TRANSFORMACIÓN A NAVE ESPACIAL! 🚀
      else if (obj.type === 'portal_ship' && !this.passedPortals.has(obj)) {
        if (this.checkAABB(px, py, pw, ph, ox, oy, 32, 90)) {
          this.passedPortals.add(obj);
          this.player.mode = 'SHIP';
          this.updateVehicleHUD('SHIP');
          this.showVehicleHint('🚀 ¡MODO NAVE ESPACIAL! MANTÉN PULSADO PARA SUBIR');
          window.soundEngine.playTransform();
          this.screenShake = 7;
          this.spawnPortalBurst(ox, oy + 45, '#ff0077');
        }
      }

      // 6. ¡PORTAL DE TRANSFORMACIÓN A CUBO! 🟩
      else if (obj.type === 'portal_cube' && !this.passedPortals.has(obj)) {
        if (this.checkAABB(px, py, pw, ph, ox, oy, 32, 90)) {
          this.passedPortals.add(obj);
          this.player.mode = 'CUBE';
          this.updateVehicleHUD('CUBE');
          window.soundEngine.playTransform();
          this.screenShake = 6;
          this.spawnPortalBurst(ox, oy + 45, '#00ff66');
        }
      }

      // 7. PORTALES DE GRAVEDAD
      else if (obj.type === 'portal_gravity_inv' && !this.passedPortals.has(obj)) {
        if (this.checkAABB(px, py, pw, ph, ox, oy, 30, 90)) {
          this.passedPortals.add(obj);
          this.gravityDir = -1;
          window.soundEngine.playPortal();
          this.screenShake = 6;
          this.spawnPortalBurst(ox, oy + 45, '#ffe600');
        }
      }

      else if (obj.type === 'portal_gravity_norm' && !this.passedPortals.has(obj)) {
        if (this.checkAABB(px, py, pw, ph, ox, oy, 30, 90)) {
          this.passedPortals.add(obj);
          this.gravityDir = 1;
          window.soundEngine.playPortal();
          this.screenShake = 6;
          this.spawnPortalBurst(ox, oy + 45, '#00f0ff');
        }
      }

      // 8. PORTALES DE VELOCIDAD
      else if (obj.type.startsWith('portal_speed_') && !this.passedPortals.has(obj)) {
        if (this.checkAABB(px, py, pw, ph, ox, oy, 35, 80)) {
          this.passedPortals.add(obj);
          window.soundEngine.playPortal();
          if (obj.type === 'portal_speed_slow') this.speedMultiplier = 0.85;
          if (obj.type === 'portal_speed_norm') this.speedMultiplier = 1.0;
          if (obj.type === 'portal_speed_fast') this.speedMultiplier = 1.25;
          if (obj.type === 'portal_speed_super') this.speedMultiplier = 1.5;
          this.spawnPortalBurst(ox, oy + 40, '#00ff66');
        }
      }

      // 9. ESTRELLAS
      else if (obj.type === 'star') {
        if (!this.collectedItems.has(obj)) {
          const sX = ox + 15;
          const sY = FLOOR_Y - obj.y - 15;
          const dist = Math.hypot((px + pw / 2) - sX, (py + ph / 2) - sY);
          if (dist < 34) {
            this.collectedItems.add(obj);
            this.starsThisRun++;
            window.soundEngine.playOrbTap();
            this.spawnStarSparkles(sX, sY);
            document.getElementById('stars-count-val').textContent = this.starsCollected + this.starsThisRun;
          }
        }
      }
    }
  }

  checkAABB(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 &&
           x1 + w1 > x2 &&
           y1 < y2 + h2 &&
           y1 + h1 > y2;
  }

  killPlayer() {
    if (!this.player.alive) return;
    this.player.alive = false;
    this.state = 'DYING';
    this.deathTimer = 0.45;
    this.screenShake = 14;

    window.soundEngine.stopMusic();
    window.soundEngine.playCrash();

    this.spawnDeathExplosion();
  }

  // ==========================================
  // EFECTOS VISUALES Y PARTÍCULAS
  // ==========================================
  spawnShipThrusterFlames() {
    const isAccelerating = this.input.jumpPressed;
    const flameCount = isAccelerating ? 3 : 1;

    for (let i = 0; i < flameCount; i++) {
      const px = this.player.x - 14;
      const py = this.player.y + this.player.height / 2 + (Math.random() - 0.5) * 8;
      this.particles.push({
        x: px,
        y: py,
        vx: -Math.random() * 120 - (isAccelerating ? 240 : 80),
        vy: (Math.random() - 0.5) * 50,
        size: Math.random() * (isAccelerating ? 7 : 4) + 3,
        color: isAccelerating ? (Math.random() < 0.6 ? '#ff7700' : '#ffe600') : '#00f0ff',
        alpha: 0.9,
        decay: 3.8
      });
    }
  }

  spawnGhostTrail() {
    this.ghostTrails.push({
      x: this.player.x,
      y: this.player.y,
      rotation: this.player.rotation,
      mode: this.player.mode,
      color: this.skin.color,
      alpha: 0.45,
      size: this.player.width
    });
  }

  updateGhostTrails(dt) {
    for (let i = this.ghostTrails.length - 1; i >= 0; i--) {
      const g = this.ghostTrails[i];
      g.alpha -= 2.4 * dt;
      if (g.alpha <= 0) {
        this.ghostTrails.splice(i, 1);
      }
    }
  }

  spawnTrailParticle() {
    const py = this.gravityDir === 1 ? this.player.y + this.player.height - 2 : this.player.y + 2;
    this.particles.push({
      x: this.player.x,
      y: py,
      vx: (Math.random() - 0.5) * 60,
      vy: -this.gravityDir * Math.random() * 40,
      size: Math.random() * 6 + 3,
      color: this.skin.color,
      alpha: 0.8,
      decay: 2.2
    });
  }

  spawnJumpParticles() {
    const py = this.gravityDir === 1 ? this.player.y + this.player.height : this.player.y;
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.player.x + this.player.width / 2,
        y: py,
        vx: (Math.random() - 0.5) * 150,
        vy: -this.gravityDir * Math.random() * 60,
        size: Math.random() * 5 + 3,
        color: '#ffffff',
        alpha: 0.9,
        decay: 3.5
      });
    }
  }

  spawnLandingDust(x, y) {
    for (let i = 0; i < 8; i++) {
      const dir = i < 4 ? -1 : 1;
      this.particles.push({
        x: x + dir * 8,
        y: y - 2,
        vx: dir * (Math.random() * 120 + 40),
        vy: -Math.random() * 30 - 8,
        size: Math.random() * 5 + 3,
        color: '#ffffff',
        alpha: 0.85,
        decay: 3.5
      });
    }
  }

  spawnPadBurst(x, y) {
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 200,
        vy: -this.gravityDir * (Math.random() * 150 + 50),
        size: Math.random() * 6 + 4,
        color: '#ffe600',
        alpha: 1,
        decay: 2.8
      });
    }
  }

  spawnOrbBurst(x, y) {
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18;
      const speed = Math.random() * 120 + 80;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 4,
        color: '#00f0ff',
        alpha: 1,
        decay: 2.5
      });
    }
  }

  spawnPortalBurst(x, y, color) {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 180 + 70;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 4,
        color: color,
        alpha: 1,
        decay: 2.2
      });
    }
  }

  spawnStarSparkles(x, y) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 180,
        vy: (Math.random() - 0.5) * 180,
        size: Math.random() * 5 + 3,
        color: '#ffe600',
        alpha: 1,
        decay: 2.0
      });
    }
  }

  spawnDeathExplosion() {
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;

    for (let i = 0; i < 32; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 360 + 100;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 120,
        size: Math.random() * 8 + 4,
        color: Math.random() < 0.5 ? this.skin.color : '#ffffff',
        alpha: 1,
        decay: 1.6,
        isFragment: true,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 10
      });
    }
  }

  spawnVictoryConfetti() {
    const colors = ['#00f0ff', '#ff0077', '#ffe600', '#00ff66', '#ffffff'];
    for (let i = 0; i < 110; i++) {
      this.particles.push({
        x: this.player.x + Math.random() * 600 - 300,
        y: Math.random() * 150,
        vx: (Math.random() - 0.5) * 180,
        vy: Math.random() * 120 + 50,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.55,
        isConfetti: true,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 6
      });
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.isFragment) {
        p.vy += 800 * dt;
        p.rotation += p.vRot * dt;
      }
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // ==========================================
  // RENDERIZADO VISUAL
  // ==========================================
  render() {
    const ctx = this.ctx;
    ctx.save();

    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    const theme = this.currentLevel.theme;

    // Fondo
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, theme.bgGradient[0]);
    bgGrad.addColorStop(1, theme.bgGradient[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Líneas de velocidad
    if (this.speedMultiplier > 1.0) {
      this.renderSpeedLines(ctx);
    }

    // Sol synthwave y skyline
    this.renderHorizonSun(ctx, theme);
    this.renderParallaxSkyline(ctx, theme);

    const cameraX = this.player.x - this.player.screenX;

    // Suelo y techo
    this.renderFloorAndCeiling(ctx, cameraX, theme);

    // Checkpoints de práctica
    if (this.isPracticeMode) {
      this.renderCheckpoints(ctx, cameraX);
    }

    // Objetos y portales
    this.renderLevelObjects(ctx, cameraX, theme);

    // Estelas fantasma
    this.renderGhostTrails(ctx, cameraX);

    // Partículas
    this.renderParticles(ctx, cameraX);

    // Jugador (Cubo o Nave)
    if (this.player.alive) {
      if (this.player.mode === 'SHIP') {
        this.renderSpaceShip(ctx);
      } else {
        this.renderPlayer(ctx);
      }
    }

    ctx.restore();
  }

  renderSpeedLines(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      const ly = (i * 45) + (Math.sin(performance.now() * 0.01 + i) * 10);
      const lx = (Math.random() * CANVAS_WIDTH);
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + 80 * this.speedMultiplier, ly);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderHorizonSun(ctx, theme) {
    const sunX = CANVAS_WIDTH / 2;
    const sunY = FLOOR_Y - 95;
    const sunRadius = 75;

    ctx.save();
    const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
    sunGrad.addColorStop(0, theme.accent);
    sunGrad.addColorStop(1, '#ff0077');

    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = theme.bgGradient[1];
    for (let i = 0; i < 5; i++) {
      const ly = sunY + 10 + (i * 12);
      const lh = 3 + i * 1.5;
      ctx.fillRect(sunX - sunRadius, ly, sunRadius * 2, lh);
    }
    ctx.restore();
  }

  renderParallaxSkyline(ctx, theme) {
    const scrollX = this.player.x * 0.2;
    ctx.save();
    ctx.strokeStyle = theme.gridColor;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    const segWidth = 140;
    const startIdx = Math.floor(scrollX / segWidth) - 1;
    const endIdx = startIdx + Math.ceil(CANVAS_WIDTH / segWidth) + 3;

    for (let i = startIdx; i <= endIdx; i++) {
      const peakX = (i * segWidth) - (scrollX % (segWidth * 10));
      const peakY = FLOOR_Y - 50 - ((i % 3) * 35);
      ctx.lineTo(peakX - segWidth / 2, FLOOR_Y);
      ctx.lineTo(peakX, peakY);
      ctx.lineTo(peakX + segWidth / 2, FLOOR_Y);
    }
    ctx.stroke();
    ctx.restore();
  }

  renderFloorAndCeiling(ctx, cameraX, theme) {
    // Suelo
    ctx.fillStyle = theme.floorColor;
    ctx.fillRect(0, FLOOR_Y, CANVAS_WIDTH, FLOOR_HEIGHT);

    ctx.save();
    ctx.shadowColor = theme.floorBorder;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = theme.floorBorder;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(CANVAS_WIDTH, FLOOR_Y);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = theme.gridColor;
    ctx.lineWidth = 1.5;
    const gridOffset = cameraX % GRID_SIZE;
    for (let x = -gridOffset; x < CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR_Y);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = FLOOR_Y + 20; y < CANVAS_HEIGHT; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    ctx.restore();

    // Techo
    ctx.fillStyle = theme.floorColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CEILING_Y);

    ctx.save();
    const ceilingColor = this.player.mode === 'SHIP' ? '#ff0077' : (this.gravityDir === -1 ? '#ffe600' : theme.floorBorder);
    ctx.shadowColor = ceilingColor;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = ceilingColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, CEILING_Y);
    ctx.lineTo(CANVAS_WIDTH, CEILING_Y);
    ctx.stroke();
    ctx.restore();
  }

  renderCheckpoints(ctx, cameraX) {
    for (const cp of this.checkpoints) {
      const sx = cp.x - cameraX;
      if (sx < -40 || sx > CANVAS_WIDTH + 40) continue;

      ctx.save();
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#00ff66';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📍', sx + 18, cp.y + 18);
      ctx.restore();
    }
  }

  renderLevelObjects(ctx, cameraX, theme) {
    const visibleObjects = this.currentLevel.objects.filter(obj => {
      const sx = obj.x - cameraX;
      return sx >= -120 && sx <= CANVAS_WIDTH + 120;
    });

    for (const obj of visibleObjects) {
      const sx = obj.x - cameraX;
      const w = obj.w || GRID_SIZE;
      const h = obj.h || GRID_SIZE;
      let sy = 0;

      if (obj.type === 'spike_hanging' || obj.type === 'block_ceiling') {
        sy = CEILING_Y + obj.y;
      } else {
        sy = FLOOR_Y - obj.y - h;
      }

      ctx.save();

      // PINCHO DE SUELO
      if (obj.type === 'spike') {
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ff0055';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(sx, sy + h);
        ctx.lineTo(sx + w / 2, sy);
        ctx.lineTo(sx + w, sy + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // PINCHO COLGANTE (TECHO)
      else if (obj.type === 'spike_hanging') {
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ff0055';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + w / 2, sy + h);
        ctx.lineTo(sx + w, sy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // BLOQUES / PILARES
      else if (obj.type === 'block' || obj.type === 'block_ceiling') {
        ctx.shadowColor = theme.accent;
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#141829';
        this.roundRect(ctx, sx, sy, w, h, 6);
        ctx.fill();

        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 2.5;
        this.roundRect(ctx, sx, sy, w, h, 6);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.strokeRect(sx + 4, sy + 4, w - 8, h - 8);
      }

      // TRAMPOLÍN (PAD)
      else if (obj.type === 'pad') {
        const padH = 12;
        const padY = FLOOR_Y - obj.y - padH;
        ctx.shadowColor = '#ffe600';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#ffe600';
        this.roundRect(ctx, sx, padY, w, padH, 4);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(sx + w / 2, padY + 2);
        ctx.lineTo(sx + w / 2 - 6, padY + 9);
        ctx.lineTo(sx + w / 2 + 6, padY + 9);
        ctx.fill();
      }

      // ORBE AÉREO
      else if (obj.type === 'orb') {
        const oCenterX = sx + 20;
        const oCenterY = FLOOR_Y - obj.y - 20;
        const oRadius = 18;

        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 16;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(oCenterX, oCenterY, oRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(oCenterX, oCenterY, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // PORTAL DE NAVE ESPACIAL (Rosa Neón con Cohete) 🚀
      else if (obj.type === 'portal_ship') {
        ctx.shadowColor = '#ff0077';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = '#ff0077';
        ctx.lineWidth = 4;
        this.roundRect(ctx, sx, sy, 32, 90, 16);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 0, 119, 0.2)';
        this.roundRect(ctx, sx, sy, 32, 90, 16);
        ctx.fill();

        // Icono de cohete dentro del portal
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🚀', sx + 16, sy + 50);
      }

      // PORTAL DE REGRESO A CUBO (Verde Neón con Cubo) 🟩
      else if (obj.type === 'portal_cube') {
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 4;
        this.roundRect(ctx, sx, sy, 32, 90, 16);
        ctx.stroke();

        ctx.fillStyle = 'rgba(0, 255, 102, 0.2)';
        this.roundRect(ctx, sx, sy, 32, 90, 16);
        ctx.fill();

        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🟩', sx + 16, sy + 50);
      }

      // PORTAL DE GRAVEDAD INVERTIDA
      else if (obj.type === 'portal_gravity_inv') {
        ctx.shadowColor = '#ffe600';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = '#ffe600';
        ctx.lineWidth = 4;
        this.roundRect(ctx, sx, sy, 28, 90, 14);
        ctx.stroke();

        ctx.fillStyle = '#ffe600';
        ctx.beginPath();
        ctx.moveTo(sx + 14, sy + 30);
        ctx.lineTo(sx + 6, sy + 45);
        ctx.lineTo(sx + 22, sy + 45);
        ctx.fill();
      }

      // PORTAL DE GRAVEDAD NORMAL
      else if (obj.type === 'portal_gravity_norm') {
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 4;
        this.roundRect(ctx, sx, sy, 28, 90, 14);
        ctx.stroke();

        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(sx + 14, sy + 60);
        ctx.lineTo(sx + 6, sy + 45);
        ctx.lineTo(sx + 22, sy + 45);
        ctx.fill();
      }

      // PORTALES DE VELOCIDAD
      else if (obj.type.startsWith('portal_speed_')) {
        const col = obj.type.includes('super') ? '#ff0077' : (obj.type.includes('fast') ? '#00ff66' : '#ffe600');
        ctx.shadowColor = col;
        ctx.shadowBlur = 16;
        ctx.strokeStyle = col;
        ctx.lineWidth = 3.5;
        this.roundRect(ctx, sx, sy, 34, 80, 8);
        ctx.stroke();

        ctx.fillStyle = col;
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('>>>', sx + 17, sy + 45);
      }

      // ESTRELLA
      else if (obj.type === 'star') {
        if (!this.collectedItems.has(obj)) {
          const stX = sx + 15;
          const stY = FLOOR_Y - obj.y - 15;
          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = '#ffe600';
          ctx.shadowBlur = 12;
          ctx.fillText('⭐', stX, stY);
        }
      }

      ctx.restore();
    }
  }

  renderGhostTrails(ctx, cameraX) {
    for (const g of this.ghostTrails) {
      const sx = g.x - cameraX;
      ctx.save();
      ctx.globalAlpha = Math.max(0, g.alpha);
      ctx.translate(sx + g.size / 2, g.y + g.size / 2);
      ctx.rotate(g.rotation);

      if (g.mode === 'SHIP') {
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(-14, -12);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-14, 12);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = g.color;
        this.roundRect(ctx, -g.size / 2, -g.size / 2, g.size, g.size, 6);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // --- RENDERIZADO DEL CUBO ---
  renderPlayer(ctx) {
    const px = this.player.screenX;
    const py = this.player.y;
    const size = this.player.width;

    ctx.save();
    ctx.translate(px + size / 2, py + size / 2);
    ctx.rotate(this.player.rotation);
    ctx.scale(this.player.scaleX || 1.0, this.player.scaleY || 1.0);

    ctx.shadowColor = this.skin.color;
    ctx.shadowBlur = 16;

    ctx.fillStyle = this.skin.color;
    this.roundRect(ctx, -size / 2, -size / 2, size, size, 7);
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    this.roundRect(ctx, -size / 2, -size / 2, size, size, 7);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    this.roundRect(ctx, -size / 2 + 5, -size / 2 + 5, size - 10, size - 10, 4);
    ctx.fill();

    const faceObj = CUBE_SKINS.faces.find(f => f.id === this.skin.face) || CUBE_SKINS.faces[0];
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(faceObj.emoji, 0, 1);

    ctx.restore();
  }

  // --- RENDERIZADO DE LA NAVE ESPACIAL ---
  renderSpaceShip(ctx) {
    const px = this.player.screenX;
    const py = this.player.y;
    const size = this.player.width;

    ctx.save();
    ctx.translate(px + size / 2, py + size / 2);
    ctx.rotate(this.player.rotation);

    // Resplandor de la nave
    ctx.shadowColor = this.skin.color;
    ctx.shadowBlur = 18;

    // 1. Llama del propulsor trasero
    const isAcc = this.input.jumpPressed;
    const flameLen = isAcc ? 26 : 14;
    const flameGrad = ctx.createLinearGradient(-16, 0, -16 - flameLen, 0);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.4, isAcc ? '#ffe600' : '#00f0ff');
    flameGrad.addColorStop(1, isAcc ? '#ff0055' : 'transparent');

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(-14, -6);
    ctx.lineTo(-14 - flameLen + (Math.random() * 4), 0);
    ctx.lineTo(-14, 6);
    ctx.closePath();
    ctx.fill();

    // 2. Alas y alerones de la nave
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.moveTo(-10, -16);
    ctx.lineTo(4, -8);
    ctx.lineTo(-12, -4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-10, 16);
    ctx.lineTo(4, 8);
    ctx.lineTo(-12, 4);
    ctx.closePath();
    ctx.fill();

    // 3. Fuselaje aerodinámico central
    ctx.fillStyle = this.skin.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(22, 0); // Punta delantera
    ctx.lineTo(-8, -13);
    ctx.lineTo(-16, -10);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-16, 10);
    ctx.lineTo(-8, 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 4. Cabina / Cúpula con la cara del piloto
    ctx.fillStyle = '#080c18';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const faceObj = CUBE_SKINS.faces.find(f => f.id === this.skin.face) || CUBE_SKINS.faces[0];
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(faceObj.emoji, 0, 1);

    ctx.restore();
  }

  renderParticles(ctx, cameraX) {
    for (const p of this.particles) {
      const sx = p.isConfetti ? p.x : p.x - cameraX;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.isFragment || p.isConfetti) {
        ctx.translate(sx, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(sx, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // ==========================================
  // BUCLE PRINCIPAL (60 FPS)
  // ==========================================
  loop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  }
}

// Inicializar al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  window.cubicGame = new CubicDashGame();

  // Hooks para pruebas automatizadas
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('test');
  if (testMode === 'jump') {
    setTimeout(() => {
      window.cubicGame.startLevel(0);
      setTimeout(() => {
        window.cubicGame.performJump(530);
      }, 400);
    }, 200);
  } else if (testMode === 'ship') {
    setTimeout(() => {
      window.cubicGame.startLevel(0);
      window.cubicGame.player.x = 3700;
      window.cubicGame.player.mode = 'SHIP';
      window.cubicGame.updateVehicleHUD('SHIP');
      window.cubicGame.player.vy = -180;
    }, 200);
  }
});
