(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Screen = require('./screen');
const Keyboard = require('./keyboard');
const Instrunction = require('./instruction');

class Chip8 {
  constructor() {
    this.Screen = new Screen();
    this.keyboard = new Keyboard();
    this.resetState();
    this.loadFontsIntoState();
  }

  resetState() {
    this.v = new Uint8Array(16);
    this.memory = new Uint8Array(1024 * 4);
    this.stack = new Array(16);
    this.i = 0;
    this.programCounter = 0x200;
    this.stackPointer = 0;
    this.delay = 0;
    this.sound = 0;
    this.pause = null;
    this.speed = 10;
  }

  loadROM(ROM) {
    for (let i = 0; i < ROM.length; i += 1) {
      this.memory[0x200 + 1] = ROM[i];
    }
  }

  emulateCycle() {
    const instruct = new Instrunction();
    for (let i = 0; i < this.speed; i += 1) {
      if (!this.pause) {
        const firstByte = this.memory[this.programCounter] << 8;
        const secondByte = this.memory[this.programCounter + 1];
        instruct.setInstructionCode(firstByte | secondByte);
        this.performInstruction(instruct);
      }
    }

    if (!this.pause) {
      this.updateTimers();
    }

    this.Screen.clearScreen();
  }

  performInstruction(instructionCode) {
    this.programCounter += 2;
    switch (instructionCode.getCatagory()) {
      case 0x0: this.operationCode0(instructionCode); break;
      case 0x1: this.operationCode1(instructionCode); break;
      case 0x2: this.operationCode2(instructionCode); break;
      case 0x3: this.operationCode3(instructionCode); break;
      case 0x4: this.operationCode4(instructionCode); break;
      case 0x5: this.operationCode5(instructionCode); break;
      case 0x6: this.operationCode6(instructionCode); break;
      case 0x7: this.operationCode7(instructionCode); break;
      case 0x8: this.operationCode8(instructionCode); break;
      case 0x9: this.operationCode9(instructionCode); break;
      default: break; // implement
    }
  }

  operationCode0(instruction) {
    switch (instruction.getKK()) {
      case 0xE0: this.Screen.clearScreen(); break;
      case 0xEE: this.programCounter = this.stack[this.stackPointer];
        break;
      default: break;
    }
  }

  operationCode1(instruction) {
    this.programCounter = instruction.getAddr();
  }

  operationCode2(instruction) {
    this.stackPointer += 1;
    this.stack[this.stackPointer] = this.programCounter;
    this.programCounter = instruction.getAddr();
  }

  operationCode3(instruction) {
    if (this.v[instruction.getX()] === instruction.getKK()) {
      this.programCounter += 2;
    }
  }

  operationCode4(instruction) {
    if (this.v[instruction.getX() !== instruction.getKK()]) {
      this.programCounter += 2;
    }
  }

  operationCode5(instruction) {
    if (this.v[instruction.getX()] === this.v[instruction.getY()]) {
      this.programCounter += 2;
    }
  }

  operationCode6(instruction) {
    this.v[instruction.getX()] = instruction.getKK();
  }

  operationCode7(instruction) {
    this.v[instruction.getX()] += instruction.getKK();
  }

  operationCode8(instruction) {
    switch (instruction.getSubCatagory()) {
      case 0x0: this.v[instruction.getX()] = this.v[instruction.getY()]; break;
      case 0x1: this.v[instruction.getX()] |= this.v[instruction.getY()]; break;
      case 0x2: this.v[instruction.getX()] &= this.v[instruction.getY()]; break;
      case 0x3: this.v[instruction.getX()] ^= this.v[instruction.getY()]; break;
      case 0x4: {
        const result = this.v[instruction.getX()] + this.v[instruction.getY()];
        if (result > 255) {
          this.v[0xF] = 1;
        } else {
          this.v[0xF] = 0;
        }
        this.v[instruction.getX()] = instruction.getKK();
      } break;
      case 0x5:
        if (this.v[instruction.getX()] > this.v[instruction.getY()]) {
          this.v[0xF] = 1;
        } else {
          this.v[0xF] = 0;
        }
        this.v[instruction.getX()] -= this.v[instruction.getY()];
        break;
      case 0x6:
        this.v[0xF] = this.v[instruction.getX()] & 0x1;
        // use bitwise shift to divide by 2
        this.v[instruction.getX()] = this.v[instruction.getX()] >> 1;
        break;
      case 0x7:
        if (this.v[instruction.getY()] > this.v[instruction.getX()]) {
          this.v[0xF] = 1;
        } else {
          this.v[0xF] = 0;
        }
        this.v[instruction.getX()] = this.v[instruction.getY()] - this.v[instruction.getX()];
        break;
      case 0xE:
        this.v[0xF] = ((this.v[instruction.getX()] & 0x80) === 0x80);
        // multiply by 2
        this.v[instruction.getX()] = this.v[instruction.getX()] << 1;
        break;
      default: break;
    }
  }

  operationCode9(instruction) {
    if (this.v[instruction.getX()] !== this.v[instruction.getY()]) {
      this.programCounter += 2;
    }
  }

  operationCodeA(instruction) {
    this.i = instruction.getAddr();
  }

  operationCodeB(instruction) {
    this.programCounter = instruction.getAddr() + this.v[0x0];
  }

  operationCodeC(instruction) {
    // generate random number between 0 and 255
    const val = Math.floor(Math.random() * (255 - 0 + 1)) + 0;
    // bitwise AND it with KK of the instruction and assign to vX
    this.v[instruction.getX()] = val & instruction.getKK();
  }

  operationCodeD(instruction) {
    let sprite;
    const width = 8;
    const height = instruction.getSubCatagory();
    const xPortion = instruction.getX();
    const yPortion = instruction.getY();
    this.v[0xF] = 0;
    for (let x = 0; x < height; x += 1) {
      sprite = this.memory[this.i + x];

      for (let y = 0; y < width; y += 1) {
        if ((sprite & 0x80) > 0) {
          if (this.Screen.setPixels(this.v[xPortion] + y, this.v[yPortion] + x)) {
            this.v[0xF] = 1;
          }
        }
        sprite <<= 1;
      }
    }
  }

  operationCodeE(instruction) {
    switch (instruction.getKK()) {
      case 0x9E:
        if (this.keyboard.isKeyPressed(this.v[instruction.getX()])) {
          this.programCounter += 2;
        }
        break;
      case 0xA1:
        if (!this.keyboard.isKeyPressed(this.v[instruction.getX()])) {
          this.programCounter += 2;
        }
        break;
      default: break;
    }
  }

  operationCodeF(instruction) {
    switch (instruction.getKK()) {
      case 0x07: this.operationCodeF07(instruction); break;
      case 0x0A: this.operationCodeF0A(instruction); break;
      case 0x15: this.operationCodeF15(instruction); break;
      case 0x18: this.operationCodeF18(instruction); break;
      case 0x1E: this.operationCodeF1E(instruction); break;
      case 0x29: this.operationCodeF29(instruction); break;
      case 0x33: this.operationCodeF33(instruction); break;
      case 0x55: this.operationCodeF55(instruction); break;
      case 0x65: this.operationCodeF65(instruction); break;
      default: break;
    }
  }


  operationCodeF07(instruction) {
    this.v[instruction.getX()] = this.delay;
  }

  operationCodeF0A(instruction) {
    this.pause = true;
    this.keyboard.onNextKeyPress = function onNextKeyPress(key) {
      this.v[instruction.getX()] = key;
      this.pause = false;
    }.bind(this);
  }

  operationCodeF15(instruction) {
    this.delay = this.v[instruction.getX()];
  }

  operationCodeF18(instruction) {
    this.sound = this.v[instruction.getX()];
  }

  operationCodeF1E(instruction) {
    this.i += this.v[instruction.getX()];
  }

  operationCodeF29(instruction) {
    this.i = this.v[instruction.getX()] * 5;
  }

  operationCodeF33(instruction) {
    this.memory[this.i] = parseInt(this.v[instruction.getX()] / 100, 16);
    this.memory[this.i + 1] = parseInt((this.v[instruction.getX()] % 100) / 10, 16);
    this.memory[this.i + 2] = this.v[instruction.getX()] & 10;
  }

  operationCodeF55(instruction) {
    for (let i = 0; i <= instruction.getX(); i += 1) {
      this.memory[this.i + i] = this.v[i];
    }
  }

  operationCodeF65(instruction) {
    for (let i = 0; i <= instruction.getX(); i += 1) {
      this.v[i] = this.memory[this.i + i];
    }
  }

  updateTimers() {
    if (this.delay > 0) {
      this.delay -= 1;
    }
    if (this.sound > 0) {
      this.sound -= 0;
    }
  }

  loadFontsIntoState() {
    const fonts = [
      // 0
      0xF0, 0x90, 0x90, 0x90, 0xF,
      // 1
      0x20, 0x60, 0x20, 0x20, 0x70,
      // 2
      0xF0, 0x10, 0xF0, 0x80, 0xF0,
      // 3
      0xF0, 0x10, 0xF0, 0x10, 0xF0,
      // 4
      0x90, 0x90, 0xF0, 0x10, 0x10,
      // 5
      0xF0, 0x80, 0xF0, 0x10, 0xF0,
      // 6
      0xF0, 0x80, 0xF0, 0x90, 0xF0,
      // 7
      0xF0, 0x10, 0x20, 0x40, 0x40,
      // 8
      0xF0, 0x90, 0xF0, 0x90, 0xF0,
      // 9
      0xF0, 0x90, 0xF0, 0x10, 0xF0,
      // A
      0xF0, 0x90, 0xF0, 0x90, 0x90,
      // B
      0xE0, 0x90, 0xE0, 0x90, 0xE0,
      // C
      0xF0, 0x80, 0x80, 0x80, 0xF0,
      // D
      0xE0, 0x90, 0x90, 0x90, 0xE0,
      // E
      0xF0, 0x80, 0xF0, 0x80, 0xF0,
      // F
      0xF0, 0x80, 0xF0, 0x80, 0x80,
    ];
    for (let i = 0; i < fonts.length; i += 1) {
      this.memory[i] = fonts[i];
    }
  }
}

module.exports = Chip8;

},{"./instruction":3,"./keyboard":4,"./screen":5}],2:[function(require,module,exports){
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

},{"./chip8":1}],3:[function(require,module,exports){
class Instruction {
  constructor(instructionCode) {
    this.instructionCode = instructionCode || 0;
  }

  getInstrunctionCode() {
    return this.instructionCode;
  }

  setInstructionCode(instructionCode) {
    this.instructionCode = instructionCode;
  }

  getCatagory() {
    return (this.instructionCode & 0xF000) >> 12;
  }

  getAddr() {
    return this.instructionCode & 0xFFF;
  }

  getx() {
    return (this.instructionCode & 0xF00) >> 8;
  }

  getY() {
    return (this.instructionCode & 0xf0) >> 4;
  }

  getKK() {
    return this.instructionCode & 0xFF;
  }

  getSubCatagory() {
    return this.instructionCode & 0xF;
  }
}

module.exports = Instruction;

},{}],4:[function(require,module,exports){
class Keyboard {
  constructor() {
    this.keysPressed = [];
    this.onNextKeyPress = null;
    this.loadKeyMapping();
    window.addEventListener('keydown', this.keyDown, false);
    window.addEventListener('keyup', this.keyUp, false);
  }

  clear() {
    this.keyPressed = [];
  }

  isKeyPressed(keyCode) {
    const keyPressed = this.keyMapping[keyCode];
    return !!this.keyPressed[keyPressed];
  }

  keyDown(event) {
    const key = String.fromCharCode(event.which);
    this.keysPressed[key] = true;
    Object.entries(this.keyMapping).forEach(([oKey, oVal]) => {
      const keyCode = this.keyMapping[oVal];

      if (keyCode === key) {
        this.onNextKeyPress(parseInt(oKey, 16));
      }
    });
  }

  keyUp(event) {
    const key = String.fromCharCode(event.which);
    this.keysPressed[key] = false;
  }

  loadKeyMapping() {
    this.keyMapping = {
      0x0: 'X',
      0x1: '1',
      0x2: '2',
      0x3: '3',
      0x4: 'Q',
      0x5: 'W',
      0x6: 'E',
      0x7: 'A',
      0x8: 'S',
      0x9: 'D',
      0xA: 'Z',
      0xB: 'C',
      0xC: '4',
      0xD: 'R',
      0xE: 'F',
      0xF: 'V',
    };
  }
}

module.exports = Keyboard;

},{}],5:[function(require,module,exports){
class Screen {
  constructor() {
    // row
    this.x = 32;
    // column
    this.y = 64;

    this.resolution = this.y * this.x;

    this.screen = new Array(this.resolution);
    this.canvas = null;
    this.scale = null;
  }

  clearScreen() {
    //  instead of assigning a new array, could also set all values to using a for loop
    this.screen = new Array(this.resolution);
  }

  setPixels(x, y) {
    if (x > (this.x - 1)) {
      while (x > (this.x - 1)) {
        x -= this.x;
      }
    }

    if (x < 0) {
      while (x < 0) {
        x += this.x;
      }
    }

    if (y > (this.y - 1)) {
      while (y > (this.y - 1)) {
        y -= this.y;
      }
    }

    if (y < 0) {
      while (y < 0) {
        y += this.y;
      }
    }

    const location = x + (y * this.y);

    this.screen[location] ^= location;

    return !this.screen[location];
  }

  ApplyCanvas(context, scale) {
    this.scale = scale || 10;

    this.width = context.canvas.width = this.y * this.scale;
    this.height = context.canvas.width = this.x * this.scale;
    this.canvas = context;
  }

  render() {
    let x;
    let y;
    this.canvas.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.resolution; i += 1) {
      x = (i % this.y) * this.scale;
      y = Math.floor(i / this.x) * this.scale;
      if (this.screen[i]) {
        this.context.fillStyle = '#000';
        this.context.fillRect(x, y, this.scale, this.scale);
      }
    }
  }
}

module.exports = Screen;

},{}],6:[function(require,module,exports){
const Chip8Wrapper = require('./models/chip8wrapper');

const emulator = new Chip8Wrapper();
const canvas = document.querySelector('canvas');
emulator.chip8.Screen.canvas = canvas.getContext('2d');

const romSelector = document.getElementById('rom_selection');
for (let i = 0, romsCount = emulator.ROMS.length; i < romsCount; i += 1) {
  const option = document.createElement('option');
  const rom = emulator.ROMS[i];
  option.value = option.innerHTML = rom;
  romSelector.appendChild(option);
}
romSelector.addEventListener('change', (event) => {
  if (event.target.value !== '') {
    emulator.loadRom(event.target.value);
    canvas.focus();
  }
}, false);

},{"./models/chip8wrapper":2}]},{},[6]);
