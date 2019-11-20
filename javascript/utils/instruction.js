/**
 * utility class to help reading the binary 2 byte long instruction
 * and stop repetition of bitwise operations to get specific bits out of the instruction
 *
 * to know what KK, X, Y, ADDR, Category, subCateogry mean read more at
 *
 * http://devernay.free.fr/hacks/chip8/C8TECH10.HTM#keyboard
 */
export default class Instruction {
  /**
   * @param {Number} instructionCode
   */
  constructor(instructionCode) {
    this.instructionCode = instructionCode || 0;
  }

  getInstructionCode() {
    return this.instructionCode;
  }

  setInstructionCode(instructionCode) {
    this.instructionCode = instructionCode;
  }

  /**
   * @returns first bit (from left) of the instruction
   */
  getCategory() {
    return (this.instructionCode & 0xF000) >> 12;
  }

  /**
   * @returns last 12 bit (from left) of the instruction (also known as NNN/addr)
   */
  getAddr() {
    return this.instructionCode & 0x0FFF;
  }

  /**
   * @returns last 4 bits (from left) of the 2nd byte from the instruction (also known as X)
   */
  getX() {
    return (this.instructionCode & 0x0F00) >> 8;
  }

  /**
   * @returns first 4 bit (from left) of the 2nd byte from the instruction
   */
  getY() {
    return (this.instructionCode & 0x00f0) >> 4;
  }

  /**
   * @returns the last 8 bit (1 byte) (from left) of the instruction
   */
  getKK() {
    return this.instructionCode & 0x00FF;
  }

  /**
   * @returns first bit (from right) of the instruction
   */
  getSubCategory() {
    return this.instructionCode & 0x000F;
  }
}
