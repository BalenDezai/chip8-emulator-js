import Chip8 from './models/chip8.js';
import Keyboard from './models/keyboard.js';
import Screen from './models/screen.js';
import Sound from './models/sound.js';
import autoBind  from './utils/autobinder.js';


export default class Chip8Wrapper {
  constructor(debugCallback) {
    autoBind(this);
    this.debugCallback = debugCallback || function () {};
    this.loop = 0;
    this.chip8 = new Chip8(new Screen(), new Keyboard());
    this.ROMS = [];
  }

  step() {
    this.emulateEmuCycle();
    this.debugCallback(this.chip8, this.debugNumBase);
    this.loop = requestAnimationFrame(this.step);
  }

  start() {
    this.loop = requestAnimationFrame(this.step);
  }

  stop() {
    cancelAnimationFrame(this.loop);
  }

  pauseEmu() {
    if (this.chip8.pause === false) {
      this.chip8.pause = true;
    } else {
      this.chip8.pause = false;
    }
  }

  setEmuSpeed(speed) {
    this.chip8.speed = parseInt(speed, 10);
  }

  setEmuSoundVolume(sound) {
    this.chip8.soundOff = sound;
  }

  setEmuScreenBlinkLevel(blinkLevel) {
    this.chip8.screen.blinkLevel = parseInt(blinkLevel, 10);
  }

  emulateEmuCycle() {
    this.chip8.emulateCycle();
  }

  setEmuDebugNumBase(numBase) {
    this.debugNumBase = numBase;
  }

  setEmuDebugCallback(cb) {
    this.debugCallback = cb;
  }

  setEmuSound(context) {
    this.chip8.sound = new Sound(context);
  }

  async loadROMNames() {
    const romNames = await fetch('https://balend.github.io/chip8-emulator-js/roms/names.txt');
    const test = await romNames.text();
    const names = test.split('.').map((name) => name.trim().toUpperCase()).filter((name) => name !== 'names' && name !== 'txt' && name !== '');
    this.ROMS = names;
  }

  async loadROM(name) {
    const ROMData = await fetch(`https://balend.github.io/chip8-emulator-js/roms/${name.toLowerCase()}`);
    this.stop();
    this.chip8.resetState();
    this.chip8.loadROM(new Uint8Array(await ROMData.arrayBuffer()));
    this.start();
  }
}
