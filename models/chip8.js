const Screen = require('./screen');

class Chip8 {
  constructor() {
    this.Screen = new Screen();
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
    this.keyState = new Array(16);
  }

  loadROM(ROM) {
    for (let i = 0; i < ROM.length; i += 1) {
      this.memory[0x200 + 1] = ROM[i];
    }
  }

  performInstruction(instructionCode) {
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
      case 0xEE:
        this.programCounter = this.stack[this.stackPointer];
        this.programCounter += 2;
        break;
      default: break;
    }
  }

  operationCode1(instruction) {
    this.programCounter = instruction.getAddr();
    this.programCounter += 2;
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
    this.programCounter += 2;
  }

  operationCode4(instruction) {
    if (this.v[instruction.getX() !== instruction.getKK()]) {
      this.programCounter += 2;
    }
    this.programCounter += 2;
  }

  operationCode5(instruction) {
    if (this.v[instruction.getX()] === this.v[instruction.getY()]) {
      this.programCounter += 2;
    }
    this.programCounter += 2;
  }

  operationCode6(instruction) {
    this.v[instruction.getX()] = instruction.getKK();
    this.programCounter += 2;
  }

  operationCode7(instruction) {
    this.v[instruction.getX()] += instruction.getKK();
  }

  operationCode8(instruction) {
    switch (instruction.getSubCatagory()) {
      case 0x0: this.v[instruction.getX()] = this.v[instruction.getY()]; break;
      default: break;
    }
  }

  operationCode9(instruction) {
    if (this.v[instruction.getX()] !== this.v[instruction.getY()]) {
      this.programCounter += 2;
    }
    this.programCounter += 2;
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
