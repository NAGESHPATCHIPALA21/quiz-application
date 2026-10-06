// Web Audio API Synthesized Sound Effects Engine
// Zero external mp3 downloads required; fully reliable offline and online

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }

  // Click / Selection blip
  playClick() {
    this.playTone(600, 'sine', 0.08, 0.08);
  }

  // Correct answer - happy 3-note arpeggio
  playCorrect() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'triangle', 0.18, 0.12);
        }, idx * 70);
      });
    } catch (_) {}
  }

  // Wrong answer - low buzz
  playWrong() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      this.playTone(160, 'sawtooth', 0.35, 0.15);
      setTimeout(() => {
        this.playTone(130, 'sawtooth', 0.35, 0.15);
      }, 100);
    } catch (_) {}
  }

  // Countdown tick
  playTick() {
    this.playTone(880, 'sine', 0.04, 0.04);
  }

  // Game start countdown (3, 2, 1, GO)
  playCountdownBeep(isFinal = false) {
    if (isFinal) {
      this.playTone(987.77, 'triangle', 0.4, 0.18); // B5 high
    } else {
      this.playTone(440, 'sine', 0.15, 0.1);
    }
  }

  // Victory Fanfare
  playFanfare() {
    if (!this.enabled) return;
    try {
      const melody = [
        { f: 523.25, d: 150 }, // C5
        { f: 659.25, d: 150 }, // E5
        { f: 783.99, d: 150 }, // G5
        { f: 1046.50, d: 450 } // C6
      ];
      melody.forEach((note, idx) => {
        setTimeout(() => {
          this.playTone(note.f, 'triangle', note.d / 1000, 0.15);
        }, idx * 160);
      });
    } catch (_) {}
  }
}

export const sounds = new SoundEngine();
