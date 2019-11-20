import Instruction from '../utils/instruction.js';
import Screen from './screen.js';
import Keyboard from './keyboard.js'
import Sound from './sound.js';
/**
 * chip8 cpu. This handles reading and executing instructions from the ROM,
 * manages what to render  on the screen, what audio to play.
 * Is the general CPU and memory of the chip8
 *
 *
 * all the instruction handling, memory handling, screen rendering, etc.
 * are all done after Cowgod's Chip-8 Technical Reference v1.0
 *
 *
 * http://devernay.free.fr/hacks/chip8/C8TECH10.HTM
 */
export default class Chip8 {
  /**
   * @param {Screen} screen handle all drawing/redrawing of sprites
   * @param {Keyboard} keyboard handle all keyboard interaction
   * @param {Sound} sound sound context to handle sound on/off
   */
  constructor(screen, keyboard, sound) {
    this.screen = screen || new Screen();
    this.keyboard = keyboard || new Keyboard();
    this.sound = sound || new Sound();
    this.instruction = new Instruction();
    //  cycle execution speed
    this.speed = 10;
    this.soundOff = true;
  }

  resetState() {
    // 16 8-bit registers
    this.v = new Uint8Array(16);
    // 4096 byte RAM, first 512 bytes are reserved for the interpreter (stuff like font)
    // program starts at 512
    this.memory = new Uint8Array(1024 * 4);
    this.stack = [];
    this.screen.clearScreen();
    this.keyboard.clear();
    // memory addr register
    this.i = 0;
    this.programCounter = 0x200;
    //  points to topmost level of the stack
    this.stackPointer = 0;
    this.delayTimer = 0;
    this.soundTimer = 0;
    this.pause = false;
    this.loadFontsIntoState();
  }

  /**
   * @param {Uint8Array} ROM binary data
   */
  loadROM(ROM) {
    for (let i = 0, size = ROM.length; i < size; i += 1) {
      //  start loading ROM in memory from 0x200
      this.memory[0x200 + i] = ROM[i];
    }
  }

  emulateCycle() {
    for (let i = 0; i < this.speed; i += 1) {
      if (!this.pause) {
        // each instruction is 2 bytes (16bit) long
        // read value in memory of current PC and bitshift to left by 8
        const firstByte = this.memory[this.programCounter] << 8;
        // read next value (PC++) in memory
        const secondByte = this.memory[this.programCounter + 1];
        // add both values together by bitwise OR to create a 16bit (2 byte) instruction
        // this is because the memory of chip8 is only 8 bit (1byte)
        this.instruction.setInstructionCode(firstByte | secondByte);
        this.performInstruction(this.instruction);
      }
    }

    if (!this.pause) {
      this.updateTimers();
    }
  }

  performInstruction(instructionCode) {
    // to signal that this instruction executed and move to next
    this.programCounter += 2;
    switch (instructionCode.getCategory()) {
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
      case 0xA: this.operationCodeA(instructionCode); break;
      case 0xB: this.operationCodeB(instructionCode); break;
      case 0xC: this.operationCodeC(instructionCode); break;
      case 0xD: this.operationCodeD(instructionCode); break;
      case 0xE: this.operationCodeE(instructionCode); break;
      case 0xF: this.operationCodeF(instructionCode); break;
      default: throw new Error(`Unknown opcode ${instructionCode.getInstrunctionCode().toString(16)}`);
    }
  }

  operationCode0(instruction) {
    switch (instruction.getKK()) {
      case 0xE0: this.screen.clearScreen(); break;
      // return from subroutine
      case 0xEE:
        this.stackPointer = this.stackPointer -= 1;
        // sets program counter to address at top of stack
        this.programCounter = this.stack[this.stackPointer];
        break;
      default: break;
    }
  }

  /**
   * interpreter sets address to NNN
   * @param {Instruction} instruction
   */
  operationCode1(instruction) {
    this.programCounter = instruction.getAddr();
  }

  /**
   * calls subroutine at NNN
   * @param {Instruction} instruction
   */
  operationCode2(instruction) {
    //  put the program counter on the top of the stack
    this.stack[this.stackPointer] = this.programCounter;
    this.stackPointer += 1;
    this.programCounter = instruction.getAddr();
  }

  /**
   * skip next instruction if Vx = kk
   * @param {Instruction} instruction
   */
  operationCode3(instruction) {
    if (this.v[instruction.getX()] === instruction.getKK()) {
      this.programCounter += 2;
    }
  }

  /**
   * skip next instruction if Vx != KK
   * @param {Instruction} instruction
   */
  operationCode4(instruction) {
    if (this.v[instruction.getX()] !== instruction.getKK()) {
      this.programCounter += 2;
    }
  }

  /**
   * skip next instruction if Vx = Vy
   * @param {Instruction} instruction
   */
  operationCode5(instruction) {
    if (this.v[instruction.getX()] === this.v[instruction.getY()]) {
      this.programCounter += 2;
    }
  }

  /**
   * set Vx to KK
   * @param {Instruction} instruction
   */
  operationCode6(instruction) {
    this.v[instruction.getX()] = instruction.getKK();
  }

  /**
   * set Vx = Vx + KK
   * @param {Instruction} instruction
   */
  operationCode7(instruction) {
    let val = instruction.getKK() + this.v[instruction.getX()];
    if (val > 255) {
      val -= 256;
    }
    this.v[instruction.getX()] = val;
  }

  /**
   * handle any instruction regarding the 16 8-bit registers
   * @param {Instruction} instruction
   */
  operationCode8(instruction) {
    const x = instruction.getX();
    const y = instruction.getY();
    switch (instruction.getSubCategory()) {
      case 0x0: this.v[x] = this.v[y]; break;
      case 0x1: this.v[x] |= this.v[y]; break;
      case 0x2: this.v[x] &= this.v[y]; break;
      case 0x3: this.v[x] ^= this.v[y]; break;
      case 0x4:
        this.v[x] += this.v[y];
        if (this.v[x] > 0xFF) {
          this.v[0xF] = 1;
        } else {
          this.v[0xF] = 0;
        }
        if (this.v[x] > 255) {
          this.v[x] -= 256;
        }
        break;
      case 0x5:
        if (this.v[x] > this.v[y]) {
          this.v[0xF] = 1;
        } else {
          this.v[0xF] = 0;
        }
        this.v[x] -= this.v[y];
        if (this.v[x] < 0) {
          this.v[x] += 256;
        }
        break;
      case 0x6:
        // get the last bit of Vx and assign
        this.v[0xF] = this.v[x] & 0x1;
        // use bitwise shift to divide by 2
        this.v[x] >>= 1;
        break;
      case 0x7:
        if (this.v[x] > this.v[y]) {
          this.v[0xF] = 0;
        } else {
          this.v[0xF] = 1;
        }
        this.v[x] = this.v[y] - this.v[x];
        if (this.v[x] < 0) {
          this.v[x] += 256;
        }
        break;
      case 0xE:
        this.v[0xF] = +(this.v[x] & 0x80);
        // multiply by 2
        this.v[x] = this.v[x] << 1;
        if (this.v[x] > 255) {
          this.v[x] -= 256;
        }
        break;
      default: throw new Error(`Unknown opcode ${instruction.getInstrunctionCode().toString(16)}`);
    }
  }

  /**
   * skip next instruction if Vx != Vy
   * @param {Instruction} instruction
   */
  operationCode9(instruction) {
    if (this.v[instruction.getX()] !== this.v[instruction.getY()]) {
      this.programCounter += 2;
    }
  }

  /**
   * set memory address register to NNN
   * @param {Instruction} instruction
   */
  operationCodeA(instruction) {
    this.i = instruction.getAddr();
  }

  /**
   * set programCounter to NNN + V0x0
   * @param {Instruction} instruction
   */
  operationCodeB(instruction) {
    this.programCounter = instruction.getAddr() + this.v[0x0];
  }

  /**
   * set Vx = random byte bitwise AND KK
   * @param {Instruction} instruction
   */
  operationCodeC(instruction) {
    // generate random number between 0 and 255
    const val = Math.floor(Math.random() * 0xFF);
    // bitwise AND it with KK of the instruction and assign to vX
    this.v[instruction.getX()] = val & instruction.getKK();
  }

  /**
   * draws n-byte sprite starting at memory[i] at (Vx, Vy)
   * @param {Instruction} instruction
   */
  operationCodeD(instruction) {
    let sprite;
    const width = 8;
    const height = instruction.getSubCategory();
    const xPortion = instruction.getX();
    const yPortion = instruction.getY();
    this.v[0xF] = 0;

    // read N bytes from memory
    // to know where to draw vertically along the Y axis
    for (let y = 0; y < height; y += 1) {
      sprite = this.memory[this.i + y];

      // draw certain pixels horizontally along the X axis
      for (let x = 0; x < width; x += 1) {
        // if sprite is to be drawn
        if ((sprite & 0x80) > 0) {
          if (this.screen.setPixels(this.v[xPortion] + x, this.v[yPortion] + y)) {
            this.v[0xF] = 1;
          }
        }
        sprite <<= 1;
      }

      this.screen.vfFrame = this.v[0xF];
      this.screen.render();
    }
  }

  /**
 * handle all instructions related to key pressing
 * @param {Instruction} instruction
 */
  operationCodeE(instruction) {
    switch (instruction.getKK()) {
      // skip next instruction if key with value Vx is pressed
      case 0x9E:
        if (this.keyboard.isKeyPressed(this.v[instruction.getX()])) {
          this.programCounter += 2;
        }
        break;
      // skip next instruction if key with the value Vx is not pressed
      case 0xA1:
        if (!this.keyboard.isKeyPressed(this.v[instruction.getX()])) {
          this.programCounter += 2;
        }
        break;
      default: throw new Error(`Unknown opcode ${instruction.getInstrunctionCode().toString(16)}`);
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
      default: throw new Error(`Unknown opcode ${instruction.getInstrunctionCode().toString(16)}`);
    }
  }


  /**
   * set Vx = delay timer
   * @param {Instruction} instruction
   */
  operationCodeF07(instruction) {
    this.v[instruction.getX()] = this.delayTimer;
  }

  /**
   * wait for key press. store value of key in Vx
   * @param {Instruction} instruction
   */
  operationCodeF0A(instruction) {
    this.pause = true;
    this.keyboard.onNextKeyPress = function onNextKeyPress(key) {
      this.v[instruction.getX()] = key;
      this.pause = false;
    }.bind(this);
  }

  /**
   * set delay timer = Vx
   * @param {Instruction} instruction
   */
  operationCodeF15(instruction) {
    this.delayTimer = this.v[instruction.getX()];
  }

  /**
   * set sound timer = Vx
   * @param {Instruction} instruction
   */
  operationCodeF18(instruction) {
    this.soundTimer = this.v[instruction.getX()];
  }

  /**
 * set i register = i + Vx
 * @param {Instruction} instruction
 */
  operationCodeF1E(instruction) {
    this.i += this.v[instruction.getX()];
  }

  /**
   * set register i = location of sprite for digit Vx
   * @param {Instruction} instruction
   */
  operationCodeF29(instruction) {
    this.i = this.v[instruction.getX()] * 5;
  }

  /**
   * store hundreds, tens and ones of Vx in memory 1, 2 , 3
   * @param {Instruction} instruction
   */
  operationCodeF33(instruction) {
    let number = this.v[instruction.getX()];
    for (let i = 3; i > 0; i -= 1) {
      // parse and assign the first (from right) mnumber
      this.memory[this.i + i - 1] = parseInt(number % 10, 10);
      // divide by 10 to shave off a decimal
      number /= 10;
    }
  }

  /**
   * set registers V0 to Vx in memory starting at location I (register)
   * @param {Instruction} instruction
   */
  operationCodeF55(instruction) {
    for (let i = 0; i <= instruction.getX(); i += 1) {
      this.memory[this.i + i] = this.v[i];
    }
  }

  /**
   * read registers V0 to Vx from memory starting at location I (register)
   * @param {Instruction} instruction
   */
  operationCodeF65(instruction) {
    for (let i = 0; i <= instruction.getX(); i += 1) {
      this.v[i] = this.memory[this.i + i];
    }
  }

  /**
   * updates delay and sound timers after every cycle
   */
  updateTimers() {
    if (this.delayTimer > 0) {
      this.delayTimer -= 1;
    }
    if (this.soundTimer > 0) {
      if (this.soundTimer === 1) {
        if (!this.soundOff) {
          this.sound.start();
        }
      }
      this.soundTimer -= 1;
    }
  }

  /**
   * loads the hexadecimal values of the FONTS from the technical reference into memory
   * starting at location 0
   */
  loadFontsIntoState() {
    const fonts = [
      // 0
      0xF0, 0x90, 0x90, 0x90, 0xF0,
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
