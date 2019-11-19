import Chip8 from './models/chip8.js';
import Keyboard from './models/keyboard.js';
import Screen from './models/screen.js';
import Sound from './models/sound.js';
import autoBind from './utils/autobinder.js';

/**
 * helper class that combines all the chip8 pieces and gives setter/getter access
 * also the class that runs the loop to keep the emulation loop going
 */
export default class Chip8Wrapper {
  /**
   * puts together all the pieces of the chip8 to be accessed
   * @param {Function} debugFunc will be passed the chip8 state, numBase and executed every cycle
   */
  constructor(debugFunc) {
    autoBind(this);
    this.debugFunc = debugFunc || function () {};
    this.loop = 0;
    this.chip8 = new Chip8(new Screen(), new Keyboard());
    this.ROMS = [];
    this.keyDownEvent = this.chip8.keyboard.keyDown;
    this.keyUpEvent = this.chip8.keyboard.keyUp;
    this.debugNumBase = 16;
  }

  /**
   * execute emulation cycle
   * loop the animation request passing self  as the callback
   */
  emuCycleLoop() {
    this.emulateCycle();
    this.debugFunc(this.chip8, this.debugNumBase);
    this.loop = requestAnimationFrame(this.emuCycleLoop);
  }

  /**
   * start browser animation request
   */
  startEmuCycleLoop() {
    this.loop = requestAnimationFrame(this.emuCycleLoop);
  }

  /**
   * cancel animation request loop
   */
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
   * set emulators execution speed
   * @param {Number} speed the speed to execute instructions
   */
  setEmuSpeed(speed) {
    this.chip8.speed = parseInt(speed, 10);
  }

  /**
   * turn emulator sound on or off
   * @param {Boolean} sound the value to turn on (true) or off (false)
   */
  setEmuSoundVolume(sound) {
    this.chip8.soundOff = sound;
  }

  /**
   * set emulator blink reduction level
   * @param {Number} blinkLevel the level of blink reduction (0-3)
   */
  setEmuScreenBlinkLevel(blinkLevel) {
    this.chip8.screen.blinkLevel = parseInt(blinkLevel, 10);
  }

  /**
   * execuete one emulation cycle
   */
  emulateCycle() {
    this.chip8.emulateCycle();
  }

  /**
   * setsnumber base to the debug function call
   * @param {Number} numBase 10 or 16
   */
  setEmuDebugNumBase(numBase) {
    this.debugNumBase = numBase;
  }

  /**
   * set function that will be called after every emulation execution
   * @param {Function} debugFunc function to call
   */
  setEmuDebugFunc(debugFunc) {
    this.debugFunc = debugFunc;
  }

  /**
   * set emulators sound context, to play and stop sounds
   * @param {Object} context browsers sound context
   */
  setEmuSound(context) {
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
   * set canvas context of emulator
   * @param {*} canvas canvas for graphic emulation
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
    //const filteredNames = names.filter((name) => name !== 'names' && name !== 'txt' && name !== '');
    this.ROMS = names;
  }

  async loadROM(name) {
    const ROMData = await fetch(`https://balend.github.io/chip8-emulator-js/roms/${name.toLowerCase()}`);
    this.stopemuCycleloop();
    this.chip8.resetState();
    this.chip8.loadROM(new Uint8Array(await ROMData.arrayBuffer()));
    this.startEmuCycleLoop();
  }
}
