import Chip8 from './models/chip8.js';
import Sound from './models/sound.js';
import autoBind from './utils/autobinder.js';

/**
 * helper class that combines all the chip8 pieces and gives setter/getter access
 * also the class that runs the loop to keep the emulation loop going
 */
export default class Chip8Wrapper {
  /**
   * @param {Function} debugFunc will be passed the chip8 state, numBase and executed every cycle
   */
  constructor(debugFunc) {
    autoBind(this);
    this.debugFunc = debugFunc || function () {};
    this.loop = 0;
    this.chip8 = new Chip8();
    this.ROMS = [];
    this.keyDownEvent = this.chip8.keyboard.keyDown;
    this.keyUpEvent = this.chip8.keyboard.keyUp;
    this.debugNumBase = 16;
  }

  emuCycleLoop() {
    this.emulateCycle();
    this.debugFunc(this.chip8, this.debugNumBase);
    this.loop = requestAnimationFrame(this.emuCycleLoop);
  }

  startEmuCycleLoop() {
    this.loop = requestAnimationFrame(this.emuCycleLoop);
  }

  stopemuCycleloop() {
    cancelAnimationFrame(this.loop);
  }

  /**
   * pause emulator before next cycle execution
   * if paused, will resume
   */
  pauseEmu() {
    if (this.chip8.pause === false) {
      this.chip8.pause = true;
    } else {
      this.chip8.pause = false;
    }
  }

  /**
   * @param {Number} speed the speed to execute instructions
   */
  setEmuSpeed(speed) {
    this.chip8.speed = speed;
  }

  /**
   * @param {Boolean} sound value to turn on (true) or off (false)
   */
  setEmuSoundEnabled(sound) {
    this.chip8.soundOff = sound;
  }

  /**
   * @param {Number} blinkLevel the level of blink reduction (0-3)
   */
  setEmuScreenBlinkLevel(blinkLevel) {
    if (blinkLevel < 0 || blinkLevel > 3) throw new Error('invalid blink level');
    this.chip8.screen.blinkLevel = blinkLevel;
  }

  emulateCycle() {
    this.chip8.emulateCycle();
  }

  /**
   * @param {Number} numBase 10 or 16
   */
  setEmuDebugNumBase(numBase) {
    if (numBase !== 10 || numBase !== 16) throw new Error('Invalid number base');
    this.debugNumBase = numBase;
  }

  /**
   * @param {Function} debugFunc function to call
   */
  setEmuDebugFunc(debugFunc) {
    this.debugFunc = debugFunc;
  }

  /**
   * @param {Object} context browsers sound context
   */
  setEmuSoundCtx(context) {
    this.chip8.sound = new Sound(context);
  }

  /**
   * execute key up emulation
   * @param {Number} charCode  pressed keys character code
   */
  emuKeyUp(charCode) {
    this.chip8.keyboard.keyUp({ which: charCode });
  }

  /**
   * execute key down emulation
   * @param {Number} charCode key pressed character code
   */
  emuKeyDown(charCode) {
    this.chip8.keyboard.keyDown({ which: charCode });
  }

  /**
   * @param {*} canvas canvas context
   */
  setEmuCanvasCtx(canvas) {
    this.chip8.screen.setCanvas(canvas);
  }

  /**
   * fetch all ROM names from file.
   * Insert names into array property
   */
  async loadROMNames() {
    const romNames = await fetch('https://balend.github.io/chip8-emulator-js/roms/names.txt');
    // resolve body to UTF-8 string
    const bodyString = await romNames.text();
    // split string by comma
    // trim and turn each string to uppercase
    const names = bodyString.split(',').map((name) => name.trim().toUpperCase());
    //  filter out empty strings
    const filteredNames = names.filter((name) => name !== '');
    this.ROMS = filteredNames;
  }

  /**
   * fetches binary data in a ROM and starts the emulator
   * @param {String} name name of the ROM to fetch
   */
  async loadROM(name) {
    const ROMData = await fetch(`https://balend.github.io/chip8-emulator-js/roms/${name.toLowerCase()}`);
    this.stopemuCycleloop();
    this.chip8.resetState();
    this.chip8.loadROM(new Uint8Array(await ROMData.arrayBuffer()));
    this.startEmuCycleLoop();
  }
}
