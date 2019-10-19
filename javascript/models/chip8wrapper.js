const Chip8 = require('./chip8');

class Chip8Emulator {
  constructor() {
    this.chip8 = new Chip8();
    this.loop = 0;
    this.step = 0;
    this.ROMS = [
      'pong',
    ];
  }

  loadRom(name) {
    const request = new XMLHttpRequest();
    request.onload = () => {
      if (request.response) {
        this.chip8.Screen = window.screen;
        this.chip8.input = window.input;
        this.stop();
        this.chip8.resetState();
        this.chip8.loadROM(new Uint8Array(request.response));
        this.start();
      }
    };
    request.open('GET', `roms/${name}`, true);
    request.responseType = 'arraybuffer';
    request.send();
  }

  step() {
    this.chip8.emulateCycle();
    this.loop = requestAnimationFrame(this.step);
  }

  start() {
    this.loop = requestAnimationFrame(this.step);
  }

  stop() {
    cancelAnimationFrame(this.loop);
  }
}

module.exports = Chip8Emulator;
