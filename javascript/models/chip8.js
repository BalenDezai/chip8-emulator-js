(function () {
  class Chip8 {
    constructor(screen, keyboard, instruction) {
      this.screen = screen;
      this.keyboard = keyboard;
      this.instruction = instruction;
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
        this.memory[0x200 + i] = ROM[i];
      }
    }

    emulateCycle() {
      const instruct = this.instruction;
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

      this.screen.render();
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
        case 0xE0: this.screen.clearScreen(); break;
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
            if (this.screen.setPixels(this.v[xPortion] + y, this.v[yPortion] + x)) {
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
  if (typeof module !== 'undefined' && module.exports) {
    const screen = require('./screen');
    const keyboard = require('./keyboard');
    const instruction = require('./instruction');
    module.exports = new Chip8(screen, keyboard, instruction);
  } else {
    const chip8 = new Chip8(
      new window.Chip8Screen(),
      new window.Chip8Keyboard(),
      new window.Chip8Instruction());
    window.chip8 = chip8;
  }
}());
