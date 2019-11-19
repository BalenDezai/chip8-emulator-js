export default class Instruction {
  constructor(instructionCode) {
    this.instructionCode = instructionCode || 0;
  }

  getInstrunctionCode() {
    return this.instructionCode;
  }

  setInstructionCode(instructionCode) {
    this.instructionCode = instructionCode;
  }

  getCategory() {
    return (this.instructionCode & 0xF000) >> 12;
  }

  getAddr() {
    return this.instructionCode & 0x0FFF;
  }

  getX() {
    return (this.instructionCode & 0x0F00) >> 8;
  }

  getY() {
    return (this.instructionCode & 0x00f0) >> 4;
  }

  getKK() {
    return this.instructionCode & 0x00FF;
  }

  getSubCategory() {
    return this.instructionCode & 0x000F;
  }
}
