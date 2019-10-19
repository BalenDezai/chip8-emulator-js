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
