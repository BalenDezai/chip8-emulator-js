import Chip8 from './models/chip8.js';
import Keyboard from './models/keyboard.js';
import Screen from './models/screen.js';
import Disassembler from './models/disassembler.js';

export default class Chip8Wrapper {
  constructor(debugCallback) {
    this.debugCallback = debugCallback || function () {};
    this.loop = 0;
    this.chip8 = new Chip8(new Screen(), new Keyboard());
    this.ROMS = [];
    this.step = () => {
      this.chip8.emulateCycle();
      this.debugCallback(this.chip8, this.debugNumBase);
      this.loop = requestAnimationFrame(this.step);
    };
    this.start = () => {
      this.loop = requestAnimationFrame(this.step);
    };
    this.stop = () => {
      cancelAnimationFrame(this.loop);
    };
  }

  AssignDebugEle(ele) {
    this.chip8.debugger = new Disassembler(ele);
  }

  setDebugNumBase(numBase) {
    this.debugNumBase = numBase;
  }

  setDebugCallback(cb) {
    this.debugCallback = cb;
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
